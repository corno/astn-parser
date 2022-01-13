import { formatCLI } from "./formatCLI"
import * as astn from "../../../interface"
import { createASTNSerializer } from "./createASTNSerializer"
import { Normalize } from "../../Functions"

export function normalize(): Normalize {
    return (
        write,
        onError,
    ) => {
        return formatCLI(
            write,
            onError,
            createASTNSerializer,
        )
    }
}