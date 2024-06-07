const { PropertyModel } = require("../models/propertyModels");
const { ImageModel } = require("../models/imageModels");
const { LocationModel } = require("../models/locationModels");
const UserModel = require("../models/userModels");
const {
  addPropertySchema,
  editPropertySchema,
} = require("../../joi_validation");

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// *************************Create a nodemailer transporter*************************
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  // secure: false, // true for 465, false for other ports
  auth: {
    user: "santos.anderson79@ethereal.email",
    pass: "dzhpXhEDpTGQEs7FN9",
  },
});

// *************************Function to send an email*************************
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: '"testing mail functionality" <noreply@example.com>',
      to,
      subject,
      text,
    });
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// *************************Add Property Controller*************************
const addProperty = async (req, res) => {
  try {
    const { error } = addPropertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      title,
      description,
      price,
      size,
      rooms,
      bathrooms,
      parking,
      property_age,
      user_id,
      category_id,
      listing_type,
      address,
      pincode,
    } = req.body;

    const image = req.file;

    if (decoded.userId !== Number(user_id)) {
      const imagePath = path.join(
        __dirname,
        "../../upload/images",
        image.filename
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Image is deleted coz all the data is not correct`);
        }
      });

      return res.json({
        msg: `Please, enter the correct User ID, You can't add Property with current User ID.`,
      });
    }

    // Check for duplicate property

    const isDuplicate = await PropertyModel.checkForDuplicate(
      title,
      description,
      size,
      rooms,
      bathrooms,
      property_age,
      category_id
    );

    if (isDuplicate) {
      // Delete the uploaded image if property already exists
      if (image) {
        const imagePath = path.join(
          __dirname,
          "../../upload/images",
          image.filename
        );
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          }
          console.log("Image deleted");
        });
      }
      return res.status(400).json({ error: "Property already exists." });
    }

    // Add property

    const propertyResult = await PropertyModel.addProperty(
      title,
      description,
      price,
      size,
      rooms,
      bathrooms,
      parking,
      property_age,
      user_id,
      category_id,
      listing_type
    );

    const property_id = propertyResult[0].insertId;

    // Add property location

    const locationResult = await LocationModel.addPropertyLocation(
      address,
      pincode,
      property_id
    );

    // Add property image if provided
    if (image && propertyResult) {
      const imageName = req.file.originalname;
      const imageResult = await ImageModel.addPropertyImage(
        imageName,
        property_id
      );

      if (!imageResult) {
        // Rollback property and location creation if image addition fails
        await PropertyModel.deleteProperty(property_id);
        await LocationModel.deletePropertyLocation(property_id);
        return res.status(500).json({ error: "Failed to add property image" });
      }
    }

    // Fetch user details from the database based on the decoded user ID
    const user = await UserModel.getUserById(decoded.userId);

    // Fetch property details from the database based on the inserted property ID
    const property = await PropertyModel.getPropertyById(property_id);

    // Create the message for the email dynamically
    const emailMessage = `User ${user.username} (${user.email}, ID: ${user.id}) has added the property "${property[0].title}" which is located at "${property[0].address}, ${property[0].city}, ${property[0].pincode} ".`;

    // Call sendEmail function to send an email
    sendEmail(
      "santos.anderson79@ethereal.email",
      "New Property Added",
      emailMessage
    );

    res.status(201).json({
      message: "Property added successfully",
      propertyId: property_id,
    });
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *************************List All Property Controller*************************
const getAllProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *************************Get Property By ID Controller*************************
const getPropertyById = async (req, res) => {
  const property_id = req.params.id;
  try {
    const properties = await PropertyModel.getPropertyById(property_id);
    if (!properties || properties.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const property = properties[0];

    const response = {
      title: property.title,
      description: property.description,
      size: property.size,
      rooms: property.rooms,
      price: property.price,
      parking: property.parking,
      listing_type: property.listing_type,
      address: property.address,
      city: property.city,
      pincode: property.pincode,
      images: properties.map((item) => item.image_name),
      user: {
        name: property.name,
        email: property.email,
        contact: property.contactNo,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *****************Get Properties added by particular user Controller******************
const getPropertiesByUser = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const properties = await PropertyModel.getPropertiesByUser(userId);

    if (!properties || properties.length === 0) {
      return res
        .status(404)
        .json({ error: "No properties found for the authenticated user" });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *************************Search the Property Controller*************************
const searchProperty = async (req, res) => {
  try {
    const queryParams = req.query;
    let [data] = await PropertyModel.findProperty(queryParams);
    // console.log(data);
    res.send(data);
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).send("Internal Server Error");
  }
};

// *************************Edit Property Controller*************************
const editProperty = async (req, res) => {
  try {
    const { error } = editPropertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { Pid } = req.params;
    const {
      title,
      description,
      price,
      size,
      rooms,
      bathrooms,
      parking,
      property_age,
      user_id,
      category_id,
      listing_type,
      address,
      pincode,
    } = req.body;

    if (decoded.userId !== Number(user_id)) {
      return res.status(403).json({
        msg: `You are not authorized to edit this property.`,
      });
    }

    const updatedProperty = await PropertyModel.editProperty(Pid, {
      title,
      description,
      price,
      size,
      rooms,
      bathrooms,
      parking,
      property_age,
      user_id,
      category_id,
      listing_type,
      address,
      pincode,
    });

    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *************************Edit Property Image Controller*************************
const editPropertyImage = async (req, res) => {
  try {
    const { Pid } = req.params;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Add image to local folder
    const imageName = req.file.originalname;
    const imagePath = path.join(
      __dirname,
      "../../upload/images",
      image.filename
    );

    // Add image entry to database
    const imageResult = await ImageModel.addPropertyImage(imageName, Pid);

    if (!imageResult) {
      // If image insertion fails, delete the uploaded image
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        }
        console.log("Image deleted");
      });
      return res.status(500).json({ error: "Failed to add property image" });
    }

    res.status(201).json({
      message: "Property image edited successfully",
      imageId: imageResult.insertId,
    });
  } catch (error) {
    console.error("Error adding property image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *************************Delete Property Controller*************************
const deleteProperty = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { Pid } = req.params;

    // Fetch property details from the database
    const property = await PropertyModel.getPropertyById(Pid);

    if (!property) {
      return res.status(404).json({ msg: `Property not found.` });
    }

    // Check if the decoded userId matches the user_id of the property
    // if (decoded.userId !== property[0].user_id && decoded.role === 'admin') {
    //   const deletedProperty = await PropertyModel.deleteProperty(Pid);
    //   res.status(200).json(deletedProperty);
    // }

    if (decoded.userId !== property[0].user_id && decoded.role === "user") {
      return res
        .status(403)
        .json({ msg: `You are not authorized to delete this property.` });
    }

    // Fetch user details from the database based on the decoded user ID
    const user = await UserModel.getUserById(decoded.userId);

    // Create the message for the email dynamically
    const emailMessage = `User ${user.username} (${user.email}, ID: ${user.id}) has deleted the property "${property[0].title}" which is located at "${property[0].address}, ${property[0].city}, ${property[0].pincode} ".`;

    // Call sendEmail function to send an email
    sendEmail(
      "santos.anderson79@ethereal.email",
      "Property Deleted",
      emailMessage
    );

    const deletedProperty = await PropertyModel.deleteProperty(Pid);
    res.status(200).json(deletedProperty);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addProperty,
  getAllProperties,
  getPropertyById,
  getPropertiesByUser,
  editProperty,
  editPropertyImage,
  deleteProperty,
  searchProperty,
};
