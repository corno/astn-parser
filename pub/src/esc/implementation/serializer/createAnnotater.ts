import * as pr from "pareto-runtime"

import * as astn from "../../../interface"
// import * as etc from "../../interfaces/etc"
import * as grammar from "../../../modules/grammar"
import { CreateAnnotater } from "../../Functions"
// import * as tokenLevel from "../../interfaces/tokenLevel"
// import * as typed from "../../interfaces/typed"
// import * as typedTokenize from "../../interfaces/typedTokenize"

export function createAnnotater<InTokenAnnotation>(): CreateAnnotater<InTokenAnnotation> {
    return (handler) => {

        let dictionaryDepth = 0
        let verboseGroupDepth = 0
        let listDepth = 0
        let shorthandGroupDepth = 0
        let taggedUnionDepth = 0
        function createStackContext(): astn.StackContext {
            return {
                dictionaryDepth: dictionaryDepth,
                verboseGroupDepth: verboseGroupDepth,
                listDepth: listDepth,
                shorthandGroupDepth: shorthandGroupDepth,
                taggedUnionDepth: taggedUnionDepth,
            }
        }

        function createDecoratedValue(
        ): grammar.IValueHandler<InTokenAnnotation> {
            return {
                object: ($) => {
                    switch ($.token.token.type[0]) {
                        case "dictionary": {
                            dictionaryDepth += 1
                            break
                        }
                        case "verbose group": {
                            verboseGroupDepth += 1
                            break
                        }
                        default:
                            pr.au($.token.token.type[0])
                    }
                    handler.objectBegin({
                        token: $.token,
                        stackContext: createStackContext(),
                    })
                    let foundProperties = false
                    return {
                        property: ($$) => {
                            const wasFirst = !foundProperties
                            foundProperties = true
                            handler.property({
                                propertyToken: $$.token,
                                objectToken: $.token,
                                stackContext: createStackContext(),
                                isFirst: wasFirst,
                            })
                            return createDecoratedRequiredValue()
                        },
                        onEnd: ($$) => {
                            switch ($.token.token.type[0]) {
                                case "dictionary": {
                                    dictionaryDepth -= 1
                                    break
                                }
                                case "verbose group": {
                                    verboseGroupDepth -= 1
                                    break
                                }
                                default:
                                    pr.au($.token.token.type[0])
                            }
                            handler.objectEnd({
                                openToken: $.token,
                                token: $$.token,
                                isEmpty: !foundProperties,
                                stackContext: createStackContext(),
                            })
                        },
                    }
                },
                array: ($) => {
                    switch ($.token.token.type[0]) {
                        case "list": {
                            listDepth += 1
                            break
                        }
                        case "shorthand group": {
                            shorthandGroupDepth += 1
                            break
                        }
                        default:
                            pr.au($.token.token.type[0])
                    }handler.arrayBegin({
                        token: $.token,
                        stackContext: createStackContext(),
                    })
                    let foundElements = false
                    return {
                        element: ($$) => {
                            const wasFirst = !foundElements
                            foundElements = true
                            handler.element({
                                arrayToken: $.token,
                                stackContext: createStackContext(),
                                isFirst: wasFirst,
                            })
                            return createDecoratedValue()
                        },
                        onEnd: ($$) => {
                            switch ($.token.token.type[0]) {
                                case "list": {
                                    listDepth -= 1
                                    break
                                }
                                case "shorthand group": {
                                    shorthandGroupDepth -= 1
                                    break
                                }
                                default:
                                    pr.au($.token.token.type[0])
                            }
                            handler.arrayEnd({
                                openToken: $.token,
                                token: $$.token,
                                stackContext: createStackContext(),
                                isEmpty: !foundElements,
                            })
                        },
                    }
                },
                simpleString: ($) => {
                    handler.simpleStringValue({
                        token: $.token,
                        stackContext: createStackContext(),
                    })
                },
                multilineString: ($) => {
                    handler.multilineStringValue({
                        token: $.token,
                        stackContext: createStackContext(),
                    })
                },
                taggedUnion: ($) => {
                    taggedUnionDepth += 1
                    handler.taggedUnionBegin({
                        token: $.token,
                        stackContext: createStackContext(),
                    })
                    return {
                        option: ($$) => {
                            handler.option({
                                token: $$.token,
                                stackContext: createStackContext(),
                            })
                            return createDecoratedRequiredValue()
                        },
                        missingOption: () => { },
                        end: ($$) => {
                            taggedUnionDepth -= 1
                            handler.taggedUnionEnd({
                                stackContext: createStackContext(),
                            })
                        },
                    }
                },
            }
        }

        function createDecoratedRequiredValue(
        ): grammar.IRequiredValueHandler<InTokenAnnotation> {
            return {
                exists: createDecoratedValue(),
                missing: () => { },
            }
        }
        return {
            root: createDecoratedRequiredValue(),
            onEnd: (annotation) => {
                handler.end(annotation)
            },
        }
    }
}