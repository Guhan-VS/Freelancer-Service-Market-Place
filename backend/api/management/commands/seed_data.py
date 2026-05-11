import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile, Job, Bid, Project

class Command(BaseCommand):
    help = 'Seeds the database with initial users, profiles, and jobs'

    def handle(self, *args, **kwargs):
        categories = ['Developers', 'Editors', 'Videography', 'Photography', 'Designs', 'Consultants']
        first_names = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura', 'Robert', 'Emma', 'William', 'Olivia', 'James', 'Sophia']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas']

        self.stdout.write('Clearing existing data...')
        Bid.objects.all().delete()
        Job.objects.all().delete()
        Project.objects.all().delete()
        Profile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write('Seeding freelancers...')
        for category in categories:
            for i in range(5):
                username = f"freelancer_{category.lower()}_{i}"
                first_name = random.choice(first_names)
                last_name = random.choice(last_names)
                email = f"{username}@example.com"
                
                user = User.objects.create_user(username=username, email=email, password='password123', first_name=first_name, last_name=last_name)
                
                exp = random.randint(0, 5)
                bio = f"A passionate {category.lower()} with {exp} years of experience in the industry. Specializing in high-quality work and client satisfaction."
                
                Profile.objects.create(
                    user=user,
                    role='Freelancer',
                    category=category,
                    experience_years=exp,
                    bio=bio
                )

                # Add projects
                for j in range(random.randint(2, 4)):
                    Project.objects.create(
                        freelancer=user,
                        title=f"Portfolio Project {j+1}",
                        description=f"This is a detailed description of project {j+1} performed in the field of {category}."
                    )

        self.stdout.write('Seeding clients and jobs...')
        for i in range(5):
            username = f"client_{i}"
            user = User.objects.create_user(username=username, email=f"{username}@example.com", password='password123')
            Profile.objects.create(user=user, role='Client')

            for j in range(random.randint(2, 4)):
                category = random.choice(categories)
                job = Job.objects.create(
                    client=user,
                    title=f"Need a {category} for project {j+1}",
                    description=f"We are looking for a talented {category} to help us with our upcoming project. Requires expertise in {category}.",
                    budget=random.randint(100, 2000),
                    category=category
                )

                # Add some bids
                freelancers = User.objects.filter(profile__role='Freelancer', profile__category=category)
                if freelancers.exists():
                    for f in random.sample(list(freelancers), min(len(freelancers), 3)):
                        Bid.objects.create(
                            job=job,
                            freelancer=f,
                            amount=job.budget - random.randint(0, 50),
                            proposal=f"I am interested in this job. I have extensive experience in {category}."
                        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
