# -*- coding : utf-8 -*-
import re
import jieba
from collections import Counter

with open('stops.txt', 'r') as f:
	stops = f.read().split('\n')

stops.append('\n')
stops.append('[')
stops.append(']')
stops.append(' ')
done = []
data = dict()
# with open('text/CYFIT.txt', 'r') as input:
with open('subtitles/Table_Games_Taichung.txt') as input:
	item_now = ''
	for i, item in enumerate(input):
		if re.match(r'(.*?).wav', item):
			#print(item)
			item_now = item.strip()
			data[item_now] = [t for t in jieba.cut_for_search(item) if t not in stops]
			#print(data)
		else:
			#print(item)
			data[item_now] += [t for t in jieba.cut_for_search(item) if t not in stops]
			#terms = [t for t in jieba.cut_for_search(item) if t not in stops]
		# print(sorted(Counter(terms).items(), key=lambda x:x[1], reverse=True))
			#print(data)
			#break
		# if(terms != []):
			# done += terms
for key in data:
	path = 'documents/' + key + '.txt'
	with open(path, 'w') as out:
		doc = key + '\n'
		for word in data[key]:
			if not re.match(r'[\u4E00-\u9FBF]+', word):
				continue
			doc = doc + word + ' '
		print(doc)
		out.write(doc)

print(len(data))

# print(done)


#print(sorted(Counter(done).items(), key=lambda x:x[1], reverse=True))