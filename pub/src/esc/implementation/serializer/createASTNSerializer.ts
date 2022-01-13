import * as astn from "../../../interface"
import * as grammar from "../../../modules/grammar"

import { createAnnotater } from "./createAnnotater"
import { createASTNNormalizer } from "./createASTNNormalizer"
import { createTreeParser } from "../parser/createTreeParser"
import { CreateFormatterParameters } from "./formatCLI"

export function createASTNSerializer<EventAnnotation>($: CreateFormatterParameters<EventAnnotation>): grammar.IStructureHandler<EventAnnotation> {
    const writer: astn.IFormatInstructionWriter<EventAnnotation> = {
        token: (instruction) => {
            $.write(instruction.stringBefore)
            $.write(instruction.token)
            $.write(instruction.stringAfter)

        },
        nonToken: (instruction) => {
            $.write(instruction.string)
        },
    }
    return {
        onNoInternalSchema: () => { },
        onEmbeddedSchema: (_range) => {
            $.write(`! `)
            return createAnnotater<EventAnnotation>()(createASTNNormalizer(
                {
                    indentationString: $.indentationString,
                    newline: $.newline,
                },
                {
                    writer: writer,
                }

            ))
        },
        onSchemaReference: ($$) => {
            $.write(`! ${$$.token.token.value}${$.newline}`)
        },
        onBody: () => {
            const x = createTreeParser<EventAnnotation>()({
                handler: createAnnotater<EventAnnotation>()(createASTNNormalizer(
                    {
                        indentationString: $.indentationString,
                        newline: $.newline,
                    },
                    {
                        writer: writer,
                    }

                )),
                onError: $.onError,
            })
            return x
        },
    }
}
