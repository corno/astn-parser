

import * as astn from "../../../interface"
import * as grammar from "../../../modules/grammar"

import { createAnnotater } from "./createAnnotater"
import { createDummyTreeHandler } from "../parser/dummyHandlers"
import { createJSONFormatter } from "./createJSONFormatter"
import { createTreeParser } from "../parser/createTreeParser"
import { CreateFormatterParameters } from "./formatCLI"

export function createJSONSerializer<EventAnnotation>($: CreateFormatterParameters<EventAnnotation>): grammar.IStructureHandler<EventAnnotation> {
    return {
        onNoInternalSchema: () => { },
        onEmbeddedSchema: (_range) => {
            return createDummyTreeHandler()()
        },
        onSchemaReference: () => { },
        onBody: () => {
            const x = createTreeParser<EventAnnotation>()({
                handler: createAnnotater<EventAnnotation>()(createJSONFormatter(
                    $.indentationString,
                    $.newline,
                    {
                        token: (instruction) => {
                            $.write(instruction.stringBefore)
                            $.write(instruction.token)
                            $.write(instruction.stringAfter)

                        },
                        nonToken: (instruction) => {
                            $.write(instruction.string)
                        },
                    }
                )),
                onError: $.onError,
            })
            return x
        },
    }
}
