import { v5 as uuid5 } from "uuid"
import { Collections } from "~/lib/constants"

export class ProfileRepository {
    static nextId({ groupId, userId }: { groupId: string; userId: string }) {
        const namespace = uuid5(Collections.Profiles, groupId)
        return uuid5(userId, namespace)
    }
}
