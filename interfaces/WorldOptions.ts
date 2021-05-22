import WorldCurrent from "~/interfaces/WorldCurrent";
import WorldObject from "./WorldObject";

export type Coordinates<T=number> = {
    x: T
    y: T
};

export default interface WorldOptions {
    size: Coordinates
    start: WorldCurrent
    walls: Coordinates<Coordinates[]>

    objects: WorldObject[]

    timeout: number
}
