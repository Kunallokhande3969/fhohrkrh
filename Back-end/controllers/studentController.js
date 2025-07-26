const { catchAsyncErorrs } = require("../middlewares/catchAsyncErorrs");
const Internship = require("../models/internshipModel");
const Job = require("../models/jobModel");
const Student = require("../models/studentModel");
const ErorrHandler = require("../utiles/ErorrHandler");
const { sendtoken } = require("../utiles/SendTokens");
const { sendmail } = require("../utiles/nodemailer");
const imagekit = require("../utiles/imageKit");
const path = require("path");

// ======================
//  Authentication Controllers
// ======================

exports.studentsignup = catchAsyncErorrs(async (req, res, next) => {
  const student = await new Student(req.body).save();
  sendtoken(student, 200, res);
});

exports.studentsignin = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findOne({ email: req.body.email })
    .select("+password")
    .exec();

  if (!student) {
    return next(
      new ErorrHandler("User not found with this email address!", 404)
    );
  }

  const isMatch = student.comparepassword(req.body.password);
  if (!isMatch) {
    return next(new ErorrHandler("Wrong Password", 401));
  }

  sendtoken(student, 200, res);
});

exports.studentsignout = catchAsyncErorrs(async (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({ 
    success: true,
    message: "Successfully signed out" 
  });
});

// ======================
//  Password Management
// ======================

exports.studentsendmail = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findOne({ email: req.body.email }).exec();

  if (!student) {
    return next(
      new ErorrHandler("User not found with this email address!", 404)
    );
  }

  const otp = Math.floor(Math.random() * 9000 + 1000);
  await sendmail(req, res, next, otp);
  
  student.resetPasswordToken = otp.toString();
  await student.save();
  
  res.status(200).json({
    success: true,
    message: "OTP sent successfully"
  });
});

exports.studentforgetlink = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findOne({ email: req.body.email }).exec();
  
  if (!student) {
    return next(
      new ErorrHandler("User not found with this email address!", 404)
    );
  }

  if (student.resetPasswordToken !== req.body.otp) {
    return next(
      new ErorrHandler("Invalid OTP. Please try again!", 400)
    );
  }

  student.resetPasswordToken = "0";
  student.password = req.body.password;
  await student.save();

  res.status(200).json({
    success: true,
    message: "Password has been successfully changed"
  });
});

exports.studentresetpassword = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.id).exec();
  student.password = req.body.password;
  await student.save();
  sendtoken(student, 200, res);
});

// ======================
//  Profile Management
// ======================

exports.currentStudent = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.id)
    .populate("jobs")
    .populate("internships")
    .exec();
    
  res.status(200).json({
    success: true,
    student
  });
});

exports.updateStudent = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).exec();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    student
  });
});

exports.deletestudent = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findByIdAndDelete(req.id).exec();
  
  if (!student) {
    return next(new ErorrHandler("Student not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Account deleted successfully"
  });
});

exports.studentavatar = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.params.id).exec();

  if (!req.files?.avatar) {
    return next(new ErorrHandler("Please upload an image", 400));
  }

  const file = req.files.avatar;
  const modifiedName = `resumebuilder-${Date.now()}${path.extname(file.name)}`;

  // Delete old avatar if exists
  if (student.avatar.fileId) {
    await imagekit.deleteFile(student.avatar.fileId);
  }

  // Upload new avatar
  const { fileId, url } = await imagekit.upload({
    file: file.data,
    fileName: modifiedName,
  });

  student.avatar = { fileId, url };
  await student.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    avatar: url
  });
});

// ======================
//  Job/Internship Controllers
// ======================

exports.applyinternship = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.id).exec();
  const internship = await Internship.findById(req.params.internshipid).exec();

  if (!internship) {
    return next(new ErorrHandler("Internship not found", 404));
  }

  // Check if already applied
  if (student.internships.includes(internship._id)) {
    return next(new ErorrHandler("Already applied for this internship", 400));
  }

  student.internships.push(internship._id);
  internship.students.push(student._id);
  
  await student.save();
  await internship.save();

  res.status(200).json({
    success: true,
    message: "Successfully applied for internship",
    internship
  });
});

exports.applyjob = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.id).exec();
  const job = await Job.findById(req.params.jobid).exec();

  if (!job) {
    return next(new ErorrHandler("Job not found", 404));
  }

  // Check if already applied
  if (student.jobs.includes(job._id)) {
    return next(new ErorrHandler("Already applied for this job", 400));
  }

  student.jobs.push(job._id);
  job.students.push(student._id);
  
  await student.save();
  await job.save();

  res.status(200).json({
    success: true,
    message: "Successfully applied for job",
    job
  });
});

// ======================
//  Listing Controllers
// ======================

exports.studentreadalljobs = catchAsyncErorrs(async (req, res, next) => {
  const jobs = await Job.find().exec();
  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs
  });
});

exports.studentreadallinternships = catchAsyncErorrs(async (req, res, next) => {
  const internships = await Internship.find().exec();
  res.status(200).json({
    success: true,
    count: internships.length,
    internships
  });
});

exports.readsinglejob = catchAsyncErorrs(async (req, res, next) => {
  const job = await Job.findById(req.params.id).exec();
  
  if (!job) {
    return next(new ErorrHandler("Job not found", 404));
  }

  res.status(200).json({
    success: true,
    job
  });
});

exports.readsingleinternship = catchAsyncErorrs(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id).exec();
  
  if (!internship) {
    return next(new ErorrHandler("Internship not found", 404));
  }

  res.status(200).json({
    success: true,
    internship
  });
});

// ======================
//  Miscellaneous
// ======================

exports.homepage = catchAsyncErorrs(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Secure Homepage!"
  });
});