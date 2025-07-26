const express = require("express");
const router = express.Router();
const { 
    homepage,
    studentsignup,
    studentsignin,
    studentsignout,
    current,
    studentsendmail,
    studentforgetlink,
    studentresetpassword,
    studentupdate,
    studentavatar,
    applyinternship,
    applyjob,
    deletestudent,
    studentreadalljobs,
    studentreadallinternships,
    readsinglejob,
    readsingleinternship,
} = require("../controllers/indexController");
const { isAuthenticated } = require("../middlewares/auth");

// ====================
//  Public Routes
// ====================

// GET / - Homepage
router.get("/", homepage);

// POST /student/signup - Student registration
router.post("/student/signup", studentsignup);

// POST /student/signin - Student login
router.post("/student/signin", studentsignin);

// POST /student/send-mail - Send email
router.post("/student/send-mail", studentsendmail);

// POST /student/forget-link - Password reset link
router.post("/student/forget-link", studentforgetlink);

// ====================
//  Authenticated Routes
// ====================

// GET /student - Current student profile
router.get("/student", isAuthenticated, current);

// DELETE /student - Delete student account
router.delete("/student", isAuthenticated, deletestudent);

// GET /student/signout - Student logout
router.get("/student/signout", isAuthenticated, studentsignout);

// POST /student/reset-password/:id - Reset password
router.post("/student/reset-password/:id", isAuthenticated, studentresetpassword);

// PUT /student/update/:id - Update student profile
router.put("/student/update/:id", isAuthenticated, studentupdate);

// POST /student/avatar/:id - Update student avatar
router.post("/student/avatar/:id", isAuthenticated, studentavatar);

// ====================
//  Job/Internship Routes
// ====================

// GET /student/jobs - Get all jobs
router.get("/student/jobs", isAuthenticated, studentreadalljobs);

// GET /student/internships - Get all internships
router.get("/student/internships", isAuthenticated, studentreadallinternships);

// GET /job/:id - Get single job
router.get("/job/:id", isAuthenticated, readsinglejob);

// GET /internship/:id - Get single internship
router.get("/internship/:id", isAuthenticated, readsingleinternship);

// POST /student/apply/internship/:internshipid - Apply for internship
router.post("/student/apply/internship/:internshipid", isAuthenticated, applyinternship);

// POST /student/apply/job/:jobid - Apply for job
router.post("/student/apply/job/:jobid", isAuthenticated, applyjob);

module.exports = router;