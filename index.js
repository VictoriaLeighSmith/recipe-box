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
    secret: "5d8b2e94f31a7c68b0d1e9f4a6c3b8d7f2a5e9c1d4b7f0a8",
    resave: false,
    saveUninitialized: false,
  }),
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

// ---------- GET /login - Render login form ----------
app.get("/login", (request, response) => {
  const currentUser = request.session.user;
  const errorMessage = request.session.errorMessage;

  // Delete the error message if it exists so it doesn't persist on the page
  if (errorMessage) {
    delete request.session.errorMessage;
  }

  return response.render("login", { errorMessage, currentUser });
});

// ---------- POST /login - Allows a user to login ----------
app.post("/login", (request, response) => {
  const { email, password } = request.body;

  // Validate that email and password were provided
  if (!email?.trim()) {
    request.session.errorMessage = "Email must be provided.";
    return response.redirect("/login");
  }

  if (!password?.trim()) {
    request.session.errorMessage = "Password must be provided.";
    return response.redirect("/login");
  }

  // Look up the user by email
  const userRecord = USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
  );

  // Display an error if the email provided didn't match any of the records
  if (!userRecord) {
    request.session.errorMessage = "Invalid email or password.";
    return response.redirect("/login");
  }

  // Display an error if the password provided didn't match what we have stored in the users array
  if (!bcrypt.compareSync(password.trim(), userRecord.password)) {
    request.session.errorMessage = "Invalid email or password.";
    return response.redirect("/login");
  }

  // Create a user session with the validated data
  request.session.user = {
    id: userRecord.id,
    username: userRecord.username,
    email: userRecord.email,
    role: userRecord.role,
  };

  return response.redirect("/recipes");
});

// ---------- GET /signup - Render signup form ----------
app.get("/signup", (request, response) => {
  const currentUser = request.session.user;
  const errorMessage = request.session.errorMessage;

  if (errorMessage) {
    delete request.session.errorMessage;
  }

  return response.render("signup", { errorMessage, currentUser });
});

// ---------- POST /signup - Allows a user to signup ----------
app.post("/signup", (request, response) => {
  const { username, email, password } = request.body;

  // Validate that username, email and password were provided
  if (!username?.trim()) {
    request.session.errorMessage = "Username must be provided.";
    return response.redirect("/signup");
  }

  if (!email?.trim()) {
    request.session.errorMessage = "Email must be provided.";
    return response.redirect("/signup");
  }

  if (!password?.trim()) {
    request.session.errorMessage = "Password must be provided.";
    return response.redirect("/signup");
  }

  // Check to make sure password is at least 8 characters long
  if (password.trim().length < 8) {
    request.session.errorMessage = "Passwords must be at least 8 characters.";
    return response.redirect("/signup");
  }

  // Validate that username isn't already in use. If it is, display an error message
  const isUsernameTaken = USERS.find(
    (user) => user.username.toLowerCase() === username.trim().toLowerCase(),
  );

  if (isUsernameTaken) {
    request.session.errorMessage = "Username is already in use.";
    return response.redirect("/signup");
  }

  // Validate that email isn't already in use. If it is, display an error message
  const isEmailInUse = USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (isEmailInUse) {
    request.session.errorMessage = "Email is already in use.";
    return response.redirect("/signup");
  }

  // Hash user's password after validation
  const hashedPassword = bcrypt.hashSync(password.trim(), SALT_ROUNDS);

  // Push the new user to the users array
  const newUser = {
    id: USERS.length + 1,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: "user",
  };

  USERS.push(newUser);

  return response.redirect("/login");
});

// ---------- GET / - Render home page (or redirect to /recipes if logged in) ----------
app.get("/", (request, response) => {
  const currentUser = request.session.user;
  const errorMessage = request.session.errorMessage;

  // // If the user is logged in redirect to the recipes page
  // if (currentUser) {
  //   return response.redirect("/recipes");
  // }

  // Delete the error message if it exists so it doesn't persist on the page
  if (errorMessage) {
    delete request.session.errorMessage;
  }

  return response.render("index", { currentUser, errorMessage });
});

// ---------- GET /recipes - Show all recipes for the logged-in user (all recipes for admin) ----------
app.get("/recipes", (request, response) => {
  const currentUser = request.session.user;
  const errorMessage = request.session.errorMessage;

  // If the current user isn't logged in, display an error and redirect
  if (!currentUser) {
    request.session.errorMessage = "You must be logged in to view this page.";
    return response.redirect("/login");
  }

  // Delete the error message if it exists so it doesn't persist on the page
  if (errorMessage) {
    delete request.session.errorMessage;
  }

  const { id, role } = currentUser;

  // Display all recipes for users with admin privileges, otherwise filter recipes by userId
  const recipesToDisplay =
    role === "admin"
      ? RECIPES
      : RECIPES.filter((recipe) => recipe.userId === id);

  // Map the recipe to the user so we can display a creator username for admin users
  const recipes = recipesToDisplay.map((recipe) => {
    const creator = USERS.find((user) => user.id === recipe.userId);

    return {
      ...recipe,
      creatorUsername: creator ? creator.username : "Unknown",
    };
  });

  return response.render("recipes", {
    recipes,
    currentUser,
    errorMessage,
  });
});

// ---------- GET /recipes/new - Render create recipe form ----------
app.get("/recipes/new", (request, response) => {
  const currentUser = request.session.user;
  const errorMessage = request.session.errorMessage;

  // If the current user isn't logged in, display an error and redirect
  if (!currentUser) {
    request.session.errorMessage = "You must be logged in to view this page.";
    return response.redirect("/login");
  }

  // Delete the error message if it exists so it doesn't persist on the page
  if (errorMessage) {
    delete request.session.errorMessage;
  }

  return response.render("recipe-new", { errorMessage, currentUser });
});

// ---------- POST /recipes - Create a new recipe ----------
app.post("/recipes", (request, response) => {
  const currentUser = request.session.user;

  // If the current user isn't logged in, display an error and redirect
  if (!currentUser) {
    request.session.errorMessage = "You must be logged in to view this page.";
    return response.redirect("/login");
  }

  const { name, ingredients, instructions } = request.body;
  const { id } = currentUser;

  // Validate that a user has given all input needed to create a new recipe
  if (!name?.trim() || !ingredients?.trim() || !instructions?.trim()) {
    request.session.errorMessage =
      "Recipe must contain name, ingredients, and instructions.";
    return response.redirect("/recipes/new");
  }

  // After validating, create a new recipe and push to the RECIPES array
  const newRecipe = {
    id: RECIPES.length + 1,
    name: name.trim(),
    ingredients: ingredients.trim(),
    instructions: instructions.trim(),
    userId: id,
  };

  RECIPES.push(newRecipe);

  return response.redirect(`/recipes/${newRecipe.id}`);
});

// ---------- GET /recipes/:id - Show a single recipe's details ----------
app.get("/recipes/:id", (request, response) => {
  const currentUser = request.session.user;
  const errorMessage = request.session.errorMessage;

  // If the current user isn't logged in, display an error and redirect
  if (!currentUser) {
    request.session.errorMessage = "You must be logged in to view this page.";
    return response.redirect("/login");
  }

  // Delete the error message if it exists so it doesn't persist on the page
  if (errorMessage) {
    delete request.session.errorMessage;
  }

  const recipeId = Number(request.params.id);
  const recipe = RECIPES.find((recipe) => recipe.id === recipeId);
  const { role, id } = currentUser;

  // If the recipe doesn't exist, display an error and redirect to all recipes
  if (!recipe) {
    request.session.errorMessage = "Recipe not found.";
    return response.redirect("/recipes");
  }

  // If the recipe's userId doesn't match the current user's id or the user is not an admin, display an error and redirect to all recipes
  if (recipe.userId !== id && role !== "admin") {
    request.session.errorMessage = "Not authorized to view this recipe.";
    return response.redirect("/recipes");
  }

  // Find the user who created the recipe
  const creator = USERS.find((user) => user.id === recipe.userId);

  // Create a recipe object that includes the creator's username so we can display it
  const recipeWithCreator = {
    ...recipe,
    creatorUsername: creator ? creator.username : "Unknown",
  };

  // Check to see if the recipe was created by the current user, or if the user is an admin so we can determine if they can delete the recipe
  const canDelete = recipe.userId === id || role === "admin";

  return response.render("recipe-detail", {
    recipe: recipeWithCreator,
    canDelete,
    currentUser,
    errorMessage,
  });
});

// ---------- POST /recipes/:id/delete - Delete a recipe ----------
app.post("/recipes/:id/delete", (request, response) => {
  const currentUser = request.session.user;

  // If the current user isn't logged in, display an error and redirect
  if (!currentUser) {
    request.session.errorMessage = "You must be logged in to view this page.";
    return response.redirect("/login");
  }

  const recipeId = Number(request.params.id);
  const recipe = RECIPES.find((recipe) => recipe.id === recipeId);
  const { role, id } = currentUser;

  // If the recipe doesn't exist, display an error and redirect to all recipes
  if (!recipe) {
    request.session.errorMessage = "Recipe not found.";
    return response.redirect("/recipes");
  }

  // If the user isn't the creator and isn't an admin, display an error and redirect
  if (recipe.userId !== id && role !== "admin") {
    request.session.errorMessage = "Not authorized to delete this recipe.";
    return response.redirect("/recipes");
  }

  // Find the index of the recipe to delete
  const recipeIndex = RECIPES.indexOf(recipe);

  // If the index was found, delete the recipe from the recipes array
  if (recipeIndex > -1) {
    RECIPES.splice(recipeIndex, 1);
  }

  return response.redirect("/recipes");
});

// ---------- GET /logout - Log the user out ----------
app.get("/logout", (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      console.error("Error destroying session: ", error);
      request.session.errorMessage =
        "An unknown error occurred while logging out, please try again.";
      return response.redirect("/recipes");
    }
    return response.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
