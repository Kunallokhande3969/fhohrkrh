require("dotenv").config();

const express = require("express");
const app = express();

// ===== Logger (Morgan) =====
const logger = require("morgan");
app.use(logger("tiny"));

// ===== Database Connection =====
require("./models/database").connectDatabase();

// ===== CORS =====
const cors = require("cors");



app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://kunal-lokhande.vercel.app",
      "https://jobs-and-internships.vercel.app" // नया URL जोड़ा
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] // सभी मेथड्स अलाउड
  })
);

// ===== Body Parsers =====
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ===== Session and Cookies =====
const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRETE || "defaultsecret", // स्पेलिंग सुधारी
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// ===== Routes =====
app.use("/", require("./routes/indexRouter"));
app.use("/student", require("./routes/studentRouter")); // नया रूट जोड़ा
app.use("/resume", require("./routes/resumeRoutes"));
app.use("/employe", require("./routes/employeRouter"));

// ===== Error Handling =====
const ErrorHandler = require("./utiles/ErorrHandler"); // स्पेलिंग सुधारी
const { generatedErorrs } = require("./middlewares/erorrs"); // स्पेलिंग सुधारी

// Catch-all route
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found: ${req.url}`, 404));
});

// Error Middleware
app.use(generatedErorrs);

// ===== Start Server =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));