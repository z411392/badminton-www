import { Pages } from "~/lib/constants"
import { getAuth, signOut } from "firebase/auth"
import { withRedirectTo } from "~/lib/utils/sessions"

export const onSigningOut = async () => {
    try {
        const auth = getAuth()
        if (!auth.currentUser) return
        const redirectTo = withRedirectTo()
        const route = useRoute()
        redirectTo.value = route.fullPath
        await signOut(auth)
    } finally {
        await navigateTo(Pages.SignIn.fullPath())
    }
}
