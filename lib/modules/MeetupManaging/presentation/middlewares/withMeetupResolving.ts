import { SessionKeys } from "~/lib/utils/sessions"
import { type Meetup } from "~/lib/modules/MeetupManaging/dtos/Meetup"
import { onRetrievingMeetup } from "~/lib/modules/MeetupManaging/presentation/controllers/onRetrievingMeetup"
import { onRetrievingVenue } from "~/lib/modules/VenueManaging/presentation/controllers/onRetrievingVenue"
import { type Venue } from "~/lib/modules/VenueManaging/dtos/Venue"
import { onRetrievingShuttle } from "~/lib/modules/ShuttleManaging/presentation/controllers/onRetrievingShuttle"
import { type Shuttle } from "~/lib/modules/ShuttleManaging/dtos/Shuttle"
import { onRetrievingPlaylist } from "~/lib/modules/PlaylistManaging/presentation/controllers/onRetrievingPlaylist"
import { type Playlist } from "~/lib/modules/PlaylistManaging/dtos/Playlist"
import { onRetrievingProfile } from "~/lib/modules/ProfileManaging/presentation/controllers/onRetrievingProfile"
import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { ProfileRepository } from "~/lib/adapters/firestore/ProfileRepository"
import { getAuth } from "firebase/auth"

export type MeetupEnriched = Meetup & {
    venue: Venue
    shuttles: Shuttle[]
    playlist?: Playlist
    profile?: Profile
}

export const withMeetupResolving = async (groupId: string, meetupId: string) => {
    const { data: meetupEnriched } = useNuxtData(SessionKeys.Meetup) as { data: Ref<MeetupEnriched> }
    const meetup = await onRetrievingMeetup(groupId, meetupId)
    if (!meetup) return undefined
    const userId = getAuth().currentUser?.uid
    const [venue, shuttles, playlist] = await Promise.all([
        onRetrievingVenue(meetup.venueId),
        Promise.all(meetup.shuttleIds.map((shuttleId) => onRetrievingShuttle(shuttleId))),
        meetup.playlistId ? onRetrievingPlaylist(groupId, meetup.playlistId) : Promise.resolve(undefined),
    ])
    let profile: Profile | undefined = undefined
    if (userId) {
        try {
            profile = await onRetrievingProfile(groupId, ProfileRepository.nextId({ groupId, userId }))
        } catch { }
    }
    meetupEnriched.value = {
        ...meetup,
        venue: venue!,
        shuttles: shuttles.filter((shuttle) => !!shuttle),
        playlist,
        profile,
    }
}
