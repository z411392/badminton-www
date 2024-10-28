import { Settings } from "luxon"
import { Container } from "inversify"
import { BoyholicBadmintonService } from "~/lib/adapters/http/BoyholicBadmintonService"
import { getAuth, onIdTokenChanged } from "firebase/auth"

export const container = new Container()
export const Symbols = {
    BoyholicBadmintonService: Symbol.for(`BoyholicBadmintonService`),
}
export const bootstrap = async ({ timezone, apiBaseURL }: { timezone: string; apiBaseURL: string }) => {
    Settings.defaultZone = timezone
    let idToken: string | undefined = undefined
    onIdTokenChanged(getAuth(), async (user) => {
        if (user) idToken = await user.getIdToken()
        else idToken = undefined
    })
    container
        .bind<BoyholicBadmintonService>(Symbols.BoyholicBadmintonService)
        .toDynamicValue(() => new BoyholicBadmintonService({ baseURL: apiBaseURL, idToken }))
}
