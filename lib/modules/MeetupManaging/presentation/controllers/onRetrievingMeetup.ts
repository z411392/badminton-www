import { type Meetup } from "~/lib/modules/MeetupManaging/dtos/Meetup"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingMeetup = async (groupId: string, meetupId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = `/groups/:groupId/meetups/:meetupId`.replace(":groupId", groupId).replace(":meetupId", meetupId)
    try {
        const {
            data: {
                payload: { meetup },
            },
        } = await axios.get<{
            payload: {
                meetup: Meetup
            }
        }>(uri)
        return meetup
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
