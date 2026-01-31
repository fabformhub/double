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
//  ROUTES (imported first, mounted later)
// -----------------------------
import dashboardRoutes from "./routes/dashboard.js";
import adsRoutes from "./routes/ads.js";
import authRoutes from "./routes/auth.js";
import messagesRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";

// -----------------------------
//  VIEW ENGINE (EJS)
// -----------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// -----------------------------
//  STATIC FILES
// -----------------------------
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
//  BODY PARSERS
// -----------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -----------------------------
//  SESSION SETUP
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
//  FLASH MESSAGES (must come AFTER session)
// -----------------------------
app.use((req, res, next) => {
  res.locals.messages = req.session.messages || [];
  next();
});

// -----------------------------
//  MAKE userId AVAILABLE TO ALL VIEWS
//  (must come AFTER session, BEFORE CSRF)
// -----------------------------
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  next();
});

// -----------------------------
//  CSRF PROTECTION (must come AFTER session)
// -----------------------------
app.use(csrf({ ignoreMethods: ["GET", "HEAD", "OPTIONS"] }));

// Make CSRF token available in all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// -----------------------------
//  ROUTES (MUST COME AFTER MIDDLEWARE)
// -----------------------------
app.use("/", authRoutes);
app.use("/ads", adsRoutes);
app.use("/messages", messagesRoutes);
app.use("/admin", adminRoutes);
app.use("/dashboard", dashboardRoutes);

// -----------------------------
//  HOME PAGE
// -----------------------------
app.get("/", (req, res) => {
  const ads = db.prepare("SELECT * FROM ads ORDER BY created_at DESC").all();
  res.render("ads/index", { title: "Home", ads });
});

// -----------------------------
//  ERROR HANDLING
// -----------------------------
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Invalid CSRF token");
  }
  console.error(err);
  res.status(500).send("Something went wrong");
});

// -----------------------------
//  START SERVER
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

