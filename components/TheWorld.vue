<template>
    <div :class="$style.world">
        <div>
            <button
                v-if="!isRunning"
                type="button"
                :class="$style.button"
                @click="run()"
            >
                <i class="micon mi-run" />
                Run
            </button>
            <button
                v-if="!isRunning && canReset"
                type="button"
                :class="$style.button"
                @click="reset"
            >
                <i class="micon mi-reset" />
                Reset
            </button>
            <button
                v-if="!isRunning"
                type="button"
                :class="$style.button"
                @click="debug"
            >
                <i class="micon mi-debug" />
                Debug
            </button>
            <button
                v-if="isRunning && actions.debug"
                type="button"
                :class="$style.button"
                @click="stepOver"
            >
                <i class="micon mi-step-over" />
                Step over
            </button>
            <button
                v-if="isRunning"
                type="button"
                :class="$style.button"
                @click="stop"
            >
                <i class="micon mi-stop" />
                Stop
            </button>
        </div>
        <div ref="tableWrapper" :class="$style.table_wrapper">
            <table :class="$style.table" :style="cellWidthStyle">
                <tbody>
                    <tr
                        v-for="(row) in range(options.size.y)"
                        :key="row"
                    >
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
                                <div
                                    v-for="(obj, objIndex) in objectsAt(row, col)"
                                    :key="objIndex + obj.type"
                                >
                                    <template v-if="obj.type === 'grass'">
                                        <GrassObject
                                            :class="[$style.cell__object, $style.obj_grass]"
                                            style="fill: green"
                                        />
                                    </template>
                                    <template v-if="obj.type === 'hatchet'">
                                        <HatchetObject
                                            :class="[$style.cell__object, $style.obj_hatchet]"
                                        />
                                    </template>
                                    <template v-if="obj.type === 'vitoria'">
                                        <VitoriaObject
                                            :class="[$style.cell__object, $style.obj_vitoria]"
                                        />
                                    </template>
                                </div>
                                <img
                                    v-if="isCurrent(row, col)"
                                    src="~/assets/img/character.svg"
                                    alt="Miorița"
                                    :class="$style.cell__img"
                                >
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div ref="console" :class="$style.console">
            <div
                v-for="({message, args}, index) in moves"
                :key="message + index"
            >
                <template v-if="message === 'reset'">
                    Miorița teleported to the start position
                </template>
                <template v-else-if="message === 'rotate-left'">
                    Miorița turned left (counter-clockwise)
                </template>
                <template v-else-if="message === 'rotate-right'">
                    Miorița turned right (clockwise)
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
                <template v-else-if="message === 'found'">
                    Miorița has found "{{ args[0] }}"
                </template>
                <template v-else-if="message === 'not-found'">
                    Miorița has not found "{{ args[0] }}"
                </template>
                <template v-else-if="message === 'pick'">
                    Miorița has picked "{{ args[0] }}"
                </template>
                <template v-else-if="message === 'drop'">
                    Miorița has dropped "{{ args[0] }}"
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
                <template v-else-if="message === 'next-found'">
                    Miorița is trying to find "{{ args[0] }}"
                </template>
                <template v-else-if="message === 'next-pick'">
                    Miorița is trying to pick "{{ args[0] }}"
                </template>
                <template v-else-if="message === 'next-drop'">
                    Miorița is trying to drop "{{ args[0] }}"
                </template>
                <template v-else-if="message === 'end'">
                    Miorița has ended her programming
                </template>
                <span v-else-if="message === 'error-orientation'" :class="$style.error">
                    Miorița is a little dizzy
                </span>
                <span v-else-if="message === 'error-map-overflow'" :class="$style.error">
                    Miorița cannot get out of her sheepfold
                </span>
                <span v-else-if="message === 'error-wall-hit'" :class="$style.error">
                    Miorița cannot get over the fence
                </span>
                <span v-else-if="message === 'error-stop'" :class="$style.error">
                    Miorița has stopped
                </span>
                <span v-else-if="message.startsWith('error-build')" :class="$style.error">
                    Miorița cannot understand . Here's why:
                    {{ message.substring('error-build-'.length) }}
                </span>
                <span v-else-if="message.startsWith('error-generic')" :class="$style.error">
                    {{ message.substring('error-generic-'.length) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Howl } from "howler";
import WorldOptions, { Coordinates } from "~/interfaces/WorldOptions";
import WorldCurrent from "~/interfaces/WorldCurrent";
import Actions from "~/lib/Actions";
import makeRunner from "~/lib/makeRunner";
import GrassObject from "~/assets/img/grass.svg?inline";
import HatchetObject from "~/assets/img/hatchet.svg?inline";
import VitoriaObject from "~/assets/img/vitoria.svg?inline";
import "~/assets/css/icons.css";

@Component({
    components: {
        GrassObject,
        HatchetObject,
        VitoriaObject,
    },
})
export default class TheWorld extends Vue {
    @Prop({
        default: () => ({
            size: { x: 4, y: 4 },
            start: {
                position: { x: 0, y: 0 },
                orientation: "E",
            },
            walls: {},
            objects: [
                {
                    type: "grass",
                    position: { x: 1, y: 0 },
                },
            ],
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
        picked: {},
    };

    isCurrent (row:number, col:number) {
        const { current: { position: { x, y } } } = this;

        return row === y && col === x;
    }

    objectsAt (row:number, col:number) {
        if (this.actions) {
            return Object.values(this.actions.objects[`${col}x${row}`] || {});
        }
        return this.options.objects.filter(
            ({ position: { x, y } }) => row === y && col === x,
        );
    }

    get canReset () {
        const { current, options: { start } } = this;

        return current.orientation !== start.orientation ||
            current.position.x !== start.position.x ||
            current.position.y !== start.position.y;
    }

    get isRunning () {
        return this.actions && !this.actions.ended;
    }

    hasWallRight (row:number, col:number) {
        return this.options.walls.x &&
            this.options.walls.x.some((pos:Coordinates) => row === pos.y && col === pos.x);
    }

    hasWallLeft (row:number, col:number) {
        return this.hasWallRight(row, col - 1);
    }

    hasWallBottom (row:number, col:number) {
        return this.options.walls.y &&
            this.options.walls.y.some((pos:Coordinates) => row === pos.y && col === pos.x);
    }

    hasWallTop (row:number, col:number) {
        return this.hasWallBottom(row - 1, col);
    }

    actions:Actions | null = null;

    moves:{
        message: string
        args?: any[]
    }[] = [];

    @Watch("moves", { deep: true })
    onMovedUpdated () {
        this.$nextTick(() => {
            // @ts-ignore
            this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
        });
    }

    run (debug = false) {
        this.moves = [];
        this.actions = new Actions(this.options, this.current, debug);
        this.actions.onMove((message, ...args) => {
            this.moves.push({ message, args });
        });
        let runner: (_action: Actions) => Promise<any>;

        try {
            runner = makeRunner(this.$store.state.code);
        } catch (e) {
            this.moves.push({ message: `error-build-${e.message}` });
            this.actions = null;
            return;
        }

        runner(this.actions)
            .then(() => {
                this.moves.push({ message: "end" });
            })
            .catch((e) => {
                (new Howl({
                    src: `${this.$nuxt.context.base}sounds/bleating.mp3`,
                })).play();
                if (e.isRunnerError) {
                    this.moves.push({ message: `error-${e.message}` });
                } else {
                    this.moves.push({ message: `error-generic-${e.message}` });
                    console.error(e);
                }
            })
            .then(() => {
                this.actions.ended = true;
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

    stop () {
        if (this.actions) {
            this.actions.stop();
        }
    }

    cellWidth = "10%";

    get cellWidthStyle () {
        return {
            "--cell-width": `${this.cellWidth}`,
        };
    }

    resizeCell () {
        const wrapper = this.$refs.tableWrapper;
        if (!wrapper) {
            return;
        }

        // @ts-ignore
        wrapper.querySelector("table").attributes.style.value = "--cell-width: 1px";

        const cellWidth = Math.floor(
            Math.min(
                // @ts-ignore
                wrapper.clientWidth / this.options.size.y,
                // @ts-ignore
                wrapper.clientHeight / this.options.size.x,
            ) * 0.95,
        );

        this.cellWidth = `${cellWidth}px`;
        // @ts-ignore
        wrapper.querySelector("table").attributes.style.value = `--cell-width: ${cellWidth}px`;
    }

    reset () {
        if (this.actions) {
            this.actions.stop();
        }
        const { start } = this.options;
        this.current = {
            position: { ...start.position },
            orientation: "E",
            picked: {},
        };
        this.moves = [];
    }

    created () {
        this.reset();
    }

    resizeCellListener?: ()=>void;

    mounted () {
        this.resizeCell();

        this.resizeCellListener = this.resizeCell.bind(this);
        window.addEventListener("resize", this.resizeCellListener);
    }

    destroyed () {
        // @ts-ignore
        window.removeEventListener("resize", this.resizeCellListener);
    }
}
</script>

<style module>
.world {
    display: flex;
    flex-direction: column;
}

.button {
    padding: 0.2em 0.7em;
    background: #fff;
    border: 1px solid currentColor;
    border-radius: 0.3em;
    margin: 0.5em;
    cursor: pointer;
}

.button:hover,
.button:focus {
    background: #333;
    color: #fff;
}

.table_wrapper {
    flex-grow: 1;
}

.table {
    --cell-width: 1rem;
    --wall-color: #c9c9c9;
    --wall-warning-color: rgba(255, 156, 156, 0.44);

    border-collapse: separate;
    table-layout: fixed;
    flex-grow: 1;
    margin-left: auto;
    margin-right: auto;
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
    font-size: calc(var(--cell-width) / 3);
    color: #eee;
}

.cell__inner {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    justify-content: center;
    align-items: center;
    border: 2px solid transparent;
    overflow: hidden;
}

.cell__img {
    max-width: 100%;
    max-height: 100%;
    position: absolute;
    z-index: 2;
}

.cell__object {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 2;
    margin-left: auto;
    margin-right: auto;
}

.obj_grass {
    transform: scale(0.95) translateY(20%);
}

.obj_hatchet {
    transform: scale(0.95) translateY(20%);
}

.obj_vitoria {
    transform: scale(0.95) translateY(20%);
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

.facing_up .cell__img {
    transform: rotate(-90deg);
}

.facing_down .cell__img {
    transform: rotate(90deg);
}

.facing_left .cell__img {
    transform: scaleX(-1);
}

.console {
    display: flex;
    flex-direction: column;
    overflow: auto;
    gap: 0.5em;
    background: #000;
    color: #fff;
    padding: 1rem;
    height: 7.5rem;
}

.error {
    color: #f00;
}

</style>
