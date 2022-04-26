<template>
    <div :class="$style.wrapper">
        <MonacoEditor
            v-model="workCode"
            :class="$style.editor"
            language="javascript"
            :options="{
                wordWrap: true,
                minimap: {
                    enabled: false
                },
                overviewRulerBorder: false
            }"
        />
    </div>
</template>

<script>
import MonacoEditor from "vue-monaco";

export default {
    components: {
        MonacoEditor,
    },

    props: {
        code: {
            type: String,
            default: "",
        },
    },

    computed: {
        workCode: {
            get () {
                return this.$store.state.code;
            },
            set (value) {
                this.$store.dispatch("setCode", value);
            },
        },
    },

    mounted () {
        let { code } = this;
        if (localStorage.workCodeUrl === window.location.href) {
            code = localStorage.workCode;
        } else {
            localStorage.workCodeUrl = window.location.href;
        }

        this.$store.dispatch("init", code);
        this.workCode = this.$store.state.code;
    },
};
</script>

<style module>
.wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 1rem;
}

.editor {
    flex-grow: 1;
}
</style>
