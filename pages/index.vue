<template>
    <div :class="$style.container">
        <h2>Lessons</h2>
        <LessonDescription
            title="1. Meet Miorița"
            to="lessons/1-intro"
        >
            Have a quick look at what Miorița can do.
        </LessonDescription>
        <LessonDescription
            title="2. Conditional statement (if+else)"
            to="lessons/2-if"
        >
            Learn to run different sets of instructions depending on a condition.
        </LessonDescription>
        <LessonDescription
            title="3. Loops and variables"
            to="lessons/3-while"
        >
            Find ways to run the same commands multiple times.
        </LessonDescription>
        <h2>Playgrounds</h2>
        <LessonDescription
            title="Empty playground"
            to="playgrounds"
        >
            Empty code and a 9x9 board where you can move however you want.
            <br>Miorița starts at the very center of the sheepfold.
        </LessonDescription>
        <LessonDescription
            title="The Hatchet"
            to="playgrounds/hatchet"
        >
            Based on a Romanian novel,
            <a href="https://en.wikipedia.org/wiki/The_Hatchet_(novel)" rel="nofollow" target="_blank">The Hatchet</a>,
            Miorița has to pick the hatchet (axe)
            and deliver it to Vitoria.
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
    overflow-y: auto;
}
</style>
