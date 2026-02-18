import express from "express";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import csrf from "csurf";
import path from "path";
import { fileURLToPath } from "url";
import db from "./config/db.js";
import expressLayouts from "express-ejs-layouts";

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLiteStore = SQLiteStoreFactory(session);
const app = express();

// -----------------------------
// STATIC FILES
// -----------------------------
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// BODY PARSERS
// -----------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -----------------------------
// SESSION SETUP
// -----------------------------
app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite" }),
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

// -----------------------------
// DEFAULT PAGE TITLE
// -----------------------------
app.use((req, res, next) => {
  res.locals.title = "NookyUp"; // fallback title
  next();
});

// -----------------------------
// FLASH HELPER (CUSTOM)
// -----------------------------
app.use((req, res, next) => {
  req.flash = function (msg) {
    if (!req.session.messages) req.session.messages = [];
    req.session.messages.push(msg);
  };
  next();
});

// Expose + clear flash messages
app.use((req, res, next) => {
  res.locals.messages = req.session.messages || [];
  req.session.messages = [];
  next();
});

// -----------------------------
// USER INFO IN VIEWS
// -----------------------------
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;

  if (req.session.userId) {
    const user = db
      .prepare("SELECT email FROM users WHERE id = ?")
      .get(req.session.userId);
    res.locals.userEmail = user?.email || null;
  } else {
    res.locals.userEmail = null;
  }

  next();
});

// -----------------------------
// CSRF PROTECTION
// -----------------------------
app.use(csrf({ ignoreMethods: ["GET", "HEAD", "OPTIONS"] }));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// -----------------------------
// VIEW ENGINE + LAYOUTS
// -----------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

// -----------------------------
// ROUTES (ORDER MATTERS!)
// -----------------------------

// IMPORT ROUTES
import authRoutes from "./routes/auth.js";            // /signup, /login, /logout
import dashboardRoutes from "./routes/dashboard.js";  // /dashboard
import adminRoutes from "./routes/admin.js";          // /admin
import messagesRoutes from "./routes/messages.js";    // /messages
import apiRoutes from "./routes/api.js";              // /api/*
import adsBrowseRoutes from "./routes/adsBrowse.js";
import pageRoutes from "./routes/pages.js";


app.use((req, res, next) => {
  const normalizedPath = req.path.replace(/\/$/, "") || "/";

  res.locals.currentRoute = normalizedPath;
  res.locals.user = req.user || null;

  next();
});



// -----------------------------
// SYSTEM ROUTES (STATIC)
// -----------------------------
app.use("/", authRoutes);          // /signup, /login, /logout
app.use("/", pageRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);
app.use("/messages", messagesRoutes);
app.use("/", pageRoutes);


// -----------------------------
// API ROUTES
// -----------------------------
app.use("/api", apiRoutes);

// -----------------------------
// 
// -----------------------------

app.use("/", adsBrowseRoutes);
// -----------------------------
// 404 HANDLER
// -----------------------------
app.use((req, res) => {
  res.status(404).render("404", { title: "Not found" });
});

// -----------------------------
// ERROR HANDLER
// -----------------------------
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Invalid CSRF token");
  }
  console.error(err);
  res.status(500).send("Something went wrong");
});

// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

