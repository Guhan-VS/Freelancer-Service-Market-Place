import json
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, Job, Bid, Project
from .serializers import (
    UserSerializer, ProfileSerializer, JobSerializer, 
    JobDetailSerializer, BidSerializer, ProjectSerializer,
    ReviewSerializer, MessageSerializer
)

def home(request):
    return render(request, 'index.html')

@api_view(['GET'])
def category_list(request):
    categories = [choice[0] for choice in Profile.CATEGORIES]
    return Response({'categories': categories})

@api_view(['POST'])
@permission_classes([AllowAny])
def auth_register(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, password=password)
    Profile.objects.create(
        user=user, 
        role=role,
        category=data.get('category'),
        experience_years=data.get('experience_years', 0),
        bio=data.get('bio', '')
    )
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_me(request):
    return Response(UserSerializer(request.user).data)

class FreelancerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(profile__role='Freelancer')
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(profile__category=category)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['profile'] = ProfileSerializer(instance.profile).data
        data['projects'] = ProjectSerializer(instance.projects.all(), many=True).data
        return Response(data)

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobDetailSerializer
        return JobSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def bid(self, request, pk=None):
        job = self.get_object()
        if job.status != 'Open':
            return Response({'error': 'Bidding is closed for this job'}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.user.profile.role != 'Freelancer':
            return Response({'error': 'Only freelancers can bid'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BidSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(job=job, freelancer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        job = self.get_object()
        if request.user != job.client:
            return Response({'error': 'Only the client can complete the job'}, status=status.HTTP_403_FORBIDDEN)
        
        if job.status != 'In Progress':
            return Response({'error': 'Only in-progress jobs can be completed'}, status=status.HTTP_400_BAD_REQUEST)

        job.status = 'Completed'
        job.save()
        return Response({'message': 'Job marked as completed'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def review(self, request, pk=None):
        job = self.get_object()
        if request.user != job.client:
            return Response({'error': 'Only the client can leave a review'}, status=status.HTTP_403_FORBIDDEN)
        
        if job.status != 'Completed':
            return Response({'error': 'You can only review completed jobs'}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(job, 'review'):
            return Response({'error': 'Job already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

        accepted_bid = job.bids.filter(status='Accepted').first()
        if not accepted_bid:
            return Response({'error': 'No freelancer associated with this job'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(job=job, client=request.user, freelancer=accepted_bid.freelancer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def messages(self, request, pk=None):
        job = self.get_object()
        # Check if user is either client or the accepted freelancer
        accepted_bid = job.bids.filter(status='Accepted').first()
        if not accepted_bid:
             return Response({'error': 'Job not in progress'}, status=status.HTTP_400_BAD_REQUEST)
        
        is_freelancer = request.user == accepted_bid.freelancer
        is_client = request.user == job.client

        if not (is_client or is_freelancer):
            return Response({'error': 'You are not part of this job'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            messages = job.messages.all().order_by('timestamp')
            return Response(MessageSerializer(messages, many=True).data)
        
        elif request.method == 'POST':
            receiver = accepted_bid.freelancer if is_client else job.client
            serializer = MessageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(job=job, sender=request.user, receiver=receiver)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(freelancer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bid_accept(request, pk):
    bid = get_object_or_404(Bid, pk=pk)
    if request.user != bid.job.client:
        return Response({'error': 'Only the job owner can accept bids'}, status=status.HTTP_403_FORBIDDEN)
    
    if bid.job.status != 'Open':
        return Response({'error': 'This job is already in progress or completed'}, status=status.HTTP_400_BAD_REQUEST)

    bid.status = 'Accepted'
    bid.save()
    
    job = bid.job
    job.status = 'In Progress'
    job.save()
    
    job.bids.exclude(pk=pk).update(status='Rejected')
    
    return Response({'message': 'Bid accepted and job started'})
