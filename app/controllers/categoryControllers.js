// *************************Importing necessary modules****************************

const CategoryModel = require("../models/categoryModels");
const jwt = require("jsonwebtoken");
const {
  addCategorySchema,
  editCategorySchema,
} = require("../../joi_validation");

// *************************Controller of Add Property Category*************************
const addCategory = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { error } = addCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title } = req.body;

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized!" });
    }

    const result = await CategoryModel.addCategory(title);

    res.status(201).json({
      message: "Property category added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error adding property category:", error);
    res.status(500).json({ error: "Internal server error" }); 
  }
};

// ***********************Controller of list all Property category*******************
const getAllCategory = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(403).json({ error: "Unauthorized!" });
    }

    const result = await CategoryModel.getAllCategory();

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// *********************Controller of Get Property Category by ID*******************
const getCategoryById = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(403).json({ error: "Unauthorized!" });
    }

    const categoryId = req.params.id;
    const result = await CategoryModel.getCategoryById(categoryId);

    if (result) {
      return res.status(200).json(result);
    } else {
      return res
        .status(404)
        .json({ message: "Property Category is not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// *************************Controller of Edit Property Category*************************
const editCategory = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized!" });
    }

    const { error } = editCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const title = req.body;

    const categoryId = req.params.id;
    const result = await CategoryModel.getCategoryById(categoryId);

    if (result) {
      await CategoryModel.editCategory(result.id, title);

      return res.status(200).json({ message: "Property Category is updated!" });
    } else {
      return res
        .status(404)
        .json({ message: "Property Category is not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// *************************Controller of Delete Property Category*************************
const deleteCategory = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const categoryId = req.params.id;
    const category = await CategoryModel.getCategoryById(categoryId);

    if (!category || category.status === "0") {
      return res
        .status(404)
        .json({ message: "Property Category is not found." });
    }

    const result = await CategoryModel.deleteCategory(categoryId);

    if (result) {
      return res
        .status(200)
        .json({ message: "Property Category deleted successfully" });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to delete Property Category." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addCategory,
  getAllCategory,
  getCategoryById,
  editCategory,
  deleteCategory,
};
