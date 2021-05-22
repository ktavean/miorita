import { Coordinates } from "~/interfaces/WorldOptions";

export default interface WorldObject {
    position: Coordinates
    type: string
    fixed?: boolean
    count?: number
}
