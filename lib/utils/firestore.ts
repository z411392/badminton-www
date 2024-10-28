import { onSnapshot, collection, getFirestore, type Query, type Firestore } from "@firebase/firestore"
import { type Event } from "~/lib/adapters/firestore/EventPublisher"

export enum WatchTypes {
    Added = "added",
    Modified = "modified",
    Removed = "removed",
}

type OnChanged<T> = (type: WatchTypes, parameters: string[], data: T) => void | Promise<void>

export const watchCollection = <T = Event>(
    q: string | Query,
    onChanged: OnChanged<T>,
    types: string[] = [WatchTypes.Added, WatchTypes.Modified, WatchTypes.Removed],
    db?: Firestore,
) => {
    if (!db) db = getFirestore()
    if (typeof q === "string") q = collection(db, q)
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        for (const { type, doc } of querySnapshot.docChanges()) {
            if (!types.includes(type)) return
            const parameters = doc.ref.path.split("/").filter((_, index) => index % 2)
            try {
                await onChanged(type as WatchTypes, parameters, doc.data() as T)
            } catch {}
        }
    })
    return unsubscribe
}
