import { type Topics } from "~/lib/constants"

export type Event<S = Topics, T = any> = {
    topic: S
    payload: T
    timestamp: number
}
