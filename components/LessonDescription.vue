<template>
    <div
        :class="$style.container"
        @click="$router.push(to)"
    >
        <h3>{{ title }}</h3>
        <slot />
        <span class="sr-only">
            <nuxt-link :to="to">{{ title }}</nuxt-link>
        </span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({
    name: "LessonDescription",
})
export default class TheLesson extends Vue {
    @Prop(String) title!:string;
    @Prop(String) to!:string;
}
</script>

<style module>
.container {
    margin: 1rem;
    padding: 0.7rem 1rem;
    border: 1px solid #eee;
    border-radius: 0.5rem;
    transition: transform 200ms ease-in-out;
    cursor: pointer;
}

.container > h3 {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 0.7rem;
}

.container:hover {
    transform: scale(1.01);
}
</style>
