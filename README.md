# SkillSync: Internal Campus Placement Portal

## Project Overview
SkillSync is a web-based campus placement portal designed to connect students, recruiting companies, and placement officers through a centralized platform. It supports job listings, student applications, profile management, and application review.

## Features
- **Student:** Browse jobs, apply for opportunities, manage profiles, and track application status.
- **Company:** Post job openings, view listings, and manage job posts.
- **Placement Officer (Admin):** Review applications, view student and job information, and monitor application status.
- **Skill Matching:** Display skill matches between student profiles and job requirements.

## Technology Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Cloud Hosting:** Amazon S3 for static website hosting, Amazon EC2 for the backend, and Amazon RDS for PostgreSQL.

## Project Structure
- `index.html` - Login page
- `student.html` - Student dashboard
- `company.html` - Company dashboard
- `admin.html` - Placement officer dashboard
- `style.css` - User interface styling
- `login.js` - Login functionality
- `script.js` - Dashboard interactions
- `server.js` - Express backend and API routes
- `db.js` - PostgreSQL connection configuration
- `schema.sql` - Database schema
- `package.json` - Backend dependencies and scripts
- `bg.jpg` - Background image

## Setup Instructions

### 1. Install Dependencies
Install Node.js and npm, then run:

```bash
npm install
```

### 2. Configure Database
Create a PostgreSQL database and execute the SQL statements in `schema.sql`.

Configure the following environment variables for the backend:

- `PGHOST` - Database host
- `PGPORT` - Database port, usually `5432`
- `PGDATABASE` - Database name
- `PGUSER` - Database username
- `PGPASSWORD` - Database password

### 3. Start the Backend
Run the command defined by the project's start script in `package.json`. If no start script is configured, use:

```bash
node server.js
```

### 4. Open the Frontend
Open `index.html` in a browser or host the frontend using a static website hosting service. Update the frontend API address to match the backend endpoint when running in a different environment.

## Cloud Deployment
The project was deployed using Amazon S3, Amazon EC2, and Amazon RDS for PostgreSQL. Cloud resources were used to host the frontend, backend, and database separately.

**Note:** The cloud resources used for the demonstration have been stopped or taken offline. Deployment URLs may no longer be accessible.

## Security
Database credentials should be provided through environment variables and should not be committed to the repository. Production deployments should use HTTPS, restrict network access, and configure database permissions securely.

## Academic Project
Developed as an academic project to demonstrate full-stack web development, relational database integration, role-based functionality, and cloud deployment.
