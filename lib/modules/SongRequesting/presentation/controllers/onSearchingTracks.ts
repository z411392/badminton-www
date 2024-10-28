import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"
import { isCancel } from "axios"

export type Track = {
    id: string
    album: {
        name: string
        image?: string
    }
    artists: Array<{ name: string; image: string }>
    name: string
    duration: number
    preview: string
}

export type SearchingTracks = {
    artist: string
    search: string
    page: number
}

export const onSearchingTracks = async (
    { artist, page, search }: SearchingTracks,
    signal?: AbortController["signal"],
) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = "/spotify/tracks"
    const params = { page, search, artist }
    try {
        const {
            data: {
                payload: { tracks },
            },
        } = await axios.get<{ payload: { tracks: Track[] } }>(uri, { params, signal })
        return tracks
    } catch (thrown) {
        if (isCancel(thrown)) return []
        const error = translateError(thrown)
        if (error) showError(error.message)
        return []
    }
}
