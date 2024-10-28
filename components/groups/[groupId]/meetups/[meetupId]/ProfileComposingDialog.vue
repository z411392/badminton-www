<script lang="ts" setup>
import { type Profile } from '~/lib/modules/ProfileManaging/dtos/Profile'
import { type Level } from '~/lib/modules/LevelManaging/dtos/Level'
import * as validators from '~/lib/modules/ProfileManaging/presentation/validators/Profile'
import { onSavingProfile } from '~/lib/modules/ProfileManaging/presentation/controllers/onSavingProfile'
import { onRetrievingProfile } from '~/lib/modules/ProfileManaging/presentation/controllers/onRetrievingProfile'

const {
    groupId,
    levels,
} = defineProps<{
    groupId: string
    levels: Level[]
}>()

const profile = defineModel<Profile>()
const opened = ref<boolean>(false)
const name = ref(profile.value?.name || "")
const nameRules = [
    (value: string) => {
        const { error } = validators.name.validate(value)
        if (error) return error.message
        return true
    },
]
const line = ref(profile.value?.line || "")
const lineRules = [
    (value: string) => {
        const { error } = validators.line.validate(value)
        if (error) return error.message
        return true
    },
]
const levelId = ref(ref(profile.value?.levelId || ""))
const touched = ref(false)

const mutation = computed(() => {
    return {
        name: name.value,
        line: line.value,
        levelId: levelId.value,
    }
})

const stopWatching = ref<Function>()
onBeforeMount(() => {
    stopWatching.value = watch(mutation, () => touched.value = true, { deep: true })
})

onBeforeUnmount(() => {
    stopWatching.value?.()
})

const valid = ref(true)

const loading = ref(false)

const onSaveButtonClicked = async () => {
    loading.value = true
    const profileId = (await onSavingProfile(groupId, unref(mutation)))!
    profile.value = await onRetrievingProfile(groupId, profileId)
    loading.value = false
    close()
}

const creating = ref(true)
const open = () => {
    opened.value = true
    creating.value = !profile.value
}
const close = () => opened.value = false

defineExpose({
    open,
})
</script>

<template>
    <v-dialog v-model="opened" :width="320" :persistent="creating">
        <v-card :loading="loading">
            <v-card-title>
                <template v-if="creating">
                    建立基本資料
                </template>
                <template v-else>
                    編輯基本資料
                </template>
            </v-card-title>
            <v-card-subtitle>
                <template v-if="creating">
                    要先建立基本資料才能報名打球喔！
                </template>
                <template v-else>
                    你要改蝦米～？
                </template>
            </v-card-subtitle>
            <v-card-item>
                <v-form v-model="valid">
                    <v-row dense>
                        <v-col :cols="12" dense>
                            <v-text-field label="暱稱" v-model="name" :rules="nameRules" variant="underlined" counter />
                        </v-col>
                        <v-col :cols="12" dense>
                            <v-text-field label="LINE ID" v-model="line" :rules="lineRules" variant="underlined"
                                counter />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col :cols="12" dense>
                            程度
                        </v-col>
                        <v-col :cols="12" dense>
                            <v-expansion-panels density="compact">
                                <template v-for="{ id, color, name, description } in levels">
                                    <v-expansion-panel density="compact" :class="{ selected: id === levelId }">
                                        <template #title>
                                            <v-avatar size="x-small" :color="color">
                                                <v-btn @click.native.stop="levelId = levelId === id ? undefined : id"
                                                    variant="plain" flat>
                                                    <v-fade-transition>
                                                        <v-icon size="x-small" v-show="id === levelId"
                                                            icon="mdi-check" />
                                                    </v-fade-transition>
                                                </v-btn>
                                            </v-avatar>
                                            <v-divider vertical :thickness="16" />
                                            {{ name }}
                                        </template>
                                        <template #text>
                                            <v-sheet>
                                                {{ description }}
                                            </v-sheet>
                                        </template>
                                    </v-expansion-panel>
                                </template>
                            </v-expansion-panels>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-item>
            <v-card-actions>
                <v-row justify="space-evenly">
                    <template v-if="!creating">
                        <v-col cols="auto">
                            <v-btn variant="text" @click="() => close()">取消</v-btn>
                        </v-col>
                    </template>
                    <v-col cols="auto">
                        <v-btn variant="text" :disabled="!valid || !touched || !levelId"
                            @click="() => onSaveButtonClicked()" :loading="loading">
                            <template v-if="creating">
                                建立基本資料
                            </template>
                            <template v-else>
                                儲存基本資料
                            </template>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.v-theme--light {
    --v-hover-opacity: 0;
}

.v-sheet {
    @apply whitespace-pre-wrap leading-8;
}
</style>