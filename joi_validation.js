// *******************Importing Joi module for data validation***************
const Joi = require("joi");

// *************************Schema for user sign up*************************
const signUpSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  contactNo: Joi.string().required(),
});

// *************************Schema for user login*************************
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// *************************Schema for forgot password request*************************
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

// *************************Schema for resetting password*************************
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().required(),
});

// *************************Schema for user profile*************************
const profileSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// *************************Schema for editing user*************************
const editUserDataSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  contactNo: Joi.string().required(),
});

// *************************Schema for adding a category*************************
const addCategorySchema = Joi.object({
  title: Joi.string().required(),
});

// *************************Schema for editing a category*************************
const editCategorySchema = Joi.object({
  title: Joi.string().required(),
});

// *************************Schema for adding a property*************************
const addPropertySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  size: Joi.number().required(),
  rooms: Joi.number().required(),
  bathrooms: Joi.number().required(),
  parking: Joi.string().required(),
  property_age: Joi.number().required(),
  user_id: Joi.number().required(),
  category_id: Joi.number().required(),
  listing_type: Joi.string().required(),
  address: Joi.string().required(),
  pincode: Joi.number().required(),
});

// *************************Schema for editing a property*************************
const editPropertySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  size: Joi.number().required(),
  rooms: Joi.number().required(),
  bathrooms: Joi.number().required(),
  parking: Joi.string().required(),
  property_age: Joi.number().required(),
  user_id: Joi.number().required(),
  category_id: Joi.number().required(),
  listing_type: Joi.string().required(),
  address: Joi.string().required(),
  pincode: Joi.number().required(),
});

// *************************Exporting all schemas*************************
module.exports = {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
  editUserDataSchema,
  addCategorySchema,
  editCategorySchema,
  addPropertySchema,
  editPropertySchema,
};
