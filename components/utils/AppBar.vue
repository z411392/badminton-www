<script lang="ts" setup>
import TempVar from "vue-temp-var"
import { type Profile } from "~/lib/modules/ProfileManaging/dtos/Profile"
import { type User } from "firebase/auth"
import { type Level } from "~/lib/modules/LevelManaging/dtos/Level"
import { onSigningOut } from "~/lib/modules/IdentityAndAccessManaging/presentation/controllers/onSigningOut"
const { user, profile, levelsMap, editProfile } = defineProps<{
    user: User
    profile: Profile
    levelsMap: { [levelId: string]: Level }
    editProfile: Function
}
>()
</script>

<template>
    <v-app-bar elevation="0" :height="40">
        <template #append>
            <v-menu>
                <template #activator="{ props }">
                    <v-avatar :size="28" :class="$style.avatar" v-bind="props">
                        <template v-if="user.photoURL">
                            <v-img :src="user.photoURL">
                                <template #error>
                                    <v-sheet>
                                        {{ profile.name[0] }}
                                    </v-sheet>
                                </template>
                            </v-img>
                        </template>
                        <template v-else>
                            <v-sheet>
                                {{ profile.name[0] }}
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
                                        <template v-if="levelsMap[profile.levelId]">
                                            <TempVar :define="{ level: levelsMap[profile.levelId] }"
                                                #default="{ level: { color } }">
                                                <v-badge :color="color" dot :offset-x="-12" :offset-y="-2">
                                                    {{ profile.name }}
                                                </v-badge>
                                            </TempVar>
                                        </template>
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