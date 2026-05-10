from django.db import models

class Freelancer(models.Model):
    CATEGORIES = [
        ('Developers', 'Developers'),
        ('Editors', 'Editors'),
        ('Videography', 'Videography'),
        ('Photography', 'Photography'),
        ('Designs', 'Designs'),
        ('Consultants', 'Consultants'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    experience_years = models.IntegerField()
    bio = models.TextField()

    def __str__(self):
        return self.name

class Project(models.Model):
    freelancer = models.ForeignKey(Freelancer, related_name='projects', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title
