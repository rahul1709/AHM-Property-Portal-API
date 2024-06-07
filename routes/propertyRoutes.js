// *************************Importing necessary modules*************************
const express = require("express");
const router = express.Router();
const propertyController = require("../app/controllers/propertyControllers");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer"); // Importing multer for handling file uploads

router.use(express.json()); // Using JSON parser middleware 

// *********************Multer configuration for handling file uploads***************
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/images");  // Destination directory for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);  // File name preservation
  },
});

// *******************Multer instance with defined storage configuration*****************
const upload = multer({ storage: storage });

// *************************Add property Route*************************
router.post( "/add", authMiddleware, upload.single("image") , propertyController.addProperty );

// *************************Get all property Route*************************
router.get( "/list", propertyController.getAllProperties );

// *************************Get property by ID Route*************************
router.get( "/list/:id", propertyController.getPropertyById );

// ********************Get properties added by authenticated user Route**************
router.get("/my-properties", authMiddleware, propertyController.getPropertiesByUser);

// *************************Search the property Route*************************
router.get("/search", propertyController.searchProperty);

// *************************Edit property Route*************************
router.put( "/edit/:Pid", upload.none(), authMiddleware, propertyController.editProperty );

// *************************Edit Property Image Route*************************
router.post("/edit/image/:Pid", authMiddleware, upload.single("image") ,propertyController.editPropertyImage);

// *************************Delete Property Route*************************
router.delete( "/delete/:Pid", authMiddleware, propertyController.deleteProperty );

// *************************Exporting router instance*************************
module.exports = router;
