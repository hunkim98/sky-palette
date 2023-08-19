import numpy as np
import random


class Cluster:
    def __init__(self, centroid):
        self.centroid = centroid
        self.points = []

    def add_point(self, point):
        self.points.append(point)

    def clear_points(self):
        self.points = []


class Custom_KMeans:
    def __init__(self, n_clusters, max_iters=100, random_state=None):
        self.n_clusters = n_clusters
        self.max_iters = max_iters
        self.random_state = random_state

    def fit(self, data):
        self.clusters = self.initialize_clusters(data)

        for _ in range(self.max_iters):
            for cluster in self.clusters:
                cluster.clear_points()

            for point in data:
                closest_cluster = self.assign_cluster(point)
                closest_cluster.add_point(point)

            new_centroids = self.calculate_new_centroids()

            if self.are_centroids_equal(self.clusters, new_centroids):
                break

            self.update_clusters_centroids(new_centroids)

    def initialize_clusters(self, data):
        if self.random_state is not None:
            random.seed(self.random_state)
        random_indices = random.sample(range(len(data)), self.n_clusters)
        initial_centroids = [data[idx] for idx in random_indices]
        clusters = [Cluster(centroid) for centroid in initial_centroids]
        return clusters

    def assign_cluster(self, point):
        distances = [np.linalg.norm(cluster.centroid - point)
                     for cluster in self.clusters]
        closest_cluster_idx = np.argmin(distances)
        return self.clusters[closest_cluster_idx]

    def calculate_new_centroids(self):
        new_centroids = [np.mean(cluster.points, axis=0)
                         for cluster in self.clusters]
        return new_centroids

    def are_centroids_equal(self, clusters, new_centroids):
        return all(np.array_equal(cluster.centroid, new_centroid) for cluster, new_centroid in zip(clusters, new_centroids))

    def update_clusters_centroids(self, new_centroids):
        for cluster, new_centroid in zip(self.clusters, new_centroids):
            cluster.centroid = new_centroid
