import { StackContext } from "../types/StackContext"
import * as grammar from "../../modules/grammar"

export type IAnnotatedHandler<InTokenAnnotation> = {
    objectBegin: ($: {
        token: grammar.OpenObjectToken<InTokenAnnotation>
        stackContext: StackContext
    }) => void
    property: ($: {
        propertyToken: grammar.SimpleStringToken<InTokenAnnotation>
        objectToken: grammar.OpenObjectToken<InTokenAnnotation>
        stackContext: StackContext
        isFirst: boolean
    }) => void
    objectEnd: ($: {
        openToken: grammar.OpenObjectToken<InTokenAnnotation>
        token: grammar.CloseObjectToken<InTokenAnnotation>
        stackContext: StackContext
        isEmpty: boolean
    }) => void
    arrayBegin: ($: {
        token: grammar.OpenArrayToken<InTokenAnnotation>
        stackContext: StackContext
    }) => void
    element: ($: {
        arrayToken: grammar.OpenArrayToken<InTokenAnnotation>
        stackContext: StackContext
        isFirst: boolean
    }) => void
    arrayEnd: ($: {
        openToken: grammar.OpenArrayToken<InTokenAnnotation>
        token: grammar.CloseArrayToken<InTokenAnnotation>
        stackContext: StackContext
        isEmpty: boolean
    }) => void
    simpleStringValue: ($: {
        token: grammar.SimpleStringToken<InTokenAnnotation>
        stackContext: StackContext
    }) => void
    multilineStringValue: ($: {
        token: grammar.MultilineStringToken<InTokenAnnotation>
        stackContext: StackContext
    }) => void
    taggedUnionBegin: ($: {
        token: grammar.TaggedUnionToken<InTokenAnnotation>
        stackContext: StackContext
    }) => void
    option: ($: {
        token: grammar.SimpleStringToken<InTokenAnnotation>
        stackContext: StackContext
    }) => void
    taggedUnionEnd: ($: {
        stackContext: StackContext
    }) => void
    end: (annotation: InTokenAnnotation) => void
}