from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.auth_register, name='auth-register'),
    path('auth/login/', views.auth_login, name='auth-login'),
    path('auth/logout/', views.auth_logout, name='auth-logout'),
    path('auth/me/', views.auth_me, name='auth-me'),
    
    # Directory / Browsing
    path('categories/', views.category_list, name='category-list'),
    path('freelancers/', views.freelancer_list, name='freelancer-list'),
    path('freelancers/<int:pk>/', views.freelancer_detail, name='freelancer-detail'),
    
    # Marketplace
    path('jobs/', views.job_list, name='job-list'),
    path('jobs/create/', views.job_create, name='job-create'),
    path('jobs/<int:pk>/', views.job_detail, name='job-detail'),
    path('jobs/<int:job_id>/bid/', views.bid_create, name='bid-create'),
]
