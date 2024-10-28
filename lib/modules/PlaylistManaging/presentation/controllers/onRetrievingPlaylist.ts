import { type Playlist } from "~/lib/modules/PlaylistManaging/dtos/Playlist"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingPlaylist = async (groupId: string, playlistId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/playlists/:playlistId`.replace(":groupId", groupId).replace(":playlistId", playlistId)
    try {
        const {
            data: {
                payload: { playlist },
            },
        } = await axios.get<{
            payload: {
                playlist: Playlist
            }
        }>(uri)
        return playlist
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
