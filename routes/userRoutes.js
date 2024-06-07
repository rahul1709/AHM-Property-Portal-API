// *************************Importing necessary modules*************************
const express = require("express");
const router = express.Router();    // Creating router instance
const { auth } = require("../middleware/auth");

const userController = require("../app/controllers/userControllers");

// *************************Sign Up Route*************************
router.post("/signUp", userController.signUp);

// *************************Login Route*************************
router.post("/login", userController.login);

// *************************Forgot Password Route*************************
router.post("/forgot-password", userController.forgotPassword);

// *************************Reset Password Route*************************
router.post("/reset-password", userController.resetPassword);

// Logout Route
router.post('/logout', userController.logout);


// *************************Profile Route*************************
router.post("/profile", userController.checkTokenValidity, userController.userProfile);

// *************************Edit User Data Route*************************
router.put("/edit", auth, userController.editUserData);

// *************************Soft Delete Route*************************
router.delete("/delete/:id", userController.deleteUserData);

// *************************Exporting router instance*************************
module.exports = router;
