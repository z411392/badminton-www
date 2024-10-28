import { translateError } from "~/lib/utils/formatters"
import { showError, showSuccess } from "~/composables/utils/useSnackbar"

export type CreatingProfile = {
    name: string
    levelId: string
    line: string
}

export const onCreatingProfile = async (groupId: string, data: CreatingProfile) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/profiles`.replace(":groupId", groupId)
    try {
        const {
            data: {
                payload: { profileId },
            },
        } = await axios.post<{ payload: { profileId: string } }>(uri, data)
        showSuccess(`新增了基本資料`)
        return profileId
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
