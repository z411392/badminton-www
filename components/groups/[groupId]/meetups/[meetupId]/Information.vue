<script lang="ts" setup>
import { type GroupEnriched } from '~/lib/modules/GroupManaging/presentation/middlewares/withGroupResolving'
import { type MeetupEnriched } from '~/lib/modules/MeetupManaging/presentation/middlewares/withMeetupResolving'
import { DateTime } from "luxon"
import { DatetimeFormats } from "~/lib/constants"

const { group, meetup } = defineProps<{ group: GroupEnriched, meetup: MeetupEnriched }>()

const venue = computed(() => meetup.venue)
const shuttles = computed(() => meetup.shuttles)

const weekday = computed(() => {
    const weekday = Number(DateTime.fromFormat(meetup.date, DatetimeFormats.ISO8601DATE).toFormat("c")) % 7
    switch (weekday) {
        case 0: return "週日"
        case 1: return "週一"
        case 2: return "週二"
        case 3: return "週三"
        case 4: return "週四"
        case 5: return "週五"
        case 6: return "週六"
    }
    return undefined
})

const mapURL = computed(() => {
    const { latitude, longitude } = venue.value
    return `https://maps.google.com/maps?z=17&t=m&q=${latitude},${longitude}`
})

const location = computed(() => {
    const { address, building, floor } = venue.value
    let location = address
    if (building) location += building
    if (floor !== 1) {
        if (floor > 0) location += ` ${floor} 樓`
        if (floor < 0) location += `地下 ${floor} 樓`
    }
    return location
})


</script>

<template>
    <v-container dense density="compact">
        <v-row dense density="compact">
            <v-col :cols="12" :sm="7" dense density="compact">
                <v-card-title>
                    {{ meetup.name }}
                </v-card-title>
                <v-list density="compact">
                    <v-list-item density="compact">
                        <template #prepend>
                            <v-avatar>
                                <v-img cover :src="group.photoURL" />
                            </v-avatar>
                        </template>
                        <template #title>
                            <NuxtLink to="javascript:void(0)">{{ group.name }}</NuxtLink>
                        </template>
                    </v-list-item>
                    <v-list-item density="compact">
                        <template #prepend>
                            <v-icon icon="mdi-calendar" size="small" />
                        </template>
                        <template #title>
                            {{ meetup.date }}
                        </template>
                        <template #subtitle>
                            {{ weekday }}
                        </template>
                    </v-list-item>
                    <v-list-item density="compact">
                        <template #prepend>
                            <v-icon icon="mdi-map-marker" size="small" />
                        </template>
                        <v-list-item-title>
                            <NuxtLink :to="mapURL" target="_blank" external>
                                {{ venue.name }}
                            </NuxtLink>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <v-sheet>
                                {{ location }}
                            </v-sheet>
                        </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item density="compact">
                        <template #prepend>
                            <v-icon icon="mdi-badminton" size="small" />
                        </template>
                        <template #title>
                            <template v-for="shuttle in shuttles">
                                <NuxtLink to="javascript:void(0)">
                                    {{ shuttle.name }}
                                </NuxtLink>
                            </template>
                        </template>
                    </v-list-item>
                    <v-list-item density="compact">
                        <template #prepend>
                            <v-divider vertical :thickness="2" style="border-color: transparent" />
                            <v-avatar :size="20" color="#02c755" style="filter: grayscale(1)">
                                <v-img src="https://storage.boyholic.com/badminton/assets/line_88.png" />
                            </v-avatar>
                            <v-divider vertical :thickness="16" style="border-color: transparent" />
                        </template>
                        <template #title>
                            <NuxtLink :to="group.contactUs" external>聯絡我們</NuxtLink>
                        </template>
                    </v-list-item>
                </v-list>
            </v-col>
            <v-spacer />
            <v-col :cols="12" :sm="5" dense density="compact">
                <v-card-title>
                    說明
                </v-card-title>
                <v-card-text>
                    {{ meetup.description }}
                </v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.v-card-text {
    @apply whitespace-pre-wrap;
}

.v-list-item-subtitle {
    @apply line-clamp-none;
}
</style>