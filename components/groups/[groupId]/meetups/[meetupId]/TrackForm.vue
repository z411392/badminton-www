<script lang="ts" setup>
import { type Artist } from "~/lib/modules/SongRequesting/presentation/controllers/onSearchingArtists"
import ArtistAutoComplete from "~/components/groups/[groupId]/meetups/[meetupId]/ArtistAutoComplete.vue"
import { type Track } from "~/lib/modules/SongRequesting/presentation/controllers/onSearchingTracks"
import TracksInfiniteScroll from "~/components/groups/[groupId]/meetups/[meetupId]/TracksInfiniteScroll.vue"
import { onAddingTracks } from "~/lib/modules/TrackManaging/presentation/controllers/onAddingTracks"

const { groupId, meetupId } = defineProps<{ groupId: string, meetupId: string }>()

const opened = ref(false)
const title = ref("")

const artist = ref<Artist>()
const artistName = computed(() => artist.value ? artist.value.name : "")
const tracks = ref<Track[]>([])
const spotifyIds = computed(() => tracks.value.map(({ id }) => id))
const loading = ref(false)

const onSaveButtonClicked = async () => {
    loading.value = true
    await onAddingTracks(groupId, meetupId, unref(mutation))
    loading.value = false
    artist.value = undefined
    tracks.value = []
    close()
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
</script>

<template>
    <v-dialog v-model="opened" :width="360">
        <v-card :title="title" class="rounded-lg" :loading="loading">
            <v-card-text>
                <v-form @submit.prevent="">
                    <v-container dense>
                        <v-row dense>
                            <v-col dense :cols="12">
                                <ArtistAutoComplete v-model="artist" />
                            </v-col dense>
                            <v-col dense :cols="12">
                                <TracksInfiniteScroll v-model="tracks" v-model:artist="artistName" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text="取消" @click="close" :disabled="loading" />
                <v-btn text="儲存" @click="onSaveButtonClicked" :disabled="spotifyIds.length === 0" :loading="loading" />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>