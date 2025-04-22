import Joi from "joi";

export const gigValidator = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    gigProviderOfferPrice: Joi.number().required(),
    gigOfferOpenWindow: Joi.date().required(),
    gigStartDate: Joi.date().required(),
    location: Joi.string.required(),
}).options({ abortEarly: false });                      