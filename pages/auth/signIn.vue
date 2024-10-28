<script lang="ts" setup>
import { Pages } from "~/lib/constants";
import LINESignInButton from "~/components/auth/signIn/LINESignInButton.vue"
import Snackbar from "~/components/utils/Snackbar.vue"
import { useSnackbar } from "~/composables/utils/useSnackbar"

definePageMeta({
    name: Pages.SignIn.name,
})
const snackbar = useSnackbar()
</script>

<template>
    <v-app>
        <Snackbar ref="snackbar" />
        <div>
            <aside>
                <img
                    src="https://storage.boyholic.com/badminton/assets/banner.jpg" />
            </aside>
            <main>
                <h3>一同打羽球</h3>
                <p>歡迎使用一同打羽球報名系統，請先登入。</p>
                <ul>
                    <li>
                        <LINESignInButton></LINESignInButton>
                    </li>
                </ul>
            </main>
        </div>
    </v-app>

</template>

<style scoped>
div {
    @apply flex items-center min-h-screen;
    background-color: #fff;
}

aside {
    @apply self-stretch p-6 overflow-hidden hidden max-w-2xl max-h-screen;
}

@media (min-width: 1080px) {
    aside {
        @apply block;
    }
}

aside img {
    @apply w-full h-full object-cover rounded-xl;
}

main {
    @apply max-w-lg mx-auto p-6 text-center mt-2 shadow-none;
    min-width: 320px;
}

main ul {
    @apply mt-14;
}

:deep(main ul a) {
    @apply flex rounded-xl p-1 cursor-pointer;
}

:deep(main ul a[disabled]) {
    @apply pointer-events-none;
    background-color: #e5e5e5;
}

:deep(main ul a img) {
    @apply h-10;
}

:deep(main ul span) {
    @apply flex-1 leading-10 text-white text-center;
}
</style>