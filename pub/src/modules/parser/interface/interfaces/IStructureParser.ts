import { AnnotatedStructureToken } from "../types/StructureToken"

export type IStructureParser<EventAnnotation> = {
    onToken(token: AnnotatedStructureToken<EventAnnotation>): void
    onEnd(annotation: EventAnnotation): void
}
