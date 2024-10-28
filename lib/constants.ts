export type PageMeta = {
    name: string
    title: string
    fullPath: (parmas?: any) => string
}

export const Pages: { [pageName: string]: PageMeta } = {
    SignIn: {
        name: "auth-signIn",
        title: "使用者登入",
        fullPath: () => "/auth/signIn",
    },
    Meetup: {
        name: "groups-groupId-meetups-meetupId",
        title: "報名",
        fullPath: ({ groupId }: { groupId: string }) => "/groups/:groupId/meetups".replace(":groupId", groupId),
    },
}

export enum DatetimeFormats {
    ISO8601DATE = "yyyy-LL-dd",
    ISO8601TIME = "HH:mm:ss",
    ISO8601 = `${DatetimeFormats.ISO8601DATE} ${DatetimeFormats.ISO8601TIME}`,
}

export enum PageSizes {}

export const emptyPlaceholder = "-"

export const Root = "wT9yf3fvduNaALoB5PKPDMQVrNZ2"

export const Collections = new Proxy(
    {
        Tracks: `groups/:groupId/playlists/:playlistId/tracks`,
        SignUps: `groups/:groupId/meetups/:meetupId/timeslots/:timeslotId/signUps`,
        MeetupEvents: `groups/:groupId/meetups/:meetupId/events`,
        Profiles: "groups/:groupId/profiles",
    },
    {
        get: (props, prop) => {
            const collection = props[prop as keyof typeof props]
            if (!collection) return undefined
            return process.env.NODE_ENV && process.env.NODE_ENV !== "production"
                ? [process.env.NODE_ENV, collection].join("_")
                : collection
        },
    },
)

export enum Topics {
    SignUp = "SignUp",
}

export const EventsSavedTo = {
    [Topics.SignUp]: Collections.MeetupEvents,
}
