import * as pr from "pareto-runtime"

import * as astn from "../../../interface"
import { PrintTokenizerError } from "../../Functions"

import { printTokenizer2Error } from "./createTokenizer2"
import { printTokenError } from "./printTokenError"

export function printTokenizerError(): PrintTokenizerError {
    return ($) => {
        switch ($[0]) {
            case "pre":
                return pr.cc($[1], ($) => {
                    return printTokenError()($)
                })
            case "tokenizer":
                return pr.cc($[1], ($) => {
                    return printTokenizer2Error($)
                })
            default:
                return pr.au($[0])
        }
    }
}