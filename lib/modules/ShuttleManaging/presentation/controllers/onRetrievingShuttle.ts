import { type Shuttle } from "~/lib/modules/ShuttleManaging/dtos/Shuttle"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingShuttle = async (shuttleId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/shuttles/:shuttleId`.replace(":shuttleId", shuttleId)
    try {
        const {
            data: {
                payload: { shuttle },
            },
        } = await axios.get<{
            payload: {
                shuttle: Shuttle
            }
        }>(uri)
        return shuttle
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
