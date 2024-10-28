import { translateError } from "~/lib/utils/formatters"
import { showError, showSuccess } from "~/composables/utils/useSnackbar"

export type RemovingTracks = {
    trackIds: string[]
}

export const onRemovingTracks = async (groupId: string, meetupId: string, data: RemovingTracks) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/meetups/:meetupId/tracks`.replace(":groupId", groupId).replace(":meetupId", meetupId)
    try {
        const {
            data: {
                payload: { trackIds },
            },
        } = await axios.delete<{ payload: { trackIds: string[] } }>(uri, { data })
        showSuccess(`刪除了點播`)
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
