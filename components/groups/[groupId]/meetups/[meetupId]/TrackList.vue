<script lang="ts" setup>
import { type TrackEnriched } from "~/lib/modules/TrackManaging/presentation/controllers/onRetrievingTrack"
import { useWindowSize } from "@vueuse/core"
import { getAuth } from "firebase/auth"
import { type VDialog } from "vuetify/components"
import TempVar from "vue-temp-var"
import { onRemovingTracks } from "~/lib/modules/TrackManaging/presentation/controllers/onRemovingTracks"
import { withMeetup } from "~/lib/utils/sessions"
import { Duration } from "luxon"

const { groupId, meetupId, tracks } = defineProps<{ groupId: string, meetupId: string, tracks: TrackEnriched[] }>()
const user = getAuth().currentUser!
const userId = user.uid

const search = ref("")

const items = computed(() => tracks.filter((track) => {
    if (!search.value) return true
    const { name, artists, album, user } = track
    if (name.includes(search.value)) return true
    for (const { name } of artists) {
        if (name.includes(search.value)) return true
    }
    if (album.name.includes(search.value)) return true
    if (user.displayName.includes(search.value)) return true
    return false
}))

const { height } = useWindowSize()
const listHeight = computed(() => Math.max(60, height.value - 168))

const confirmRemovingDialog = ref<InstanceType<typeof VDialog>>()
const opened = ref(false)
const removing = ref<TrackEnriched>()
const open = (track: TrackEnriched) => {
    opened.value = true
    removing.value = track
}
const close = () => {
    opened.value = false
    removing.value = undefined
}
const processing = ref(false)
const meetup = withMeetup()
const removeTrack = async () => {
    processing.value = true
    const track = removing.value!
    await onRemovingTracks(groupId, meetupId, { trackIds: [track.id] })
    processing.value = false
    close()
}

const durationFor = (millis: number) => {
    const { hours, minutes, seconds } = Duration.fromMillis(millis).shiftTo("hours", "minutes", "seconds")
    return `${("00" + Math.round(hours)).slice(-2)}:${("00" + Math.round(minutes)).slice(-2)}:${("00" + Math.round(seconds)).slice(-2)}`
}
</script>

<template>
    <v-dialog ref="confirmRemovingDialog" v-model="opened" width="auto">
        <v-card flat :width="320" :persistent="true" :loading="processing">
            <v-card-title>
                刪除點播
            </v-card-title>
            <v-card-subtitle>
                確定要刪除「{{ removing?.name }}」嗎？
            </v-card-subtitle>
            <v-card-actions>
                <v-row justify="center">
                    <v-col cols="auto">
                        <v-btn variant="plain" flat @click="() => close()">
                            我再想想
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn variant="plain" flat @click="() => removeTrack()">
                            確定
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-card-item>
        <v-form @submit.prevent="">
            <v-text-field v-model="search" placeholder="關鍵字" prepend-inner-icon="mdi-magnify" variant="solo-filled" flat
                hide-details density="compact" single-line />
        </v-form>
    </v-card-item>
    <v-card-item>
        <v-table :height="listHeight">
            <tbody>
                <tr v-for="track in items">
                    <td>
                        <TempVar :define="track">
                            <template #default="{ name, album: { image }, artists, user, preview, duration }">
                                <v-card flat>
                                    <v-row :align="'center'">
                                        <v-col :cols="3" dense>
                                            <template v-if="image">
                                                <v-img :src="image" cover>
                                                    <template #error>
                                                        <v-sheet>
                                                            無法顯示圖片
                                                        </v-sheet>
                                                    </template>
                                                </v-img>
                                            </template>
                                            <template v-else>
                                                <v-sheet>
                                                    無法顯示圖片
                                                </v-sheet>
                                            </template>
                                        </v-col>
                                        <v-spacer />
                                        <v-col :cols="5" dense>
                                            <v-card-title>
                                                <small>
                                                    <v-sheet>
                                                        {{ name }}
                                                    </v-sheet>
                                                </small>
                                            </v-card-title>
                                            <v-divider :thickness="8" />
                                            <v-card-subtitle>
                                                <v-sheet>
                                                    {{ artists.map(({ name }) => name).join(", ") }}
                                                </v-sheet>
                                            </v-card-subtitle>
                                        </v-col>
                                        <v-col :cols="3" dense>
                                            <v-card-actions>
                                                <v-row justify="center">
                                                    <v-col :cols="12">
                                                        <v-menu>
                                                            <template #activator="{ props }">
                                                                <v-btn variant="plain" v-bind="props">
                                                                    <v-btn icon="mdi-dots-vertical" variant="text"
                                                                        v-bind="props" />
                                                                </v-btn>
                                                            </template>
                                                            <v-card flat>
                                                                <v-list flat>
                                                                    <v-list-item>
                                                                        <v-list-item-title>
                                                                            {{ user.displayName }}
                                                                        </v-list-item-title>
                                                                        <v-list-item-subtitle>
                                                                            {{ durationFor(duration) }}
                                                                        </v-list-item-subtitle>
                                                                        <template #prepend>
                                                                            <v-avatar :size="40">
                                                                                <template v-if="user.photoURL">
                                                                                    <v-img :src="user.photoURL">
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
                                                                        </template>
                                                                    </v-list-item>
                                                                </v-list>
                                                                <v-card-item>
                                                                    <v-row justify="space-evenly">
                                                                        <v-col cols="auto">
                                                                            <a :href="preview" target="_blank">
                                                                                試聽
                                                                            </a>
                                                                        </v-col>
                                                                        <template v-if="userId === user.id">
                                                                            <v-col cols="auto">
                                                                                <a @click="() => open(track)">
                                                                                    刪除
                                                                                </a>
                                                                            </v-col>
                                                                        </template>
                                                                    </v-row>
                                                                </v-card-item>
                                                            </v-card>
                                                        </v-menu>
                                                    </v-col>
                                                </v-row>
                                            </v-card-actions>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </template>
                        </TempVar>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </v-card-item>
</template>

<style scoped>
:deep(table) {
    table-layout: fixed;
    width: 100%;
}

.v-card-title {
    @apply whitespace-pre-wrap leading-4;
}

.v-card-subtitle {
    @apply whitespace-pre-wrap leading-4;
}
</style>