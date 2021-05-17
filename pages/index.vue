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
    display: grid;
    grid-template:
        "Editor World" auto /
        1fr     1fr
    ;
}

.container > * {
    flex-basis: 50%;
}

.editor {
    grid-area: Editor;
}

.world {
    grid-area: World;
}

@media (orientation: portrait) {
    .container {
        grid-template:
            "World" 1fr
            "Editor" 1fr /
            auto
        ;
    }
}
</style>
