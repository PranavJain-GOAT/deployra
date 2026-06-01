const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  country: Joi.string().required(),
  role: Joi.string().valid('CLIENT', 'DEVELOPER', 'client', 'developer').optional(),
  rememberMe: Joi.boolean().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional()
});

const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  features: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  productSchema
};
