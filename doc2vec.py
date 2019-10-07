import sys
import os
from os import listdir
import gensim
from gensim.models import Doc2Vec
import time
start = time.time()

documents = []
titles = []
path = "./documents_movie"
files = listdir(path)

for i, f in enumerate(files):
    with open(path + '/' + f, 'r', encoding = 'utf-8') as data:
        for ele in data:
            documents.append(gensim.models.doc2vec.TaggedDocument(ele, [str(i+1)]))
            #documents.append(ele)
            #titles.append(f)


#print(documents, titles, sep = '\n')
model = Doc2Vec(documents, dm = 1, size = 100, window = 8, min_count = 5, workers = 4)
#model.train(documents, total_examples=model.corpus_count, epochs=70)

model.save('doc2vec_first.model')

end = time.time()
print('Totel Time:', round(end - start, 2), 'sec', sep = ' ')

print(len(files))


