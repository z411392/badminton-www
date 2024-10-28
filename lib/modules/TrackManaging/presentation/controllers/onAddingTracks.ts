import { translateError } from "~/lib/utils/formatters"
import { showError, showSuccess } from "~/composables/utils/useSnackbar"

export type AddingTracks = {
    spotifyIds: string[]
}

export const onAddingTracks = async (groupId: string, meetupId: string, data: AddingTracks) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/meetups/:meetupId/tracks`.replace(":groupId", groupId).replace(":meetupId", meetupId)
    try {
        const {
            data: {
                payload: { trackIds },
            },
        } = await axios.post<{ payload: { trackIds: string[] } }>(uri, data)
        showSuccess(`新增了點播`)
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
