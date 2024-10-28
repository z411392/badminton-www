import { type H3Event } from "h3"
import { SignIn } from "~/lib/modules/IdentityAndAccessManaging/application/mutations/SignIn"
import { getAuth } from "firebase-admin/auth"
import { type UpdateRequest } from "firebase-admin/auth"

export const onExchangingToken = async (event: H3Event) => {
    const auth = getAuth()
    const path = event.path
    try {
        const sessionId = getCookie(event, "sessionId") || ""
        const requestUri = `${process.env.APP_URL!}${path}`
        const signIn = new SignIn()
        const credentials = await signIn({ requestUri, sessionId })
        let properties: UpdateRequest = {}
        const { localId, displayName, photoUrl: photoURL } = credentials
        if (displayName) properties = { ...properties, displayName }
        if (photoURL) properties = { ...properties, photoURL }
        if (Object.keys(properties)) await auth.updateUser(localId, properties)
        const customToken = await auth.createCustomToken(localId)
        const query = new URLSearchParams({ customToken })
        await sendRedirect(event, path.split("/").slice(0, -1).join("/") + "?" + query.toString())
        return
    } catch (error) {
        const { message } = error as Error
        return {
            message,
        }
    }
}
