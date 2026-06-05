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
  rememberMe: Joi.boolean().optional(),
  role: Joi.string().valid('CLIENT', 'DEVELOPER', 'client', 'developer').optional()
});

const productSchema = Joi.object({
  title:              Joi.string().required(),
  description:        Joi.string().required(),
  price:              Joi.number().min(0).required(),
  shortDesc:          Joi.string().allow('').optional(),
  category:           Joi.string().allow('').optional(),
  tags:               Joi.array().items(Joi.string()).optional(),
  features:           Joi.array().items(Joi.string()).optional(),
  industries:         Joi.array().items(Joi.string()).optional(),
  requirements:       Joi.array().items(Joi.string()).optional(),
  images:             Joi.array().items(Joi.string()).optional(),
  coverImage:         Joi.string().allow('').optional(),
  screenshots:        Joi.array().items(Joi.string()).optional(),
  videoUrl:           Joi.string().allow('').optional(),
  demoUrl:            Joi.string().allow('').optional(),
  docsUrl:            Joi.string().allow('').optional(),
  walkthroughUrl:     Joi.string().allow('').optional(),
  deliveryDays:       Joi.number().integer().min(1).optional(),
  revisions:          Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  support:            Joi.string().allow('').optional(),
  deploymentMethod:   Joi.string().allow('').optional(),
  hostingRequirements:Joi.string().allow('').optional(),
  configFields:       Joi.array().items(Joi.object()).optional(),
  isDraft:            Joi.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  productSchema
};
