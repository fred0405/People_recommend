import json

file = open('yt_js.txt', 'r') 
js = file.read()
dic = json.loads(js) 
print(dic) 
file.close()