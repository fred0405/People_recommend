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

    key = name.get_text('#').split('#')[0]
    
    if(description != None):
        value = [description.get_text('#').split('#')[1],subscriber.get_text('#') + (" 位訂閱者"),imgs]
    else:
        value = ["None",subscriber.get_text('#') + (" 位訂閱者"),imgs]
    
    data[key] = value


data['A_Di_English'] = data['阿滴英文']
data['CYFIT'] = data['CYFIT兆佑']
data['Dodo_Village'] = data['抖抖村']
data['Empty_Bottle_King'] = data['空罐王']
data['Gamker'] = data['Gamker攻壳官方频道']
data['Little_Hot_Sing'] = data['小熱唱']
data['Lulu'] = data['路路LULU']
data['Table_Games_Taichung'] = data['逸馬的桌遊小教室']
data['bq'] = data['特力屋']
data['gayi'] = data['健人蓋伊']
data['maomaotv'] = data['MaoMao TV']
data['missga'] = data['嘎老師 Miss Ga']    

js = json.dumps(data) 
file = open('yt_js.txt', 'w') 
file.write(js) 
file.close() 
    
print(data)