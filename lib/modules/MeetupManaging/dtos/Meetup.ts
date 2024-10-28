import { type Timeslot } from "~/lib/modules/MeetupManaging/dtos/Timeslot"

export type Meetup = {
    id: string
    name: string
    date: string
    venueId: string
    shuttleIds: string[]
    playlistId?: string
    timeslots: Timeslot[]
    description: string
    createdAt: number
    updatedAt: number
}
