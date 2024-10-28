import { onRetrievingTrack, type TrackEnriched } from "~/lib/modules/TrackManaging/presentation/controllers/onRetrievingTrack"
import { watchCollection } from "~/lib/utils/firestore"
import { Collections } from "~/lib/constants"
import { getFirestore, collection, query, orderBy } from "@firebase/firestore"
import { WatchTypes } from "~/lib/utils/firestore"

export const useTracks = ({ groupId, playlistId }: { groupId: string, playlistId: string }, onChanged?: (trackId: string) => any | Promise<any>) => {
    const timestamps: { [trackId: string]: number } = {}
    const promises: { [trackId: string]: Promise<any> | undefined } = {}
    const stopWatching = ref<Function>()
    const trackIds = ref<string[]>([])
    const tracksMap = ref<{ [trackId: string]: TrackEnriched }>({})
    onBeforeMount(() => {
        const db = getFirestore()
        const q = query(
            collection(
                db,
                Collections.Tracks.replace(":groupId", groupId).replace(":playlistId", playlistId)
            ),
            orderBy("timestamp", "asc"),
        )
        stopWatching.value = watchCollection<{}>(q, async (type, parameters) => {
            const trackId = parameters[parameters.length - 1]
            const loaded = timestamps[trackId]
            onChanged?.(trackId)
            if (!loaded) trackIds.value.push(trackId)
            timestamps[trackId] = Date.now()
            if (!promises[trackId]) promises[trackId] = onRetrievingTrack(groupId, playlistId, trackId).then((track) => {
                if (track) tracksMap.value[trackId] = track
                return track
            })
            if (type === WatchTypes.Removed) {
                const index = trackIds.value.indexOf(trackId)
                if (index > -1) trackIds.value.splice(index, 1)
                delete tracksMap.value[trackId]
            }
        }, [WatchTypes.Added, WatchTypes.Modified, WatchTypes.Removed], db)
    })

    onBeforeUnmount(() => {
        stopWatching.value?.()
    })

    const tracks = computed(() => {
        const tracks = []
        for (const trackId of trackIds.value) {
            const track = tracksMap.value[trackId]
            if (!track) continue
            tracks.push(track)
        }
        return tracks
    })

    return {
        tracks,
    }
}