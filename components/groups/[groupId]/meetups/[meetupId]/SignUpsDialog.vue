<script lang="ts" setup>
import TempVar from "vue-temp-var"
import { type Level } from '~/lib/modules/LevelManaging/dtos/Level'
import { SignUpStatuses } from '~/lib/modules/SignUpManaging/dtos/SignUpStatuses'
import { type Plan } from '~/lib/modules/MeetupManaging/dtos/Plan'
import { type SignUpEnriched } from '~/composables/groups/[groupId]/meetups/[meetupId]/useSignUps'

const {
    signUps,
    levels,
    levelsMap,
    plans,
} = defineProps<{
    signUps: SignUpEnriched[]
    levels: Level[]
    levelsMap: { [levelId: string]: Level }
    plans: Plan[]
}>()

const opened = ref(false)
const open = () => {
    opened.value = true
}

defineExpose({
    open,
})

const levelItemTitle = (level: Level) => level.name
const levelItemValue = (level: Level) => level.id
const levelsSelected = ref<Level[]>([])
const levelIdsSelected = computed(() => levelsSelected.value.map(({ id }) => id))


const search = ref("")
const items = computed(() => signUps.filter(({ user, profile, statuses }) => {
    let attending = false
    for (const index in statuses) {
        const status = statuses[index]
        if (!(status === SignUpStatuses.Accepted || status === SignUpStatuses.Paid)) continue
        attending = true
        break
    }
    if (!attending) return false
    if (levelIdsSelected.value.length) {
        if (!levelIdsSelected.value.includes(profile.levelId)) return false
    }
    if (!search.value) return true
    if (user.displayName.includes(search.value)) return true
    if (profile.name.includes(search.value)) return true
    return false
}))
</script>

<template>
    <v-dialog v-model="opened" width="auto">
        <v-card flat>
            <v-card-title>
                成員名單
            </v-card-title>
            <v-container>
                <v-row dense>
                    <v-col :cols="12" dense>
                        <v-text-field label="關鍵字" v-model="search" variant="solo-filled" flat hide-details
                            density="compact" />
                    </v-col>
                    <v-col :cols="12" dense>
                        <v-select label="分級" v-model="levelsSelected" :items="levels" return-object
                            variant="solo-filled" flat chips multiple density="compact" :item-title="levelItemTitle"
                            :item-value="levelItemValue" hide-details>
                            <template #item="{ props, item: { raw: { name, description, color } } }">
                                <v-list-item v-bind="props" :subtitle="description">
                                    <template #prepend>
                                        <v-icon icon="mdi-circle" :color="color" size="xs" />
                                    </template>
                                    <template #title>
                                        {{ name }}
                                    </template>
                                </v-list-item>
                            </template>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :cols="12">
                        <v-table>
                            <thead>
                                <tr>
                                    <th>
                                        成員
                                    </th>
                                    <th template v-for="{ startTime, endTime } in plans">
                                        {{ startTime }}
                                        <br />
                                        {{ endTime }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="{ profile: { name, levelId }, user, statuses } in items">
                                    <td>
                                        <v-list>
                                            <v-list-item>
                                                <template #title>
                                                    <v-tooltip location="bottom center" :open-on-hover="false"
                                                        :open-on-click="true">
                                                        <template #activator="{ props }">
                                                            <v-sheet v-bind="props">
                                                                {{ name }}
                                                            </v-sheet>
                                                        </template>
                                                        {{ name }}
                                                    </v-tooltip>
                                                </template>
                                                <template #prepend>
                                                    <template v-if="levelsMap[levelId]">
                                                        <TempVar :define="{ level: levelsMap[levelId] }"
                                                            #default="{ level: { color } }">
                                                            <v-badge :color="color" dot>
                                                                <v-avatar>
                                                                    <template v-if="user.photoURL">
                                                                        <v-img :src="user.photoURL">
                                                                            <template #error>
                                                                                <v-icon icon="mdi-account-circle"
                                                                                    :size="40" color="white" />
                                                                            </template>
                                                                        </v-img>
                                                                    </template>
                                                                    <template v-else>
                                                                        <v-icon icon="mdi-account-circle" :size="40"
                                                                            color="white" />
                                                                    </template>
                                                                </v-avatar>
                                                            </v-badge>
                                                        </TempVar>
                                                    </template>
                                                </template>
                                            </v-list-item>
                                        </v-list>
                                    </td>
                                    <td v-for="(_, index) in plans">
                                        <TempVar :define="{ status: statuses[index] }" #default="{ status }">
                                            <template v-if="status === SignUpStatuses.Pending">
                                                <v-sheet :class="$style['figure']">
                                                    <v-avatar size="x-small" color="grey">
                                                        <v-icon icon="mdi-check" size="x-small" />
                                                    </v-avatar>
                                                    <!-- 已報名 -->
                                                </v-sheet>
                                            </template>
                                            <template v-if="status === SignUpStatuses.Accepted">
                                                <v-sheet :class="$style['figure']">
                                                    <v-avatar size="x-small" color="success">
                                                        <v-icon icon="mdi-check" size="x-small" />
                                                    </v-avatar>
                                                    <!-- 已錄取 -->
                                                </v-sheet>
                                            </template>
                                            <template v-if="status === SignUpStatuses.Paid">
                                                <v-sheet :class="$style['figure']">
                                                    <v-avatar size="x-small" color="success">
                                                        <v-icon icon="mdi-check" size="x-small" />
                                                    </v-avatar>
                                                    <!-- 已錄取 -->
                                                </v-sheet>
                                            </template>
                                        </TempVar>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<style scoped module>
.figure {
    @apply text-sm pl-4;
}
</style>