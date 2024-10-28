<script lang="ts" setup>
import { type Timeslot } from '~/lib/modules/MeetupManaging/dtos/Timeslot'
import { type Level } from '~/lib/modules/LevelManaging/dtos/Level'
import { SignUpStatuses } from '~/lib/modules/SignUpManaging/dtos/SignUpStatuses'
import { type AttendingsStats, type LevelsStats, type SignUpEnriched } from '~/composables/groups/[groupId]/meetups/[meetupId]/useSignUps'
import TempVar from 'vue-temp-var'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'
import { DateTime } from 'luxon'
import { onCancellingSignUp } from '~/lib/modules/SignUpManaging/presentation/controllers/onCancellingSignUp'


onBeforeMount(() => ChartJS.register(ArcElement, Tooltip, Legend))
const selected = defineModel<string[]>({ default: [] })
const {
    userId,
    groupId,
    meetupId,
    date,
    timeslots,
    attendingsStats,
    levelsStats,
    levels,
    signUp,
} = defineProps<{
    userId: string
    groupId: string,
    meetupId: string,
    date: string,
    timeslots: Timeslot[]
    attendingsStats: AttendingsStats
    levelsStats: LevelsStats
    levels: Level[]
    signUp?: SignUpEnriched
}>()


const timeslotIndexesSelectedMap = ref<{ [index: string]: boolean }>({})
const toggleSelect = (timeslotId: string) => {
    // if (typeof timeslotIndexesSelectedMap.value[index] === "undefined") timeslotIndexesSelectedMap.value[index] = true
    // else timeslotIndexesSelectedMap.value[index] = !timeslotIndexesSelectedMap.value[index]
    // timeslotIndexesSelected.value = Object.entries(timeslotIndexesSelectedMap.value).filter(([_, selected]) => selected).map(([index, _]) => Number(index))
}
const onCancelButtonClicked = async (timeslotId: string) => {
    // signUpsMap[signUpId].statuses[index] = SignUpStatuses.Transiting
    // await onCancellingSignUp(groupId, meetupId, index)
    // timeslotIndexesSelectedMap.value[index] = false
}

const availabilities = computed(() => timeslots.map(({ startTime }) => {
    const startedAt = DateTime.fromFormat(`${date} ${startTime}`, `yyyy-LL-dd HH:mm`).toMillis()
    return Date.now() < startedAt
}))

</script>

<template>

    
</template>