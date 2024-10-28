import { type Event } from "~/lib/adapters/firestore/EventPublisher"
import { type SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"
import { Topics } from "~/lib/constants"

export type SignUpEvent = Event<
    Topics.SignUp,
    {
        userId: string
        signUpId: string
        timeslotId: string
        status: SignUpStatuses
        administratorId?: string
    }
>
