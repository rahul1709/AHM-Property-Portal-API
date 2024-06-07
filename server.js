// *************************Application entry point********************************

// *************************Importing necessary modules****************************
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// ***************************Importing route modules******************************
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

const port = process.env.PORT || 7000; // Setting port for server


// **************************Middleware to parse JSON request bodies*****************
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ***************************Routes for different resources*************************
app.use("/user", userRoutes);
app.use("/property-categories", categoryRoutes);
app.use("/properties", propertyRoutes);


// *************************Home Page Route*************************
app.get("/", (req, res) => {
  res.send(`Project is under running yet! Frontend implementation is going on!`);
});


// *************************Starting Server******************************************
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
