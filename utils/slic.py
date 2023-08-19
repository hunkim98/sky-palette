import math
from skimage import io, color
import numpy as np
from tqdm import trange

# https://github.com/laixintao/slic-python-implementation/blob/master/slic.py
# https://github.com/darshitajain/SLIC/blob/master/SLIC_Algorithm.ipynb

class Cluster(object):
    cluster_index = 1

    def __init__(self, h, w, l=0, a=0, b=0):
        self.update(h, w, l, a, b)
        self.pixels = []
        self.no = self.cluster_index
        Cluster.cluster_index += 1

    def update(self, h, w, l, a, b):
        self.h = h
        self.w = w

        # LAB is the color space used in SLIC paper
        # It is different from RGB
        # L is the lightness
        # a is the green-red component
        # b is the blue-yellow component
        self.l = l
        self.a = a
        self.b = b

    def __str__(self):
        return "{},{}:{} {} {} ".format(self.h, self.w, self.l, self.a, self.b)

    def __repr__(self):
        return self.__str__()


class SLICProcessor(object):
    @staticmethod
    def open_image(path):
        """
        Return:
            3D array, row col [LAB]
        """
        rgb = io.imread(path)
        lab_arr = color.rgb2lab(rgb)
        return lab_arr

    @staticmethod
    def save_lab_image(path, lab_arr):
        """
        Convert the array to RBG, then save the image
        :param path:
        :param lab_arr:
        :return:
        """
        rgb_arr = color.lab2rgb(lab_arr) * 255
        io.imsave(path, rgb_arr.astype(np.uint8))


    def __init__(self, filename, K, M):
        # K is the number of clusters
        self.K = K
        # M is the compactness factor
        # M is recommended to be in the range of [1, 40]
        # A smaller "m" results in stronger normalization, 
        # making color differences have a relatively
        # smaller impact compared to spatial distances.
        # A larger "m" reduces the normalization effect, 
        # allowing color differences to have a larger impact.
        self.M = M

        self.data = self.open_image(filename)
        self.image_height = self.data.shape[0]
        self.image_width = self.data.shape[1]

        # N is the number of pixels
        self.N = self.image_height * self.image_width

        # N/K is the number of pixels in each cluster
        # math.sqrt(N/K) is the edge length of each cluster
        self.S = int(math.sqrt(self.N / self.K))

        self.clusters = []

        # label is like a hash table
        # key is the pixel's position
        # value is the cluster's index
        self.label = {}

        # dis is the distance from each pixel to the cluster center
        # we initialize it to infinity
        self.dis = np.full((self.image_height, self.image_width), np.inf)

    def init_clusters(self):
        # we start from the center of each grid
        # h is row
        h = self.S / 2
        # w is col
        w = self.S / 2
        while h < self.image_height:
            while w < self.image_width:
                self.clusters.append(self.make_cluster(h, w))
                w += self.S
            w = self.S / 2
            h += self.S

    def make_cluster(self, h, w):
        h = int(h)
        w = int(w)
        # Cluster h and w is the center of the cluster
        return Cluster(h, w,
                       # r
                       self.data[h][w][0],
                       # g
                       self.data[h][w][1],
                       # b
                       self.data[h][w][2])

    def get_gradient(self, h, w):
        if w + 1 >= self.image_width:
            w = self.image_width - 2
        if h + 1 >= self.image_height:
            h = self.image_height - 2

        gradient = self.data[h + 1][w + 1][0] - self.data[h][w][0] + \
                   self.data[h + 1][w + 1][1] - self.data[h][w][1] + \
                   self.data[h + 1][w + 1][2] - self.data[h][w][2]
        return gradient

    def move_clusters(self):
        for cluster in self.clusters:
            cluster_gradient = self.get_gradient(cluster.h, cluster.w)
            # dh and dw are the offset of the cluster center
            # dh and dw can be -1, 0 or 1
            for dh in range(-1, 2):
                for dw in range(-1, 2):
                    _h = cluster.h + dh
                    _w = cluster.w + dw
                    new_gradient = self.get_gradient(_h, _w)
                    # We update the cluster center if the gradient is smaller
                    if new_gradient < cluster_gradient:
                        cluster.update(_h, _w, self.data[_h][_w][0], self.data[_h][_w][1], self.data[_h][_w][2])
                        cluster_gradient = new_gradient
    
    # In the assignment step, we assign each pixel to the nearest cluster
    def assignment(self):
        for cluster in self.clusters:
            # Remember that self.S is the edge length of each cluster
            # We loop through the pixels in the cluster's neighborhood
            # the neighborhood is a 2S * 2S square (meaning it will intrude into other clusters)
            # Since 2S * 2S is larger than the initial cluster size,
            # we can expect that the cluster size will grow or shrink (due to the growing or shrinking of the neighborhood)
            # However, since the limit is 2S * 2S, the cluster size will not grow or shrink too much
            for h in range(cluster.h - self.S * 2, cluster.h + self.S * 2):
                # We need to consider cases of h being out of bound since we are looping 2S * 2S pixels
                if h < 0 or h >= self.image_height: continue
                for w in range(cluster.w - self.S * 2, cluster.w + self.S * 2):
                    if w < 0 or w >= self.image_width: continue
                    L, A, B = self.data[h][w]

                    # Dc is the color distance (Euclidean distance)
                    Dc = math.sqrt(
                        math.pow(L - cluster.l, 2) +
                        math.pow(A - cluster.a, 2) +
                        math.pow(B - cluster.b, 2))
                    
                    # Ds is the spatial distance (Euclidean distance)
                    Ds = math.sqrt(
                        math.pow(h - cluster.h, 2) +
                        math.pow(w - cluster.w, 2))
                    
                    # D is the final distance
                    # The M factor is the compactness factor
                    # since we divide Dc by M,
                    # we can expect that a larger M will result in a smaller Dc
                    # This eventually means that a larger M will result in less 
                    # consideration of color differences
                    # The S factor is the spatial factor 
                    # (S was N(=number of pixels) / K(=number of clusters))
                    D = math.sqrt(math.pow(Dc / self.M, 2) + math.pow(Ds / self.S, 2))
                    if D < self.dis[h][w]:
                        # label is a hash table where
                        # the key is the pixel's position
                        # and the value is the cluster's index
                        if (h, w) not in self.label:
                            self.label[(h, w)] = cluster
                            cluster.pixels.append((h, w))
                        # Now the below is the case where the pixel is already assigned to a cluster
                        # since the distance is smaller, we reassign the pixel to a new cluster
                        # the value of the self.label is a cluster class object
                        # In the class object, there is a member variable called pixels
                        # pixels is a list of pixels that are assigned to the cluster
                        else:
                            self.label[(h, w)].pixels.remove((h, w))
                            self.label[(h, w)] = cluster
                            cluster.pixels.append((h, w))

                        # Lastly, we update the distance
                        self.dis[h][w] = D

    # In the update step, we update the cluster center
    def update_cluster(self):
        for cluster in self.clusters:
            sum_h = sum_w = number = 0
            # we loop through the pixels in the cluster
            # and calculate the average of the pixels
            # the average is the new cluster center!
            # according to the changed cluster center
            # the color will also change
            # this is why during the iteration steps, the color of the cluster changes
            for p in cluster.pixels:
                sum_h += p[0]
                sum_w += p[1]
                number += 1
            _h = int(sum_h / number)
            _w = int(sum_w / number)
            cluster.update(_h, _w, self.data[_h][_w][0], self.data[_h][_w][1], self.data[_h][_w][2])

    def save_current_image(self, name):
        image_arr = np.copy(self.data)
        for cluster in self.clusters:
            for p in cluster.pixels:
                image_arr[p[0]][p[1]][0] = cluster.l
                image_arr[p[0]][p[1]][1] = cluster.a
                image_arr[p[0]][p[1]][2] = cluster.b
            # The below code is used to draw the cluster center
            # image_arr[cluster.h][cluster.w][0] = 0
            # image_arr[cluster.h][cluster.w][1] = 0
            # image_arr[cluster.h][cluster.w][2] = 0
        self.save_lab_image("test/" + name, image_arr)

    # This is the training process
    def iterate_10times(self):
        self.init_clusters()
        # In here we reassign the cluster center
        # this only happens once
        # this is to make sure the cluster center is the most representative color
        # if we change the cluster center too much, the spatial information will be lost
        self.move_clusters()

        # Mostly it is known that 10 iterations is enough for slic
        for i in trange(10):
            self.assignment()
            self.update_cluster()
            name = 'lenna_M{m}_K{k}_loop{loop}.png'.format(loop=i, m=self.M, k=self.K)
            self.save_current_image(name)


