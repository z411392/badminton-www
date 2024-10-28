<script lang="ts" setup>
import { Pages } from "~/lib/constants"
import { withGroup, withMeetup } from "~/lib/utils/sessions"
import AppBar from "~/components/utils/AppBar.vue"
import { getAuth } from "firebase/auth"
import { useSignUps } from "~/composables/groups/[groupId]/meetups/[meetupId]/useSignUps"
import { type Level } from "~/lib/modules/LevelManaging/dtos/Level"
import SignUpsDialog from "~/components/groups/[groupId]/meetups/[meetupId]/SignUpsDialog.vue"
import Information from "~/components/groups/[groupId]/meetups/[meetupId]/Information.vue"
import Broadcaster from "~/components/groups/[groupId]/meetups/[meetupId]/Broadcaster.vue"
import ProfileComposeDialog from "~/components/groups/[groupId]/meetups/[meetupId]/ProfileComposingDialog.vue"
import Snackbar from "~/components/utils/Snackbar.vue"
import { useSnackbar } from "~/composables/utils/useSnackbar"
import RefundingDialog from '~/components/groups/[groupId]/meetups/[meetupId]/RefundingDialog.vue'
import { DateTime } from 'luxon'
import TempVar from 'vue-temp-var'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'
import { SignUpStatuses } from '~/lib/modules/SignUpManaging/dtos/SignUpStatuses'
import { onSigningUp } from "~/lib/modules/SignUpManaging/presentation/controllers/onSigningUp"
import { onCancellingSignUp } from '~/lib/modules/SignUpManaging/presentation/controllers/onCancellingSignUp'
import TrackForm from "~/components/groups/[groupId]/meetups/[meetupId]/TrackForm.vue"

onBeforeMount(() => ChartJS.register(ArcElement, Tooltip, Legend))

definePageMeta({
    name: Pages.Meetup.name,
})

const route = useRoute()
const { groupId, meetupId } = route.params as { groupId: string, meetupId: string }
const user = getAuth().currentUser!
const userId = user.uid
const group = withGroup()
const meetup = withMeetup()
const levels = computed(() => group.value.levels)
const levelsMap = computed(() => levels.value.reduce((levelsMap: { [levelId: string]: Level }, level: Level) => {
    levelsMap[level.id] = level
    return levelsMap
}, {}))

const lastUpdatedAt = ref(0)
const broadcaster = ref() as Ref<InstanceType<typeof Broadcaster>>
const { signUps, signUp, attendingsStats, levelsStats, loadingsMap, signUpIdOf } = useSignUps({ groupId, meetupId, userId }, (signUpEvent, context, listeningStartedAt) => {
    const { payload: { status, timeslotId }, timestamp } = signUpEvent
    const { user, profile } = context
    lastUpdatedAt.value = timestamp
    if (timestamp < listeningStartedAt) return
    const timeslot = meetup.value.timeslots.find(({ id }) => id === timeslotId)
    if (!timeslot) return
    broadcaster.value.broadcast({ user, profile, status, timeslot })
})

const signUpsDialog = ref() as Ref<InstanceType<typeof SignUpsDialog>>
const profile = ref(meetup.value.profile)

const playlist = computed(() => meetup.value.playlist)
const displaySongRequestButton = computed(() => {
    if (!playlist.value) return false
    if (!signUp.value) return false
    const { statuses } = signUp.value
    for (const index in statuses) {
        const status = statuses[index]
        if (status === SignUpStatuses.Accepted || status === SignUpStatuses.Paid) return true
    }
    return false
})

const fee = computed(() => {
    let total = 0
    for (const timeslotId in selected.value) {
        if (!selected.value[timeslotId]) continue
        const { fee } = meetup.value.timeslots.find(({ id }) => timeslotId === id)!
        total += fee
    }
    return total
})

const disabled = computed(() => {
    const checks = Object.values(selected.value)
    if (checks.length === 0) return true
    for (const check of checks) {
        if (check) return false
    }
    return true
})

const profileComposeDialog = ref() as Ref<InstanceType<typeof ProfileComposeDialog>>
const editProfile = () => profileComposeDialog.value.open()
onMounted(() => {
    if (!profile.value) editProfile()
})

const snackbar = useSnackbar()
const refundingDialog = ref() as Ref<InstanceType<typeof RefundingDialog>>

const stats = computed(() => meetup.value.timeslots.map(({ id: timeslotId, capacity, reserved }) => {
    const attendingsStat = attendingsStats.value[timeslotId]
    if (!attendingsStat) return undefined
    const { cancelled, revoked, refunded, accepted, paid, pending } = attendingsStat
    const available = capacity - reserved
    const unattending = cancelled + revoked + refunded
    const attending = accepted + paid
    const left = Math.max(available - attending, 0)
    const excess = Math.max(pending + attending - available, 0)
    return {
        left,
        excess,
        waiting: pending,
        unpaid: accepted,
        unattending,
    }
}))

const allPieChartData = computed(() => meetup.value.timeslots.map(({ id: timeslotId }) => {
    const levelsStat = levelsStats.value[timeslotId]
    if (!levelsStat) return undefined
    const labels = levels.value.map(({ name }) => name)
    const backgroundColor = levels.value.map(({ color }) => color)
    const data = levels.value.map(({ id: levelId }) => levelsStat[levelId] || 0)
    return {
        labels,
        datasets: [
            {
                backgroundColor,
                data,
            }
        ],
    }
}))

const pieChartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    elements: {
        arc: {
            borderWidth: 1,
        },
    },
}

const timestampOf = (time: string) => {
    const { date } = meetup.value
    const timestamp = DateTime.fromFormat(`${date} ${time}`, `yyyy-LL-dd HH:mm`).toMillis()
    return timestamp
}

const now = ref(0)

setInterval(() => now.value = Date.now(), 1000)

const selected = ref<{ [timeslotId: string]: boolean }>({})
const toggleSelect = (timeslotId: string) => selected.value[timeslotId] = !selected.value[timeslotId]

const loading = ref(false)
const onSignUpButtonClicked = async () => {
    loading.value = true
    const promises: Promise<any>[] = []
    for (const timeslotId in selected.value) {
        const signUpId = signUpIdOf(userId, timeslotId)!
        loadingsMap.value[signUpId] = true
        promises.push(onSigningUp(groupId, meetupId, timeslotId).then(() => selected.value[timeslotId] = false))
    }
    await Promise.all(promises)
    loading.value = false
}

const onCancelButtonClicked = async (timeslotId: string) => {
    const signUpId = signUpIdOf(userId, timeslotId)!
    loadingsMap.value[signUpId] = true
    await onCancellingSignUp(groupId, meetupId, timeslotId)
}
const trackFrom = ref() as Ref<InstanceType<typeof TrackForm>>
</script>

<template>
    <v-app>
        <Snackbar ref="snackbar" />
        <TrackForm ref="trackFrom" :groupId="groupId" :meetupId="meetupId" />
        <ProfileComposeDialog ref="profileComposeDialog" v-model="profile" :groupId="groupId" :levels="levels" />
        <Broadcaster ref="broadcaster" :levelsMap="levelsMap" />
        <SignUpsDialog ref="signUpsDialog" :signUps="signUps" :levels="levels" :levelsMap="levelsMap"
            :timeslots="meetup.timeslots" />
        <RefundingDialog ref="refundingDialog" />
        <template v-if="profile" :key="profile?.updatedAt">
            <AppBar :user="user" :profile="profile" :levelsMap="levelsMap" :editProfile="editProfile" />
        </template>
        <v-main>
            <v-card flat :max-width="750" width="auto" :rounded="0">
                <v-parallax
                    src="https://firebasestorage.googleapis.com/v0/b/boyholic-badminton.appspot.com/o/assets%2Fimages%2Fwww-meetup-kv.jpeg?alt=media&token=fb38a0cc-066d-4ffe-ae17-f11b7c264e1b"></v-parallax>
                <Information :group="group" :meetup="meetup" />
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
                                <template
                                    v-for="({ startTime, endTime, courts, reserved, capacity, fee, id: timeslotId }, index) in meetup.timeslots">
                                    <v-expansion-panel :elevation="0">
                                        <template #title>
                                            <v-list flat width="100%" :elevation="0" density="compact">
                                                <v-list-item density="compact">
                                                    <template #title>
                                                        <v-sheet style="text-align: center;">
                                                            {{ startTime }} - {{ endTime }}
                                                        </v-sheet>
                                                    </template>
                                                    <template #prepend #text :key="signUp?.updatedAt">
                                                        <TempVar
                                                            :define="{ status: signUp?.statuses[timeslotId], signUpId: signUpIdOf(userId, timeslotId) }"
                                                            :key="now">
                                                            <template #default="{ status, signUpId }">
                                                                <template v-if="now < timestampOf(startTime)">
                                                                    <v-avatar size="x-small">
                                                                        <template
                                                                            v-if="signUpId && loadingsMap[signUpId]">
                                                                            <v-btn @click.native.stop color="grey"
                                                                                disabled :loading="true" />
                                                                        </template>
                                                                        <template v-else>
                                                                            <template v-if="status">
                                                                                <template
                                                                                    v-if="status === SignUpStatuses.Pending">
                                                                                    <v-btn @click.native.stop
                                                                                        color="grey" disabled>
                                                                                        <v-icon size="x-small"
                                                                                            icon="mdi-check" />
                                                                                    </v-btn>
                                                                                </template>
                                                                                <template
                                                                                    v-if="status === SignUpStatuses.Accepted">
                                                                                    <v-btn @click.native.stop
                                                                                        color="success" disabled>
                                                                                        <v-icon size="x-small"
                                                                                            icon="mdi-check" />
                                                                                    </v-btn>
                                                                                </template>
                                                                                <template
                                                                                    v-if="status === SignUpStatuses.Paid">
                                                                                    <v-btn @click.native.stop
                                                                                        color="info" disabled>
                                                                                        <v-icon size="x-small"
                                                                                            icon="mdi-check" />
                                                                                    </v-btn>
                                                                                </template>
                                                                            </template>
                                                                            <template
                                                                                v-if="!status || status === SignUpStatuses.Cancelled || status === SignUpStatuses.Revoked || status === SignUpStatuses.Refunded">
                                                                                <v-btn @click.native.stop color="grey"
                                                                                    @click="() => toggleSelect(timeslotId)">
                                                                                    <v-fade-transition>
                                                                                        <v-icon size="x-small"
                                                                                            icon="mdi-check"
                                                                                            v-show="selected[timeslotId] || false" />
                                                                                    </v-fade-transition>
                                                                                </v-btn>
                                                                            </template>
                                                                        </template>
                                                                    </v-avatar>
                                                                </template>
                                                            </template>
                                                        </TempVar>
                                                    </template>
                                                </v-list-item>
                                            </v-list>
                                        </template>
                                        <template #text :key="lastUpdatedAt">
                                            <v-card flat>
                                                <v-container>
                                                    <v-row justify="space-evenly" :align="'center'">
                                                        <TempVar :define="{ stat: stats[index] }" v-if="stats[index]">
                                                            <template #default="{
                                                                stat: {
                                                                    left,
                                                                    excess,
                                                                    waiting,
                                                                    unattending,
                                                                }
                                                            }">
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
                                                            </template>
                                                        </TempVar>
                                                        <TempVar :define="{ data: allPieChartData[index] }"
                                                            v-if="allPieChartData[index]">
                                                            <template #default="{ data }">
                                                                <v-col cols="auto">
                                                                    <Pie :data="data" :options="pieChartOptions"
                                                                        :class="$style.pie" />
                                                                </v-col>
                                                            </template>
                                                        </TempVar>
                                                    </v-row>
                                                </v-container>
                                                <v-card-actions>
                                                    <v-row justify="space-evenly">
                                                        <TempVar
                                                            :define="{ status: signUp?.statuses[timeslotId], loading: loadingsMap[signUpIdOf(userId, timeslotId) || ''] }"
                                                            :key="signUp?.updatedAt"
                                                            v-if="signUp?.statuses[timeslotId]">
                                                            <template #default="{ status, loading }">
                                                                <template
                                                                    v-if="status === SignUpStatuses.Pending || status === SignUpStatuses.Accepted">
                                                                    <v-col cols="auto">
                                                                        <v-btn variant="elevated"
                                                                            @click="() => onCancelButtonClicked(timeslotId)"
                                                                            :loading="loading">
                                                                            我要取消
                                                                        </v-btn>
                                                                    </v-col>
                                                                </template>
                                                                <template v-if="status === SignUpStatuses.Paid">
                                                                    <v-col cols="auto">
                                                                        <v-btn variant="elevated"
                                                                            @click="() => refundingDialog.open()">
                                                                            關於退費
                                                                        </v-btn>
                                                                    </v-col>
                                                                </template>
                                                            </template>
                                                        </TempVar>
                                                    </v-row>
                                                </v-card-actions>
                                            </v-card>
                                        </template>
                                    </v-expansion-panel>
                                </template>
                            </v-expansion-panels>
                        </v-col>
                    </v-row>
                </v-container>
                <v-card-actions>
                    <v-row justify="center">
                        <v-col cols="auto">
                            <v-btn variant="elevated" @click="() => signUpsDialog.open()">
                                成員名單
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-badge :model-value="!disabled && !loading" transition="bounce">
                                <v-btn @click="() => onSignUpButtonClicked()" variant="elevated" :disabled="disabled"
                                    :loading="loading">
                                    我要零打
                                </v-btn>
                                <template #badge>
                                    NTD {{ fee }}
                                </template>
                            </v-badge>
                        </v-col>
                    </v-row>
                </v-card-actions>
            </v-card>
        </v-main>
        <v-fade-transition>
            <v-btn v-show="displaySongRequestButton" :class="$style['request-song']" icon="mdi-music" @click="trackFrom.open()" />
        </v-fade-transition>
    </v-app>
</template>

<style scoped>
.v-main {
    @apply pb-6;
    background-color: #f8f9fa;
}

.v-card {
    @apply mx-auto
}

.v-card-text {
    @apply leading-6;
}

.v-theme--light {
    --v-hover-opacity: 0;
}
</style>

<style scoped module>
.request-song {
    @apply fixed right-4 bottom-4;
}

.figure {
    @apply text-sm pl-4;
}

.pie {
    width: 100% !important;
    height: auto !important;
    max-width: 160px;
}
</style>