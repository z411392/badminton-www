import { type H3Event } from "h3"
import { CreateAuthURI } from "~/lib/modules/IdentityAndAccessManaging/application/mutations/CreateAuthURI"

export const onSigningIn = async (event: H3Event) => {
    const path = event.path
    const providerId = getRouterParam(event, "providerId")!
    try {
        const continueUri = `${process.env.APP_URL!}${path}`
        const createAuthURI = new CreateAuthURI()
        const { sessionId, authUri } = await createAuthURI({ providerId, continueUri })
        setCookie(event, "sessionId", sessionId, { httpOnly: true, secure: true })
        await sendRedirect(event, authUri)
        return
    } catch (error) {
        const { message } = error as Error
        return {
            message,
        }
    }
}
