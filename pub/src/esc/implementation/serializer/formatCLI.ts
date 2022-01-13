import * as pr from "pareto-runtime"
import * as grammar from "../../../modules/grammar"
import * as astn from "../../../interface"
import { createTokenizer } from "../tokenizer/createTokenizer"
import { createStructureParser } from "../parser/createStructureParser"
import { printRange } from "../tokenizer/printRange"
import { printParsingError } from "../parser/printTreeParserError"
import { printTokenizerError } from "../tokenizer/printTokenizerError"


export type CreateFormatterParameters<EventAnnotation> = {
    indentationString: string
    newline: string
    write: (str: string) => void
    onError: astn.IStructureErrorHandler<EventAnnotation>
}

export function formatCLI(
    write: (str: string) => void,
    onError: (str: string) => void,
    createFormatter: ($: CreateFormatterParameters<astn.TokenizerAnnotationData>) => grammar.IStructureHandler<astn.TokenizerAnnotationData>,
): pr.IStreamConsumer<string, null> {
    return createTokenizer()({
        parser: createStructureParser<astn.TokenizerAnnotationData>()({
            handler: createFormatter({
                indentationString: "    ",
                newline: "\r\n",
                write: (str) => {
                    write(str)
                },
                onError: ($) => {
                    onError(`${printParsingError()($.error)} @ ${printRange()($.annotation.range)}`)
                },
            }),
            onError: ($) => {
                onError(`${printParsingError()($.error)} @ ${printRange()($.annotation.range)}`)
            },
        }),
        onError: ($) => {
            onError(`${printTokenizerError()($.error)} @ ${printRange()($.range)}`)
        },
    })

}
