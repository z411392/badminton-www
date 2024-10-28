import { watchCollection, WatchTypes } from "~/lib/utils/firestore"
import { getFirestore, collection, query, where, orderBy, type Query } from "@firebase/firestore"
import { Topics } from "~/lib/constants"
import { EventsSavedTo } from "~/lib/constants"

type OnChanged<T> = (data: T) => void | Promise<void>

export const useEventListener = <T>(parameters: { [key: string]: string }, topic: Topics, onlyNewIncoming: boolean = true) => {
    let path = EventsSavedTo[topic as keyof typeof EventsSavedTo]
    for (const key in parameters) path = path.replace(`:${key}`, parameters[key])
    const listen = (onChanged: OnChanged<T>) => {
        const db = getFirestore()
        let q: Query = collection(db, path)
        const now = Date.now()
        if (onlyNewIncoming) q = query(q, where("timestamp", ">=", now))
        q = query(q, orderBy("timestamp", "asc"))
        const unsubscribe = watchCollection<T>(q, (type, parameters, data) => onChanged(data), [WatchTypes.Added], db)
        return { unsubscribe, now }
    }
    return listen
}