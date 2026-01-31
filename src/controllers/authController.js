import bcrypt from "bcrypt";
import db from "../config/db.js";

export function showLogin(req, res) {
  res.render("auth/login", { title: "Login", error: null });
}

export function showSignup(req, res) {
  res.render("auth/signup", { title: "Sign Up", error: null });
}

export function signup(req, res) {
  const { email, username, password } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  try {
    db.prepare(
      "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)"
    ).run(email, username, hash);

    res.redirect("/login");
  } catch (err) {
    res.render("auth/signup", {
      title: "Sign Up",
      error: "Email or username already exists"
    });
  }
}

export function login(req, res) {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render("auth/login", {
      title: "Login",
      error: "Invalid credentials"
    });
  }

  req.session.userId = user.id;
  res.redirect("/ads");
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

