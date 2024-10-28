import { useEventListener } from "~/composables/utils/useEventListener"
import { type SignUpEvent } from "~/lib/modules/SignUpManaging/dtos/SignUpEvent"
import { Topics } from "~/lib/constants"
import { type User } from "~/lib/modules/IdentityAndAccessManaging/dtos/User"
import { onRetrievingUser } from "~/lib/modules/IdentityAndAccessManaging/presentation/controllers/onRetrievingUser"
import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { onRetrievingProfile } from "~/lib/modules/ProfileManaging/presentation/controllers/onRetrievingProfile"
import { ProfileRepository } from "~/lib/adapters/firestore/ProfileRepository"
import { Heap } from "heap-js"
import { SignUpStatuses } from "~/lib/modules/SignUpManaging/dtos/SignUpStatuses"

export type LevelsStats = { [timeslotId: string]: { [levelId: string]: number } }
export type AttendingsStats = { [timeslotId: string]: { [status: string]: number } }
export type SignUpEnriched = {
    userId: string
    profile: Profile
    user: User
    updatedAt: number
    statuses: { [timeslotId: string]: SignUpStatuses }
}
type SignUpDescriptor = { userId: string, timestamp: number }

export type OnChange = (event: SignUpEvent, context: { user: User, profile: Profile }, listeningStartedAt: number) => void | Promise<void>

export const useSignUps = ({ groupId, meetupId, userId }: { groupId: string, meetupId: string, userId: string }, onChange?: OnChange) => {
    const stopListening = ref<Function>()

    const levelsStats = ref<LevelsStats>({})
    const recalculateLevelsStats = (timeslotId: string, levelId: string, status: SignUpStatuses) => {
        if (status === SignUpStatuses.Pending) return
        if (status === SignUpStatuses.Paid) return
        if (typeof levelsStats.value[timeslotId] === "undefined") levelsStats.value[timeslotId] = {}
        if (typeof levelsStats.value[timeslotId][levelId] === "undefined") levelsStats.value[timeslotId][levelId] = 0
        if (status === SignUpStatuses.Accepted) return levelsStats.value[timeslotId][levelId] += 1
        levelsStats.value[timeslotId][levelId] = Math.max(levelsStats.value[timeslotId][levelId] - 1, 0)
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
    const promisesMap: { [userId: string]: Promise<[User, Profile]> } = {}
    const signUpDescriptors = ref(new Heap<SignUpDescriptor>((one, another) => one.timestamp - another.timestamp))
    const usersMap = ref<{ [userId: string]: User }>({})
    const profilesMap = ref<{ [userId: string]: Profile }>({})
    const timestampsMap = ref<{ [userId: string]: number }>({})

    onBeforeMount(() => {
        const listen = useEventListener<SignUpEvent>({ groupId, meetupId }, Topics.SignUp, false)
        const { unsubscribe, now } = listen((event) => {
            const { payload: { userId, status, timeslotId, signUpId }, timestamp } = event
            loadingsMap.value[signUpId] = false
            timestampsMap.value[userId] = timestamp
            const profileId = ProfileRepository.nextId({ groupId, userId })
            if (!promisesMap[userId]) {
                promisesMap[userId] = Promise.all([
                    onRetrievingUser(userId),
                    onRetrievingProfile(groupId, profileId)
                ]).then(([user, profile]) => {
                    if (!user) throw undefined
                    if (!profile) throw undefined
                    usersMap.value[userId] = user
                    profilesMap.value[userId] = profile
                    const signUpDescriptor: SignUpDescriptor = { userId, timestamp }
                    signUpDescriptors.value.push(signUpDescriptor)
                    return [user, profile]
                })
            }
            promisesMap[userId].then(([user, profile]) => {
                recalculateLevelsStats(timeslotId, profile.levelId, status)
                const previousStatus = statusesMap.value[userId] && statusesMap.value[userId][timeslotId]
                recalculateAttendingsStats(timeslotId, status, previousStatus)
                recalculateStatusesMap(userId, timeslotId, status)
                recalculateSignUpIdsMap(userId, timeslotId, signUpId)
                if (onChange) onChange(event, { user, profile }, now)
            })
        })
        stopListening.value = unsubscribe
    })

    onBeforeUnmount(() => {
        stopListening.value?.()
    })

    const signUps = computed(() => signUpDescriptors.value.toArray().map(({ userId }) => {
        const profile = profilesMap.value[userId]
        const user = usersMap.value[userId]
        const updatedAt = timestampsMap.value[userId]
        const statuses = statusesMap.value[userId] || {}
        return {
            userId,
            profile,
            user,
            updatedAt,
            statuses,
        }
    }))

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