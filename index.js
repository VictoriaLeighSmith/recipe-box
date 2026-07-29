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
  const errorMessage = request.query.error || null;

  return response.render("login", { errorMessage, currentUser });
});

// ---------- POST /login - Allows a user to login ----------
app.post("/login", (request, response) => {
  const { email, password } = request.body;
  const user = USERS.find((user) => user.email === email);

  if (user && bcrypt.compareSync(password, user.password)) {
    request.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return response.redirect("/recipes");
  }

  return response.redirect("/login?error=Invalid email or password");
});

// ---------- GET /signup - Render signup form ----------
app.get("/signup", (request, response) => {
  const currentUser = request.session.user;

  return response.render("signup", { errorMessage: null, currentUser });
});

// ---------- POST /signup - Allows a user to signup ----------
app.post("/signup", (request, response) => {
  const currentUser = request.session.user;
  const { username, email, password } = request.body;
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // Validate normalized data and pass appropriate error messages
  if (USERS.find((user) => user.username === normalizedUsername)) {
    return response.status(400).render("signup", {
      errorMessage: "Username is already in use",
      currentUser,
    });
  }

  if (USERS.find((user) => user.email === normalizedEmail)) {
    return response
      .status(400)
      .render("signup", { errorMessage: "Email already in use", currentUser });
  }

  if (!password || password.length < 8) {
    return response.status(400).render("signup", {
      errorMessage: "Password must be at least 8 characters long",
      currentUser,
    });
  }

  // Create a new user after validating and push to the USERS array
  const newUser = {
    id: USERS.length + 1,
    username: normalizedUsername,
    email: normalizedEmail,
    password: bcrypt.hashSync(password, SALT_ROUNDS),
    role: "user",
  };

  USERS.push(newUser);

  // After signing up, redirect them to login
  return response.redirect("/login");
});

// ---------- GET / - Render home page (or redirect to /recipes if logged in) ----------
app.get("/", (request, response) => {
  const currentUser = request.session.user;

  if (currentUser) {
    return response.redirect("/recipes");
  }

  return response.render("index", { currentUser, errorMessage: null });
});

// ---------- GET /recipes - Show all recipes for the logged-in user (all recipes for admin) ----------
app.get("/recipes", (request, response) => {
  const errorMessage = request.query.error || null;
  const currentUser = request.session.user;

  if (!currentUser) {
    return response.redirect(
      "/login?error=You must be logged in to view this page",
    );
  }

  const { id, role } = currentUser;
  let recipesToDisplay;

  // Display all recipes for users with admin privileges, otherwise filter recipes by userId
  if (role === "admin") {
    recipesToDisplay = RECIPES;
  } else {
    recipesToDisplay = RECIPES.filter((recipe) => recipe.userId === id);
  }

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

  if (!currentUser) {
    return response.redirect(
      "/login?error=You must be logged in to create a new recipe",
    );
  }

  return response.render("recipe-new", { errorMessage: null, currentUser });
});

// ---------- POST /recipes - Create a new recipe ----------
app.post("/recipes", (request, response) => {
  const currentUser = request.session.user;

  if (!currentUser) {
    return response.redirect("/login");
  }

  const { name, ingredients, instructions } = request.body;
  const { id } = currentUser;

  // Normalize the data before validating
  const normalizedName = name?.trim();
  const normalizedIngredients = ingredients?.trim();
  const normalizedInstructions = instructions?.trim();

  if (!normalizedName || !normalizedIngredients || !normalizedInstructions) {
    return response.status(400).render("recipe-new", {
      errorMessage: "Recipe must contain name, ingredients, and instructions",
      currentUser,
    });
  }

  // After validating, create a new recipe and push to the RECIPES array
  const newRecipe = {
    id: RECIPES.length + 1,
    name: normalizedName,
    ingredients: normalizedIngredients,
    instructions: normalizedInstructions,
    userId: id,
  };

  RECIPES.push(newRecipe);

  return response.redirect("/recipes");
});

// ---------- GET /recipes/:id - Show a single recipe's details ----------
app.get("/recipes/:id", (request, response) => {
  const currentUser = request.session.user;

  if (!currentUser) {
    return response.redirect("/login");
  }

  const recipeId = parseInt(request.params.id);
  const recipe = RECIPES.find((recipe) => recipe.id === recipeId);
  const { role, id } = currentUser;

  if (!recipe) {
    return response.redirect("/recipes?error=Recipe not found");
  }

  if (recipe.userId !== id && role !== "admin") {
    return response.redirect(
      "/recipes?error=Not authorized to view this recipe",
    );
  }

  const creator = USERS.find((user) => user.id === recipe.userId);

  const recipeWithCreator = {
    ...recipe,
    creatorUsername: creator ? creator.username : "Unknown",
  };

  const canDelete = recipe.userId === id || role === "admin";

  return response.render("recipe-detail", {
    recipe: recipeWithCreator,
    canDelete,
    currentUser,
    errorMessage: null,
  });
});

// ---------- POST /recipes/:id/delete - Delete a recipe ----------
app.post("/recipes/:id/delete", (request, response) => {
  const currentUser = request.session.user;

  if (!currentUser) {
    return response.redirect("/login");
  }

  const recipeId = parseInt(request.params.id);
  const recipe = RECIPES.find((recipe) => recipe.id === recipeId);
  const { role, id } = currentUser;

  if (!recipe) {
    return response.redirect("/recipes?error=Recipe not found");
  }

  if (recipe.userId !== id && role !== "admin") {
    return response.redirect(
      "/recipes?error=Not authorized to delete this recipe",
    );
  }

  const recipeIndex = RECIPES.indexOf(recipe);

  if (recipeIndex > -1) {
    RECIPES.splice(recipeIndex, 1);
  }

  return response.redirect("/recipes");
});

// ---------- GET /logout - Log the user out ----------
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
