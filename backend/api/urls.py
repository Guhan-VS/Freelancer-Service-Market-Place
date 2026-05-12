from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'freelancers', views.FreelancerViewSet, basename='freelancer')
router.register(r'jobs', views.JobViewSet, basename='job')
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'projects', views.ProjectViewSet, basename='project')

urlpatterns = [
    # Auth
    path('auth/register/', views.auth_register, name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.auth_me, name='auth-me'),
    
    # Directory / Browsing
    path('categories/', views.category_list, name='category-list'),
    path('bids/<int:pk>/accept/', views.bid_accept, name='bid-accept'),
    
    path('', include(router.urls)),
]
