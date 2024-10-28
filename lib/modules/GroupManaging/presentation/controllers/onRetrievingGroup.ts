import { type Group } from "~/lib/modules/GroupManaging/dtos/Group"
import { translateError } from "~/lib/utils/formatters"
import { showError } from "~/composables/utils/useSnackbar"

export const onRetrievingGroup = async (groupId: string) => {
    const axios = unref(useNuxtApp().$axios)
    const uri = "/groups/:groupId".replace(":groupId", groupId)
    const data = {}
    try {
        const {
            data: {
                payload: { group },
            },
        } = await axios.get<{ payload: { group: Group } }>(uri, data)
        return group
    } catch (thrown) {
        const error = translateError(thrown)
        if (error) showError(error.message)
    }
}
