<script lang="ts" setup>
import { onSearchingArtists, type Artist } from '~/lib/modules/SongRequesting/presentation/controllers/onSearchingArtists'
import { watchIgnorable } from '@vueuse/core'
import { useAbortController } from '~/composables/utils/useAbortController'

const selected = defineModel<Artist>()
const itemIds = ref<string[]>([])
const itemsMap = ref<{ [artistId: string]: Artist }>({})
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
    set: (artists: Artist[]) => {
        itemIds.value = []
        itemsMap.value = {}
        for (const artist of artists) {
            if (itemsMap.value[artist.id]) continue
            itemIds.value.push(artist.id)
            itemsMap.value[artist.id] = artist
        }
    }
})

const pageSize = 20

const search = ref("")
const page = ref(1)
const loading = ref(false)
const lastLoaded = ref(0)
const hasMore = computed(() => lastLoaded.value >= pageSize)

const abortController = useAbortController()

const needToReset = ([newSearch]: [string, number], [oldSearch]: [string | undefined, number | undefined]) => {
    if (typeof oldSearch === "undefined") return true
    if (newSearch !== oldSearch) return true
    return false
}

let ignoreUpdates: Function
const reset = () => {
    abortController.cancel()
    ignoreUpdates?.(() => page.value = 1)
    items.value = []
}

const stopWatching = ref<Function>()
const onFocused = async (focused: boolean) => {
    if (!focused) {
        stopWatching.value?.()
        abortController.clear()
        search.value = ""
        page.value = 1
        return
    }
    const watchIgnorableReturn = watchIgnorable([search, page], async (newOne, oldOne) => {
        if (needToReset(newOne, oldOne)) reset()
        const [search, page] = newOne
        const signal = abortController.signal({ search, page })
        loading.value = true
        const artists = await onSearchingArtists({ search, page }, signal)
        items.value = [...items.value, ...artists]
        lastLoaded.value = artists.length
        loading.value = false
    }, { immediate: true, deep: true })
    ignoreUpdates = watchIgnorableReturn.ignoreUpdates
    stopWatching.value = watchIgnorableReturn.stop
}

const loadMore = () => page.value += 1
const itemTitle = ({ name }: Artist) => name
const itemValue = ({ id }: Artist) => id
</script>

<template>
    <v-autocomplete label="歌手名稱" v-model="selected" v-model:search="search" return-object :item-title="itemTitle"
        :item-value="itemValue" :items="items" chips no-filter variant="filled" @update:focused="onFocused"
        :loading="loading" density="compact" hide-details>
        <template #item="{
            props,
            item: { raw: artist },
        }: {
            props: any
            item: { raw: Artist }
        }">
            <v-list-item v-bind="props">
                <template #title>
                    {{ itemTitle(artist) }}
                </template>
                <template #prepend>
                    <v-avatar :size="40">
                        <template v-if="artist.image">
                            <v-img :src="artist.image">
                                <template #error>
                                    <v-btn flat variant="plain" :size="30">{{ artist.name[0] }}</v-btn>
                                </template>
                            </v-img>
                        </template>
                        <template v-else>
                            <v-btn flat variant="plain" :size="30">{{ artist.name[0] }}</v-btn>
                        </template>
                    </v-avatar>
                </template>
            </v-list-item>
        </template>
        <template v-slot:append-item v-if="!loading && hasMore">
            <div v-intersect="(isIntersecting: boolean) => isIntersecting && loadMore()"></div>
        </template>
    </v-autocomplete>
</template>