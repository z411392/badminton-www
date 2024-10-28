import { type User } from "~/lib/modules/IdentityAndAccessManaging/dtos/User"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingUser = async (userId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/users/:userId`.replace(":userId", userId)
    try {
        const {
            data: {
                payload: { user },
            },
        } = await axios.get<{
            payload: {
                user: User
            }
        }>(uri)
        return user
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
