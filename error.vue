<script lang="ts" setup>
const error = useError()
</script>

<template>
    <div>
        <main>
            <template v-if="error">
                <template v-if="'statusCode' in error">
                    <h1>哎呀～發生錯誤 {{ error.statusCode }}</h1>
                    <h2>{{ error.message }}</h2>
                    <p>要請你過段時間再回來看看，或者主動連絡一下小菜</p>
                </template>
            </template>
        </main>
    </div>
</template>

<style scoped>
div {
    @apply min-h-screen max-w-full bg-cover flex justify-center items-center relative;
    background-image: url('https://storage.boyholic.com/badminton/assets/background--error.jpeg');
}

div::before {
    content: '';
    @apply block h-full w-full absolute top-0 right-0 bottom-0 left-0 opacity-60;
    background-image: linear-gradient(195deg, #42424a, #191919);
}

main {
    @apply max-w-full text-center relative z-10 text-white px-3;
}

h1 {
    @apply font-bold;
    color: inherit;
    font-size: calc(1.625rem + 4.5vw);
}

h2 {
    @apply font-bold;
    color: inherit;
    font-size: calc(1.35rem + 1.2vw);
}

p {
    @apply text-xl font-normal;
}

a {
    @apply leading-10 px-6 inline-block mt-6 uppercase;
    border: 1px solid;
    border-radius: 0.5rem;
    font-size: 12px;
}
</style>