from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLES = [
        ('Client', 'Client'),
        ('Freelancer', 'Freelancer'),
    ]
    
    CATEGORIES = [
        ('Developers', 'Developers'),
        ('Editors', 'Editors'),
        ('Videography', 'Videography'),
        ('Photography', 'Photography'),
        ('Designs', 'Designs'),
        ('Consultants', 'Consultants'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES)
    bio = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORIES, blank=True, null=True)
    experience_years = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Job(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=Profile.CATEGORIES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Bid(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bids')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_bids')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    proposal = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bid by {self.freelancer.username} on {self.job.title}"

class Project(models.Model):
    freelancer = models.ForeignKey(User, related_name='projects', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title
