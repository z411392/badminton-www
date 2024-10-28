import { type SignUp } from "~/lib/modules/SignUpManaging/dtos/SignUp"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingSignUp = async (groupId: string, meetupId: string, signUpId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/meetups/:meetupId/signUps/:signUpId`
        .replace(":groupId", groupId)
        .replace(":meetupId", meetupId)
        .replace(":signUpId", signUpId)
    try {
        const {
            data: {
                payload: { signUp },
            },
        } = await axios.get<{
            payload: {
                signUp: SignUp
            }
        }>(uri)
        return signUp
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
