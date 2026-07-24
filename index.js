const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: "replace_this_with_a_secure_key",
        resave: false,
        saveUninitialized: true,
    })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const USERS = [
    {
        id: 1,
        username: "AdminUser",
        email: "admin@example.com",
        password: bcrypt.hashSync("admin123", SALT_ROUNDS),
        role: "admin",
    },
    {
        id: 2,
        username: "RegularUser",
        email: "user@example.com",
        password: bcrypt.hashSync("user123", SALT_ROUNDS),
        role: "user",
    },
];

const RECIPES = [];

// GET /login - Render login form
app.get("/login", (request, response) => {
    response.render("login");
});

// POST /login - Allows a user to login
app.post("/login", (request, response) => {

});

// GET /signup - Render signup form
app.get("/signup", (request, response) => {
    response.render("signup");
});

// POST /signup - Allows a user to signup
app.post("/signup", (request, response) => {

});

// GET / - Render home page (or redirect to /recipes if logged in)
app.get("/", (request, response) => {
    if (request.session.user) {
        return response.redirect("/recipes");
    }
    response.render("index");
});

// GET /recipes - Show all recipes for the logged-in user (all recipes for admin)
app.get("/recipes", (request, response) => {

});

// GET /recipes/new - Render create recipe form
app.get("/recipes/new", (request, response) => {

});

// POST /recipes - Create a new recipe
app.post("/recipes", (request, response) => {

});

// GET /recipes/:id - Show a single recipe's details
app.get("/recipes/:id", (request, response) => {

});

// POST /recipes/:id/delete - Delete a recipe
app.post("/recipes/:id/delete", (request, response) => {

});

// GET /logout - Log the user out
app.get("/logout", (request, response) => {
    request.session.destroy((error) => {
        if (error) {
            console.error("Error destroying session:", error);
        }
        response.redirect("/");
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});