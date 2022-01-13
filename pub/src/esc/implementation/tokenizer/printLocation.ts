import * as inf from "../../../interface"
import { PrintLocation } from "../../Functions"

export function printLocation(): PrintLocation {
    return (location) => {
        return `${location.line}:${location.column}`
    }
}