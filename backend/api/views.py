from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Freelancer, Project

def category_list(request):
    categories = [choice[0] for choice in Freelancer.CATEGORIES]
    return JsonResponse({'categories': categories})

def freelancer_list(request):
    category = request.GET.get('category')
    freelancers = Freelancer.objects.all()
    if category:
        freelancers = freelancers.filter(category=category)
    
    data = []
    for f in freelancers:
        data.append({
            'id': f.id,
            'name': f.name,
            'category': f.category,
            'experience_years': f.experience_years,
            'bio': f.bio
        })
    return JsonResponse({'freelancers': data})

def freelancer_detail(request, pk):
    freelancer = get_object_or_404(Freelancer, pk=pk)
    projects = freelancer.projects.all()
    
    project_data = []
    for p in projects:
        project_data.append({
            'id': p.id,
            'title': p.title,
            'description': p.description
        })
    
    return JsonResponse({
        'id': freelancer.id,
        'name': freelancer.name,
        'category': freelancer.category,
        'experience_years': freelancer.experience_years,
        'bio': freelancer.bio,
        'projects': project_data
    })
