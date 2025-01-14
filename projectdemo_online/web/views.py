# -*- coding: utf-8 -*-
import os
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from whoosh.index import create_in
from whoosh.fields import *
from whoosh.qparser import QueryParser
from whoosh.qparser import MultifieldParser
from whoosh import scoring
from whoosh.index import open_dir
import json
# Create your views here.

def index(request):
	context = {}
	context['hello'] = 'Hello World!' 
	return render(request, 'index.ejs', context)
@csrf_exempt
def rshow(request):
	print(request.POST['keyword'])
	return JsonResponse({"status": True})

@csrf_exempt
def search(request):
	query = request.POST.get('keyword')
	print(query)
	# rtn_dict = get_result(query)
	rtn_dict = get_result_new(query)
	return JsonResponse({"status": True, "result": json.dumps(rtn_dict)})

def get_result(query_str):
	file_index_path =  os.path.abspath("web/static/whoosh/")# the main contents     where you put your file what you change this line
	file_movie_path = file_index_path + "/documents_movie_all"
	result_dict = {}
	schema = Schema(title=TEXT(stored=True), content=TEXT(stored=True), movie_id = TEXT(stored = True), youtuber = TEXT(stored = True), path=ID(stored=True) )
	index_file = file_index_path + "/indexdir"
	if not os.path.exists(index_file):
		os.mkdir(index_file)
	#-----------------------------------------------------writer--------------------------------------------------------
	ix = create_in(index_file, schema)
	writer = ix.writer()


# 【Huan】 巴掌大的電腦可以幹嘛 ECS LIVA Z2開箱測試-V-fIGqXdNCc.wav@@Huan.txt
	filepaths = [os.path.join(file_movie_path,i) for i in os.listdir(file_movie_path)]
	for path in filepaths:
	    fp = open(path,'r',encoding="utf-8")
	    name = fp.name.split(file_movie_path+"/")[1].split(".wav@@")[0]
	    title = name[0:-12]
	    
	    youtuber = fp.name.split(file_movie_path+"/")[1].split(".wav@@")[1].split('.txt')[0]
	    print(youtuber)
	    try:
	        ID_ = name[-11:]
	    except:
	        ID_ = "missing data"
	    text = fp.read()
	    writer.add_document(title=title,content=text , movie_id=ID_ , youtuber = youtuber, path = u"/b" )
	writer.commit()

	topN = 100
	with ix.searcher(weighting=scoring.BM25F) as searcher:
	    query = QueryParser("content", ix.schema).parse(query_str)
	    #query = MultifieldParser( ["content" ] , ix.schema).parse(query_str)
	    results = searcher.search(query,limit=topN)

	    # for i in range(topN):
	    for i in range(topN):
	    	result_dict[results[i]['movie_id']] = {"title": results[i]['title'], "youtuber":results[i]['youtuber'], "score": str(results[i].score)}
	        # print("title : " + results[i]['title'] + "\n" + "ID : " + results[i]['movie_id'] + "\n" + str(results[i].score))
	print(result_dict)
	return result_dict

def get_result_new(query_str):
	file_path = os.path.abspath("web/static/whoosh/indexdir")
	result_dict = {}
	# print(index.exists_in(file_path))
	ix = open_dir(file_path)
	topN = 100
	with ix.searcher(weighting=scoring.BM25F) as searcher:
	    query = QueryParser("content", ix.schema).parse(query_str)
	    #query = MultifieldParser( ["content" ] , ix.schema).parse(query_str)
	    results = searcher.search(query,limit=topN)

	    # for i in range(topN):
	    for i in range(topN):
	    	result_dict[results[i]['movie_id']] = {"title": results[i]['title'], "youtuber":results[i]['youtuber'], "score": str(results[i].score)}
	        # print("title : " + results[i]['title'] + "\n" + "ID : " + results[i]['movie_id'] + "\n" + str(results[i].score))
	# 'q3Fe6_KGxb0': {'title': "《漫威蜘蛛俠 Marvel's Spider-Man》的能力和責任——遊戲鑒賞【就知道玩遊戲34】", 'youtuber': 'Gamker', 'score': '1.9486520101094948'}
	result_dict = rerank(result_dict)
	# print(result_dict)
	# print(tt)

	print(result_dict)
	
	return result_dict

def rerank(data):
	youtuber_rank = dict()
	result = dict()
	for id in data:
		if data[id]['youtuber'] not in youtuber_rank.keys():
			youtuber_rank[data[id]['youtuber']] = 1
		else:
			youtuber_rank[data[id]['youtuber']] += 1
	
	youtuber_rank = sorted(youtuber_rank.items(), key=lambda d: d[1], reverse=True)
	# print(youtuber_rank)
	for yt in youtuber_rank:
		result[yt[0]] = []
	for movie_id in data:
		result[data[movie_id]['youtuber']].append({'movie_id': movie_id, 'title': data[movie_id]['title'], 'score': data[movie_id]['score']})
	# print(result)
	return result
