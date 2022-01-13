import { ParsingError } from "../types/TreeParserError"

export type IStructureErrorHandler<EventAnnotation> = ($: {
    error: ParsingError
    annotation: EventAnnotation
}) => void