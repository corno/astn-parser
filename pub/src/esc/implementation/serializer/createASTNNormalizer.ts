import * as pr from "pareto-runtime"

import * as stringSerialization from "./stringSerialization"

import * as grammar from "../../../modules/grammar"
import * as astn from "../../../interface"

export function createASTNNormalizer<EventAnnotation>(
    $: {
        indentationString: string
        newline: string
    },
    $p: {
        writer: astn.IFormatInstructionWriter<EventAnnotation>
    }
): astn.IAnnotatedHandler<EventAnnotation> {

    function createIndentation(context: astn.StackContext) {
        const depth = context.dictionaryDepth + context.verboseGroupDepth + context.listDepth
        let indentation = $.newline
        for (let x = 0; x !== depth; x += 1) {
            indentation += $.indentationString
        }
        return indentation
    }
    return {
        objectBegin: ($) => {
            $p.writer.token(
                {
                    stringBefore: ``,
                    token: `${$.token.token.type[0] === "verbose group" ? "(" : "{"}`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        property: ($) => {
            $p.writer.token(
                {
                    stringBefore: `${createIndentation($.stackContext)}`,
                    token: ((): string => {
                        switch ($.objectToken.token.type[0]) {
                            case "verbose group": {
                                return stringSerialization.createSerializedApostrophedString($.propertyToken.token.value)
                            }
                            case "dictionary": {
                                return stringSerialization.createSerializedQuotedString($.propertyToken.token.value)
                            }
                            default:
                                return pr.au($.objectToken.token.type[0])
                        }
                    })(),
                    stringAfter: `: `,
                },
                $.propertyToken.annotation,
            )
        },
        objectEnd: ($) => {
            $p.writer.token(
                {
                    stringBefore: $.isEmpty ? ` ` : `${createIndentation($.stackContext)}`,
                    token: `${$.openToken.token.type[0] === "verbose group" ? ")" : "}"}`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },

        arrayBegin: ($) => {
            $p.writer.token(
                {
                    stringBefore: ``,
                    token: `${$.token.token.type[0] === "shorthand group" ? "<" : "["}`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        element: ($) => {
            $p.writer.nonToken(
                {
                    string: $.arrayToken.token.type[0] === "shorthand group"
                        ? ` `
                        : `${createIndentation($.stackContext)}`,
                },
            )
        },
        arrayEnd: ($) => {
            $p.writer.token(
                {
                    stringBefore: $.openToken.token.type[0] === "shorthand group"
                        ? ` `
                        : $.isEmpty ? ` ` : `${createIndentation($.stackContext)}`,
                    token: $.openToken.token.type[0] === "shorthand group"
                        ? `>`
                        : `]`,
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },

        simpleStringValue: ($) => {
            function serializeSimpleString(
                $: grammar.SimpleString,
            ): string {
                switch ($.wrapping[0]) {
                    case "none": {
                        return stringSerialization.createSerializedNonWrappedString($.value)
                    }
                    case "quote": {
                        return stringSerialization.createSerializedQuotedString($.value)
                    }
                    case "apostrophe": {
                        return stringSerialization.createSerializedApostrophedString($.value)
                    }
                    default:
                        return pr.au($.wrapping[0])
                }
            }
            $p.writer.token(
                {
                    stringBefore: ``,
                    token: serializeSimpleString(
                        $.token.token,
                    ),
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },
        multilineStringValue: ($) => {
            $p.writer.token(
                {
                    stringBefore: ``,
                    token: stringSerialization.createSerializedMultilineString(
                        $.token.token.lines,
                        createIndentation($.stackContext),
                    ),
                    stringAfter: ``,
                },
                $.token.annotation,
            )
        },

        taggedUnionBegin: ($) => {
            $p.writer.token(
                {
                    stringBefore: ``,
                    token: `|`,
                    stringAfter: ` `,
                },
                $.token.annotation,
            )
        },
        option: ($) => {
            $p.writer.token(
                {
                    stringBefore: ``,
                    token: stringSerialization.createSerializedApostrophedString($.token.token.value),
                    stringAfter: ` `,
                },
                $.token.annotation,
            )
        },
        taggedUnionEnd: ($) => {
            $p.writer.nonToken(
                {
                    string: ``,
                },
            )
        },
        end: () => {
            $p.writer.nonToken({
                string: $.newline,
            })
        },
    }
}
