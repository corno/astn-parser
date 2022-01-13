import * as pt from "pareto-test"
import * as pr from "pareto-runtime"
import * as fs from "pareto-filesystem"
import * as astn from "../../../../pub"
import * as grammar from "../../../../pub/dist/modules/grammar"

import { ownJSONTests } from "../data/ownJSONTestset"
import { extensionTests } from "../data/ASTNTestSet"
import { EventDefinition, TestRange, TestDefinition, TestLocation } from "../interface/types/TestDefinition"

const astnImp = astn.init<astn.TokenizerAnnotationData>()

export function test(
    $i: {
        testContext: pt.TestContext,
        fsContext: fs.Directory,
    }
) {
    const selectedOwnJSONTests = pr.Objectkeys(ownJSONTests)
    const selectedExtensionTests = pr.Objectkeys(extensionTests)

    // const selectedJSONTests: string[] = []
    // const selectedExtensionTests: string[] = ["comment"]

    function createTestFunction(
        name: string,
        chunks: string[],
        test: TestDefinition,
        testset: pt.TestSet,
    ) {

        const actualEvents: EventDefinition[] = []

        function getRange(mustCheck: boolean | undefined, range: astn.Range): TestRange | null {
            if (mustCheck) {
                const end = astnImp.getEndLocationFromRange(range)
                return [
                    range.start.line,
                    range.start.column,
                    end.line,
                    end.column,
                ]
            } else {
                return null
            }
        }
        function getLocation(mustTest: boolean | undefined, location: astn.Location): TestLocation | null {
            if (mustTest) {
                return [
                    location.line,
                    location.column,
                ]
            } else {
                return null
            }
        }

        function createLogger(): grammar.ITreeHandler<astn.TokenizerAnnotationData> {
            return astnImp.createFlattener(
                {
                    onEnd: (annotation) => {
                        actualEvents.push(["end", getLocation(test.testForLocation, astnImp.getEndLocationFromRange(annotation.range))])

                    },
                    onToken: ($) => {
                        const annotation = $.annotation
                        switch ($.token[0]) {
                            case "structural": {
                                pr.cc($.token[1], ($) => {
                                    switch ($.type[0]) {
                                        case "close dictionary":
                                            actualEvents.push(["token", "closeobject", getRange(test.testForLocation, annotation.range)])
                                            break
                                        case "close list":
                                            actualEvents.push(["token", "closearray", getRange(test.testForLocation, annotation.range)])

                                            break
                                        case "close shorthand group":
                                            actualEvents.push(["token", "closearray", getRange(test.testForLocation, annotation.range)])
                                            break
                                        case "close verbose group":
                                            actualEvents.push(["token", "closeobject", getRange(test.testForLocation, annotation.range)])
                                            break

                                        case "open dictionary":
                                            actualEvents.push(["token", "openobject", "{", getRange(test.testForLocation, annotation.range)])
                                            break
                                        case "open list":
                                            actualEvents.push(["token", "openarray", "[", getRange(test.testForLocation, annotation.range)])
                                            break
                                        case "open shorthand group":
                                            actualEvents.push(["token", "openarray", "<", getRange(test.testForLocation, annotation.range)])
                                            break
                                        case "open verbose group":
                                            actualEvents.push(["token", "openobject", "(", getRange(test.testForLocation, annotation.range)])
                                            break
                                        case "tagged union start":
                                            actualEvents.push(["token", "opentaggedunion", getRange(test.testForLocation, annotation.range)])
                                            break
                                        default:
                                            pr.au($.type[0])
                                    }
                                })
                                break
                            }
                            case "simple string": {
                                const data = $.token[1]
                                actualEvents.push(["token", "simple string", data.value, getRange(test.testForLocation, annotation.range)])
                                break
                            }
                            case "multiline string": {
                                const data = $.token[1]
                                actualEvents.push(["token", "multiline string", data.lines.join("\\n"), getRange(test.testForLocation, annotation.range)])
                                break
                            }
                            default:
                                pr.au($.token[0])
                        }
                    },
                }
            )

        }
        const onError: astn.IStructureErrorHandler<astn.TokenizerAnnotationData> = ($) => {
            actualEvents.push(["parsingerror", astnImp.printParsingError($.error), getRange(test.testForLocation, $.annotation.range)])
        }

        const spt = astnImp.createTokenizer({
            parser: astnImp.createStructureParser({
                handler: {
                    onNoInternalSchema: () => { },
                    onEmbeddedSchema: (_schemaSchemaName) => {
                        actualEvents.push(["token", "schema data start"])
                        return createLogger()
                    },
                    onSchemaReference: ($$) => {
                        actualEvents.push(["token", "schema data start"])
                        actualEvents.push(["token", "simple string", $$.token.token.value, getRange(test.testForLocation, $$.token.annotation.range)])
                    },
                    onBody: () => {
                        if (test.testHeaders) {
                            actualEvents.push(["instance data start"])
                        }
                        const x = astnImp.createTreeParser({
                            handler: createLogger(),
                            onError: onError,
                        })
                        return x
                    },
                },
                onError: onError,
            }),
            onError: ($) => {
                actualEvents.push(["parsingerror", astnImp.printTokenizerError($.error), getRange(test.testForLocation, $.range)])
            },
        })
        chunks.forEach(($) => {
            spt.onData($)
        })
        spt.onEnd(null)

        testset.testString(
            {
                testName: name,
                expected: JSON.stringify(test.events),
                actual: JSON.stringify(actualEvents),
            }
        )
        //const expectedFormattedText = test.formattedText ? test.formattedText : test.text

        // if (!test.skipRoundTripCheck) {
        //     chai.assert.equal("roundtrip:\n" + out.join(""), "roundtrip:\n" + chunks.join("")
        //         .replace(/\r\n/g, "\n")
        //         .replace(/\n\r/g, "\n")
        //         .replace(/\r/g, "\n")
        //     )
        // }
        // chai.assert.equal(
        //     "formatted:\n" + formattedText
        //         .replace(/\r\n/g, "\n")
        //         .replace(/\n\r/g, "\n")
        //         .replace(/\r/g, "\n"),
        //     "formatted:\n" + expectedFormattedText
        // )
    }

    $i.testContext.subset('astn', ($i) => {
        $i.subset('#strictJSON', ($i) => {
            selectedOwnJSONTests.forEach((key) => {
                const test = ownJSONTests[key]
                $i.subset(
                    key,
                    ($i) => {
                        createTestFunction(
                            'should be able to parse -> one chunk',
                            [test.text],
                            test,
                            $i,
                        )
                        createTestFunction(
                            'should be able to parse -> every character is a chunck',

                            test.text.split(''),
                            test,
                            $i,
                        )
                    }
                )
            })
        })
        $i.subset('#extensions', ($i) => {
            selectedExtensionTests.forEach((key) => {
                const test = extensionTests[key]
                $i.subset(
                    key,
                    ($i) => {
                        createTestFunction(
                            'should be able to parse -> one chunk',
                            [test.text],
                            test,
                            $i,
                        )
                        createTestFunction(
                            'should be able to parse -> every character is a chunck',

                            test.text.split(''),
                            test,
                            $i,
                        )
                    }
                )
            })
        })

        $i.subset('#pre-chunked', ($i) => {
            selectedOwnJSONTests.forEach((key) => {
                const test = ownJSONTests[key]
                if (!test.chunks) {
                    return
                }
                createTestFunction(
                    '[' + key + '] should be able to parse pre-chunked',
                    test.chunks,
                    test,
                    $i,
                )
            })
        })
    })

}