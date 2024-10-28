import { type SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"

export type SignUp = {
    id: string
    userId: string
    statuses: { [planIndex: string]: SignUpStatuses }
    attending: boolean
    administratorId?: string
    createdAt: number
    updatedAt: number
}
