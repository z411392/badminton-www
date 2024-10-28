import { translateError } from "~/lib/utils/formatters"
import { showSuccess, showError } from "~/composables/utils/useSnackbar"

export type SavingToken = {
    token: string
}

export const onSavingToken = async (data: SavingToken) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = "/subscription"
    try {
        const {
            data: {
                payload: { token: _ },
            },
        } = await axios.put<{ payload: { token: string } }>(uri, data)
        showSuccess(`訂閱成功`)
        return true
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
        return false
    }
}