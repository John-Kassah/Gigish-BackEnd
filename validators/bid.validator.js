import Joi from "joi";

export const bidValidator = Joi.object({
    serviceProviderBidPrice: Joi.number().required()
}).options({ abortEarly: false });  