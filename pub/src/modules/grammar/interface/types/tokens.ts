import { AnnotatedToken } from "./AnnotatedToken"

export type Wrapping =
    | ["quote", { }]
    | ["apostrophe", { }]
    | ["none", { }]

export type OpenObject = {
    readonly "type":
    | ["verbose group", {}]
    | ["dictionary", {}]
}

export type OpenArray = {
    readonly "type":
    | ["shorthand group", {}]
    | ["list", {}]
}

export type SimpleString = {
    readonly "wrapping": Wrapping
    readonly "value": string
}

export type MultilineString = {
    readonly "lines": string[]
}

export type CloseObject = { }

export type CloseArray = { }

export type TaggedUnion = { }

export type CloseArrayToken<EventAnnotation> = AnnotatedToken<CloseArray, EventAnnotation>

export type CloseObjectToken<EventAnnotation>  = AnnotatedToken<CloseObject, EventAnnotation>

export type OpenArrayToken<EventAnnotation> = AnnotatedToken<OpenArray, EventAnnotation>

export type OpenObjectToken<EventAnnotation> = AnnotatedToken<OpenObject, EventAnnotation>

export type SimpleStringToken<EventAnnotation> = AnnotatedToken<SimpleString, EventAnnotation>

export type MultilineStringToken<EventAnnotation> = AnnotatedToken<MultilineString, EventAnnotation>

export type TaggedUnionToken<EventAnnotation> = AnnotatedToken<TaggedUnion, EventAnnotation>