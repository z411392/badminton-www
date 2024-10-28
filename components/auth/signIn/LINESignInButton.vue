<script lang="ts" setup>
const signIn = () => navigateTo(`/auth/signIn/oidc.line`, { external: true })
</script>

<template>
    <a :class="$style['line']" @click="signIn">
        <img
            src="https://firebasestorage.googleapis.com/v0/b/boyholic-badminton.appspot.com/o/assets%2Fimages%2Fline-88.png?alt=media&token=2ce753b7-0f30-4ddc-948f-1e9e45c392ec" />
        <span>透過 LINE 登入</span>
    </a>
</template>

<style scoped module>
.line {
    background-color: #02c755;
}
</style>