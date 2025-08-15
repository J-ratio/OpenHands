import { FakeMessage } from "./fake_message";

export const GENERATE_CLASS_DIAGRAM_MESSAGES: Array<FakeMessage> = [
  {
    type: "user",
    message:
      "I need to create a mermaid class diagram for the class named 'User' from the repository dnesbala/django-ramailo on the main branch. Let's start by exploring the repository to locate the User class and gather the necessary information.",
    delay: 0,
  },
  {
    type: "agent",
    message:
      "I'll help you create a mermaid class diagram for the User class. Let me start by exploring the repository structure to locate the User class definition.",
    delay: 2000,
  },
  {
    type: "environment",
    message:
      '```bash\n$ grep -r "class User" django-ramailo\ngrep: django-ramailo: No such file or directory\n```',
    delay: 1000,
  },
  {
    type: "agent",
    message:
      "It seems there was an issue with the `grep` command because it didn't find the `django-ramailo` directory directly. Let's ensure we are in the correct directory and then search for the `User` class again.\n\nFirst, let's list the contents of the current directory to verify the structure:",
    delay: 3000,
  },
  {
    type: "environment",
    message:
      "```bash\n$ ls -la\ntotal 48\ndrwxr-xr-x  8 user user 4096 Jan 15 10:30 .\ndrwxr-xr-x  3 user user 4096 Jan 15 10:25 ..\ndrwxr-xr-x  2 user user 4096 Jan 15 10:30 ramailo\n-rw-r--r--  1 user user 1234 Jan 15 10:30 manage.py\n-rw-r--r--  1 user user  567 Jan 15 10:30 requirements.txt\n-rw-r--r--  1 user user 2341 Jan 15 10:30 README.md\n```",
    delay: 4000,
  },
  {
    type: "agent",
    message:
      "It looks like the `User` class might be located within the `ramailo` directory or one of its subdirectories. Let's search for the `User` class within the `ramailo` directory:",
    delay: 1000,
  },
  {
    type: "environment",
    message:
      '```bash\n$ grep -r "class User" ramailo\nramailo/models/user.py:class User(AbstractUser):\n```',
    delay: 2000,
  },
  {
    type: "agent",
    message:
      "Perfect! The `User` class is defined in `ramailo/models/user.py`. Let's view the contents of this file to gather the necessary information for generating the mermaid class diagram:",
    delay: 1000,
  },
  {
    type: "environment",
    message:
      '```python\n# ramailo/models/user.py\nfrom django.contrib.auth.models import AbstractUser\nfrom django.db import models\n\nclass User(AbstractUser):\n    """Custom user model extending Django\'s AbstractUser"""\n    \n    # Additional fields\n    phone_number = models.CharField(max_length=15, blank=True, null=True)\n    date_of_birth = models.DateField(blank=True, null=True)\n    profile_picture = models.ImageField(upload_to=\'profiles/\', blank=True, null=True)\n    is_verified = models.BooleanField(default=False)\n    created_at = models.DateTimeField(auto_now_add=True)\n    updated_at = models.DateTimeField(auto_now=True)\n    \n    def __str__(self):\n        return self.username\n    \n    def get_full_name(self):\n        return f"{self.first_name} {self.last_name}".strip()\n    \n    def is_profile_complete(self):\n        return bool(self.first_name and self.last_name and self.email)\n```',
    delay: 3000,
  },
  {
    type: "agent",
    message:
      "Excellent! Now I have all the information needed to create the mermaid class diagram. The `User` class extends Django's `AbstractUser` and includes additional fields and methods. Here's the mermaid class diagram:\n\n```mermaid\nclassDiagram\n    class User {\n        +str username\n        +str first_name\n        +str last_name\n        +str email\n        +str phone_number\n        +date date_of_birth\n        +ImageField profile_picture\n        +bool is_verified\n        +datetime created_at\n        +datetime updated_at\n        +bool is_active\n        +bool is_staff\n        +bool is_superuser\n        +datetime date_joined\n        +datetime last_login\n        \n        +__str__() str\n        +get_full_name() str\n        +is_profile_complete() bool\n    }\n    \n    AbstractUser <|-- User\n    \n    note for User \"Custom user model extending Django's AbstractUser\\nwith additional profile fields and methods\"\n```",
    delay: 4000,
  },
  {
    type: "agent",
    message:
      "The mermaid class diagram has been successfully generated! This diagram shows:\n\n- **Inheritance**: User extends AbstractUser (indicated by the arrow)\n- **Fields**: All the custom fields plus inherited fields from AbstractUser\n- **Methods**: Custom methods defined in the User class\n- **Note**: Additional context about the class purpose\n\nThe diagram includes both the custom fields you added (phone_number, date_of_birth, etc.) and the standard Django user fields inherited from AbstractUser.",
    delay: 2000,
  },
];
