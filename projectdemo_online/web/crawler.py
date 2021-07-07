import requests
from bs4 import BeautifulSoup
import urllib
import json


f = open('yt.txt',"r")    

lines = f.readlines()


song_url_list = lines

f.close()

data = {}

for i in range(len(song_url_list)):

    url = song_url_list[i]
    request = requests.get(url)
    content = request.content
    root = BeautifulSoup(content, "html.parser")
    
    name = root.find("a", {"spf-link branded-page-header-title-link yt-uix-sessionlink"})

    description = root.find("div", {"class": "about-description branded-page-box-padding"})

    subscriber = root.find("span", {"class": "yt-subscription-button-subscriber-count-branded-horizontal subscribed yt-uix-tooltip"})

    img = root.find("img")
    imgs = img['src']

    key = name.get_text('#').split('#')[0].replace(" ", "")
    
    if(description != None):
        value = [description.get_text('#').split('#')[1],subscriber.get_text('#') + (" 位訂閱者"),imgs]
    else:
        value = ["None",subscriber.get_text('#') + (" 位訂閱者"),imgs]
    
    data[key] = value 

js = json.dumps(data) 
file = open('yt_js.txt', 'w') 
file.write(js) 
file.close() 
    
print(data)