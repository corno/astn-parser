import { formatCLI } from "./formatCLI"
import * as astn from "../../../interface"
import { createJSONSerializer } from "./createJSONSerializer"
import { ToJSON } from "../../Functions"

export function toJSON(): ToJSON {
    return (
        write,
        onError,
    ) => {
        return formatCLI(
            write,
            onError,
            createJSONSerializer,
        )
    }
}