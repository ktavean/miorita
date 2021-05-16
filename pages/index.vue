<template>
    <div :class="$style.container">
        <TheEditor />
        <TheWorld />
    </div>
</template>

<script>
import TheWorld from "~/components/TheWorld.vue";
import TheEditor from "~/components/TheEditor.vue";

export default {
    components: { TheWorld, TheEditor },
};
</script>

<style module>
.container {
    display: flex;
    width: 100vw;
    height: 100vh;
}
.container > * {
    flex-basis: 50%;
}

@media (orientation: portrait) {
    .container {
        flex-direction: column-reverse;
    }
}
</style>
