// *************************Importing necessary modules*************************
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();  // Loading environment variables from .env file
const secret = process.env.JWT_SECRET;  // Retrieving JWT secret key from environment variables

const auth = (req, res, next) => {

  // *********************Extracting token from request headers********************
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // *************************Verifying token*************************
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.decoded = decoded; // Attach decoded user data to the request object
    next(); // Proceed to next middleware or route handler
  });
};

module.exports = {
  auth,
  secret,
};

