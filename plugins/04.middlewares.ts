import { Pages } from "~/lib/constants"
import { withGroupResolving } from "~/lib/modules/GroupManaging/presentation/middlewares/withGroupResolving"
import { withMeetupResolving } from "~/lib/modules/MeetupManaging/presentation/middlewares/withMeetupResolving"
import {
    withUser,
    withRedirectTo,
    ensureGroupIsSpecified,
    ensureMeetupIsSpecified,
} from "~/lib/utils/sessions"

export default defineNuxtPlugin({
    name: "middlewares",
    parallel: false,
    dependsOn: ["firebase"],
    hooks: {
        async "app:beforeMount"() {
            const router = useRouter()
            const route = useRoute()
            if (route.query["customToken"]) {
                const { customToken: _, ...query } = route.query
                await router.replace({ query })
            }
        }
    },
    async setup() {
        addRouteMiddleware("withCredentialsResolving", async ({ name, path, fullPath }) => {
            if (path === "/subscribe") return
            const user = withUser()
            if (name === Pages.SignIn.name) {
                if (!user) return
                const redirectTo = withRedirectTo(true)
                return redirectTo.value
            } else {
                if (user) return
                const redirectTo = withRedirectTo()
                redirectTo.value = fullPath
                return Pages.SignIn.fullPath()
            }
        }, { global: true })
        addRouteMiddleware("withGroupResolving", async ({ name, params }) => {
            const { groupId } = params as { groupId?: string }
            if (!groupId) return
            await withGroupResolving(groupId)
            ensureGroupIsSpecified()
        }, { global: true })
        addRouteMiddleware("withMeetupResolving", async ({ params }) => {
            const { groupId, meetupId } = params as { groupId: string, meetupId?: string }
            if (!meetupId) return
            await withMeetupResolving(groupId, meetupId)
            ensureMeetupIsSpecified()
        }, { global: true })
    }
})