import WorldCurrent from "~/interfaces/WorldCurrent";

export type Coordinates<T=number> = {
    x: T
    y: T
};

export default interface WorldOptions {
    size: Coordinates
    start: WorldCurrent
    walls: Coordinates<Coordinates[]>

    objects: {
        type: string
        position: Coordinates
    }[]

    timeout: number
}
