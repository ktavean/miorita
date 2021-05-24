/* eslint-disable max-classes-per-file */
import WorldOptions from "~/interfaces/WorldOptions";
import WorldCurrent from "~/interfaces/WorldCurrent";
import RunnerError from "~/lib/RunnerError";
import WorldObject from "../interfaces/WorldObject";

const DIRECTIONS = "NESW";

const userActions:string[] = [];

type QueueFunction = () => any;
type MoveFunction = (type:string, ...args:any[])=>void;

/**
 * Decorator that makes the provided function queueable, thus usable in user code
 *
 * @param speed
 * @constructor
 */
function UserAction ({ speed = 1 } : {speed?:number;} = {}) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        target: Actions,
        action: string,
        descriptor: PropertyDescriptor,
    ) => {
        const { value: actionFunction } = descriptor;

        userActions.push(action);

        // eslint-disable-next-line no-param-reassign,func-names
        descriptor.value = function (this:Actions, ...args:[]) {
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
                                this.options.timeout * speed,
                            );
                        }
                    });
                } catch (e) {
                    this.ended = true;
                    reject(e);
                }
            });
        };
    };
}

/**
 * Actions performed by the character
 */
export default class Actions {
    /**
     * Calls queue
     * @private
     */
    private queue: QueueFunction[] = [];

    /**
     * Flag to determine if the run has ended
     */
    ended = false;

    /**
     * Temporary objects in the world
     */
    objects: {
        [pos: string]: {
            [type: string]: WorldObject
        }
    } = {};

    /**
     * @param options   Run settings
     * @param current   Data about the current state of the world
     * @param debug     Flag to allow debugging (running step-by-step)
     */
    constructor (
        public options:WorldOptions,
        public current:WorldCurrent,
        public debug = false,
    ) {
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

    static GetActions (): string[] {
        return userActions;
    }

    // region User actions

    /**
     * Character rotates counter-clockwise
     */
    @UserAction()
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
    @UserAction()
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
     * Character moves forward
     */
    @UserAction()
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

    /**
     * Test if a character can move forward
     */
    @UserAction({ speed: 0.1 })
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

    /**
     * Test if there is an object of the provided type
     *  at the current character position
     * @param type
     */
    @UserAction({ speed: 0.1 })
    found (type:string) {
        if (this.pickPossible(type)) {
            this.addMove("found", type);
            return true;
        }
        this.addMove("not-found", type);
        return false;
    }

    /**
     * Pick an object of the provided type from the coordinates
     *
     * @param type
     */
    @UserAction()
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

    /**
     * Drop an object of the provided type at the current position
     *
     * @param type
     */
    @UserAction()
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

    /**
     * Move the character to the original position
     */
    @UserAction({ speed: 0.01 })
    reset () {
        this.current.position = { ...this.options.start.position };
        this.current.orientation = this.options.start.orientation;
        this.addMove("reset");
    }

    // endregion
    // region Helpers

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

    /**
     * Test if the character can pick an object of the provided type
     *  at the current character position
     *
     * @param type
     */
    pickPossible (type:string) {
        const { current: { position: { x, y } }, objects } = this;
        const pickable = objects[`${x}x${y}`]?.[type];

        return pickable && !pickable.fixed &&
            pickable.type === String(type).toLowerCase();
    }

    /**
     * Call all the watchers with the provided move
     *
     * @param move
     * @param args
     */
    addMove (move:string, ...args:any[]) {
        this.moveWatchers.forEach((callback) => {
            callback(move, ...args);
        });
    }

    /**
     * Callbacks to be run when any move occurs
     */
    moveWatchers:MoveFunction[] = [];

    /**
     * Register a callback that will fire during a move
     *
     * @param callback
     */
    onMove (callback:MoveFunction) {
        this.moveWatchers.push(callback);
    }

    /**
     * Add the provided callback to the queue
     *
     * @param callback
     */
    addToQueue (callback:QueueFunction) {
        this.queue.push(callback);

        if (!this.debug) {
            this.stepOver();
        }
    }

    /**
     * Run the next item in the queue
     */
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

    // endregion
}
