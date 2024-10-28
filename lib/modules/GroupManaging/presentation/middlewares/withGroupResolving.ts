import { SessionKeys } from "~/lib/utils/sessions"
import { type Group } from "~/lib/modules/GroupManaging/dtos/Group"
import { onRetrievingGroup } from "~/lib/modules/GroupManaging/presentation/controllers/onRetrievingGroup"
import { onListingLevels } from "~/lib/modules/LevelManaging/presentation/controllers/onListingLevels"
import { type Level } from "~/lib/modules/LevelManaging/dtos/Level"

export type GroupEnriched = Group & { levels: Level[] }

export const withGroupResolving = async (groupId: string) => {
    const { data: groupEnriched } = useNuxtData<GroupEnriched>(SessionKeys.Group) as { data: Ref<GroupEnriched> }
    const [group, levels] = await Promise.all([onRetrievingGroup(groupId), onListingLevels(groupId)])
    if (!group) return undefined
    groupEnriched.value = {
        ...group,
        levels,
    }
}
