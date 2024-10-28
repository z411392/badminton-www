import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingToken = async () => {
    const axios = unref(useNuxtApp().$axios)
    const uri = "/subscription"
    try {
        const {
            data: {
                payload: { token },
            },
        } = await axios.get<{ payload: { token: string } }>(uri)
        return token
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}