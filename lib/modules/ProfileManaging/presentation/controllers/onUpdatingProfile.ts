import { translateError } from "~/lib/utils/formatters"
import { showError, showSuccess } from "~/composables/utils/useSnackbar"

export type UpdatingProfile = {
    name: string
    levelId: string
    line: string
}

export const onUpdatingProfile = async (groupId: string, profileId: string, data: UpdatingProfile) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/profiles/:profileId`.replace(":groupId", groupId).replace(":profileId", profileId)
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
