<script lang="ts" setup>
import { type Plan } from '~/lib/modules/MeetupManaging/dtos/Plan'
import { type Level } from '~/lib/modules/LevelManaging/dtos/Level'
import { SignUpStatuses } from '~/lib/modules/SignUpManaging/dtos/SignUpStatuses'
import TempVar from 'vue-temp-var'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'
import { onCancellingSignUp } from '~/lib/modules/SignUpManaging/presentation/controllers/onCancellingSignUp'
import { type SignUpEnriched } from '~/composables/groups/[groupId]/meetups/[meetupId]/useSignUps'
import { DateTime } from 'luxon'


onBeforeMount(() => ChartJS.register(ArcElement, Tooltip, Legend))
const planIndexesSelected = defineModel<number[]>()

const {
    groupId,
    meetupId,
    date,
    plans,
    signUps,
    signUp,
    levels,
    signUpsMap,
} = defineProps<{
    groupId: string
    meetupId: string
    date: string
    plans: Plan[]
    signUps: SignUpEnriched[]
    signUp?: SignUpEnriched
    levels: Level[]
    signUpsMap: { [signUpId: string]: SignUpEnriched }
}>()

const initializeAttendingStats = () => plans.map(() => {
    const attendingStat: { [status: string]: number } = {}
    for (const status of Object.values(SignUpStatuses)) attendingStat[status] = 0
    return attendingStat
})

const processAttendingStats = (attendingStats: Array<{ [status: string]: number }>) => {
    for (const { statuses } of signUps) {
        for (const index in statuses) attendingStats[Number(index)][statuses[index]] += 1
    }
    return attendingStats
}

const fromAttendingStatToStatWeNeed = (attendingStat: { [status: string]: number }, index: number) => {
    const { cancelled, revoked, refunded, accepted, paid, pending } = attendingStat
    const { capacity, reserved } = plans[index]
    const left = capacity - reserved
    const unattending = cancelled + revoked + refunded
    const attending = accepted + paid
    const excess = Math.max(pending + attending - left, 0)
    return {
        left: Math.max(left - attending, 0),
        excess,
        waiting: pending,
        unattending,
        attending,
    }
}

const stats = computed(() => processAttendingStats(initializeAttendingStats()).map(fromAttendingStatToStatWeNeed))

const initializeLevelStats = () => plans.map(() => {
    const levelStat: { [levelId: string]: number } = {}
    for (const { id: levelId } of levels) levelStat[levelId] = 0
    return levelStat
})

const processLevelStats = (levelStats: Array<{ [levelId: string]: number }>) => {
    for (const { statuses, profile: { levelId } } of signUps) {
        for (const index in statuses) {
            const status = statuses[index]
            if (status === SignUpStatuses.Accepted || status === SignUpStatuses.Paid) levelStats[Number(index)][levelId] += 1
        }
    }
    return levelStats
}

const fromLevelStatToPieChartData = (levelStat: { [levelId: string]: number }) => {
    return {
        labels: levels.map(({ name }) => name),
        datasets: [
            {
                backgroundColor: levels.map(({ color }) => color),
                data: levels.map(({ id: levelId }) => levelStat[levelId]),
            }
        ],
    }
}

const allPieChartData = computed(() => processLevelStats(initializeLevelStats()).map(fromLevelStatToPieChartData))

const pieChartOptions = {
    responsive: false,
    elements: {
        arc: {
            borderWidth: 1,
        },
    },
}

const planIndexesSelectedMap = ref<{ [index: string]: boolean }>({})
const toggleSelect = (index: number) => {
    if (typeof planIndexesSelectedMap.value[index] === "undefined") planIndexesSelectedMap.value[index] = true
    else planIndexesSelectedMap.value[index] = !planIndexesSelectedMap.value[index]
    planIndexesSelected.value = Object.entries(planIndexesSelectedMap.value).filter(([_, selected]) => selected).map(([index, _]) => Number(index))
}
const refundingPromptOpened = ref(false)
const onCancelButtonClicked = async (signUpId: string, index: number) => {
    signUpsMap[signUpId].statuses[index] = SignUpStatuses.Transiting
    await onCancellingSignUp(groupId, meetupId, index)
    planIndexesSelectedMap.value[index] = false
}

const availabilities = computed(() => plans.map(({ startTime }) => {
    const startedAt = DateTime.fromFormat(`${date} ${startTime}`, `yyyy-LL-dd HH:mm`).toMillis()
    return Date.now() < startedAt
}))
</script>

<template>
    <v-dialog v-model="refundingPromptOpened" width="auto">
        <v-card :width="360">
            <v-card-title>
                關於退費
            </v-card-title>
            <v-card-subtitle>
                退費方式說明
            </v-card-subtitle>
            <v-card-text>
                因為目前不是在線上完成付款，想申請退費要聯絡球團管理員哦！
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-container>
        <v-row justify="space-evenly" :align="'center'" dense>
            <v-col :cols="12" sm="auto">
                <v-card-title>場次資訊</v-card-title>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
                <v-sheet :class="$style['figure']">
                    <v-avatar size="x-small" color="grey">
                        <v-icon icon="mdi-check" size="x-small" />
                    </v-avatar>
                    已報名
                </v-sheet>
            </v-col>
            <v-col cols="auto">
                <v-sheet :class="$style['figure']">
                    <v-avatar size="x-small" color="success">
                        <v-icon icon="mdi-check" size="x-small" />
                    </v-avatar>
                    已錄取
                </v-sheet>
            </v-col>
            <v-col cols="auto">
                <v-sheet :class="$style['figure']">
                    <v-avatar size="x-small" color="info">
                        <v-icon icon="mdi-check" size="x-small" />
                    </v-avatar>
                    已繳費
                </v-sheet>
            </v-col>
        </v-row>
        <v-row>
            <v-col :cols="12">
                <v-expansion-panels multiple>
                    <template v-for="({ startTime, endTime }, index) in plans">
                        <TempVar :define="{
                            stat: stats[index],
                            data: allPieChartData[index],
                            plan: plans[index],
                            status: signUp?.statuses[index],
                            available: availabilities[index],
                        }" #default="{
                            stat: {
                                left,
                                excess,
                                waiting,
                                unattending,
                                attending,
                            },
                            data,
                            plan: {
                                courts,
                                reserved,
                                capacity,
                                fee,
                            },
                            status,
                            available,
                        }">
                            <v-expansion-panel :elevation="0">
                                <template #title>
                                    <v-list flat width="100%" :elevation="0" density="compact">
                                        <v-list-item density="compact">
                                            <template #title>
                                                <v-sheet style="text-align: center;">
                                                    {{ startTime }} - {{ endTime }}
                                                </v-sheet>
                                            </template>
                                            <template #prepend :key="signUp?.updatedAt">
                                                <template v-if="available">
                                                    <v-avatar size="x-small">
                                                        <template v-if="status">
                                                            <template v-if="status === SignUpStatuses.Transiting">
                                                                <v-btn @click.native.stop color="grey" disabled
                                                                    :loading="true" />
                                                            </template>
                                                            <template v-if="status === SignUpStatuses.Pending">
                                                                <v-btn @click.native.stop color="grey" disabled>
                                                                    <v-icon size="x-small" icon="mdi-check" />
                                                                </v-btn>
                                                            </template>
                                                            <template v-if="status === SignUpStatuses.Accepted">
                                                                <v-btn @click.native.stop color="success" disabled>
                                                                    <v-icon size="x-small" icon="mdi-check" />
                                                                </v-btn>
                                                            </template>
                                                            <template v-if="status === SignUpStatuses.Paid">
                                                                <v-btn @click.native.stop color="info" disabled>
                                                                    <v-icon size="x-small" icon="mdi-check" />
                                                                </v-btn>
                                                            </template>
                                                        </template>
                                                        <template
                                                            v-if="!status || status === SignUpStatuses.Cancelled || status === SignUpStatuses.Revoked || status === SignUpStatuses.Refunded">
                                                            <v-btn @click.native.stop color="grey"
                                                                @click="() => toggleSelect(index)">
                                                                <v-fade-transition>
                                                                    <v-icon size="x-small" icon="mdi-check"
                                                                        v-show="planIndexesSelectedMap[index] || false" />
                                                                </v-fade-transition>
                                                            </v-btn>
                                                        </template>
                                                    </v-avatar>
                                                </template>
                                            </template>
                                        </v-list-item>
                                    </v-list>
                                </template>
                                <template #text :key="signUp?.updatedAt">
                                    <v-card flat>
                                        <v-container>
                                            <v-row justify="space-evenly" :align="'center'">
                                                <v-col cols="auto">
                                                    <v-list flat style="column-count: 2;">
                                                        <v-list-item>
                                                            <template #title>
                                                                球費
                                                            </template>
                                                            <template #subtitle>
                                                                {{ fee }} 元
                                                            </template>
                                                        </v-list-item>
                                                        <v-divider />
                                                        <v-list-item>
                                                            <template #title>
                                                                場地數
                                                            </template>
                                                            <template #subtitle>
                                                                {{ courts }}
                                                            </template>
                                                        </v-list-item>
                                                        <v-divider />
                                                        <v-list-item>
                                                            <template #title>
                                                                名額
                                                            </template>
                                                            <template #subtitle>
                                                                {{ capacity }}
                                                            </template>
                                                        </v-list-item>
                                                        <v-divider />
                                                        <v-list-item>
                                                            <template #title>
                                                                預留名額
                                                            </template>
                                                            <template #subtitle>
                                                                {{ reserved }}
                                                            </template>
                                                        </v-list-item>
                                                        <v-divider />
                                                        <v-list-item>
                                                            <template #title>
                                                                缺額
                                                            </template>
                                                            <template #subtitle>
                                                                {{ left }}
                                                            </template>
                                                        </v-list-item>
                                                        <v-divider />
                                                        <v-list-item>
                                                            <template #title>
                                                                剩餘名額
                                                            </template>
                                                            <template #subtitle>
                                                                {{ left }}
                                                            </template>
                                                        </v-list-item>
                                                        <template v-if="excess">
                                                            <v-divider />
                                                            <v-list-item>
                                                                <template #title>
                                                                    候補人數
                                                                </template>
                                                                <template #subtitle>
                                                                    {{ excess }}
                                                                </template>
                                                            </v-list-item>
                                                        </template>
                                                        <template v-else>
                                                            <v-divider />
                                                            <v-list-item>
                                                                <template #title>
                                                                    等待人數
                                                                </template>
                                                                <template #subtitle>
                                                                    {{ waiting }}
                                                                </template>
                                                            </v-list-item>
                                                        </template>
                                                        <v-divider />
                                                        <v-list-item>
                                                            <template #title>
                                                                取消人數
                                                            </template>
                                                            <template #subtitle>
                                                                {{ unattending }}
                                                            </template>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-col>
                                                <template v-if="attending > 0">
                                                    <v-col cols="auto">
                                                        <Pie :data="data" :options="pieChartOptions"
                                                            :class="$style.pie" />
                                                    </v-col>
                                                </template>
                                            </v-row>
                                        </v-container>
                                        <v-card-actions>
                                            <v-row justify="space-evenly">
                                                <v-col cols="auto">
                                                    <template v-if="status">
                                                        <template
                                                            v-if="status === SignUpStatuses.Pending || status === SignUpStatuses.Accepted">
                                                            <v-btn variant="elevated"
                                                                @click="() => onCancelButtonClicked(signUp!.id, index)">
                                                                我要取消
                                                            </v-btn>
                                                        </template>
                                                        <template v-if="status === SignUpStatuses.Paid">
                                                            <v-btn variant="elevated"
                                                                @click="refundingPromptOpened = true">
                                                                關於退費
                                                            </v-btn>
                                                        </template>
                                                    </template>
                                                </v-col>
                                            </v-row>
                                        </v-card-actions>
                                    </v-card>
                                </template>
                            </v-expansion-panel>
                        </TempVar>
                    </template>
                </v-expansion-panels>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped module>
.figure {
    @apply text-sm pl-4;
}

.pie {
    width: 100% !important;
    height: auto !important;
    max-width: 160px;
}
</style>

<style scoped>
.v-theme--light {
    --v-hover-opacity: 0;
}
</style>