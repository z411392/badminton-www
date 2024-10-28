import { AxiosError, type AxiosResponse } from "axios"

const deserializeFromAxiosResponse = ({ type, payload }: { type: string; payload: any }) => {
    if (type === "ValidationError") {
        const { message } = payload as { message: string }
        return new Error(message)
    }
    if (type === "UserUnauthenticated") return new Error("必須先登入")
    if (type === "PermissionDenied") return new Error("未授權進行此操作")
    if (type === "GroupNotFound") {
        const { groupId } = payload as { groupId: string }
        return new Error(`球團 ${groupId} 不存在`)
    }
    if (type === "VenueNotFound") {
        const { venueId } = payload as { venueId: string }
        return new Error(`場地 ${venueId} 不存在`)
    }
    if (type === "MeetupNotFound") {
        const { meetupId } = payload as { meetupId: string }
        return new Error(`球敘 ${meetupId} 不存在`)
    }
    if (type === "TimeslotNotFound") {
        const { meetupId, index } = payload as { meetupId: string; index: number }
        return new Error(`場次 ${meetupId}/${index} 不存在`)
    }
    if (type === "TagNotFound") {
        const { tagId } = payload as { tagId: string }
        return new Error(`標籤 ${tagId} 不存在`)
    }
    if (type === "TagNotFound") {
        const { playlistId } = payload as { playlistId: string }
        return new Error(`播放清單 ${playlistId} 不存在`)
    }
    if (type === "ProfileNotFound") return new Error(`必須先填寫入團申請`)
    if (type === "LevelNotFound") {
        const { levelId } = payload as { levelId: string }
        return new Error(`分級 ${levelId} 不存在`)
    }
    if (type === "ShuttleNotFound") {
        const { shuttleId } = payload as { shuttleId: string }
        return new Error(`用球 ${shuttleId} 不存在`)
    }
    if (type === "UnableToRegister") return new Error(`已無法報名或取消報名`)
    if (type === "UnableToAccept") return new Error(`錄取失敗`)
    if (type === "UnableToCancel") return new Error(`取消失敗`)
    if (type === "UnableToMarkAsPaid") return new Error(`無法標記為已付款`)
    if (type === "UnableToMarkAsRefunded") return new Error(`無法標記為已退款`)
    if (type === "UnableToRevoke") return new Error(`取消失敗`)
    if (type === "SignedUpAlready") return new Error(`您的報名已經送出請耐心等待審核`)
    if (type === "VenueConflict") return new Error(`場地已經有人新增過了`)
    if (type === "GroupConflict") return new Error(`球團的名稱已有球團使用`)
    if (type === "ShuttleConflict") return new Error(`用球已經有人新增過了`)
    if (type === "GroupCreatingInProgress") return new Error(`建立球團的申請已經送出請等待管理員審核`)
    if (type === "HasJoinedGroup") return new Error(`您已是該球團幹部`)
    if (type === "JoinRequestAlreadySubmitted") return new Error(`加入球團幹部的申請已經送出請等待管理員審核`)
    if (type === "JoinRequestRejected") return new Error(`您加入該球團幹部的申請已被拒絕`)
    if (type === "MustBeImage") return new Error(`請檢查上傳的圖片格式是否正確`)
    if (type === "PlaylistNotSpecified") return new Error(`未指定播放清單`)
    if (type === "SignUpNotFound") {
        const { signUpId } = payload as { signUpId: string }
        return new Error(`報名 ${signUpId} 不存在`)
    }
    if (type === "TagConflict") return new Error(`標籤已經有人新增過了`)
    if (type === "TokenInvalid") return new Error(`訂閱碼不正確（可能沒複製完整？）`)
    if (type === "UnableToSendMessage") {
        const { reason } = payload as { reason: string }
        return new Error(`無法發送訊息，理由：${reason}`)
    }
    return undefined
}

export const translateError = (thrown: unknown) => {
    if (!(thrown instanceof Error)) return undefined
    if (!(thrown instanceof AxiosError)) return thrown
    if (!thrown.response) return thrown
    const response: AxiosResponse<{ error?: { type: string; payload: any } }> = thrown.response
    if (response.data.error) {
        const error = deserializeFromAxiosResponse(response.data.error)
        if (error) return error
    }
    return thrown
}
