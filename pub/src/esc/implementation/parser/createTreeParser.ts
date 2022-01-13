import * as pr from "pareto-runtime"

import * as grammar from "../../../modules/grammar"
import * as astn from "../../../interface"
import { CreateTreeParserAndHandleErrors } from "../../Functions"

interface ITreeParser<EventAnnotation> {
    closeArray(
        token: grammar.CloseArrayToken<EventAnnotation>,
    ): void
    closeObject(
        token: grammar.CloseObjectToken<EventAnnotation>,
    ): void
    openArray(
        token: grammar.OpenArrayToken<EventAnnotation>,
    ): void
    openObject(
        token: grammar.OpenObjectToken<EventAnnotation>,
    ): void
    simpleString(
        token: grammar.SimpleStringToken<EventAnnotation>,
    ): void
    multilineString(
        token: grammar.MultilineStringToken<EventAnnotation>,
    ): void
    taggedUnion(
        token: grammar.TaggedUnionToken<EventAnnotation>,
    ): void
    forceEnd(
        annotation: EventAnnotation
    ): void
}

export function createTreeParser<EventAnnotation>(): CreateTreeParserAndHandleErrors<EventAnnotation> {
    return ($p) => {
        let done = false
        const currentTreeHandlers: grammar.ITreeHandler<EventAnnotation>[] = []
        if ($p.handler !== null) {
            currentTreeHandlers.push($p.handler)
        }


        function createTreeParserImp(
        ): ITreeParser<EventAnnotation> {
            function raiseError(error: astn.TreeParserError, annotation: EventAnnotation) {
                $p.onError({
                    error: ["tree", error],
                    annotation: annotation,
                })
            }
            type TaggedUnionState =
                | ["expecting option", {}]
                | ["expecting value", grammar.IRequiredValueHandler<EventAnnotation>[]]

            type ObjectContext = {
                type:
                | ["dictionary", {}]
                | ["verbose group", {}]
                readonly objectHandlers: grammar.IObjectHandler<EventAnnotation>[]
                propertyHandlers: null | grammar.IRequiredValueHandler<EventAnnotation>[]
            }

            type ArrayContext = {
                type:
                | ["list", {}]
                | ["shorthand group", {}]
                foundElements: boolean
                readonly arrayHandlers: grammar.IArrayHandler<EventAnnotation>[]
            }

            type TaggedUnionContext = {
                readonly handlers: grammar.ITaggedUnionHandler<EventAnnotation>[]
                state: TaggedUnionState
            }

            type ContextType =
                | ["object", ObjectContext]
                | ["array", ArrayContext]
                | ["taggedunion", TaggedUnionContext]
            type Processing = {
                currentContext: ContextType
                stack: ContextType[]
            }
            let state: Processing | null = null

            function closeObjectImp(
                $: ObjectContext,
                annotation: EventAnnotation,
                processing: Processing,
            ): void {
                pop(
                    annotation,
                    processing,
                )
            }
            function closeArrayImp(
                $: ArrayContext,
                annotation: EventAnnotation,
                processing: Processing,
            ): void {
                pop(
                    annotation,
                    processing,
                )
            }
            function forceTaggedUnionClose(
                context: TaggedUnionContext,
                annotation: EventAnnotation,
                processing: Processing,

            ) {
                if (context.state[0] === "expecting value") {
                    context.state[1].forEach(($) => {
                        $.missing()
                    })
                    raiseError(["missing tagged union value", {}], annotation)
                } else {
                    context.handlers.forEach(($) => {
                        $.missingOption()
                    })
                    raiseError(["missing tagged union option and value", {}], annotation)
                }
                closeTaggedUnionImp(
                    annotation,
                    processing,
                )
            }
            function closeTaggedUnionImp(
                annotation: EventAnnotation,
                processing: Processing,
            ): void {
                pop(
                    annotation,
                    processing,
                )
            }
            function pop(
                annotation: EventAnnotation,
                processing: Processing,
            ): void {
                const previousContext = processing.stack.pop()
                if (previousContext === undefined) {
                    //raiseError(["unexpected end of text", { "still in": [stillin] }], annotation)
                    state = null
                } else {
                    if (previousContext[0] === "taggedunion") {
                        const taggedUnion = previousContext[1]
                        if (taggedUnion.state[0] !== "expecting value") {
                            raiseError(["missing option", {}], annotation)
                        } else {
                            taggedUnion.handlers.forEach(($) => {
                                $.end({
                                    annotation: null,
                                })
                            })
                        }
                    }
                    processing.currentContext = previousContext
                }
                wrapupValue(annotation)
            }
            function push(
                newContext: ContextType,
            ): void {
                if (state === null) {
                    state = {
                        currentContext: newContext,
                        stack: [],
                    }
                } else {
                    state.stack.push(state.currentContext)
                    state.currentContext = newContext
                }
            }
            function wrapupValue(
                annotation: EventAnnotation,
            ): void {
                if (state === null) {
                    done = true
                    currentTreeHandlers.forEach(($) => {
                        $.onEnd(annotation)
                    })
                } else {
                    switch (state.currentContext[0]) {
                        case "array": {
                            break
                        }
                        case "object": {
                            state.currentContext[1].propertyHandlers = null
                            break
                        }
                        case "taggedunion": {
                            if (state.currentContext[1].state[0] !== "expecting value") {
                                pr.logError("HANDLE UNEXPECTED TAGGED UNION VALUE END")
                            }
                            closeTaggedUnionImp(
                                annotation,
                                state,
                            )
                            break
                        }
                        default:
                            return pr.au(state.currentContext[0])
                    }
                }
            }
            function getValueHandler(annotation: EventAnnotation): grammar.IValueHandler<EventAnnotation>[] {
                if (state === null) {
                    if (done) {
                        raiseError(["unexpected data after end", {}], annotation)
                        return []
                    }
                    return currentTreeHandlers.map(($) => {
                        return $.root.exists
                    })
                } else {
                    switch (state.currentContext[0]) {
                        case "array": {
                            const $ = state.currentContext[1]
                            $.foundElements = true
                            return state.currentContext[1].arrayHandlers.map(($) => {
                                return $.element({
                                    annotation: null,
                                })
                            })
                        }
                        case "object": {
                            if (state.currentContext[1].propertyHandlers === null) {
                                raiseError(["missing key", {}], annotation)
                                return []
                            } else {
                                return state.currentContext[1].propertyHandlers.map(($) => {
                                    return $.exists
                                })
                            }
                        }
                        case "taggedunion": {
                            if (state.currentContext[1].state[0] !== "expecting value") {
                                raiseError(["missing option", {}], annotation)
                                return []
                            } else {
                                return state.currentContext[1].state[1].map(($) => {
                                    return $.exists
                                })
                            }
                        }
                        default:
                            return pr.au(state.currentContext[0])
                    }
                }
            }
            return {
                forceEnd: (endAnnotation) => {
                    unwindLoop: while (true) {
                        if (state === null) {

                            if (currentTreeHandlers !== null) {
                                currentTreeHandlers.forEach(($) => {
                                    $.root.missing()
                                })
                                done = true
                            }
                            break unwindLoop
                        }
                        switch (state.currentContext[0]) {
                            case "array": {
                                const $ = state.currentContext[1]
                                raiseError(["unexpected end of text", { "still in": ["array", {}] }], endAnnotation)
                                closeArrayImp(
                                    $,
                                    endAnnotation,
                                    state,
                                )
                                break
                            }
                            case "object": {
                                const $ = state.currentContext[1]
                                if ($.propertyHandlers !== null) {
                                    $.propertyHandlers.forEach(($) => {
                                        $.missing()
                                    })
                                    $.propertyHandlers = null
                                }
                                raiseError(["unexpected end of text", { "still in": ["object", {}] }], endAnnotation)
                                closeObjectImp(
                                    $,
                                    endAnnotation,
                                    state,
                                )
                                break
                            }
                            case "taggedunion": {
                                const $ = state.currentContext[1]
                                switch ($.state[0]) {
                                    case "expecting option": {
                                        //const $$ = $.state[1]
                                        $.handlers.forEach(($) => {
                                            $.missingOption()
                                        })
                                        break
                                    }
                                    case "expecting value": {
                                        const $$ = $.state[1]
                                        //option not yet parsed
                                        $$.forEach(($) => {
                                            $.missing()
                                        })
                                        break
                                    }
                                    default:
                                        pr.au($.state[0])
                                }
                                raiseError(["unexpected end of text", { "still in": ["tagged union", {}] }], endAnnotation)
                                closeTaggedUnionImp(
                                    endAnnotation,
                                    state,
                                )

                                break
                            }
                            default:
                                pr.au(state.currentContext[0])
                        }
                    }
                },
                taggedUnion: ($$) => {
                    if (state === null) {
                        state = {
                            stack: [],
                            currentContext: ["taggedunion", {
                                handlers: getValueHandler($$.annotation).map(($) => {
                                    return $.taggedUnion({
                                        token: $$,
                                    })
                                }),
                                state: ["expecting option", {}],
                            }],
                        }
                    } else {
                        push(
                            ["taggedunion", {
                                handlers: getValueHandler($$.annotation).map(($) => {
                                    return $.taggedUnion({
                                        token: $$,
                                    })
                                }),
                                state: ["expecting option", {}],
                            }],
                        )
                    }
                },
                multilineString: ($$) => {
                    getValueHandler($$.annotation).forEach(($) => {
                        $.multilineString({
                            token: $$,
                        })
                    })
                    wrapupValue(
                        $$.annotation,
                    )
                },
                simpleString: ($$$) => {
                    function onStringValue(
                    ): void {
                        getValueHandler($$$.annotation).forEach(($) => {
                            $.simpleString({
                                token: $$$,
                            })
                        })
                        wrapupValue(
                            $$$.annotation,
                        )
                    }
                    if (state === null) {
                        onStringValue()
                    } else {
                        switch (state.currentContext[0]) {
                            case "array": {
                                onStringValue()
                                break
                            }
                            case "object": {
                                const $$ = state.currentContext[1]
                                if ($$.propertyHandlers === null) {
                                    $$.propertyHandlers = $$.objectHandlers.map(($) => {
                                        return $.property({
                                            token: $$$,
                                        })
                                    })
                                    break
                                } else {
                                    onStringValue()
                                    break
                                }
                            }
                            case "taggedunion": {
                                const $$ = state.currentContext[1]
                                switch ($$.state[0]) {
                                    case "expecting option": {
                                        $$.state = ["expecting value", $$.handlers.map(($) => {
                                            return $.option({
                                                token: $$$,
                                            })
                                        })]
                                        break
                                    }
                                    case "expecting value": {
                                        onStringValue()
                                        break
                                    }
                                    default:
                                        pr.au($$.state[0])
                                }
                                break
                            }
                            default:
                                pr.au(state.currentContext[0])
                        }
                    }
                },
                openObject: ($$) => {
                    push(["object", {
                        type: $$.token.type[0] === "verbose group" ? ["verbose group", {}] : ["dictionary", {}],
                        objectHandlers: getValueHandler($$.annotation).map(($) => {
                            return $.object({
                                token: $$,
                            })
                        }),
                        propertyHandlers: null,
                    }])
                },
                openArray: ($$) => {
                    push(["array", {
                        foundElements: false,
                        type: $$.token.type[0] === "shorthand group" ? ["shorthand group", {}] : ["list", {}],
                        arrayHandlers: getValueHandler($$.annotation).map(($) => {
                            return $.array({
                                token: $$,
                            })
                        }),
                    }])
                },
                closeObject: ($$) => {
                    unwindLoop: while (true) {
                        if (state === null) {
                            break unwindLoop
                        }
                        switch (state.currentContext[0]) {
                            case "array": {
                                const $ = state.currentContext[1]
                                raiseError(["missing array close", {}], $$.annotation)
                                closeArrayImp(
                                    $,
                                    $$.annotation,
                                    state,
                                )
                                break
                            }
                            case "object": {

                                break unwindLoop
                                break
                            }
                            case "taggedunion": {
                                const $ = state.currentContext[1]
                                forceTaggedUnionClose(
                                    $,
                                    $$.annotation,
                                    state,
                                )
                                break
                            }
                            default:
                                pr.au(state.currentContext[0])
                        }
                    }
                    if (state === null || state.currentContext[0] !== "object") {
                        raiseError(["unexpected end of object", {}], $$.annotation)
                    } else {

                        const $$$ = state.currentContext[1]
                        if ($$$.propertyHandlers !== null) {
                            //was in the middle of processing a property
                            //the key was parsed, but the data was not
                            raiseError(["missing property value", {}], $$.annotation)
                            $$$.propertyHandlers.forEach(($) => {
                                $.missing()
                            })
                            $$$.propertyHandlers = null
                        }
                        $$$.objectHandlers.forEach(($) => {
                            $.onEnd({
                                token: $$,
                            })
                        })
                        closeObjectImp(
                            $$$,
                            $$.annotation,
                            state,
                        )
                    }
                },
                closeArray: ($$) => {
                    unwindLoop: while (true) {
                        if (state === null) {
                            break unwindLoop
                        }
                        switch (state.currentContext[0]) {
                            case "array": {
                                break unwindLoop
                                break
                            }
                            case "object": {
                                const $$2 = state.currentContext[1]
                                raiseError(["missing object close", {}], $$.annotation)
                                closeObjectImp(
                                    $$2,
                                    $$.annotation,
                                    state,
                                )
                                break
                            }
                            case "taggedunion": {
                                forceTaggedUnionClose(
                                    state.currentContext[1],
                                    $$.annotation,
                                    state,
                                )
                                break
                            }
                            default:
                                pr.au(state.currentContext[0])
                        }
                    }
                    if (state === null || state.currentContext[0] !== "array") {
                        raiseError(["unexpected end of array", {}], $$.annotation)
                    } else {
                        const $$$ = state.currentContext[1]
                        switch ($$$.type[0]) {
                            case "list": {
                                break
                            }
                            case "shorthand group": {

                                break
                            }
                            default:
                                pr.au($$$.type[0])
                        }
                        $$$.arrayHandlers.forEach(($) => {
                            $.onEnd({
                                token: $$,
                            })
                        })
                        closeArrayImp(
                            $$$,
                            $$.annotation,
                            state,
                        )
                    }
                },
            }
        }
        const parser = createTreeParserImp(
        )
        return {
            onToken: (token) => {
                switch (token.token[0]) {
                    case "structural": {
                        const punctuation = token.token[1]
                        function createToken<Token>(dta: Token): grammar.AnnotatedToken<Token, EventAnnotation> {
                            return {
                                token: dta,
                                annotation: token.annotation,
                            }
                        }
                        switch (punctuation.type[0]) {
                            case "close shorthand group":
                                parser.closeArray(createToken({}))
                                break
                            case "close list":
                                parser.closeArray(createToken({}))
                                break
                            case "open shorthand group":
                                parser.openArray(createToken({
                                    type: ["shorthand group", {}],
                                }))
                                break
                            case "open list":
                                parser.openArray(createToken({
                                    type: ["list", {}],
                                }))
                                break
                            case "close dictionary":
                                parser.closeObject(createToken({}))
                                break
                            case "close verbose group":
                                parser.closeObject(createToken({}))
                                break
                            case "open dictionary":
                                parser.openObject(createToken({
                                    type: ["dictionary", {}],
                                }))
                                break
                            case "open verbose group":
                                parser.openObject(createToken({
                                    type: ["verbose group", {}],
                                }))
                                break
                            case "tagged union start":
                                parser.taggedUnion(createToken({}))
                                break
                            default:
                                pr.au(punctuation.type[0])
                        }
                        break
                    }
                    case "simple string": {
                        pr.cc(token.token[1], ($) => {
                            parser.simpleString(
                                {
                                    annotation: token.annotation,
                                    token: {
                                        value: $.value,
                                        wrapping: $.wrapping,
                                    },
                                },
                            )
                        })

                        break
                    }
                    case "multiline string": {
                        pr.cc(token.token[1], ($) => {
                            parser.multilineString(
                                {
                                    annotation: token.annotation,
                                    token: {
                                        lines: $.lines,
                                    },
                                },
                            )
                        })
                        break
                    }

                    default:
                        pr.au(token.token[0])
                }
            },
            onEnd: (annotation) => {
                parser.forceEnd(annotation)
            },
        }
    }
}