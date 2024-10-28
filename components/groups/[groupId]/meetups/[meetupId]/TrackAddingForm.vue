<script lang="ts" setup>
import { type Artist } from "~/lib/modules/SongRequesting/presentation/controllers/onSearchingArtists"
import ArtistAutoComplete from "~/components/groups/[groupId]/meetups/[meetupId]/ArtistAutoComplete.vue"
import { type Track } from "~/lib/modules/SongRequesting/presentation/controllers/onSearchingTracks"
import TracksInfiniteScroll from "~/components/groups/[groupId]/meetups/[meetupId]/TracksInfiniteScroll.vue"
import { onAddingTracks } from "~/lib/modules/TrackManaging/presentation/controllers/onAddingTracks"
import TrackList from "~/components/groups/[groupId]/meetups/[meetupId]/TrackList.vue"
import { useTracks } from "~/composables/groups/[groupId]/meetups/[meetupId]/useTracks"
import { withMeetup } from "~/lib/utils/sessions"
import { onRetrievingPlaylist } from "~/lib/modules/PlaylistManaging/presentation/controllers/onRetrievingPlaylist"
import { Duration } from "luxon"

const { groupId, meetupId, playlistId } = defineProps<{ groupId: string, meetupId: string, playlistId: string }>()

const opened = ref(false)
const title = ref("")

const artist = ref<Artist>()
const artistName = computed(() => artist.value ? artist.value.name : "")
const selected = ref<Track[]>([])
const spotifyIds = computed(() => selected.value.map(({ id }) => id))
const loading = ref(false)

const onSaveButtonClicked = async () => {
    loading.value = true
    await onAddingTracks(groupId, meetupId, unref(mutation))
    loading.value = false
    artist.value = undefined
    tracksInfiniteScroll.value.flush(true)
}

const mutation = computed(() => {
    return {
        spotifyIds: spotifyIds.value,
    }
})

const open = async () => {
    opened.value = true
    title.value = "新增點播"
}

const close = () => {
    opened.value = false
}

onBeforeUnmount(() => close())

defineExpose({
    open,
})

const tab = ref(0)
const search = ref("")
const tracksInfiniteScroll = ref() as Ref<InstanceType<typeof TracksInfiniteScroll>>

const meetup = withMeetup()
const playlist = ref(meetup.value.playlist!)
const onChanged = async (trackId: string) => playlist.value = (await onRetrievingPlaylist(groupId, playlistId))!
const { tracks } = useTracks({ groupId, playlistId }, onChanged)

const durationFor = (millis: number) => {
    const { hours, minutes, seconds } = Duration.fromMillis(millis).shiftTo("hours", "minutes", "seconds")
    return `${("00" + Math.round(hours)).slice(-2)}:${("00" + Math.round(minutes)).slice(-2)}:${("00" + Math.round(seconds)).slice(-2)}`
}
</script>

<template>
    <v-dialog v-model="opened" :width="320">
        <v-card :loading="loading">
            <v-card-title>
                <v-tabs v-model="tab" show-arrows>
                    <v-tab :value="0">
                        播放清單
                    </v-tab>
                    <v-tab :value="1">
                        我要點歌
                    </v-tab>
                </v-tabs>
            </v-card-title>

            <v-card-subtitle>
                {{ durationFor(playlist.tracksDuration) }}
            </v-card-subtitle>

            <v-window v-model="tab">
                <v-window-item :value="0">
                    <TrackList :groupId="groupId" :meetupId="meetupId" :tracks="tracks" />
                </v-window-item>
                <v-window-item :value="1">
                    <v-card-item>
                        <v-form @submit.prevent="">
                            <v-row dense>
                                <v-col dense :cols="12">
                                    <ArtistAutoComplete v-model="artist" />
                                </v-col dense>
                                <v-col dense :cols="12">
                                    <TracksInfiniteScroll ref="tracksInfiniteScroll" v-model:search="search"
                                        v-model="selected" v-model:artist="artistName" />
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-item>

                    <v-card-actions>
                        <v-row justify="center">
                            <v-col cols="auto">
                                <v-btn text="取消" @click="close" :disabled="loading" />
                            </v-col>
                            <v-col cols="auto">
                                <v-btn text="送出" @click="onSaveButtonClicked" :disabled="spotifyIds.length === 0"
                                    :loading="loading" />
                            </v-col>
                        </v-row>
                    </v-card-actions>
                </v-window-item>
            </v-window>
        </v-card>
    </v-dialog>
</template>