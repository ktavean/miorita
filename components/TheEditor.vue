<template>
    <div :class="$style.wrapper">
        <textarea
            :value="workCode"
            :class="$style.editor"
            @input="workCode = $event.target.value"
        />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class TheEditor extends Vue {
    @Prop(String) code?:string;

    get workCode () {
        return this.$store.state.code;
    }

    set workCode (value:string) {
        this.$store.dispatch("setCode", value);
    }

    mounted () {
        this.$store.dispatch("init", this.code);
        this.workCode = this.$store.state.code;
    }
}
</script>

<style module>
.wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}
.editor {
    /* you must provide font-family font-size line-height. Example: */
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
    min-height: 10rem;
    display: block;
    resize: none;
    flex-grow: 1;
}
</style>
