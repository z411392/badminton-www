import { useStorage } from "@vueuse/core"
import { getAuth } from "firebase/auth"
import { type GroupEnriched } from "~/lib/modules/GroupManaging/presentation/middlewares/withGroupResolving"
import { type MeetupEnriched } from "~/lib/modules/MeetupManaging/presentation/middlewares/withMeetupResolving"

export enum SessionKeys {
    RedirectTo = "redirectTo",
    User = "user",
    Group = "group",
    Meetup = "meetup",
    Playlist = "playlist",
}

export const withRedirectTo = (setDefaultURL: boolean = false) => {
    return useStorage<string | undefined>(SessionKeys.RedirectTo, setDefaultURL ? "/" : undefined)
}

export const withUser = () => {
    const auth = getAuth()
    return auth.currentUser!
}

export const withGroup = () => {
    const { data: group } = useNuxtData<GroupEnriched>(SessionKeys.Group)
    return group as Ref<GroupEnriched>
}

export const ensureGroupIsSpecified = () => {
    const group = withGroup()
    if (!group.value) return createError({ statusCode: 404, message: `沒有這個球團喔` })
    return group.value
}

export const withMeetup = () => {
    const { data: meetup } = useNuxtData<MeetupEnriched>(SessionKeys.Meetup)
    return meetup as Ref<MeetupEnriched>
}

export const ensureMeetupIsSpecified = () => {
    const meetup = withMeetup()
    if (!meetup.value) return createError({ statusCode: 404, message: `沒有這個球敘喔` })
    return meetup.value
}
