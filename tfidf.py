# -*- coding : utf-8 -*-

from os import listdir
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(ngram_range = (1,2), sublinear_tf = True)

test_list = []

files = listdir("./documents")
for file in files:
	path = "./documents/" + file
	
	with open(path, 'r', encoding='utf8') as f:
		for stuff in f :

			test_list.append(stuff)
			
	

tfidf = vectorizer.fit_transform(test_list) # test_list是corpus of documents e.g. ["doc1切好的字", "doc2切好的字"]
feature_names = vectorizer.get_feature_names()
for i in range(1587): # i 是指第幾篇doc
    print(i, '= = = = == = = === == =')
    try:
        feature_index = tfidf[i,:].nonzero()[1]
        tfidf_scores = zip(feature_index, [tfidf[i, x] for x in feature_index])
        for w, s in [(feature_names[i], s) for (i, s) in tfidf_scores]:
            print(w, str(s)) # w是term, s是tfidf_score
        break
    except:
        continue


