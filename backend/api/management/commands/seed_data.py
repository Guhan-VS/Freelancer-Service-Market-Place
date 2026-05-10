import random
from django.core.management.base import BaseCommand
from api.models import Freelancer, Project

class Command(BaseCommand):
    help = 'Seeds the database with initial freelancers and projects'

    def handle(self, *args, **kwargs):
        categories = ['Developers', 'Editors', 'Videography', 'Photography', 'Designs', 'Consultants']
        first_names = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura', 'Robert', 'Emma', 'William', 'Olivia', 'James', 'Sophia']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas']

        self.stdout.write('Clearing existing data...')
        Project.objects.all().delete()
        Freelancer.objects.all().delete()

        self.stdout.write('Seeding freelancers...')
        for category in categories:
            for i in range(10):
                name = f"{random.choice(first_names)} {random.choice(last_names)}"
                exp = random.randint(0, 5)
                bio = f"A passionate {category.lower()} with {exp} years of experience in the industry. Specializing in high-quality work and client satisfaction."
                
                freelancer = Freelancer.objects.create(
                    name=name,
                    category=category,
                    experience_years=exp,
                    bio=bio
                )

                # Add projects
                for j in range(random.randint(2, 4)):
                    Project.objects.create(
                        freelancer=freelancer,
                        title=f"Project {j+1} for {name}",
                        description=f"This is a detailed description of project {j+1} performed by {name} in the field of {category}."
                    )

        self.stdout.write(self.style.SUCCESS('Successfully seeded 60 freelancers!'))
