<script lang="ts" setup>
const opened = ref(false)
const open = () => opened.value = true
defineExpose({
    open,
})
</script>

<template>
    <v-dialog v-model="opened" :width="320">
        <v-card>
            <v-card-title>
                關於退費
            </v-card-title>
            <v-card-subtitle>
                退費方式說明
            </v-card-subtitle>
            <v-card-text>
                因為目前不是在線上完成付款，想申請退費要聯絡球團管理員哦！
            </v-card-text>
        </v-card>
    </v-dialog>
</template>