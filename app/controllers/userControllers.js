const UserModel = require("../models/userModels");
const jwt = require("jsonwebtoken");
const { secret } = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  editUserDataSchema,
} = require("../../joi_validation");

const blacklist = new Set();

// Middleware to check token validity before each protected route
const checkTokenValidity = (req, res, next) => {
  const token = req.headers.authorization; 

  // Check if token is missing or blacklisted
  if (!token || blacklist.has(token)) {
    return res.status(401).json({ message: "Access denied. Invalid token" });
  }

  try {
    // Verify JWT token
    jwt.verify(token, secret); 
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Access denied. Invalid token" });
  }
};

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'santos.anderson79@ethereal.email',
    pass: 'dzhpXhEDpTGQEs7FN9'
  }
});

const signUp = async (req, res) => {
  try {
    const { error } = signUpSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { firstName, lastName, email, username, password, contactNo } =
      req.body;

    const existingUser = await UserModel.getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    await UserModel.createUser(
      firstName,
      lastName,
      email,
      username,
      password,
      contactNo
    );

    // Send email confirmation
    const mailOptions = {
      from: '<noreply@example.com>',
      to: 'santos.anderson79@ethereal.email',
      subject: 'Registration Confirmation',
      html: `<h3>Dear <b>${firstName}</b>,</h3>
             <p>Thank you for registering with us!</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "You are registered successfully! Confirmation email sent." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await UserModel.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "30m" }
    );
    res.status(200).json({ message: "Login successful", email, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization; // Extract token from request headers

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Add the token to the blacklist
    blacklist.add(token);
    console.log(blacklist);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const { error } = forgotPasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = req.body;

    const existingUser = await UserModel.getUserByEmail(email);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store the OTP in the database
    await UserModel.updateUserOTP(email, otp);

    // Send OTP via email
    sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const { email, otp, newPassword} = req.body;

    const user = await UserModel.getUserByEmail(email);

    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }


    // Verify OTP
    const isValidOTP = await UserModel.verifyOTP(email, otp);

    if (!isValidOTP || otp !== user.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user's password
    await UserModel.updateUserPassword(email, newPassword);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendOTP = async (email, otp) => {
  try {
    // Create a nodemailer transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "santos.anderson79@ethereal.email",
        pass: "dzhpXhEDpTGQEs7FN9",
      },
    });

    // Send OTP email
    let info = await transporter.sendMail({
      from: '"testing mail functionality" <noreply@example.com>',
      to: "santos.anderson79@ethereal.email",
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const userProfile = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user's data based on decoded token information
    const userData = await UserModel.getUserById(decoded.userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the decoded role is admin or user
    if (decoded.role === "admin") {
      // Fetch all users' data if the role is admin
      const allUsers = await UserModel.getAllUsers();
      return res.status(200).json(allUsers);
    } else {
      // Otherwise, return the user's own data
      return res.status(200).json(userData);
    }
  } catch (error) {
    console.error(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const editUserData = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user's data based on decoded token information
    const userData = await UserModel.getUserById(decoded.userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    const { error } = editUserDataSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Update user data
    const { firstName, lastName, email, username, contactNo } = req.body;
    if (decoded.userId !== userData.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await UserModel.updateUserData(decoded.userId, {
      firstName,
      lastName,
      email,
      username,
      contactNo,
    });

    res.status(200).json({ message: "User data updated successfully" });
  } catch (error) {
    console.error(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUserData = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded role is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Check if the provided user id matches the id in the token
    const userId = req.params.id;
    const success = await UserModel.deleteUserData(userId);

    if (success) {
      return res
        .status(200)
        .json({ message: "User deleted successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // console.error(error);
    // console.log(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  userProfile,
  editUserData,
  deleteUserData,
  checkTokenValidity
};
