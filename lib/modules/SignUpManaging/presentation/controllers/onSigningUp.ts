import { translateError } from "~/lib/utils/formatters"
import { showError, showSuccess } from "~/composables/utils/useSnackbar"

export const onSigningUp = async (groupId: string, meetupId: string, timeslotId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/meetups/:meetupId/timeslots/:timeslotId/signUp`
        .replace(":groupId", groupId)
        .replace(":meetupId", meetupId)
        .replace(":timeslotId", timeslotId)
    try {
        const {
            data: {
                payload: { signUpId },
            },
        } = await axios.put<{
            payload: {
                signUpId: string
            }
        }>(uri)
        showSuccess(`報名已送出`)
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
