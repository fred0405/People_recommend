import re
import sys
from os import listdir

# files = listdir("./subtitles")

# for file in files:
# 	print(file.split('.')[0])
# 	path = "./subtitles/" + file
# 	with open(path, 'r') as f:
# 		for line in f:
# 			print(re.findall(r'[\u4E00-\u9FBF]+', line))
			
path = "./subtitles/Table_Games_Taichung.txt"
with open(path, 'r') as f:
	print(f)
	for line in f:
		#print(line)
		print(re.findall(r'[\u4E00-\u9FBF]+', line))