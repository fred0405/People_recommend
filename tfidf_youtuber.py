# -*- coding : utf-8 -*-
import re
import sys
import jieba
import numpy as np
from os import listdir
from sklearn.feature_extraction.text import TfidfVectorizer

def Cosine_Similarity(Query,Document):
    return dot_product(Query,Document) / (distance(Query) * distance(Document))

def dot_product(Query,Document):
    sum = 0
    for i in range(len(Document)):
        sum = sum + (Query[i] * Document[i])
    return sum

def distance(Vec):
    sum = 0
    for i in range(len(Vec)):
        sum = sum + np.square(Vec[i])
    return np.sqrt(sum)

vectorizer = TfidfVectorizer(ngram_range = (1,2), sublinear_tf = True)

test_list = []

files = listdir("./documents_youtubers")
for file in files:
	path = "./documents_youtubers/" + file
	
	with open(path, 'r', encoding='utf8') as f:
		for stuff in f :

			test_list.append(stuff)
#print(test_list[5])

####query
with open('stops.txt', 'r') as f:
    stops = f.read().split('\n')
input_q = input("Please enter the query(in Chinese): ")
input_q = [t for t in jieba.cut_for_search(input_q) if t not in stops]
input_str_q = ""
for word in input_q:
    if not re.match(r'[\u4E00-\u9FBF]+', word):
        continue
    input_str_q = input_str_q + word + ' '
test_list.append(input_str_q) #query 放在最後面



tfidf = vectorizer.fit_transform(test_list) # test_list是corpus of documents e.g. ["doc1切好的字", "doc2切好的字"]
feature_names = vectorizer.get_feature_names()

document_tfidf_list = []
query = {}

for i in range(len(files)+1): # i 是指第幾篇doc
    try:
        
        tfidf_dic = dict()
        feature_index = tfidf[i,:].nonzero()[1]
        tfidf_scores = zip(feature_index, [tfidf[i, x] for x in feature_index])
        for w, s in [(feature_names[i], s) for (i, s) in tfidf_scores]:
            #print(w, str(s)) # w是term, s是tfidf_score
            tfidf_dic[w] = s
        #print(tfidf_dic)
        if (i == len(files)):
            query = tfidf_dic
        else:
            document_tfidf_list.append(tfidf_dic)
    except:
        continue


tfidf_c = dict()
for i, document in enumerate(document_tfidf_list):
    size = len(document) + len(query)
    d = np.zeros([size])
    q = np.zeros([size])
    dif = 0
    for j, key in enumerate(document):
        d[j] = document[key]
        if(key in query.keys()):
            q[j] = query[key]

    for j, key in enumerate(query):
        if(key not in document.keys()):
            q[len(document)+dif] = query[key]
            dif += 1
        else:
            continue

    f = files[i].split('.txt')
    tfidf_c[f[0]] = Cosine_Similarity(q, d)
tfidf_c = sorted(tfidf_c.items(), key=lambda x: x[1], reverse=True)

for file, score in tfidf_c[:5]:
    print("{}\t{}".format(file, round(score, 6)))

