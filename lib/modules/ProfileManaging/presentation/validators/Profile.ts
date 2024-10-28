import Joi from "joi"

export const name = Joi.string().required().min(1).max(30).messages({
    "any.required": `必須填寫暱稱`,
    "string.empty": `必須填寫暱稱`,
    "string.min": `暱稱至少 {#limit} 個字`,
    "string.max": `暱稱最多 {#limit} 個字`,
})
export const levelId = Joi.string().required().messages({
    "any.required": `必須選擇分級`,
    "string.empty": `必須選擇分級`,
})
export const line = Joi.string().required().min(1).max(30).messages({
    "any.required": `必須填寫 LINE ID`,
    "string.empty": `必須填寫 LINE ID`,
    "string.min": `LINE ID至少 {#limit} 個字`,
    "string.max": `LINE ID最多 {#limit} 個字`,
})
