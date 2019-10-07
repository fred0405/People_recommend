import os
import gensim
from gensim.models import Doc2Vec
from annoy import AnnoyIndex

model = gensim.models.Doc2Vec.load('./doc2vec_first.model')
t = AnnoyIndex(100)

id_to_index = {}

i = 0
for item in model:
    #print(len(item))
    t.add_item(i, [float(data) for data in item])
    i += 1
    if i == 1586:
        break

t.build(1000)
t.save("./first_annoy.ann")
