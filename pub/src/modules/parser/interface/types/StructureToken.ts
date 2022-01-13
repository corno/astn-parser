import { AnnotatedToken } from "./AnnotatedToken"
import { ContentToken } from "./ContentToken"

export type StructureToken =
    | ["header start", {}]
    | ["content", ContentToken]

export type AnnotatedStructureToken<EventAnnotation> = AnnotatedToken<StructureToken, EventAnnotation>