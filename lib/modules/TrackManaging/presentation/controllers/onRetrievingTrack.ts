import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"
import { type User } from "~/lib/modules/IdentityAndAccessManaging/dtos/User"

type SpotifyTrack = {
    id: string
    name: string
    duration: number
    preview: string
    userId: string
    album: {
        name: string
        image: string
    }
    artists: Array<{
        name: string
    }>
    user: User
    spotifyId: string
    createdAt: number
    updatedAt: number
}

export type TrackEnriched = SpotifyTrack & { user: User }

export const onRetrievingTrack = async (groupId: string, playlistId: string, trackId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/playlists/:playlistId/tracks/:trackId`
        .replace(":groupId", groupId)
        .replace(":playlistId", playlistId)
        .replace(":trackId", trackId)
    try {
        const {
            data: {
                payload: { track },
            },
        } = await axios.get<{
            payload: {
                track: TrackEnriched
            }
        }>(uri)
        return { ...track }
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
