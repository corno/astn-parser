export * from "./Functions"

import { Functions } from "./Functions"

import { createDummyTreeHandler } from "./implementation/parser/dummyHandlers"
import { createFlattener } from "./implementation/serializer/createFlattener"
import { createStructureParser } from "./implementation/parser/createStructureParser"
import { createTokenizer } from "./implementation/tokenizer/createTokenizer"
import { createTreeParser } from "./implementation/parser/createTreeParser"
import { getEndLocationFromRange } from "./implementation/tokenizer/getEndLocationFromRange"
import { normalize } from "./implementation/serializer/normalizeText"
import { printLocation } from "./implementation/tokenizer/printLocation"
import { printParsingError } from "./implementation/parser/printTreeParserError"
import { printRange } from "./implementation/tokenizer/printRange"
import { printStructureError } from "./implementation/parser/printStructureError"
import { printTokenError } from "./implementation/tokenizer/printTokenError"
import { printTokenizerError } from "./implementation/tokenizer/printTokenizerError"
import { printTreeParserError } from "./implementation/parser/printTreeParserError"
import { runProgram } from "./implementation/etc/runProgram"
import { toJSON } from "./implementation/serializer/toJSON"
import { createAnnotater } from "./implementation/serializer/createAnnotater"

// export type Function<T> = () => {
//     return T
// }

export function init<Annotation>(): Functions<Annotation> {
    return {
        createAnnotater: createAnnotater(),
        createDummyTreeHandler: createDummyTreeHandler(),
        createFlattener: createFlattener(),
        createStructureParser: createStructureParser(),
        createTokenizer: createTokenizer(),
        createTreeParser: createTreeParser(),
        getEndLocationFromRange: getEndLocationFromRange(),
        normalize: normalize(),
        printLocation: printLocation(),
        printParsingError: printParsingError(),
        printRange: printRange(),
        printStructureError: printStructureError(),
        printTokenError: printTokenError(),
        printTokenizerError: printTokenizerError(),
        printTreeParserError: printTreeParserError(),
        runProgram: runProgram(),
        toJSON: toJSON(),
    }
}
