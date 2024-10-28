import { v5 as uuid5 } from "uuid"

export class SignUpRepository {
    static nextId({ meetupId, userId }: { meetupId: string; userId: string }) {
        return uuid5(userId, meetupId)
    }
}
