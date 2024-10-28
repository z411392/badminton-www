import Joi from "joi"

const spotifyId = Joi.string().required().messages({
    "any.required": `必須填寫 spotifyId`,
    "string.empty": `必須填寫 spotifyId`,
})

export const spotifyIds = Joi.array().required().items(spotifyId).min(1).messages({
    "any.required": `必須填寫 spotifyIds`,
    "array.min": `必須填寫 spotifyIds`,
})
