import * as astn from "../../../interface"
import { GetEndLocationFromRange } from "../../Functions"

export function getEndLocationFromRange(): GetEndLocationFromRange {
    return (range) => {
        return {
            position: range.start.position + range.length, line: range.start.line, column: range.size[0] === "single line" ? range.size[1]["column offset"] + range.start.column : range.size[1].column,
        }
    }
}
