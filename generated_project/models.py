class UserData:
    def __init__(self, user_id, name, email):
        self.user_id = user_id
        self.name = name
        self.email = email

    def __str__(self):
        return f'User ID: {self.user_id}, Name: {self.name}, Email: {self.email}'


def process_user_data(user_data):
    # Process user data logic here
    # For example, let's assume we want to extract the user's name and email
    name = user_data['name']
    email = user_data['email']
    return name, email