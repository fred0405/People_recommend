from django.shortcuts import render

# Create your views here.

def index(request):
	context = {}
	context['hello'] = 'Hello World!' 
	return render(request, 'index.ejs', context)
