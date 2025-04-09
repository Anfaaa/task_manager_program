## Backend - Django

### Dependencies (Python)

To install the backend dependencies, run:

```bash
pip install -r requirements.txt
```

---

## Database: PostgreSQL

This project uses PostgreSQL as the database. Make sure you have PostgreSQL installed and running.

You can change the database settings in settings.py if necessary.

### Database Configuration
In settings.py, the following PostgreSQL database is configured:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'task_manager_db',
        'USER': 'postgres',
        'PASSWORD': '12345',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
To set up the database, create the database and run migrations:

```bash
python manage.py migrate
```

## Frontend - React

### Dependencies (JavaScript)

The frontend is built with React. To install the dependencies, run:

```bash
npm install
```

The app will run on [http://localhost:3000](http://localhost:3000).

### Dependencies (JS)

Used libraries:
- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `react-scripts`
- `@testing-library/react`, `jest-dom`, `user-event`
- `web-vitals`

---

### Running the Project

1. **Backend (Django)**:
   - Set up the environment and run the server:
   ```bash
   python manage.py runserver
   ```
   - Your backend will run on [http://localhost:8000](http://localhost:8000).

2. **Frontend (React)**:
   - Run the development server:
   ```bash
   npm start
   ```
   - Your frontend will run on [http://localhost:3000](http://localhost:3000).