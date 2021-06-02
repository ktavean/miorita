<template>
    <div :class="$style.container">
        <TheEditor :code="code" :class="$style.editor" />
        <TheWorld :options="options" :class="$style.world">
            <template #options>
                <slot name="options" />
            </template>
        </TheWorld>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import TheWorld from "~/components/TheWorld.vue";
import TheEditor from "~/components/TheEditor.vue";
import WorldOptions from "~/interfaces/WorldOptions";

@Component({
    components: {
        TheWorld,
        TheEditor,
    },
})
export default class TheLesson extends Vue {
    @Prop(String) code!:string;
    @Prop(Object) options!:WorldOptions;
}
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
