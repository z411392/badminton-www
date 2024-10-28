import { type Plan } from "~/lib/modules/MeetupManaging/dtos/Plan"

export type Meetup = {
    id: string
    name: string
    date: string
    venueId: string
    shuttleIds: string[]
    playlistId?: string
    plans: Plan[]
    description: string
    createdAt: number
    updatedAt: number
}
