<script lang="ts" setup>
import TempVar from "vue-temp-var"
import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { type User } from "firebase/auth"
import { type Level } from "~/lib/modules/LevelManaging/dtos/Level"
import { onSigningOut } from "~/lib/modules/IdentityAndAccessManaging/presentation/controllers/onSigningOut"
import { onSavingToken } from "~/lib/modules/Notifying/presentation/onSavingToken"
import { onRetrievingToken } from "~/lib/modules/Notifying/presentation/onRetrievingToken"
import { copyTextToClipboard } from "~/lib/utils/ui"
import { showSuccess } from "~/composables/utils/useSnackbar"

const { user, profile, levelsMap, editProfile } = defineProps<{
    user: User
    profile: Profile
    levelsMap: { [levelId: string]: Level }
    editProfile: Function
}
>()

const token = ref()
onBeforeMount(async () => {
    token.value = await onRetrievingToken()
})

const opened = ref(false)
const open = () => {
    opened.value = true
}
const close = () => opened.value = false

const mutation = computed(() => {
    return {
        token: token.value,
    }
})

const onSubscribingButtonClicked = async () => {
    const succeeded = await onSavingToken(unref(mutation))
    if (succeeded) close()
}

const copySubscribeURL = () => {
    const { host, protocol } = location
    const subscribeURL = `${protocol}//${host}/subscribe`
    copyTextToClipboard(subscribeURL, () => showSuccess(`已複製取得訂閱碼的網址至剪貼簿`))
}
</script>

<template>
    <v-dialog v-model="opened" :width="320">
        <v-card flat>
            <v-card-title>
                訂閱
            </v-card-title>
            <v-card-item>
                <v-form @submit.prevent="">
                    <v-textarea label="訂閱碼" placeholder="貼上訂閱碼" v-model="token" hide-details variant="plain" :rows="7"
                        no-resize @mousedown:control.prevent="(event) => (event.target as HTMLTextAreaElement).select()" />
                </v-form>
            </v-card-item>
            <v-card-actions>
                <v-row justify="space-evenly">
                    <v-col cols="auto">
                        <v-btn @click="() => copySubscribeURL()">
                            複製取得訂閱碼的網址
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn width="100%" :disabled="!token" @click="() => onSubscribingButtonClicked()">訂閱</v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-app-bar elevation="0" :height="40">
        <template #append>
            <v-menu>
                <template #activator="{ props }">
                    <v-avatar :size="32" :class="$style.avatar" v-bind="props">
                        <template v-if="user.photoURL">
                            <v-img :src="user.photoURL">
                                <template #error>
                                    <v-sheet style="line-height: 32px;">
                                        {{ user.displayName!.charAt(0) }}
                                    </v-sheet>
                                </template>
                            </v-img>
                        </template>
                        <template v-else>
                            <v-sheet style="line-height: 32px;">
                                {{ user.displayName!.charAt(0) }}
                            </v-sheet>
                        </template>
                    </v-avatar>
                </template>
                <v-card :width="240" flat>
                    <template v-if="user.photoURL">
                        <v-img :src="user.photoURL" />
                    </template>
                    <v-card-item>
                        <v-spacer />
                        <v-col cols="auto">
                            <v-list flat>
                                <v-list-item @click="() => editProfile()">
                                    <template #title>
                                        <TempVar :define="{ level: levelsMap[profile.levelId] }"
                                            #default="{ level: { color } }" v-if="levelsMap[profile.levelId]">
                                            <v-badge :color="color" dot :offset-x="-12" :offset-y="-2">
                                                {{ profile.name }}
                                            </v-badge>
                                        </TempVar>
                                    </template>
                                    <template #subtitle>
                                        {{ profile.line }}
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-col>
                        <v-spacer />
                    </v-card-item>
                    <v-card-actions>
                        <v-row justify="center">
                            <v-col cols="auto">
                                <v-badge dot :color="token ? `success` : `warning`">
                                    <v-btn @click="() => open()" variant="elevated">
                                        訂閱
                                    </v-btn>
                                </v-badge>
                            </v-col>
                            <v-col cols="auto">
                                <v-btn @click="() => onSigningOut()" variant="elevated">
                                    登出
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-menu>
        </template>
    </v-app-bar>
</template>

<style scoped module>
.avatar {
    cursor: pointer;
    margin-right: 8px;
}
</style>