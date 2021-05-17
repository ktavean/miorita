<template>
    <div :class="$style.container">
        <TheEditor :class="$style.editor" />
        <TheWorld :class="$style.world" />
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
}

.editor {
    flex-basis: 50%;
}

.world {
    flex-basis: 50%;
}

@media (orientation: portrait) {
    .container {
        flex-direction: column-reverse;
    }

    .editor {
        height: 50%;
    }

    .world {
        height: 50%;
    }
}
</style>
