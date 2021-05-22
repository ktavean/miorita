/* eslint-disable max-classes-per-file */
import WorldOptions from "~/interfaces/WorldOptions";
import WorldCurrent from "~/interfaces/WorldCurrent";
import RunnerError from "~/lib/RunnerError";
import WorldObject from "../interfaces/WorldObject";

const DIRECTIONS = "NESW";

type QueueFunction = () => any;
type MoveFunction = (type:string, ...args:any[])=>void;

class UsableActions {
    options: WorldOptions;
    current: WorldCurrent;
    objects: {
        [pos: string]: {
            [type: string]: WorldObject
        }
    } = {};

    constructor (options:WorldOptions, current:WorldCurrent) {
        this.options = options;
        this.current = current;

        options.objects.forEach(
            ({
                position: { x, y },
                type,
                fixed,
                count,
            }) => {
                const objKey = `${x}x${y}`;
                if (this.objects[objKey] === undefined) {
                    this.objects[objKey] = {};
                }
                const objects = this.objects[objKey];

                objects[type] = {
                    fixed,
                    type,
                    position: { x, y },
                    count: count || 1,
                };
            }, // =>
        ); // forEach
    }

    /**
     * Character rotates counter-clockwise
     */
    turnLeft () {
        const { orientation } = this.current;
        let orientationIndex = DIRECTIONS.indexOf(orientation) - 1;
        if (orientationIndex < 0) {
            orientationIndex = DIRECTIONS.length - 1;
        }

        this.current.orientation = DIRECTIONS[orientationIndex];

        this.addMove("rotate-left");
    }

    /**
     * Character rotates clockwise
     */
    turnRight () {
        const { orientation } = this.current;
        let orientationIndex = DIRECTIONS.indexOf(orientation) + 1;
        if (orientationIndex >= DIRECTIONS.length) {
            orientationIndex = 0;
        }

        this.current.orientation = DIRECTIONS[orientationIndex];
        this.addMove("rotate-right");
    }

    /**
     * Determine the next position
     */
    nextPosition () {
        const { current: { orientation, position }, options: { size, walls } } = this;

        let axis:string;
        let sign:number;
        switch (orientation) {
            case "N":
                axis = "y";
                sign = -1;
                break;
            case "S":
                axis = "y";
                sign = 1;
                break;
            case "W":
                axis = "x";
                sign = -1;
                break;
            case "E":
                axis = "x";
                sign = 1;
                break;
            default:
                throw new RunnerError("orientation");
        }

        // @ts-ignore
        const nextValue = position[axis] + sign;

        // @ts-ignore
        if (nextValue < 0 || nextValue >= size[axis]) {
            throw new RunnerError("map-overflow");
        }

        const nextPosition = {
            ...position,
            [axis]: nextValue,
        };

        const wallHitError = new RunnerError("wall-hit");
        const wallHitTest = sign < 0 ? nextPosition : position;

        // @ts-ignore

        if (walls[axis] && walls[axis].some(w => w.x === wallHitTest.x && w.y === wallHitTest.y)) {
            throw wallHitError;
        }

        return {
            axis,
            sign,
            position: nextPosition,
        };
    }

    move () {
        try {
            const { position } = this.nextPosition();

            // @ts-ignore
            this.current.position = position;

            this.addMove("forward");
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    canMove () {
        try {
            this.nextPosition();
            this.addMove("move-possible");
            return true;
        } catch (e) {
            this.addMove("move-blocked");
            return false;
        }
    }

    pickPossible (type:string) {
        const { current: { position: { x, y } }, objects } = this;
        const pickable = objects[`${x}x${y}`]?.[type];

        return pickable && !pickable.fixed &&
            pickable.type === String(type).toLowerCase();
    }

    found (type:string) {
        if (this.pickPossible(type)) {
            this.addMove("found", type);
            return true;
        }
        this.addMove("not-found", type);
        return false;
    }

    pick (type:string) {
        if (!this.pickPossible(type)) {
            throw new RunnerError(`pick-${type}`);
        }

        const { current: { position: { x, y }, picked }, objects } = this;
        const objKey = `${x}x${y}`;

        if (undefined === picked[type]) {
            picked[type] = 0;
        }
        picked[type] += 1;

        delete objects[objKey];

        this.objects = { ...objects };
        this.current.picked = { ...picked };
        this.addMove("pick", type);
    }

    drop (type:string) {
        const { current: { position: { x, y }, picked }, objects } = this;
        const objKey = `${x}x${y}`;

        if (!picked[type]) {
            throw new RunnerError(`drop${type}`);
        }

        picked[type] -= 1;

        if (objects[objKey] === undefined) {
            objects[objKey] = {};
        }
        objects[objKey][type] = {
            type,
            position: { x, y },
            fixed: false,
            count: (objects[objKey][type]?.count || 0) + 1,
        };

        this.objects = { ...objects };
        this.current.picked = { ...picked };
        this.addMove("drop", type);
    }

    reset () {
        this.current.position = { ...this.options.start.position };
        this.current.orientation = this.options.start.orientation;
        this.addMove("reset");
    }

    addMove (move:string, ...args:any[]) {
        this.moveWatchers.forEach((callback) => {
            callback(move, ...args);
        });
    }

    moveWatchers:MoveFunction[] = [];
    onMove (callback:MoveFunction) {
        this.moveWatchers.push(callback);
    }
}

export default class Actions extends UsableActions {
    private queue: QueueFunction[] = [];
    ended = false;
    debug: boolean;

    constructor (options:WorldOptions, current:WorldCurrent, debug = false) {
        super(options, current);
        this.debug = debug;
    }

    static GetActions () {
        const MethodsNotActionable = [
            "constructor",
            "nextPosition",
            "addMove",
            "onMove",
            "pickPossible",
        ];
        // All functions of the class Actions
        return Object.getOwnPropertyNames(UsableActions.prototype)
            // ... except the ones that are marked otherwise
            .filter(action => !MethodsNotActionable.includes(action));
    }

    addToQueue (callback:QueueFunction) {
        this.queue.push(callback);

        if (!this.debug) {
            this.stepOver();
        }
    }

    stepOver () {
        const callback = this.queue.shift();
        if (typeof callback === "function") {
            callback();
        }
    }

    stop () {
        this.ended = true;
        // And run next step, which should clear the queue
        this.stepOver();
    }
}

// All functions of the class Actions
const actions = Actions.GetActions();

actions.forEach((action) => {
    // Save the actual action
    // @ts-ignore
    const actionFunction = Actions.prototype[action];

    /**
     * Replace action function with another function that adds it to the queue
     *
     * This is done so actions can be written without worrying about running in debug mode
     *
     * @type {function(): Promise<unknown>}
     */
    // @ts-ignore
    // eslint-disable-next-line require-await
    Actions.prototype[action] = function (...args) {
        /// The replacement function returns a promise that is resolved
        ///     only when the callback from the queue is called

        return new Promise((resolve, reject) => {
            try {
                this.addMove(`next-${action}`, ...args);
                this.addToQueue(() => {
                    if (this.ended) {
                        reject(new RunnerError("stop"));
                        return;
                    }
                    const out = actionFunction.apply(this, args);
                    if (this.debug) {
                        resolve(out);
                    } else {
                        setTimeout(
                            () => { resolve(out); },
                            this.options.timeout,
                        );
                    }
                });
            } catch (e) {
                this.ended = true;
                reject(e);
            }
        });
    };
});
