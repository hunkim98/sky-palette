"""File to download example sky images from flickr."""
from __future__ import print_function, division
import socket
socket.setdefaulttimeout(10)
import urllib.request as urllib
import os
import time
import re
import traceback

FILE_DIR = os.path.dirname(os.path.realpath(__file__))
WRITE_TO_BASE_DIR = os.path.join(FILE_DIR, "downloaded")
PATTERN = re.compile(r"_z\.jpg$")
URLS_LIST_FILEPATH = os.path.join(WRITE_TO_BASE_DIR, "_urls.txt")

# List of URLs that have images of skies
ERIC_CHAN_SKY_SERIES = ["https://ericcahan.com/portfolio/sky-series/", "https://ericcahan.com/uncategorized/horizontals/"]


def main():
    """Main function: Iterates over search pages and downloads images linked on them."""
    with open(URLS_LIST_FILEPATH, "a") as furl:
        urls_to_download = []
        urls_to_download.extend(ERIC_CHAN_SKY_SERIES)
        for url in urls_to_download:
            host = re.findall(r"//[^/]*", url)[0][2:-4]
            print("Downloading images from %s" % (host,))
            dest_dir = os.path.join(WRITE_TO_BASE_DIR, "%s/" % (host,))
            try:
                source = load_page_source(url)
            except Exception as exc:
                traceback.print_exc()
                print(exc)
                source = None

            if source is not None:
                images = extract_image_urls(source)
                for image in images:
                    # Examples:
                    # http://c3.staticflickr.com/3/2935/14030724164_8a4cf0b48d.jpg   (500x333, 1.5:1)
                    # http://c3.staticflickr.com/3/2935/14030724164_8a4cf0b48d_n.jpg (320x213, 1.5:1, 64%)
                    # http://c3.staticflickr.com/3/2935/14030724164_8a4cf0b48d_q.jpg (150x150, 1.0:1, 30%)
                    # http://c3.staticflickr.com/3/2935/14030724164_8a4cf0b48d_m.jpg (240x160, 1.5:1, 48%)
                    # http://c3.staticflickr.com/3/2935/14030724164_8a4cf0b48d_s.jpg ( 75x75,  1.0:1, 15%)
                    # http://c3.staticflickr.com/3/2935/14030724164_8a4cf0b48d_t.jpg (100x67,  1.5:1, 20%)
                    # http://c3.staticflickr.com/3/2935/14030724164_8a4cf0b48d_z.jpg (640x427, 1.5:1, 128%)
                    
                    # if PATTERN.search(url):
                    url = fix_url(image["src"])
                    alt = image["alt"]
                    print("<Image> %s" % (url))
                    try:
                        downloaded = download_image(url, dest_dir, furl, alt)
                        if downloaded:
                            # wait for 1sec before downloading the next image
                            time.sleep(1.0)
                    except Exception as exc:
                        traceback.print_exc()
                        print(exc)

            # wait for 5secs before opening the next search page
            time.sleep(5.0)

def load_page_source(main_url):
    """Load the source code of a flickr search page.
    Args:
        main_url The search page url, must contain "%PAGE"
        page_no The number of the search page to request (1 ... N)
    Returns:
        Html content
    """
    url = main_url
    headers = {'User-Agent': 'Chrome/66.0.3359.181'}
    req = urllib.Request(url, headers=headers)
    lines = urllib.urlopen(req).readlines()
    content = " "
    if len(lines) == 0:
        raise Exception("No data received from %s" % (url,))
    else:
        for line in lines:
            content += line.decode("utf-8")
    # return " ".join(urllib.urlopen(url).readlines())
    return content

def extract_image_urls(source):
    """Finds urls to images in the source code of a flickr search page.
    Args:
        source HTML-Sourc code
    Returns:
        List of urls (strings)
    """
    # todo pylint complains here
    source = source.replace("\/", "/")
    img_tag_pattern = re.compile(r"<img[^>]*>")
    img_tags = re.findall(img_tag_pattern, source)
    img_src_pattern = re.compile(r"src=\"[^\"]*\"")
    img_alt_pattern = re.compile(r"alt=\"[^\"]*\"")
    img_srcs = []
    for img_tag in img_tags:
        img_src = re.findall(img_src_pattern, img_tag)
        img_alt = re.findall(img_alt_pattern, img_tag)
        if len(img_src) > 0 and len(img_alt) > 0:
            img_srcs.append({
                "src": img_src[0][5:-1],
                "alt": img_alt[0][5:-1]
            })

    return img_srcs

def fix_url(url):
    """Makes sure that an url is properly formatted.
    Args:
        url The url to fix
    Returns:
        The fixed URL
    """
    if url.startswith("//"):
        return "http:" + url
    else:
        return url

def download_image(source_url, dest_dir, urls_list_file, name):
    """Downloads an image from flickr and saves it.
    Images that were already downloaded are skipped automatically.
    
    Args:
        source_url The URL of the image.
        dest_dir The directory to save the image in.
        urls_list_file File handle for the file in which the URLs of downloaded images will be
                       saved.
    Returns:
        True if the image was downloaded
        False otherwise (including images that were skipped)
    """
    if "/" not in source_url or (".jpg" not in source_url and ".jpeg" not in source_url) or "?" in source_url:
        print("[Warning] source url '%s' is invalid" % (source_url))
        return False
    else:
        # index = source_url.rfind(".com/")
        file_type = source_url[source_url.rfind("."):].lower()
        # image_name = source_url[index+len(".com/"):].replace("/", "-")
        # image_name = image_name.replace("wp-content-uploads-", "-")
        filepath = os.path.join(dest_dir, name + file_type)
        if os.path.isfile(filepath):
            print("[Info] skipped '%s', already downloaded" % (filepath))
            return False
        else:
            # create directory if it doesnt exist
            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir)

            # add "<URL>\t<Image-Filepath>" (without <, >) to urls file
            urls_list_file.write("%s\t%s\n" % (source_url, filepath))
            # download the image
            headers = {'User-Agent': 'Chrome/66.0.3359.181'}
            req = urllib.Request(source_url, headers=headers)
            res = urllib.urlopen(req)
            f = open(filepath, "wb")
            f.write(res.read())
            f.close()
            # urllib.urlretrieve(source_url, filepath)
            return True

if __name__ == "__main__":
    main()
