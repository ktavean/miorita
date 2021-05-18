<template>
    <TheLesson
        :code="code"
        :options="{
            size: { x: 9, y: 9 },
            start: {
                position: { x: 4, y: 4 },
                orientation: 'E'
            },
            walls: {},
            objects: [],
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
export default class EmptyPlayground extends Vue {
    code:string = "\n";
}
</script>
