<template>
    <div>
        <div>
            <button type="button" @click="run()">
                Run
            </button>
            <button type="button" @click="reset">
                Reset
            </button>
            <button type="button" @click="debug">
                Debug
            </button>
            <button type="button" @click="stepOver">
                Step over
            </button>
        </div>
        <table :class="$style.table">
            <thead>
                <tr>
                    <th />
                    <th
                        v-for="(col) in range(options.size.x)"
                        :key="col"
                    >
                        {{ col }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(row) in range(options.size.y)"
                    :key="row"
                >
                    <th>{{ row }}</th>
                    <td
                        v-for="(col) in range(options.size.x)"
                        :key="col"
                        :class="$style.cell"
                    >
                        <div
                            :class="{
                                [$style.cell__inner]: true,
                                [$style.cell_current]: isCurrent(row, col),
                                [$style.wall_right]: hasWallRight(row, col),
                                [$style.wall_left]: hasWallLeft(row, col),
                                [$style.wall_top]: hasWallTop(row, col),
                                [$style.wall_bottom]: hasWallBottom(row, col),
                                [$style.facing_up]: current.orientation === 'N',
                                [$style.facing_down]: current.orientation === 'S',
                                [$style.facing_left]: current.orientation === 'W',
                                [$style.facing_right]: current.orientation === 'E',
                            }"
                        >
                            <img
                                v-if="isCurrent(row, col)"
                                src="~/assets/img/character.svg"
                                alt="Mioara"
                                :class="$style.cell__img"
                            >
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div>
            <div
                v-for="(message, index) in moves"
                :key="message + index"
            >
                <template v-if="message === 'reset'">
                    Miorița teleported to the start position
                </template>
                <template v-else-if="message === 'rotate-left'">
                    Miorița turned left (counter-clockwise)
                </template>
                <template v-else-if="message === 'rotate-right'">
                    Miorița turned left (clockwise)
                </template>
                <template v-else-if="message === 'forward'">
                    Miorița moved forward
                </template>
                <template v-else-if="message === 'move-possible'">
                    Miorița realized she can move forward
                </template>
                <template v-else-if="message === 'move-blocked'">
                    Miorița realized she cannot move forward
                </template>
                <template v-else-if="message === 'next-turnLeft'">
                    Miorița will turn left
                </template>
                <template v-else-if="message === 'next-turnRight'">
                    Miorița will turn right
                </template>
                <template v-else-if="message === 'next-canMove'">
                    Miorița is analyzing if she can move forward
                </template>
                <template v-else-if="message === 'next-move'">
                    Miorița will try to move forward
                </template>
                <template v-else-if="message === 'end'">
                    Miorița has ended her programming
                </template>
                <template v-else-if="message === 'error-orientation'">
                    Miorița is a little dizzy
                </template>
                <template v-else-if="message === 'error-map-overflow'">
                    Miorița cannot get out of her sheepfold
                </template>
                <template v-else-if="message === 'error-wall-hit'">
                    Miorița cannot get over the fence
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import WorldOptions, { Coordinates } from "~/interfaces/WorldOptions";
import WorldCurrent from "~/interfaces/WorldCurrent";
import Actions from "~/lib/Actions";
import makeRunner from "~/lib/makeRunner";

@Component
export default class TheWorld extends Vue {
    @Prop({
        default: () => ({
            size: { x: 8, y: 8 },
            start: {
                position: { x: 0, y: 0 },
                orientation: "e",
            },
            walls: {
                x: [
                    { x: 0, y: 0 },
                ],
                y: [
                    { x: 1, y: 0 },
                ],
            },
            timeout: 1000,
        } as WorldOptions),
    }) options!: WorldOptions;

    // eslint-disable-next-line class-methods-use-this
    range (size:number): number[] {
        return [...new Array(size)].map((_, index) => index);
    }

    current:WorldCurrent = {
        position: { x: 0, y: 0 },
        orientation: "E",
    };

    isCurrent (row:number, col:number) {
        const { current: { position: { x, y } } } = this;

        return row === y && col === x;
    }

    hasWallRight (row:number, col:number) {
        return this.options.walls.x.some((pos:Coordinates) => row === pos.y && col === pos.x);
    }

    hasWallLeft (row:number, col:number) {
        return this.hasWallRight(row, col - 1);
    }

    hasWallBottom (row:number, col:number) {
        return this.options.walls.y.some((pos:Coordinates) => row === pos.y && col === pos.x);
    }

    hasWallTop (row:number, col:number) {
        return this.hasWallBottom(row - 1, col);
    }

    actions:Actions | null = null;

    @Watch("actions.nextAction")
    onNextActionChange (nextAction:string) {
        this.moves.push(`next-${nextAction}`);
    }

    moves:string[] = [];

    run (debug = false) {
        this.moves = [];
        this.actions = new Actions(this.options, this.current, debug);
        this.actions.onMove((move) => {
            this.moves.push(move);
        });
        const runner = makeRunner(this.$store.state.code);

        runner(this.actions)
            .then(() => {
                this.moves.push("end");
            })
            .catch((e) => {
                if (e.isRunnerError) {
                    this.moves.push(`error-${e.message}`);
                } else {
                    this.moves.push(`error-generic-${e.message}`);
                    console.error(e);
                }
            })
            .then(() => {
                this.actions = null;
            });
        if (debug) {
            this.$nextTick(() => {
                if (this.actions) {
                    this.actions.stepOver();
                }
            });
        }
    }

    debug () {
        this.run(true);
    }

    stepOver () {
        if (this.actions) {
            this.actions.stepOver();
        }
    }

    reset () {
        if (this.actions) {
            this.actions.stop();
        }
        const { start } = this.options;
        this.current = {
            position: { ...start.position },
            orientation: "E",
        };
        this.moves = [];
    }

    created () {
        this.reset();
    }
}
</script>

<style module>
.table {
    --cell-width: 10%;
    --wall-color: #c9c9c9;
    --wall-warning-color: rgba(255, 156, 156, 0.44);

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

.cell__inner {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    justify-content: center;
    align-items: center;
    border: 2px solid transparent;
    overflow: hidden;
}

.cell__img {
    width: 90%;
}

.wall_right {
    border-right-color: var(--wall-color);
}

.cell_current.wall_right.facing_right {
    border-right-color: var(--wall-warning-color);

    /* box-shadow: inset -4px 0 4px 0 var(--wall-warning-color); */

}

.wall_left {
    border-left-color: var(--wall-color);
}

.cell_current.wall_left.facing_left {
    border-left-color: var(--wall-warning-color);
}

.wall_top {
    border-top-color: var(--wall-color);
}

.cell_current.wall_top.facing_up {
    border-top-color: var(--wall-warning-color);
}

.wall_bottom {
    border-bottom-color: var(--wall-color);
}

.cell_current.wall_bottom.facing_down {
    border-bottom-color: var(--wall-warning-color);
}

.facing_up img {
    transform: rotate(-90deg);
}

.facing_down img {
    transform: rotate(90deg);
}

.facing_left img {
    transform: scaleX(-1);
}

</style>
