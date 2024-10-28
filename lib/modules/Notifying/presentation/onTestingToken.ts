import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onTestingToken = async ({ token }: { token: string }) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = "/subscription"
    try {
        const {
            data: {
                payload: { messageId },
            },
        } = await axios.post<{ payload: { messageId: string } }>(uri, { token })
        return true
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
        return false
    }
}