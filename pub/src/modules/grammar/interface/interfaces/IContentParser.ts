import { AnnotatedContentToken } from "../../../parser/interface/types/ContentToken"

export type IContentParser<EventAnnotation> = {
    onToken(token: AnnotatedContentToken<EventAnnotation>): void
    onEnd(annotation: EventAnnotation): void
}
