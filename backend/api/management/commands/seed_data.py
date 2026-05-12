import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile, Job, Bid, Project, Review

class Command(BaseCommand):
    help = 'Seeds the database with initial users, profiles, jobs, bids, and reviews'

    def handle(self, *args, **kwargs):
        categories = ['Developers', 'Editors', 'Videography', 'Photography', 'Designs', 'Consultants']
        first_names = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura', 'Robert', 'Emma', 'William', 'Olivia', 'James', 'Sophia']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas']

        self.stdout.write('Clearing existing data...')
        Review.objects.all().delete()
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
            client_user = User.objects.create_user(username=username, email=f"{username}@example.com", password='password123')
            Profile.objects.create(user=client_user, role='Client')

            for j in range(random.randint(3, 6)):
                category = random.choice(categories)
                # Randomly assign status
                status_roll = random.random()
                if status_roll < 0.2:
                    job_status = 'Completed'
                elif status_roll < 0.5:
                    job_status = 'In Progress'
                else:
                    job_status = 'Open'

                job = Job.objects.create(
                    client=client_user,
                    title=f"Need a {category} for project {j+1}",
                    description=f"We are looking for a talented {category} to help us with our upcoming project. Requires expertise in {category}.",
                    budget=random.randint(100, 2000),
                    category=category,
                    status=job_status
                )

                # Add some bids
                freelancers = User.objects.filter(profile__role='Freelancer', profile__category=category)
                if freelancers.exists():
                    sampled_freelancers = random.sample(list(freelancers), min(len(freelancers), 3))
                    accepted_bid = None
                    
                    for f in sampled_freelancers:
                        bid_status = 'Pending'
                        if job_status in ['In Progress', 'Completed'] and accepted_bid is None:
                            bid_status = 'Accepted'
                            accepted_bid = f
                        elif job_status in ['In Progress', 'Completed'] and accepted_bid is not None:
                            bid_status = 'Rejected'
                        
                        Bid.objects.create(
                            job=job,
                            freelancer=f,
                            amount=job.budget - random.randint(0, 50),
                            proposal=f"I am interested in this job. I have extensive experience in {category}.",
                            status=bid_status
                        )

                    # If job is completed, add a review
                    if job_status == 'Completed' and accepted_bid:
                        Review.objects.create(
                            job=job,
                            client=client_user,
                            freelancer=accepted_bid,
                            rating=random.randint(4, 5),
                            comment=f"Excellent work! The {category.lower()} was very professional and delivered on time."
                        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
