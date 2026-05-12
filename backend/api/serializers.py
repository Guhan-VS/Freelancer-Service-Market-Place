from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Job, Bid, Project, Review, Message

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    category = serializers.CharField(source='profile.category', read_only=True)
    experience_years = serializers.IntegerField(source='profile.experience_years', read_only=True)
    bio = serializers.CharField(source='profile.bio', read_only=True)
    name = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.IntegerField(source='reviews_received.count', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'name', 'category', 'experience_years', 'bio', 'avg_rating', 'review_count']

    def get_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.username
    
    def get_avg_rating(self, obj):
        reviews = obj.reviews_received.all()
        if not reviews.exists():
            return 0
        return sum(r.rating for r in reviews) / reviews.count()

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'user', 'username', 'role', 'bio', 'category', 'experience_years']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description']

class ReviewSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client.username', read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'job', 'client', 'client_username', 'freelancer', 'rating', 'comment', 'created_at']
        read_only_fields = ['client', 'freelancer', 'job']

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'job', 'sender', 'sender_username', 'receiver', 'content', 'timestamp']
        read_only_fields = ['sender', 'receiver', 'job']

class BidSerializer(serializers.ModelSerializer):
    freelancer_username = serializers.CharField(source='freelancer.username', read_only=True)
    class Meta:
        model = Bid
        fields = ['id', 'job', 'freelancer', 'freelancer_username', 'amount', 'proposal', 'status', 'created_at']
        read_only_fields = ['freelancer', 'status']

class JobSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client.username', read_only=True)
    bid_count = serializers.IntegerField(source='bids.count', read_only=True)
    freelancer_username = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ['id', 'client', 'client_username', 'title', 'description', 'budget', 'category', 'status', 'created_at', 'bid_count', 'freelancer_username']
        read_only_fields = ['client', 'status']

    def get_freelancer_username(self, obj):
        accepted_bid = obj.bids.filter(status='Accepted').first()
        if accepted_bid:
            return accepted_bid.freelancer.username
        return None

class JobDetailSerializer(JobSerializer):
    bids = BidSerializer(many=True, read_only=True)
    review = ReviewSerializer(read_only=True)
    
    class Meta(JobSerializer.Meta):
        fields = JobSerializer.Meta.fields + ['bids', 'review']
