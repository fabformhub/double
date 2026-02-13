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
// FLASH HELPER
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
// VIEW ENGINE
// -----------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// -----------------------------
// ROUTES (ORDER MATTERS!)
// -----------------------------

// IMPORT ROUTES
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";
import homeRoutes from "./routes/home.js";
import locationRoutes from "./routes/locations.js";
import adsRoutes from "./routes/ads.js";
import messagesRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";
import dashboardRoutes from "./routes/dashboard.js";
import startRoutes from "./routes/start.js";

// -----------------------------
// API MUST COME FIRST
// -----------------------------
app.use("/api", apiRoutes);

// -----------------------------
// AUTH
// -----------------------------
app.use("/", authRoutes);

// -----------------------------
// HOME (city list)
// -----------------------------
app.use("/", homeRoutes);

// -----------------------------
// LOCATION ROUTES
// -----------------------------
app.use("/", locationRoutes);

// -----------------------------
// ADS ROUTES (category + subcategory)
// -----------------------------
app.use("/", adsRoutes);

// -----------------------------
// MESSAGES
// -----------------------------
app.use("/messages", messagesRoutes);

// -----------------------------
// ADMIN
// -----------------------------
app.use("/admin", adminRoutes);

// -----------------------------
// DASHBOARD
// -----------------------------
app.use("/dashboard", dashboardRoutes);

// -----------------------------
// START PAGE
// -----------------------------
app.use("/", startRoutes);

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

