import * as pr from "pareto-runtime"
import * as inf from "../../../interface"
import { RunProgram } from "../../Functions"


export function runProgram(): RunProgram {
    return ($i) => {
        const stdOut = pr.createStdOut()
        const stdErr = pr.createStdOut()
        const ssp = $i(
            (str) => stdOut.write(str),
            (str) => stdErr.write(str)
        )
        pr.subscribeToStdIn(ssp)
    }
}