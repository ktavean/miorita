import { Coordinates } from "~/interfaces/WorldOptions";
import WorldObject from "./WorldObject";

export default interface WorldCurrent {
    position: Coordinates
    orientation: string
    picked: { [type:string]: number; }
}
