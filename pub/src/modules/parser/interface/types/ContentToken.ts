import { AnnotatedToken } from "./AnnotatedToken"

export type Wrapping =
    | ["quote", { }]
    | ["apostrophe", { }]
    | ["none", { }]

export type SimpleStringData = {
    readonly "wrapping": Wrapping
    readonly "value": string
}

export type MultilineStringData = {
    readonly "lines": string[]
}

export type StructuralTokenType =
    | ["tagged union start", {}]
    | ["open shorthand group", {}]
    | ["close shorthand group", {}]
    | ["open verbose group", {}]
    | ["close verbose group", {}]
    | ["open dictionary", {}]
    | ["close dictionary", {}]
    | ["open list", {}]
    | ["close list", {}]

export type StructuralTokenData = {
    readonly "type": StructuralTokenType
}

export type ContentToken =
    | ["structural", StructuralTokenData]
    | ["simple string", SimpleStringData]
    | ["multiline string", MultilineStringData]

export type AnnotatedContentToken<EventAnnotation> = AnnotatedToken<ContentToken, EventAnnotation>