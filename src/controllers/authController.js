import bcrypt from "bcrypt";
import db from "../config/db.js";

export function showLogin(req, res) {
  res.render("auth/login", {
    title: "Login",
    csrfToken: req.csrfToken(),
    error: null
  });
}

export function showSignup(req, res) {
  res.render("auth/signup", {
    title: "Sign Up",
    csrfToken: req.csrfToken(),
    error: null
  });
}

export function signup(req, res) {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("auth/signup", {
      title: "Sign Up",
      csrfToken: req.csrfToken(),
      error: "Passwords do not match"
    });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.render("auth/signup", {
      title: "Sign Up",
      csrfToken: req.csrfToken(),
      error: "Email already registered"
    });
  }

  const hash = bcrypt.hashSync(password, 10);

  db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hash);

  req.flash("Account created successfully! You can now log in.");
  res.redirect("/login");
}

export function login(req, res) {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    return res.render("auth/login", {
      title: "Login",
      csrfToken: req.csrfToken(),
      error: "Invalid email or password"
    });
  }

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) {
    return res.render("auth/login", {
      title: "Login",
      csrfToken: req.csrfToken(),
      error: "Invalid email or password"
    });
  }

  req.session.userId = user.id;
  req.flash("Welcome back!");
  res.redirect("/dashboard");
}

export function logout(req, res) {
  req.session.destroy(() => {
    req.flash("You have been logged out.");
    res.redirect("/login");
  });
}

