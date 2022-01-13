import * as pr from "pareto-runtime"
import * as grammar from "../modules/grammar"
import * as parser from "../modules/parser"
import * as astn from "../interface"

export type CreateAnnotater<EventAnnotation> = (
    handler: astn.IAnnotatedHandler<EventAnnotation>,
) => grammar.ITreeHandler<EventAnnotation>
export type CreateDummyTreeHandler<EventAnnotation> = () => grammar.ITreeHandler<EventAnnotation>
export type CreateFlattener<EventAnnotation> = (
    parser: grammar.IContentParser<EventAnnotation>,
) => grammar.ITreeHandler<EventAnnotation>
export type CreateStructureParser<EventAnnotation> = (
    $p: {
        handler: grammar.IStructureHandler<EventAnnotation>
        onError: astn.IStructureErrorHandler<EventAnnotation>
    }
) => parser.IStructureParser<EventAnnotation>
export type CreateTreeParserAndHandleErrors<EventAnnotation> = (
    $p: {
        handler: grammar.ITreeHandler<EventAnnotation> | null
        onError: ($: {
            error: astn.ParsingError
            annotation: EventAnnotation
        }) => void
    }
) => grammar.IContentParser<EventAnnotation>
export type CreateTokenizer = ($p: {
    parser: parser.IStructureParser<astn.TokenizerAnnotationData>
    onError: ($: {
        error: astn.TokenizerError
        range: astn.Range
    }) => void
}) => pr.IStreamConsumer<string, null>



export type PrintLocation = ($: astn.Location) => string
export type PrintRange = ($: astn.Range) => string
export type PrintParsingError = ($: astn.ParsingError) => string
export type PrintStructureError = ($: astn.StructureError) => string
export type PrintTokenError = ($: astn.TokenError) => string
export type PrintTokenizerError = ($: astn.TokenizerError) => string
export type PrintTreeParserError = ($: astn.TreeParserError) => string

export type CreateStreamConsumer = (
    write: (str: string) => void,
    onError: (str: string) => void,
) => pr.IStreamConsumer<string, null>
export type ToJSON = CreateStreamConsumer
export type Normalize = CreateStreamConsumer
export type GetEndLocationFromRange = (range: astn.Range) => astn.Location
export type RunProgram = (createStreamConsumer: CreateStreamConsumer) => void

export type Functions<EventAnnotation> = {
    createAnnotater: CreateAnnotater<EventAnnotation>
    createDummyTreeHandler: CreateDummyTreeHandler<EventAnnotation>
    createFlattener: CreateFlattener<EventAnnotation>
    createStructureParser: CreateStructureParser<EventAnnotation>
    createTokenizer: CreateTokenizer
    createTreeParser: CreateTreeParserAndHandleErrors<EventAnnotation>
    getEndLocationFromRange: GetEndLocationFromRange
    normalize: Normalize
    printLocation: PrintLocation
    printParsingError: PrintParsingError
    printRange: PrintRange
    printStructureError: PrintStructureError
    printTokenError: PrintTokenError
    printTokenizerError: PrintTokenizerError
    printTreeParserError: PrintTreeParserError
    runProgram: RunProgram
    toJSON: ToJSON
}
