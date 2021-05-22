<template>
    <TheLesson
        :code="code"
        :options="{
            size: { x: 5, y: 5 },
            start: {
                position: { x: 0, y: 0 },
                orientation: 'E',
                picked: {},
            },
            walls: {},
            objects: [
                {
                    position: { x: 1, y: 0 },
                    type: 'hatchet',
                    fixed: false
                },
                {
                    position: { x: 4, y: 4 },
                    type: 'vitoria',
                    fixed: true
                },
            ],
            timeout: 1000
        }"
    />
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import TheLesson from "~/components/TheLesson.vue";

@Component({
    components: { TheLesson },
})
export default class Hatchet extends Vue {
    code:string = `/*
    Based on a famous Romanian novel, The hatchet (Baltagul),
    Miorița has to find the hatchet and bring it to Vitoria.

    The hatchet always starts right in front of Miorița.
    Vitoria is always at the bottom-right corner of the sheepfold.
*/`;
}
</script>
