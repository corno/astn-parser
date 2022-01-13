import * as pr from "pareto-runtime"


import * as grammar from "../../../modules/grammar"
import * as astn from "../../../interface"

import { createSerializedNonWrappedString, createSerializedQuotedString } from "./stringSerialization"

export function createJSONFormatter<EventAnnotation>(
    indentationString: string,
    newline: string,
    writer: astn.IFormatInstructionWriter<EventAnnotation>,
): astn.IAnnotatedHandler<EventAnnotation> {

    function createIndentation(context: astn.StackContext) {
        let indentation = ``
        for (let x = 0; x !== context.dictionaryDepth + context.verboseGroupDepth; x += 1) {
            indentation += indentationString
        }
        return indentation
    }
    return {
        objectBegin: ($) => {
            writer.token(
                {
                    stringBefore: ``,
                    token: `{`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        property: ($) => {
            writer.token(
                {
                    stringBefore: `${$.isFirst ? "" : ","}${newline}${createIndentation($.stackContext)}`,
                    token: createSerializedQuotedString($.propertyToken.token.value),
                    stringAfter: `: `,
                },
                $.propertyToken.annotation
            )
        },
        objectEnd: ($) => {
            writer.token(
                {
                    stringBefore: $.isEmpty ? ` ` : `${newline}${createIndentation($.stackContext)}`,
                    token: `}`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },

        arrayBegin: ($) => {
            writer.token({
                stringBefore: ``,
                token: `[`,
                stringAfter: ``,
            },
                $.token.annotation,
            )
        },
        element: ($) => {
            writer.nonToken(
                {
                    string: `${$.isFirst ? "" : ","} `,
                },
            )
        },
        arrayEnd: ($) => {
            writer.token(
                {
                    stringBefore: ` `,
                    token: `]`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        simpleStringValue: ($) => {
            writer.token(
                {
                    stringBefore: ``,
                    token: ((): string => {

                        switch ($.token.token.wrapping[0]) {
                            case "none": {
                                // if ($.token.data.value === "true" || $.token.data.value === "false" || $.token.data.value === "null") {
                                //     return $.token.data.value
                                // }
                                // const nr = new Number($.token.data.value).valueOf()
                                // if (isNaN(nr)) {
                                //     return createSerializedQuotedString($.token.data.value)
                                // }
                                return createSerializedNonWrappedString($.token.token.value)
                            }
                            case "quote": {
                                return createSerializedQuotedString($.token.token.value)
                            }
                            case "apostrophe": {
                                return createSerializedQuotedString($.token.token.value)
                            }
                            default:
                                return pr.au($.token.token.wrapping[0])
                        }
                    })(),
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        multilineStringValue: ($) => {
            writer.token(
                {
                    stringBefore: ``,
                    token: createSerializedQuotedString(
                        $.token.token.lines.join(newline),
                    ),
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        taggedUnionBegin: ($) => {
            writer.token(
                {
                    stringBefore: ``,
                    token: `[`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        option: ($) => {
            writer.token(
                {
                    stringBefore: ` `,
                    token: createSerializedQuotedString($.token.token.value),
                    stringAfter: `, `,
                },
                $.token.annotation,
            )
        },
        taggedUnionEnd: ($) => {
            writer.nonToken(
                {
                    string: ` ]`,
                },
            )
        },
        end: () => {
            writer.nonToken(
                {
                    string: newline,
                },
            )

        },
    }
}

