<script lang="ts" setup>
import TempVar from "vue-temp-var"
import { type User } from "~/lib/modules/IdentityAndAccessManaging/dtos/User"
import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { type Level } from "~/lib/modules/LevelManaging/dtos/Level"
import { SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"
import { type Timeslot } from "~/lib/modules/MeetupManaging/dtos/Timeslot"

const { levelsMap } = defineProps<{
    levelsMap: { [levelId: string]: Level }
}>()

type Emits = ((event: "opened") => void) & ((event: "closed") => void)

const emit = defineEmits<Emits>()
const opened = ref(false)
watch(opened, (opened) => {
    if (opened) emit("opened")
    else emit("closed")
})

const user = ref<User>() as Ref<User>
const profile = ref<Profile>() as Ref<Profile>
const status = ref<SignUpStatuses>() as Ref<SignUpStatuses>
const timeslot = ref<Timeslot>() as Ref<Timeslot>

const broadcast = (broadcastOptions: { timeslot: Timeslot, user: User, profile: Profile, status: SignUpStatuses }, timeout: number = 5000) => {
    user.value = broadcastOptions.user
    profile.value = broadcastOptions.profile
    status.value = broadcastOptions.status
    timeslot.value = broadcastOptions.timeslot
    setTimeout(() => opened.value = false, timeout)
    opened.value = true
}

const close = () => opened.value = false
defineExpose({
    broadcast
})
</script>

<template>
    <v-snackbar v-model="opened" color="white" location="top center">
        <v-list density="compact" flat>
            <v-list-item density="compact">
                <template #prepend>
                    <TempVar :define="{ level: levelsMap[profile.levelId] }" #default="{ level: { color } }"
                        v-if="levelsMap[profile.levelId]">
                        <v-badge :color="color" dot>
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
                        </v-badge>
                    </TempVar>
                </template>
                <template #title>
                    <v-row>
                        <v-col cols="auto">
                            {{ profile.name }}
                        </v-col>
                        <v-col cols="auto">
                            <template v-if="status === SignUpStatuses.Pending">
                                報名了時段 {{ timeslot.startTime }} - {{ timeslot.endTime }}
                            </template>
                            <template v-if="status === SignUpStatuses.Cancelled">
                                取消了時段 {{ timeslot.startTime }} - {{ timeslot.endTime }}
                            </template>
                            <template v-if="status === SignUpStatuses.Accepted">
                                時段 {{ timeslot.startTime }} - {{ timeslot.endTime }} 已被錄取
                            </template>
                            <template v-if="status === SignUpStatuses.Revoked">
                                時段 {{ timeslot.startTime }} - {{ timeslot.endTime }} 已被取消
                            </template>
                            <template v-if="status === SignUpStatuses.Paid">
                                時段 {{ timeslot.startTime }} - {{ timeslot.endTime }} 被標記為已繳費
                            </template>
                            <template v-if="status === SignUpStatuses.Paid">
                                時段 {{ timeslot.startTime }} - {{ timeslot.endTime }} 被標記為已退費
                            </template>
                        </v-col>
                    </v-row>
                </template>
                <template #append>
                    <v-btn variant="plain" flat @click="close">
                        <v-icon icon="mdi-close" />
                    </v-btn>
                </template>
            </v-list-item>
        </v-list>
    </v-snackbar>
</template>

<style scoped>
:deep(.v-snackbar__content) {
    @apply p-0;
}
</style>

<style scoped module>
.avatar {
    cursor: pointer;
    margin-right: 8px;
}
</style>