# Recipe Box

This repository contains the starting point for the **Personal Recipe Box** assignment. The goal of this project is to build a web application where users can register, log in, and manage their own collection of recipes.

For full project details, requirements, and grading criteria, refer to the [assignment sheet](https://menglishca.github.io/keyin-course-notes/fullstack/qaps/qap-3/) provided in class.

## Setup Instructions

1. **Accept the GitHub Classroom Assignment**
   (use the link provided in the [assignment sheet](https://menglishca.github.io/keyin-course-notes/fullstack/qaps/qap-3/)).

2. Once your repository is created, **clone your new repo** to your local machine:

   ```bash
   git clone <your-new-repo-url>
   ```

3. Navigate into the project directory and install the necessary dependencies:

   ```bash
   cd <your-new-repo-name>
   npm install
   ```

4. **Run the app:**

   ```bash
   npm start
   ```

   This will start the server at `http://localhost:3000/`.

5. You can now begin working on your project, adding your own code and committing your changes as you go:

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

By using this template, you'll have the project structure and initial setup ready to go, so you can focus on building the functionality!

## Features

- **Home Page**:
  - Displays a welcome message describing the recipe box application.
  - Shows "Login" and "Sign Up" buttons.
  - Redirects to the My Recipes page after successful login.

- **Registration Page**:
  - Allows users to create an account with a username, email, and password.
  - Stores passwords securely using bcrypt hashing.

- **Login Page**:
  - Authenticates users using their email and password.
  - Checks hashed passwords for validity during authentication.

- **My Recipes Page**:
  - Lists all recipes created by the logged-in user.
  - Includes a "Create New Recipe" button.
  - For admins, shows all recipes from all users.

- **Create Recipe Page**:
  - Form with fields for recipe name, ingredients, and instructions.
  - Redirects to the recipe detail page after creation.

- **Recipe Detail Page**:
  - Shows the full recipe with name, ingredients, and instructions.
  - Shows a "Delete" button if the recipe belongs to the current user or if the user is an admin.

- **Logout**:
  - Logs the user out by destroying their session and redirecting to the home page.

## Development Guidelines

1. **Authentication**:
   - Use `express-session` for session management.
   - Hash all passwords with bcrypt before storing them.
   - Authenticate users during login by comparing hashed passwords.

2. **Role-Based Access Control**:
   - Admin users can see all recipes from all users.
   - Regular users can only see their own recipes.
   - Only the recipe owner or an admin can delete a recipe.

3. **Recipe Management**:
   - Store recipes in an in-memory array.
   - Each recipe should have a name, ingredients, and instructions.
   - Each recipe should be associated with the user who created it.

4. **Error Handling**:
   - Display errors on login or signup pages if applicable.
   - Display validation errors on the create recipe form.

5. **Security**:
   - Ensure no plaintext passwords are stored or transmitted.
   - Ensure users cannot access or delete recipes that don't belong to them (unless they are an admin).

6. **Data Storage**:
   - Use an in-memory array to store user accounts.
   - Use an in-memory array to store recipes.
   - Persistent data storage is not required.

## Submission Guidelines

- Submit a link to your GitHub repository through the Teams assignment.
- Ensure the application runs correctly with `npm start`.
- Include all required functionality as described in the [assignment sheet](https://menglishca.github.io/keyin-course-notes/fullstack/qaps/qap-3/).

## Notes

- Extra npm packages are allowed (except for templating engines like React).
- All pages should use **EJS templates** for rendering.
- Focus on building secure and functional features with proper user experience.