// *************************Importing necessary modules*************************
const express = require("express");
const router = express.Router();
const categoryControllers = require("../app/controllers/categoryControllers");

// *************************Get all categories Route*************************
router.get("/list", categoryControllers.getAllCategory);

// *************************Get category by ID Route*************************
router.get("/list/:id", categoryControllers.getCategoryById);

// *************************Add category Route*************************
router.post("/admin/add", categoryControllers.addCategory);

// *************************Edit category Route*************************
router.patch("/admin/edit/:id", categoryControllers.editCategory);

// *************************Delete category Route*************************
router.delete("/admin/delete/:id", categoryControllers.deleteCategory);

module.exports = router;    // Exporting router instance
