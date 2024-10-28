<script lang="ts" setup>
import { getMessaging, getToken, type Messaging, deleteToken } from "@firebase/messaging"
import Snackbar from "~/components/utils/Snackbar.vue"
import { useSnackbar } from "~/composables/utils/useSnackbar"
import { copyTextToClipboard } from "~/lib/utils/ui"
import { showSuccess, showError } from "~/composables/utils/useSnackbar"
import { onTestingToken } from "~/lib/modules/Notifying/presentation/onTestingToken"

const vapidKey = "BK_JUmsWdDcxO4KllZJUgwzHxRpwwwn55QdOGITDULSwnJesHpQ4yfjXPUTM1StKzPICeRCw6fyBxDRPrAIQGz0"
const snackbar = useSnackbar()

let messaging: Messaging | undefined = undefined
try {
    messaging = getMessaging()
} catch { }

const token = ref<string>()
onBeforeMount(async () => {
    if (!messaging) return
    try {
        token.value = await getToken(messaging, { vapidKey })
    } catch { }
})

const loading = ref(false)

const generateToken = async () => {
    if (!messaging) return
    loading.value = true
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
        loading.value = false
        return showError(`請開放通知權限`)
    }
    try {
        token.value = await getToken(messaging, { vapidKey })
    } catch (error) {
        showError((error as Error).message)
    }
    loading.value = false
}

const regenerateToken = async () => {
    if (!messaging) return
    try {
        loading.value = true
        await deleteToken(messaging)
        await generateToken()
    } catch (error) {
        showError((error as Error).message)
    }
}

const copyToken = () => {
    if (!token.value) return
    copyTextToClipboard(token.value, () => showSuccess(`已複製訂閱碼至剪貼簿`))
}

const testing = ref(false)
const test = async () => {
    if (!messaging) return
    testing.value = true
    await onTestingToken({
        token: token.value!,
    })
    showSuccess("這組訂閱碼可以用喔！")
    testing.value = false
}

</script>

<template>
    <v-app>
        <Snackbar ref="snackbar" />
        <v-main>
            <v-divider :thickness="96" />
            <v-container :width="320">
                <v-card flat>
                    <template v-if="messaging">
                        <template v-if="token">
                            <v-card-item>
                                <v-textarea :model-value="token" hide-details readonly no-resize :rows="7" />
                            </v-card-item>
                            <v-card-actions>
                                <v-row justify="space-between">
                                    <v-col cols="auto">
                                        <v-btn variant="elevated" @click="() => copyToken()"
                                            :disabled="!token">複製</v-btn>
                                    </v-col>
                                    <v-col cols="auto">
                                        <v-btn variant="elevated" @click="() => test()" :loading="testing">
                                            測試
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="auto">
                                        <v-btn variant="elevated" @click="() => regenerateToken()"
                                            :loading="loading">重新訂閱</v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-actions>
                        </template>
                        <template v-else>
                            <v-card-actions>
                                <v-row justify="center">
                                    <v-btn variant="elevated" @click="() => generateToken()" :loading="loading">
                                        訂閱
                                    </v-btn>
                                </v-row>
                            </v-card-actions>
                        </template>
                    </template>
                    <template v-else>
                        <v-alert>iOS 請用 safari 將此頁面加到主畫面。</v-alert>
                    </template>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<style scoped>
pre {
    word-break: break-all;
    white-space: pre-wrap;
}
</style>