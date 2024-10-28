<script lang="ts" setup>
const loading = ref(false)
const signIn = async () => {
    loading.value = true
    await navigateTo(`/auth/signIn/oidc.line`, { external: true })
}
</script>

<template>
    <v-btn @click="() => signIn()" :loading="loading" style="background-color: #02c755;" flat :height="40">
        <img src="https://storage.boyholic.com/badminton/assets/line_88.png" :width="32" />
        <v-divider vertical :thickness="8" style="opacity: 0;" />
        透過 LINE 登入
    </v-btn>
</template>