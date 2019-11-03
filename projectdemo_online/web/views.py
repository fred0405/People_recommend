# -*- coding: utf-8 -*-
import os
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from whoosh.index import create_in
from whoosh.fields import *
from whoosh.qparser import QueryParser
from whoosh.qparser import MultifieldParser
from whoosh import scoring, index
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
	file_movie_path = file_index_path + "/documents_movie"
	result_dict = {}
	schema = Schema(title=TEXT(stored=True), content=TEXT(stored=True), movie_id = TEXT(stored = True), path=ID(stored=True) )
	index_file = file_index_path + "/indexdir"
	if not os.path.exists(index_file):
		os.mkdir(index_file)
	#-----------------------------------------------------writer--------------------------------------------------------
	ix = create_in(index_file, schema)
	writer = ix.writer()

	filepaths = [os.path.join(file_movie_path,i) for i in os.listdir(file_movie_path)]
	for path in filepaths:
	    fp = open(path,'r',encoding="utf-8")
	    name = fp.name.split(file_movie_path+"/")[1].split(".wav.txt")[0]
	    title = name[0:-12]
	    try:
	        ID_ = name[-11:]
	    except:
	        ID_ = "missing data"
	    text = fp.read()
	    writer.add_document(title=title,content=text , movie_id=ID_ , path = u"/b" )
	writer.commit()

	topN = 10
	with ix.searcher(weighting=scoring.BM25F) as searcher:
	    query = QueryParser("content", ix.schema).parse(query_str)
	    #query = MultifieldParser( ["content" ] , ix.schema).parse(query_str)
	    results = searcher.search(query,limit=topN)

	    # for i in range(topN):
	    for i in range(topN):
	    	result_dict[results[i]['movie_id']] = {"title": results[i]['title'], "score": str(results[i].score)}
	        # print("title : " + results[i]['title'] + "\n" + "ID : " + results[i]['movie_id'] + "\n" + str(results[i].score))
	print(result_dict)
	return result_dict

def get_result_new(query_str):
	file_path = os.path.abspath("web/static/whoosh/")
	ix = index.open_dir(file_path+"indexdir")
	with ix.searcher(weighting=scoring.BM25F) as searcher:
	    query = QueryParser("content", ix.schema).parse(query_str)
	    #query = MultifieldParser( ["content" ] , ix.schema).parse(query_str)
	    results = searcher.search(query,limit=topN)

	    # for i in range(topN):
	    for i in range(topN):
	    	result_dict[results[i]['movie_id']] = {"title": results[i]['title'], "score": str(results[i].score)}
	        # print("title : " + results[i]['title'] + "\n" + "ID : " + results[i]['movie_id'] + "\n" + str(results[i].score))
	print(result_dict)
	return result_dict

