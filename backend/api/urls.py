from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.category_list, name='category-list'),
    path('freelancers/', views.freelancer_list, name='freelancer-list'),
    path('freelancers/<int:pk>/', views.freelancer_detail, name='freelancer-detail'),
]
