<template>
    <div class="Layout">
        <TheHeadbar />
        <Nuxt />
    </div>
</template>

<script>
import TheHeadbar from "~/components/TheHeadbar.vue";

export default {
    name: "DefaultLayout",
    components: { TheHeadbar },
};
</script>

<style>
html {
    font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    word-spacing: 1px;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    box-sizing: border-box;
}

*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
}

sup {
    font-size: 0.6em;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.Layout {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: grid;
    grid-template-rows: 4rem auto;
}
</style>
