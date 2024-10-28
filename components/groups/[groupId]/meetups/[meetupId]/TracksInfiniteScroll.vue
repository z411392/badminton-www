<script lang="ts" setup>
import { onSearchingTracks, type Track } from '~/lib/modules/SongRequesting/presentation/controllers/onSearchingTracks'
import { useAbortController } from '~/composables/utils/useAbortController'
import { useWindowSize } from '@vueuse/core'

const artist = defineModel<string>("artist", { default: "" })
const itemIds = ref<string[]>([])
const itemsMap = ref<{ [trackId: string]: Track }>({})
const items = computed({
    get: () => {
        const items = []
        for (const itemId of itemIds.value) {
            const item = itemsMap.value[itemId]
            if (!item) continue
            items.push(item)
        }
        return items
    },
    set: (tracks: Track[]) => {
        itemIds.value = []
        itemsMap.value = {}
        for (const track of tracks) {
            if (itemsMap.value[track.id]) continue
            itemIds.value.push(track.id)
            itemsMap.value[track.id] = track
        }
    }
})

const search = defineModel<string>("search", { default: "" })
const page = ref(1)
const lastLoaded = ref(0)
const pageSize = 20
const hasMore = computed(() => lastLoaded.value >= pageSize)

const abortController = useAbortController()
const load = async ({ done }: { done: (status: "loading" | "error" | "empty" | "ok") => void }) => {
    const query = {
        artist: artist.value,
        search: search.value,
        page: page.value,
    }
    abortController.cancel()
    const signal = abortController.signal(query)
    const tracks = await onSearchingTracks(query, signal)
    items.value = page.value === 1 ? [...tracks] : [...items.value, ...tracks]
    lastLoaded.value = tracks.length
    if (!hasMore.value) return done("empty")
    page.value += 1
    return done("ok")
}

const key = computed(() => `${artist.value}/${search.value}`)
const flush = (clearSearch: boolean = false) => {
    abortController.clear()
    page.value = 1
    items.value = []
    selected.value = []
    lastLoaded.value = 0
    if (clearSearch) search.value = ""
}

const selected = defineModel<Track[]>({ default: [] })
const toggleSelect = (track: Track) => {
    const index = selected.value.findIndex(({ id }) => id === track.id)
    if (index === -1) selected.value.push(track)
    else selected.value.splice(index, 1)
}
const selectedCount = computed(() => selected.length)
const hasSelected = (trackId: string) => {
    const index = selected.value.findIndex(({ id }) => id === trackId)
    return index > -1
}

const { height } = useWindowSize()
const infiniteScrollHeight = computed(() => Math.max(60, height.value - 368))

defineExpose({
    flush,
})
</script>

<template>
    <v-text-field v-model="search" variant="filled" density="compact" hide-details />
    <template v-if="search">
        <v-infinite-scroll density="compact" @load="load" :key="key" @vue:beforeUnmount="() => flush()"
            :height="infiniteScrollHeight">
            <v-container>
                <template v-for="item in items" :key="item.id">
                    <v-row dense :align="'center'">
                        <v-col dense cols="auto">
                            <label @click.native.stop style="cursor: pointer" @click="() => toggleSelect(item)">
                                <v-avatar size="x-small" color="grey">
                                    <v-fade-transition :key="selectedCount">
                                        <v-icon size="x-small" v-show="hasSelected(item.id)" icon="mdi-check" />
                                    </v-fade-transition>
                                </v-avatar>
                            </label>
                        </v-col>
                        <v-col dense :cols="3">
                            <template v-if="item.album.image">
                                <v-img :src="item.album.image" cover>
                                    <template #error>
                                        <v-icon icon="mdi-music" />
                                    </template>
                                </v-img>
                            </template>
                            <template v-else>
                                <v-icon icon="mdi-music" />
                            </template>
                        </v-col>
                        <v-spacer />
                        <v-col dense :cols="5">
                            <v-layout dense style="flex-direction: column">
                                <v-row dense>
                                    <v-col dense :cols="12">
                                        <v-card-title density="compact">
                                            <small>
                                                {{ item.name }}
                                            </small>
                                        </v-card-title>
                                    </v-col>
                                    <v-divider :thickness="8" />
                                    <v-col dense :cols="12">
                                        <v-card-subtitle density="compact">
                                            {{ item.artists.map(({ name }) => name).join("、") }}
                                        </v-card-subtitle>
                                    </v-col>
                                </v-row>
                            </v-layout>
                        </v-col>
                        <v-col :cols="2" dense>
                            <a :href="item.preview" target="_blank">
                                試聽
                            </a>
                        </v-col>
                    </v-row>
                </template>
            </v-container>
        </v-infinite-scroll>
        <v-expansion-panels flat multiple dense density="compact">
            <v-expansion-panel :elevation="0">
                <v-expansion-panel-title> 已選擇的作品 ({{ selected.length }}) </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-chip-group v-model="selected" multiple column dense density="compact">
                        <template v-for="track in selected">
                            <v-chip filter :value="track">
                                {{ track.name }}
                            </v-chip>
                        </template>
                    </v-chip-group>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </template>
</template>

<style scoped>
.v-card-title {
    @apply whitespace-pre-wrap;
}

.v-card-subtitle {
    @apply whitespace-pre-wrap;
}

.v-infinite-scroll__side {
    @apply hidden;
}

.v-container {
    @apply p-0;
}

:deep(.v-expansion-panel-text__wrapper) {
    @apply p-0;
}

.v-card-title {
    @apply whitespace-pre-wrap leading-4;
}

.v-card-subtitle {
    @apply whitespace-pre-wrap leading-4;
}
</style>