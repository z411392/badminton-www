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

export enum PageSizes {
    Groups = 2000,
    Venues = 20,
    Shuttles = 20,
    Levels = 2000,
    Tags = 20,
    Meetups = 20,
    Playlists = 20,
    Tracks = 20,
    SignUps = 2000,
    Artists = 20,
    Profiles = 20,
}

export const emptyPlaceholder = "-"

export const Root = "wT9yf3fvduNaALoB5PKPDMQVrNZ2"

export const Collections = new Proxy(
    {
        Tracks: `groups/:groupId/playlists/:playlistId/tracks`,
        SignUps: `groups/:groupId/meetups/:meetupId/signUps`,
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
