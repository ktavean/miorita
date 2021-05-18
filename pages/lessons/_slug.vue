<template>
    <TheLesson :code="workCode" :options="worldOptions" />
</template>

<script>
import TheLesson from "~/components/TheLesson.vue";

export default {
    name: "Lesson",
    components: { TheLesson },

    asyncData ({ $content, params, error }) {
        return $content(`lessons/${params.slug}`)
            .fetch()
            .catch(() => {
                error({ statusCode: 404, message: "Page not found" });
            });
    },

    data () {
        return {
            workCode: "",
            worldOptions: {},
        };
    },
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
