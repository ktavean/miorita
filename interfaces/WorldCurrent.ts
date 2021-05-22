import { Coordinates } from "~/interfaces/WorldOptions";

export default interface WorldCurrent {
    position: Coordinates
    orientation: string
    picked: { [type:string]: number; }
}
