import * as grammar from "../types/tokens"


export type IObjectHandler<EventAnnotation> = {
    property: (
        $: {
            token: grammar.SimpleStringToken<EventAnnotation>
        }
    ) => IRequiredValueHandler<EventAnnotation>
    onEnd: ($: {
        token: grammar.CloseObjectToken<EventAnnotation>
    }) => void
}

export type IArrayHandler<EventAnnotation> = {
    element: (
        $: {}
    ) => IValueHandler<EventAnnotation>
    onEnd: ($: {
        token: grammar.CloseArrayToken<EventAnnotation>
    }) => void
}

export type ITaggedUnionHandler<EventAnnotation> = {
    option: OnOption<EventAnnotation>
    missingOption: () => void
    end: ($: {}) => void
}

export type OnObject<EventAnnotation> = ($: {
    token: grammar.OpenObjectToken<EventAnnotation>
}) => IObjectHandler<EventAnnotation>

export type OnArray<EventAnnotation> = ($: {
    token: grammar.OpenArrayToken<EventAnnotation>
}) => IArrayHandler<EventAnnotation>

export type OnSimpleString<EventAnnotation> = ($: {
    token: grammar.SimpleStringToken<EventAnnotation>
}) => void

export type OnMultilineString<EventAnnotation> = ($: {
    token: grammar.MultilineStringToken<EventAnnotation>
}) => void

export type OnTaggedUnion<EventAnnotation> = ($: {
    token: grammar.TaggedUnionToken<EventAnnotation>
}) => ITaggedUnionHandler<EventAnnotation>

export type OnOption<EventAnnotation> = ($: {
    token: grammar.SimpleStringToken<EventAnnotation>
}) => IRequiredValueHandler<EventAnnotation>

export type OnMissing = () => void

export type IRequiredValueHandler<EventAnnotation> = {
    exists: IValueHandler<EventAnnotation>
    missing: OnMissing
}

export type IValueHandler<EventAnnotation> = {
    object: OnObject<EventAnnotation>
    array: OnArray<EventAnnotation>
    multilineString: OnMultilineString<EventAnnotation>
    simpleString: OnSimpleString<EventAnnotation>
    taggedUnion: OnTaggedUnion<EventAnnotation>
}

export type ITreeHandler<EventAnnotation> = {
    root: IRequiredValueHandler<EventAnnotation>
    onEnd: (annotation: EventAnnotation) => void
}
