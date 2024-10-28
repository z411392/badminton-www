import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"
import { isCancel } from "axios"

export type Artist = {
    id: string
    name: string
    image?: string
}

export type SearchingArtists = {
    search: string
    page: number
}

export const onSearchingArtists = async ({ page, search }: SearchingArtists, signal?: AbortController["signal"]) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = "/spotify/artists"
    const params = { page, search }
    try {
        const {
            data: {
                payload: { artists },
            },
        } = await axios.get<{ payload: { artists: Artist[] } }>(uri, { params, signal })
        return artists
    } catch (thrown) {
        if (isCancel(thrown)) return []
        const error = translateError(thrown)
        if (error) showError(error.message)
        return []
    }
}
