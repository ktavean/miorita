<template>
    <div>
        <table :class="$style.table">
            <thead>
                <tr>
                    <th />
                    <th
                        v-for="(col) in range(options.sizeX)"
                        :key="col"
                    >
                        {{ col + 1 }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(row) in range(options.sizeY)"
                    :key="row"
                >
                    <th>{{ row }}</th>
                    <td
                        v-for="(col) in range(options.sizeX)"
                        :key="col"
                        :class="$style.cell"
                    >
                        <div>
                            <img
                                v-if="isCurrent(row, col)"
                                src="~/assets/img/character.svg"
                                alt="Mioara"
                            >
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import WorldOptions from "~/interfaces/WorldOptions";

@Component
export default class World extends Vue {
    currentX!: number;
    currentY!: number;

    @Prop({
        default: () => ({
            sizeX: 8,
            sizeY: 8,
            startX: 5,
            startY: 0,
        }),
    }) options!: WorldOptions;

    // eslint-disable-next-line class-methods-use-this
    range (size:number): number[] {
        return [...new Array(size)].map((_, index) => index);
    }

    isCurrent (row, col) {
        const { currentX, currentY } = this;

        return row === currentY && col === currentX;
    }

    reset () {
        const { startX, startY } = this.options;
        this.currentX = startX;
        this.currentY = startY;
    }

    created () {
        this.reset();
    }
}
</script>

<style module>
.table {
    --cell-width: 10%;

    width: 100%;
    border-collapse: collapse;
    border: 1px solid #eee;
    table-layout: fixed;
}

.cell {
    width: var(--cell-width);
    padding-bottom: var(--cell-width);
    position: relative;
}

.cell::before {
    content: "+";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: #eee;
}

.cell > div {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    justify-content: center;
    align-items: center;
}

.cell img {
    width: 100%;
    max-height: 100%;
    height: auto;
}

</style>
