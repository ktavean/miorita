/* eslint-disable max-classes-per-file */
import WorldOptions from "~/interfaces/WorldOptions";
import WorldCurrent from "~/interfaces/WorldCurrent";
import RunnerError from "~/lib/RunnerError";

const DIRECTIONS = "NESW";

type QueueFunction = () => any;
type MoveFunction = (type:string)=>void;

class UsableActions {
    options: WorldOptions;
    current: WorldCurrent;
    constructor (options:WorldOptions, current:WorldCurrent) {
        this.options = options;
        this.current = current;
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
        if (walls[axis].some(w => w.x === wallHitTest.x && w.y === wallHitTest.y)) {
            throw wallHitError;
        }

        return {
            axis,
            sign,
            position: nextPosition,
        };
    }

    move () {
        const { position } = this.nextPosition();

        // @ts-ignore
        this.current.position = position;

        this.addMove("forward");
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

    reset () {
        this.current.position = { ...this.options.start.position };
        this.current.orientation = this.options.start.orientation;
        this.addMove("reset");
    }

    addMove (move:string) {
        this.moveWatchers.forEach((callback) => {
            callback(move);
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
    nextAction = "";

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
                this.nextAction = action;
                this.addToQueue(() => {
                    if (this.ended) {
                        reject();
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
