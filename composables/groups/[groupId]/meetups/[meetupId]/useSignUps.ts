import { useEventListener } from "~/composables/utils/useEventListener"
import { type SignUpEvent } from "~/lib/modules/SignUpManaging/dtos/SignUpEvent"
import { Topics } from "~/lib/constants"
import { type User } from "~/lib/modules/IdentityAndAccessManaging/dtos/User"
import { onRetrievingUser } from "~/lib/modules/IdentityAndAccessManaging/presentation/controllers/onRetrievingUser"
import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { onRetrievingProfile } from "~/lib/modules/ProfileManaging/presentation/controllers/onRetrievingProfile"
import { ProfileRepository } from "~/lib/adapters/firestore/ProfileRepository"
import { SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"
import PQueue from "p-queue"

export type LevelsStats = { [timeslotId: string]: { [levelId: string]: number } }
export type AttendingsStats = { [timeslotId: string]: { [status: string]: number } }
export type SignUpEnriched = {
    userId: string
    profile: Profile
    user: User
    updatedAt: number
    statuses: { [timeslotId: string]: SignUpStatuses }
}

export type OnChange = (event: SignUpEvent, context: { user: User, profile: Profile }, listeningStartedAt: number) => void | Promise<void>

export const useSignUps = ({ groupId, meetupId, userId }: { groupId: string, meetupId: string, userId: string }, onChange?: OnChange) => {
    const stopListening = ref<Function>()

    const levelsStats = ref<LevelsStats>({})
    const recalculateLevelsStats = (timeslotId: string, levelId: string, status: SignUpStatuses, previousStatus?: SignUpStatuses) => {
        if (typeof levelsStats.value[timeslotId] === "undefined") levelsStats.value[timeslotId] = {}
        if (typeof levelsStats.value[timeslotId][levelId] === "undefined") levelsStats.value[timeslotId][levelId] = 0
        if (status === SignUpStatuses.Accepted) levelsStats.value[timeslotId][levelId] += 1
        if (status === SignUpStatuses.Cancelled || status === SignUpStatuses.Revoked || status == SignUpStatuses.Refunded) levelsStats.value[timeslotId][levelId] = Math.max(levelsStats.value[timeslotId][levelId] - 1, 0)
    }

    const attendingsStats = ref<AttendingsStats>({})
    const recalculateAttendingsStats = (timeslotId: string, status: SignUpStatuses, previousStatus?: SignUpStatuses) => {
        if (typeof attendingsStats.value[timeslotId] === "undefined") attendingsStats.value[timeslotId] = {
            [SignUpStatuses.Pending]: 0,
            [SignUpStatuses.Cancelled]: 0,
            [SignUpStatuses.Accepted]: 0,
            [SignUpStatuses.Revoked]: 0,
            [SignUpStatuses.Paid]: 0,
            [SignUpStatuses.Refunded]: 0,
        }
        if (typeof attendingsStats.value[timeslotId][status] === "undefined") attendingsStats.value[timeslotId][status] = 0
        attendingsStats.value[timeslotId][status] += 1
        if (!previousStatus) return
        if (typeof attendingsStats.value[timeslotId][previousStatus] === "undefined") attendingsStats.value[timeslotId][previousStatus] = 0
        attendingsStats.value[timeslotId][previousStatus] = Math.max(attendingsStats.value[timeslotId][previousStatus] - 1, 0)
    }

    const statusesMap = ref<{ [userId: string]: { [timeslotId: string]: SignUpStatuses } }>({})
    const recalculateStatusesMap = (userId: string, timeslotId: string, status: SignUpStatuses) => {
        if (typeof statusesMap.value[userId] === "undefined") statusesMap.value[userId] = {}
        statusesMap.value[userId][timeslotId] = status
    }

    const signUpIdsMap = ref<{ [userId: string]: { [timeslotId: string]: string } }>({})
    const recalculateSignUpIdsMap = (userId: string, timeslotId: string, signUpId: string) => {
        if (typeof signUpIdsMap.value[userId] === "undefined") signUpIdsMap.value[userId] = {}
        signUpIdsMap.value[userId][timeslotId] = signUpId
    }

    const loadingsMap = ref<{ [signUpId: string]: boolean }>({})
    const usersMap = ref<{ [userId: string]: User }>({})
    const profilesMap = ref<{ [userId: string]: Profile }>({})
    const timestampsMap = ref<{ [userId: string]: number }>({})
    const queue = new PQueue({})
    const promisesMap: { [key: string]: Promise<any> } = {}
    const userIds = ref<string[]>([])

    onBeforeMount(() => {
        const listen = useEventListener<SignUpEvent>({ groupId, meetupId }, Topics.SignUp, false)
        const { unsubscribe, now } = listen((event) => queue.add(async () => {
            {
                const { payload: { userId, status, timeslotId, signUpId }, timestamp } = event
                loadingsMap.value[signUpId] = false
                const hasBeenLoaded = timestampsMap.value[userId]
                timestampsMap.value[userId] = timestamp
                try {
                    if (!promisesMap[userId]) promisesMap[userId] = onRetrievingUser(userId).then((user) => {
                        if (user) usersMap.value[userId] = user
                        return user
                    })
                    const profileId = ProfileRepository.nextId({ groupId, userId })
                    if (!promisesMap[profileId]) promisesMap[profileId] = onRetrievingProfile(groupId, profileId).then((profile) => {
                        if (profile) profilesMap.value[userId] = profile
                        return profile
                    })
                    if (!hasBeenLoaded) userIds.value.push(userId)
                    const previousStatus = statusesMap.value[userId] && statusesMap.value[userId][timeslotId]
                    promisesMap[profileId].then((profile) => {
                        if (profile) recalculateLevelsStats(timeslotId, profile.levelId, status, previousStatus)
                    })
                    recalculateAttendingsStats(timeslotId, status, previousStatus)
                    recalculateStatusesMap(userId, timeslotId, status)
                    recalculateSignUpIdsMap(userId, timeslotId, signUpId)
                    if (onChange) {
                        Promise.all([
                            promisesMap[userId],
                            promisesMap[profileId],
                        ]).then(([user, profile]) => {
                            if (!user || !profile) return
                            onChange(event, { user, profile }, now)
                        })
                    }
                } catch { }
            }
        }))
        stopListening.value = unsubscribe
    })

    onBeforeUnmount(() => {
        stopListening.value?.()
    })

    const signUps = computed(() => {
        const signUps = []
        for (const userId of userIds.value) {
            const profile = profilesMap.value[userId]
            if (!profile) continue
            const user = usersMap.value[userId]
            if (!user) continue
            const updatedAt = timestampsMap.value[userId]
            const statuses = statusesMap.value[userId]
            if (!statuses) continue
            const signUp = {
                userId,
                profile,
                user,
                updatedAt,
                statuses,
            }
            signUps.push(signUp)
        }
        return signUps
    })

    const signUp = computed(() => {
        const signUp = signUps.value.find(({ userId: found }) => userId === found)
        return signUp
    })

    const signUpIdOf = (userId: string, timeslotId: string) => {
        if (!signUpIdsMap.value[userId]) return undefined
        if (!signUpIdsMap.value[userId][timeslotId]) return undefined
        return signUpIdsMap.value[userId][timeslotId]
    }

    return {
        signUps,
        levelsStats,
        attendingsStats,
        signUpIdOf,
        loadingsMap,
        signUp,
    }
}