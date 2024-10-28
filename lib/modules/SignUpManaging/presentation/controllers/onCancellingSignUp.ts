import { translateError } from "~/lib/utils/formatters"
import { showError, showSuccess } from "~/composables/utils/useSnackbar"
import { SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"

export const onCancellingSignUp = async (groupId: string, meetupId: string, index: number) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/meetups/:meetupId/signUps`.replace(":groupId", groupId).replace(":meetupId", meetupId)
    try {
        const {
            data: {
                payload: { signUpId },
            },
        } = await axios.post<{
            payload: {
                signUpId: string
            }
        }>(uri, {
            status: SignUpStatuses.Cancelled,
            index,
        })
        showSuccess(`報名已取消`)
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
