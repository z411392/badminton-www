import { type SystemInfo } from "~/lib/modules/SystemMaintaining/dtos/SystemInfo"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingSystemInfo = async () => {
    const axios = unref(useNuxtApp().$axios)
    const uri = "/system/info"
    try {
        const {
            data: { payload },
        } = await axios.get<{ payload: { systemInfo: SystemInfo } }>(uri)
        return payload
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
