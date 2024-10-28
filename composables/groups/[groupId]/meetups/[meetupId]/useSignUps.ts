import { watchCollection } from "~/lib/utils/firestore"
import { Collections } from "~/lib/constants"
import { getFirestore, collection, query, orderBy } from "@firebase/firestore"
import { WatchTypes } from "~/lib/utils/firestore"
import { onRetrievingSignUp } from "~/lib/modules/SignUpManaging/presentation/controllers/onRetrievingSignUp"
import { type SignUp } from "~/lib/modules/SignUpManaging/dtos/SignUp"
import { onRetrievingUser } from "~/lib/modules/IdentityAndAccessManaging/presentation/controllers/onRetrievingUser"
import { type User } from "~/lib/modules/IdentityAndAccessManaging/dtos/User"
import { ProfileRepository } from "~/lib/adapters/firestore/ProfileRepository"
import { onRetrievingProfile } from "~/lib/modules/ProfileManaging/presentation/controllers/onRetrievingProfile"
import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { SignUpRepository } from "~/lib/adapters/firestore/SignUpRepository"
import { default as PQueue } from "p-queue"

export type SignUpEnriched = SignUp & {
    user: User
    profile: Profile
}
const usersMap = ref({}) as Ref<{ [userId: string]: User }>
const profilesMap = ref({}) as Ref<{ [profileId: string]: Profile }>

const onRetrievingSignUpEnriched = async (groupId: string, meetupId: string, signUpId: string) => {
    const signUp = await onRetrievingSignUp(groupId, meetupId, signUpId)
    if (!signUp) return undefined
    const { userId } = signUp
    const profileId = ProfileRepository.nextId({ groupId, userId })
    if (!usersMap.value[userId]) {
        const user = await onRetrievingUser(userId)
        if (!user) return undefined
        usersMap.value[userId] = user
    }
    if (!profilesMap.value[profileId]) {
        const profile = await onRetrievingProfile(groupId, profileId)
        if (!profile) return undefined
        profilesMap.value[profileId] = profile
    }
    const signUpEnriched: SignUpEnriched = {
        ...signUp,
        user: usersMap.value[userId],
        profile: profilesMap.value[profileId],
    }
    return signUpEnriched
}

const queue = new PQueue({ concurrency: 16 })

export const useSignUps = (groupId: string, meetupId: string, userId: string) => {
    const signUpIds = ref<string[]>([])
    const signUpsMap = ref<{ [signUpId: string]: SignUpEnriched }>({})
    const stopWatching = ref<Function>()
    onBeforeMount(() => {
        const db = getFirestore()
        const q = query(
            collection(
                db,
                Collections.SignUps.replace(":groupId", groupId).replace(":meetupId", meetupId)
            ),
            orderBy("timestamp", "asc"),
        )
        stopWatching.value = watchCollection<{}>(q, async (type, parameters) => {
            const signUpId = parameters[parameters.length - 1]
            const index = signUpIds.value.indexOf(signUpId)
            if (type === WatchTypes.Added) {
                queue.add(async () => {
                    if (index >= 0) return
                    const signUp = await onRetrievingSignUpEnriched(groupId, meetupId, signUpId)
                    if (!signUp) return
                    signUpsMap.value[signUpId] = signUp
                    signUpIds.value.push(signUpId)
                })
            }
            if (type === WatchTypes.Modified) {
                queue.add(async () => {
                    if (index < 0) return
                    const signUp = await onRetrievingSignUpEnriched(groupId, meetupId, signUpId)
                    if (!signUp) return
                    signUpsMap.value[signUpId] = signUp
                })
            }
        }, [WatchTypes.Added, WatchTypes.Modified], db)
    })

    const signUpId = SignUpRepository.nextId({ meetupId, userId })
    const signUp = computed(() => signUpsMap.value[signUpId])

    onBeforeUnmount(() => {
        stopWatching.value?.()
    })

    const signUps = computed(() => signUpIds.value.map((signUpId) => signUpsMap.value[signUpId]))
    return {
        signUps,
        signUpsMap,
        signUp,
    }
}