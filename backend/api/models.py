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
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=Profile.CATEGORIES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Bid(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bids')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_bids')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    proposal = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bid by {self.freelancer.username} on {self.job.title}"

class Project(models.Model):
    freelancer = models.ForeignKey(User, related_name='projects', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title

class Review(models.Model):
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='review')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.freelancer.username} on {self.job.title}"

class Message(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"
