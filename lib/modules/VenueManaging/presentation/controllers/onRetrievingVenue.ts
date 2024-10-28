import { type Venue } from "~/lib/modules/VenueManaging/dtos/Venue"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingVenue = async (venueId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/venues/:venueId`.replace(":venueId", venueId)
    try {
        const {
            data: {
                payload: { venue },
            },
        } = await axios.get<{
            payload: {
                venue: Venue
            }
        }>(uri)
        return venue
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
