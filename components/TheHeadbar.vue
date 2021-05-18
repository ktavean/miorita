<template>
    <div :class="$style.bar">
        <h1 :class="$style.brand">
            <nuxt-link to="/" :class="$style.main">Miorița</nuxt-link>
            <span :class="$style.secondary">
                by <a href="https://scoalaweb.ro" target="_blank">Școala Web</a>
            </span>
        </h1>
        <div>
            <label :class="$style.about">
                <span class="sr-only">About</span>
                <input v-model="aboutOpen" :class="$style.about_opener" type="checkbox">
                <span :class="$style.about_content">
                    <nuxt-content :class="$style.nuxt_content" :document="aboutContent" />
                </span>
            </label>
        </div>
    </div>
</template>

<script>
import "~/assets/fonts/CabinSketch/RoCabinSketch.css";

export default {
    data () {
        return {
            aboutOpen: false,
            aboutContent: "",
        };
    },

    async fetch () {
        this.aboutContent = await this.$nuxt.context.$content("about")
            .fetch()
            .catch((err) => {
                console.log(err);
            });
    },
};
</script>

<style module>
.bar {
    background: #363636;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand {
    padding: 0 0.5rem;
}

.main {
    font-family: CabinSketch, sans-serif;
    font-weight: 700;
    font-size: 3rem;
    text-decoration: none;
}

.secondary {
    font-family: CabinSketch, sans-serif;
    font-weight: 400;
    font-size: 0.5em;
    white-space: nowrap;
}
.bar a {
    color: inherit;
}
.bar a:hover,
.bar a:focus{
    color: #dcdcdc;
}

.about::before {
    display: inline-grid;
    content: "?";
    border: 1px solid currentColor;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    font-family: CabinSketch, sans-serif;
    font-weight: 700;
    width: 1.5em;
    height: 1.5em;
    cursor: pointer;
    margin-right: 0.5rem;
}
.about:hover::before {
    background-color: #dcdcdc;
    color: #333;
}

.about_opener {
    display: none;
}

.about_content {
    display: none;
}

.about_opener:checked + .about_content {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.78);
    color: #000;
    border: 1px solid #dcdcdc;
    z-index: 1;
    display: grid;
    justify-content: center;
    align-items: center;
    padding: 2em;
}

.nuxt_content {
    max-width: 60ch;
    background: #fff;
    padding: 2em;
    box-shadow: 0.4rem 0.2rem 1rem rgba(224,219,219, 0.69);
}

.nuxt_content * + * {
    margin-top: 1em;
}
</style>
