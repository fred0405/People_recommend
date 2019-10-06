import logging
from gensim.models import word2vec

def main():
    sentences = word2vec.LineSentence("total.txt")
    model = word2vec.Word2Vec(sentences, window = 10, min_count = 5, workers = 32, iter = 5, size = 100, sg = 1, negative = 10)

    model.save("word2vec_first.model")

if __name__ == "__main__":
    main()
