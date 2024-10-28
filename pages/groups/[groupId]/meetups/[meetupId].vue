<script lang="ts" setup>
import { Pages } from "~/lib/constants"
import { withGroup, withMeetup } from "~/lib/utils/sessions"
import AppBar from "~/components/utils/AppBar.vue"
import { getAuth } from "firebase/auth"
import { useSignUps } from "~/composables/groups/[groupId]/meetups/[meetupId]/useSignUps"
import { type Level } from "~/lib/modules/LevelManaging/dtos/Level"
import SignUpsDialog from "~/components/groups/[groupId]/meetups/[meetupId]/SignUpsDialog.vue"
import Information from "~/components/groups/[groupId]/meetups/[meetupId]/Information.vue"
import SignUpForm from "~/components/groups/[groupId]/meetups/[meetupId]/SignUpForm.vue"
import { SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"
import { type Plan } from "~/lib/modules/MeetupManaging/dtos/Plan"
import { onSigningUp } from "~/lib/modules/SignUpManaging/presentation/controllers/onSigningUp"
import { useEventListener } from "~/composables/utils/useEventListener"
import { Topics } from "~/lib/constants"
import { type SignUpEvent } from "~/lib/modules/SignUpManaging/dtos/SignUpEvent"
import Broadcaster from "~/components/groups/[groupId]/meetups/[meetupId]/Broadcaster.vue"
import ProfileComposeDialog from "~/components/groups/[groupId]/meetups/[meetupId]/ProfileComposeDialog.vue"
import Snackbar from "~/components/utils/Snackbar.vue"
import { useSnackbar } from "~/composables/utils/useSnackbar"

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
const plans = computed(() => meetup.value.plans)
const { signUps, signUp, signUpsMap } = useSignUps(groupId, meetupId, userId)
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

const planIndexesSelected = ref<number[]>([])
const fee = computed(() => plans.value
    .filter((_, index) => planIndexesSelected.value.includes(index))
    .reduce((total: number, { fee }: Plan) => total + fee, 0)
)

const disabled = computed(() => planIndexesSelected.value.length === 0)
const onSignUpButtonClicked = async (...indexes: number[]) => {
    planIndexesSelected.value = []
    await Promise.all(indexes.map(async (index) => {
        if (signUp.value) signUpsMap.value[signUp.value.id].statuses[index] = SignUpStatuses.Transiting
        await onSigningUp(groupId, meetupId, index)
    }))

}

const listen = useEventListener<SignUpEvent>({ groupId, meetupId }, Topics.SignUp)
const stopListening = ref<Function>()
const broadcaster = ref() as Ref<InstanceType<typeof Broadcaster>>
onBeforeMount(() => {
    stopListening.value = listen(({ payload: { signUpId, index, status } }) => {
        const plan = plans.value[index]
        if (!plan) return
        const signUp = signUpsMap.value[signUpId]
        if (!signUp) return
        const { user, profile } = signUp
        broadcaster.value.broadcast({ user, profile, status, plan })
    })
})
onBeforeUnmount(() => {
    stopListening.value?.()
})

const profileComposeDialog = ref() as Ref<InstanceType<typeof ProfileComposeDialog>>
const editProfile = () => profileComposeDialog.value.open()
onMounted(() => {
    if (!profile.value) editProfile()
})

const snackbar = useSnackbar()
</script>

<template>
    <v-app>
        <Snackbar ref="snackbar" />
        <ProfileComposeDialog ref="profileComposeDialog" v-model="profile" :groupId="groupId" :levels="levels" />
        <Broadcaster ref="broadcaster" :levelsMap="levelsMap" />
        <SignUpsDialog ref="signUpsDialog" :signUps="signUps" :levels="levels" :levelsMap="levelsMap" :plans="plans" />
        <template v-if="profile" :key="profile?.updatedAt">
            <AppBar :user="user" :profile="profile" :levelsMap="levelsMap" :editProfile="editProfile" />
        </template>
        <v-main>
            <v-card flat :max-width="750" width="auto" :rounded="0">
                <v-parallax
                    src="https://firebasestorage.googleapis.com/v0/b/boyholic-badminton.appspot.com/o/assets%2Fimages%2Fwww-meetup-kv.jpeg?alt=media&token=fb38a0cc-066d-4ffe-ae17-f11b7c264e1b"></v-parallax>
                <Information :group="group" :meetup="meetup" />
                <SignUpForm v-model="planIndexesSelected" :groupId="groupId" :meetupId="meetupId" :date="meetup.date" :plans="plans"
                    :signUps="signUps" :signUp="signUp" :levels="levels" :signUpsMap="signUpsMap" />
                <v-card-actions>
                    <v-row justify="center">
                        <v-col cols="auto">
                            <v-btn variant="elevated" @click="() => signUpsDialog.open()">
                                成員名單
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-badge :model-value="!disabled" transition="bounce">
                                <v-btn @click="() => onSignUpButtonClicked(...planIndexesSelected)" variant="elevated"
                                    :disabled="disabled">
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
            <v-btn v-show="displaySongRequestButton" :class="$style['request-song']" icon="mdi-music" />
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
</style>

<style scoped module>
.request-song {
    @apply fixed right-4 bottom-4;
}
</style>