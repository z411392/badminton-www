import { translateError } from "~/lib/utils/formatters"
import { showError, showSuccess } from "~/composables/utils/useSnackbar"

export type SavingProfile = {
    name: string
    levelId: string
    line: string
}

export const onSavingProfile = async (groupId: string, data: SavingProfile) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/profile`.replace(":groupId", groupId)
    try {
        const {
            data: {
                payload: { profileId },
            },
        } = await axios.put<{ payload: { profileId: string } }>(uri, data)
        showSuccess(`更新了基本資料`)
        return profileId
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
