# Recipe Box

Recipe Box is a web-based recipe management application built with Node.js, Express, and EJS. It allows users to create and manage their own recipes through a simple interface, with session-based authentication and role-based access control.

## Features

- User registration and login with bcrypt password hashing
- Session-based authentication
- Create, view, and delete recipes
- User-specific recipe collections
- Role-based authorization for regular users and administrators
- Admin access to view and manage recipes across all users
- Input validation and error handling

## Technologies

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, HTML, CSS
- **Authentication:** express-session, bcrypt
- **Data storage:** In-memory JavaScript arrays

## Getting Started

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the application using `node index.js`.
4. Open `http://localhost:3000` in your browser.

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| User | user@example.com | user123 |

New users can also register through the signup page.

**Note:** This project uses in-memory data storage, so newly registered accounts and recipes are reset when the server restarts.
