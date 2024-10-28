import { type SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"

export type SignUp = {
    id: string
    userId: string
    status: SignUpStatuses
    administratorId?: string
    createdAt: number
    updatedAt: number
}
