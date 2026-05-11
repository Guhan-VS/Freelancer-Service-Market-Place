import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .models import Profile, Job, Bid, Project

def home(request):
    return render(request, 'index.html')

def category_list(request):
    categories = [choice[0] for choice in Profile.CATEGORIES]
    return JsonResponse({'categories': categories})

@csrf_exempt
def auth_register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        role = data.get('role') # 'Client' or 'Freelancer'
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        user = User.objects.create_user(username=username, password=password)
        Profile.objects.create(
            user=user, 
            role=role,
            category=data.get('category'),
            experience_years=data.get('experience_years', 0),
            bio=data.get('bio', '')
        )
        
        login(request, user)
        return JsonResponse({'message': 'User registered successfully', 'role': role})
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

@csrf_exempt
def auth_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'username': user.username,
                'role': user.profile.role
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def auth_logout(request):
    logout(request)
    return JsonResponse({'message': 'Logged out'})

def auth_me(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'username': request.user.username,
            'role': request.user.profile.role,
            'id': request.user.id
        })
    return JsonResponse({'error': 'Not authenticated'}, status=401)

def freelancer_list(request):
    category = request.GET.get('category')
    profiles = Profile.objects.filter(role='Freelancer')
    if category:
        profiles = profiles.filter(category=category)
    
    data = []
    for p in profiles:
        data.append({
            'id': p.user.id,
            'username': p.user.username,
            'name': f"{p.user.first_name} {p.user.last_name}".strip() or p.user.username,
            'category': p.category,
            'experience_years': p.experience_years,
            'bio': p.bio
        })
    return JsonResponse({'freelancers': data})

def freelancer_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    profile = user.profile
    projects = user.projects.all()
    
    project_data = []
    for p in projects:
        project_data.append({
            'id': p.id,
            'title': p.title,
            'description': p.description
        })
    
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'name': f"{user.first_name} {user.last_name}".strip() or user.username,
        'role': profile.role,
        'category': profile.category,
        'experience_years': profile.experience_years,
        'bio': profile.bio,
        'projects': project_data
    })

def job_list(request):
    category = request.GET.get('category')
    jobs = Job.objects.all().order_by('-created_at')
    if category:
        jobs = jobs.filter(category=category)
    
    data = []
    for j in jobs:
        data.append({
            'id': j.id,
            'title': j.title,
            'description': j.description,
            'budget': float(j.budget),
            'category': j.category,
            'client': j.client.username,
            'created_at': j.created_at
        })
    return JsonResponse({'jobs': data})

def job_detail(request, pk):
    job = get_object_or_404(Job, pk=pk)
    bids = job.bids.all()
    
    bid_data = []
    # Only show bids to the job owner or the freelancer who placed the bid
    # For this minimalist version, we'll show counts or public info if needed,
    # but let's just show all for the job owner.
    if request.user == job.client:
        for b in bids:
            bid_data.append({
                'id': b.id,
                'freelancer': b.freelancer.username,
                'amount': float(b.amount),
                'proposal': b.proposal,
                'created_at': b.created_at
            })
    
    return JsonResponse({
        'id': job.id,
        'title': job.title,
        'description': job.description,
        'budget': float(job.budget),
        'category': job.category,
        'client': job.client.username,
        'created_at': job.created_at,
        'bids': bid_data,
        'bid_count': bids.count()
    })

@csrf_exempt
def job_create(request):
    if not request.user.is_authenticated or request.user.profile.role != 'Client':
        return JsonResponse({'error': 'Only clients can post jobs'}, status=403)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        job = Job.objects.create(
            client=request.user,
            title=data.get('title'),
            description=data.get('description'),
            budget=data.get('budget'),
            category=data.get('category')
        )
        return JsonResponse({'message': 'Job created', 'id': job.id})
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

@csrf_exempt
def bid_create(request, job_id):
    if not request.user.is_authenticated or request.user.profile.role != 'Freelancer':
        return JsonResponse({'error': 'Only freelancers can bid'}, status=403)
    
    job = get_object_or_404(Job, pk=job_id)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        bid = Bid.objects.create(
            job=job,
            freelancer=request.user,
            amount=data.get('amount'),
            proposal=data.get('proposal')
        )
        return JsonResponse({'message': 'Bid placed', 'id': bid.id})
    return JsonResponse({'error': 'Only POST allowed'}, status=405)
