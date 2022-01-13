import * as pr from "pareto-runtime"


import * as grammar from "../../../modules/grammar"
import * as parser from "../../../modules/parser"
import { CreateFlattener } from "../../Functions"


export function createFlattener<EventAnnotation>(
): CreateFlattener<EventAnnotation> {
    return (parser) => {
        function createLoggingRequiredValueHandler(
        ): grammar.IRequiredValueHandler<EventAnnotation> {
            return {
                exists: createValueHandler(),
                missing: () => { },
            }
        }

        function onEvent(
            event: parser.ContentToken,
            annotation: EventAnnotation,
        ) {
            parser.onToken({
                annotation: annotation,
                token: event,
            })
        }

        function doSimpleString($: grammar.SimpleStringToken<EventAnnotation>) {
            onEvent(
                ["simple string", {
                    value: $.token.value,
                    wrapping: ((): grammar.Wrapping => {
                        switch ($.token.wrapping[0]) {
                            case "apostrophe":
                                return ["apostrophe", {}]
                            case "none":
                                return ["none", {}]
                            case "quote":
                                return ["quote", {}]
                            default:
                                return pr.au($.token.wrapping[0])
                        }
                    })(),
                }],
                $.annotation,
            )
        }
        function createValueHandler(
        ): grammar.IValueHandler<EventAnnotation> {
            return {
                array: ($) => {
                    const open$ = $
                    onEvent(
                        ["structural", {
                            "type": ((): parser.StructuralTokenType => {
                                switch ($.token.token.type[0]) {
                                    case "list":
                                        return ["open list", {}]
                                    case "shorthand group":
                                        return ["open shorthand group", {}]
                                    default:
                                        return pr.au($.token.token.type[0])
                                }
                            })(),
                        }],
                        $.token.annotation
                    )
                    return {
                        element: () => {
                            return createValueHandler()
                        },
                        onEnd: ($) => {
                            onEvent(
                                ["structural", {
                                    "type": ((): parser.StructuralTokenType => {
                                        switch (open$.token.token.type[0]) {
                                            case "list":
                                                return ["close list", {}]
                                            case "shorthand group":
                                                return ["close shorthand group", {}]
                                            default:
                                                return pr.au(open$.token.token.type[0])
                                        }
                                    })(),
                                }],
                                $.token.annotation
                            )
                        },
                    }
                },
                object: ($) => {
                    const open$ = $
                    onEvent(
                        ["structural", {
                            "type": ((): parser.StructuralTokenType => {
                                switch ($.token.token.type[0]) {
                                    case "dictionary":
                                        return ["open dictionary", {}]
                                    case "verbose group":
                                        return ["open verbose group", {}]
                                    default:
                                        return pr.au($.token.token.type[0])
                                }
                            })(),
                        }],
                        $.token.annotation
                    )

                    return {
                        property: ($) => {
                            doSimpleString($.token)
                            return createLoggingRequiredValueHandler()
                        },
                        onEnd: ($) => {
                            onEvent(
                                ["structural", {
                                    "type": ((): parser.StructuralTokenType => {
                                        switch (open$.token.token.type[0]) {
                                            case "dictionary":
                                                return ["close dictionary", {}]
                                            case "verbose group":
                                                return ["close verbose group", {}]
                                            default:
                                                return pr.au(open$.token.token.type[0])
                                        }
                                    })(),
                                }],
                                $.token.annotation
                            )
                        },
                    }
                },
                simpleString: ($) => {
                    doSimpleString($.token)
                },
                multilineString: ($) => {
                    onEvent(
                        ["multiline string", {
                            lines: $.token.token.lines.map(($) => {
                                return $
                            }),
                        }],
                        $.token.annotation,
                    )
                },
                taggedUnion: ($) => {
                    onEvent(
                        ["structural", {
                            "type": ["tagged union start", {}],
                        }],
                        $.token.annotation
                    )
                    return {
                        option: ($) => {
                            doSimpleString($.token)
                            return createLoggingRequiredValueHandler()
                        },
                        missingOption: () => { },
                        end: () => { },
                    }
                },
            }
        }
        return {
            root: createLoggingRequiredValueHandler(),
            onEnd: (annotation) => {
                parser.onEnd(annotation)
            },
        }
    }
}