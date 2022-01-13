import * as pr from "pareto-runtime"

export type TestRange = [number?, number?, number?, number?]
export type TestLocation = [number?, number?]

export type EventDefinition =
    | ["token", "simple string", string, pr.optional<TestRange>]
    | ["token", "multiline string", string, pr.optional<TestRange>]
    | ["token", "openarray", pr.optional<string>, pr.optional<TestRange>]
    | ["token", "closearray", pr.optional<TestRange>]
    | ["token", "openobject", pr.optional<string>, pr.optional<TestRange>]
    | ["token", "closeobject", pr.optional<TestRange>]
    | ["token", "opentaggedunion", pr.optional<TestRange>]
    | ["token", "linecomment", string, pr.optional<TestRange>]
    | ["token", "blockcomment", string, pr.optional<TestRange>]
    | ["parsingerror", string, pr.optional<TestRange>]
    | ["token", "schema data start", TestRange?]
    | ["end", pr.optional<TestLocation>]
    | ["instance data start"]
    | ["validationerror", string]
// [AnyEvent, string?, number?, number?]

export type TestDefinition = {
    readonly skipRoundTripCheck?: boolean
    readonly text: string
    readonly testHeaders?: boolean
    readonly testForLocation?: boolean
    readonly chunks?: string[]
    readonly events: EventDefinition[]
    readonly formattedText?: string
}

export type TestDefinitions = {
    readonly [key: string]: TestDefinition
}