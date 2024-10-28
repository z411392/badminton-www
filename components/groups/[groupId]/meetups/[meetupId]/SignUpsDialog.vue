<script lang="ts" setup>
import TempVar from "vue-temp-var"
import { type Level } from '~/lib/modules/LevelManaging/dtos/Level'
import { SignUpStatuses } from '~/lib/modules/SignUpManaging/dtos/SignUpStatuses'
import { type Timeslot } from '~/lib/modules/MeetupManaging/dtos/Timeslot'
import { type SignUpEnriched } from "~/composables/groups/[groupId]/meetups/[meetupId]/useSignUps"

const {
    signUps,
    levels,
    levelsMap,
    timeslots,
} = defineProps<{
    signUps: SignUpEnriched[]
    levels: Level[]
    levelsMap: { [levelId: string]: Level }
    timeslots: Timeslot[]
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
    <v-dialog v-model="opened" :width="320">
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
                <v-row dense>
                    <v-col :cols="12" dense>
                        <v-table>
                            <thead>
                                <tr>
                                    <th width="280px">
                                        成員
                                    </th>
                                    <th width="96px" template v-for="{ startTime, endTime } in timeslots">
                                        {{ startTime }} <br />
                                        {{ endTime }}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="{ profile: { name, levelId, line }, user, statuses } in items">
                                    <td>
                                        <v-list flat>
                                            <v-list-item>
                                                <template #title>
                                                    {{ name }}
                                                </template>
                                                <template #subtitle>
                                                    {{ line }}
                                                </template>
                                                <template #prepend>
                                                    <TempVar :define="{ level: levelsMap[levelId] }"
                                                        #default="{ level: { color } }" v-if="levelsMap[levelId]">
                                                        <v-menu>
                                                            <template #activator="{ props }">
                                                                <v-badge :color="color" dot>
                                                                    <a style="cursor:pointer;" v-bind="props">
                                                                        <v-avatar :size="40">
                                                                            <template v-if="user.photoURL">
                                                                                <v-img :src="user.photoURL" cover>
                                                                                    <template #error>
                                                                                        <v-sheet style="line-height: 40px;">
                                                                                            {{ user.displayName.charAt(0) }}
                                                                                        </v-sheet>
                                                                                    </template>
                                                                                </v-img>
                                                                            </template>
                                                                            <template v-else>
                                                                                <v-sheet style="line-height: 40px;">
                                                                                    {{ user.displayName.charAt(0) }}
                                                                                </v-sheet>
                                                                            </template>
                                                                        </v-avatar>
                                                                    </a>
                                                                </v-badge>
                                                            </template>
                                                            <v-card flat :width="320">
                                                                <v-img :src="user.photoURL" />
                                                            </v-card>
                                                        </v-menu>
                                                    </TempVar>
                                                </template>
                                            </v-list-item>
                                        </v-list>
                                    </td>
                                    <td v-for="{ id: timeslotId } in timeslots">
                                        <TempVar :define="{ status: statuses[timeslotId] }" #default="{ status }">
                                            <template v-if="status === SignUpStatuses.Pending">
                                                <v-sheet :class="$style['figure']">
                                                    <v-avatar size="x-small" color="grey">
                                                        <v-icon icon="mdi-check" size="x-small" />
                                                    </v-avatar>
                                                </v-sheet>
                                            </template>
                                            <template v-if="status === SignUpStatuses.Accepted">
                                                <v-sheet :class="$style['figure']">
                                                    <v-avatar size="x-small" color="success">
                                                        <v-icon icon="mdi-check" size="x-small" />
                                                    </v-avatar>
                                                </v-sheet>
                                            </template>
                                            <template v-if="status === SignUpStatuses.Paid">
                                                <v-sheet :class="$style['figure']">
                                                    <v-avatar size="x-small" color="success">
                                                        <v-icon icon="mdi-check" size="x-small" />
                                                    </v-avatar>
                                                </v-sheet>
                                            </template>
                                        </TempVar>
                                    </td>
                                    <td></td>
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

<style scoped>
:deep(table) {
    table-layout: fixed;
    width: 100% !important;
}

.v-list-item-subtitle {
    @apply line-clamp-none;
}
</style>