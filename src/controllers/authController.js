import bcrypt from "bcrypt";
import db from "../config/db.js";

export function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

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
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("auth/signup", {
      title: "Sign Up",
      csrfToken: req.csrfToken(),
      error: "Passwords do not match"
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  const existing = db.prepare(`
    SELECT id FROM users 
    WHERE username = ? OR email = ?
  `).get(cleanUsername, cleanEmail);

  if (existing) {
    return res.render("auth/signup", {
      title: "Sign Up",
      csrfToken: req.csrfToken(),
      error: "Username or email already registered"
    });
  }

  const hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (username, email, password)
    VALUES (?, ?, ?)
  `).run(cleanUsername, cleanEmail, hash);

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

