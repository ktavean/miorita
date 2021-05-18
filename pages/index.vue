<template>
    <div :class="$style.container">
        <h2>Lessons</h2>
        <LessonDescription
            title="Meet Miorița"
            to="lessons/1-intro"
        >
            Have a quick look at what Miorița can do
        </LessonDescription>
        <h2>Playgrounds</h2>
        <LessonDescription
            title="Empty playground"
            to="playgrounds"
        >
            Empty code and a 9x9 board where you can move however you want.
            <br>Miorița starts at the very center of the sheepfold.
        </LessonDescription>
    </div>
</template>

<script>
import LessonDescription from "~/components/LessonDescription.vue";

export default {
    components: { LessonDescription },
};
</script>

<style module>
.container {
    width: 100%;
    max-width: 80ch;
    margin: 1rem auto;
    box-shadow: 0.4rem 0.2rem 1rem rgba(224,219,219, 0.69);
    padding: 1rem;
}
</style>
