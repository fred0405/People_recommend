from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

def index(request):
	context = {}
	context['hello'] = 'Hello World!' 
	return render(request, 'index.ejs', context)
@csrf_exempt
def rshow(request):
	print(request.POST['keyword'])
	return JsonResponse({"status": True})
