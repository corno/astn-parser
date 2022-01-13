import { StructureError } from "./StructureError"

export type TreeParserError =
    | ["missing array close", {}]
    | ["missing key", {}]
    | ["missing object close", {}]
    | ["missing option", {}]
    | ["missing property value", {}]
    | ["missing tagged union option and value", {}]
    | ["missing tagged union value", {}]
    | ["unexpected data after end", {}]
    | ["unexpected end of array", {}]
    | ["unexpected end of object", {}]
    | ["unexpected end of text", {
        readonly "still in":
        | ["array", {}]
        | ["object", {}]
        | ["tagged union", {}]
    }]

export type ParsingError =
    | ["tree", TreeParserError]
    | ["structure", StructureError]