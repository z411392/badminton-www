import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingProfile = async (groupId: string, profileId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/profiles/:profileId`.replace(":groupId", groupId).replace(":profileId", profileId)
    try {
        const {
            data: {
                payload: { profile },
            },
        } = await axios.get<{
            payload: {
                profile: Profile
            }
        }>(uri)
        return profile
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
