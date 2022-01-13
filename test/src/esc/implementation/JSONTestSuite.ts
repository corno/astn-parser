import * as pr from "pareto-runtime"
import * as pt from "pareto-test"
import * as fs from "pareto-filesystem"
import * as astn from "../../../../pub"

const astnImp = astn.init<astn.TokenizerAnnotationData>()

export function test(
    $i: {
        testContext: pt.TestContext,
        fsContext: fs.Directory,
    }
) {

    const directory = $i.fsContext
    function doTest(
        $: {
            name: string,
            path: string,
            expectErrors?: boolean,
        },
        $i: pt.TestSet,
    ) {
        const testData = $
        const pathx = $.path
        $i.subset($.name, ($i) => {
            const test = $i
            directory.readDirWithFileTypes(
                {
                    path: "JSONTestSuite/" + pathx,
                },
                {
                    onFile: ($, $i) => {
                        const absolutePath = $.absolutePath
                        $i.read(
                            ($) => {
                                let foundErrors: string[] = []
                                const spt = astnImp.createTokenizer({
                                    parser: astnImp.createStructureParser({
                                        handler: {
                                            onNoInternalSchema: () => { },
                                            onEmbeddedSchema: () => astnImp.createDummyTreeHandler(),
                                            onSchemaReference: () => { },
                                            onBody: () => {
                                                return astnImp.createTreeParser({
                                                    handler: astnImp.createAnnotater(
                                                        {
                                                            objectBegin: ($) => {
                                                            },
                                                            property: ($) => {
                                                                if ($.propertyToken.token.wrapping[0] !== "quote") {
                                                                    foundErrors.push(`key does not have quotes`)
                                                                }
                                                            },
                                                            objectEnd: ($) => {
                                                            },
                                                            arrayBegin: ($) => {
                                                            },
                                                            element: ($) => {
                                                            },
                                                            arrayEnd: ($) => {
                                                            },
                                                            simpleStringValue: ($) => {
                                                                switch ($.token.token.wrapping[0]) {
                                                                    case "none": {
                                                                        if ($.token.token.value === "true" || $.token.token.value === "false" || $.token.token.value === "null") {
                                                                            //okay
                                                                        } else {
                                                                            const nr = new Number($.token.token.value).valueOf()
                                                                            if (isNaN(nr)) {
                                                                                foundErrors.push(`unexpected unquoted string value: ${$.token.token.value}`)
                                                                            }
                                                                        }
                                                                        break
                                                                    }
                                                                    case "quote": {
                                                                        break
                                                                    }
                                                                    case "apostrophe": {
                                                                        foundErrors.push(`unexpected apostrophed string value`)
                                                                        break
                                                                    }
                                                                    default:
                                                                        pr.au($.token.token.wrapping[0])
                                                                }
                                                            },
                                                            multilineStringValue: ($) => {
                                                            },
                                                            taggedUnionBegin: ($) => {
                                                            },
                                                            option: ($) => {
                                                            },
                                                            taggedUnionEnd: ($) => {
                                                            },
                                                            end: () => {
                                                            },
                                                        }
                                                    ),
                                                    onError: ($) => {
                                                        //console.log($)
                                                        foundErrors.push(astnImp.printParsingError($.error))
                                                    },
                                                })
                                            },
                                        },
                                        onError: ($) => {
                                            //console.log($)
                                            foundErrors.push(astnImp.printParsingError($.error))

                                        },
                                    }),
                                    onError: ($) => {
                                        //console.log($)
                                        foundErrors.push(astnImp.printTokenizerError($.error))
                                    },
                                })
                                spt.onData($)
                                spt.onEnd(null)
                                if (testData.expectErrors !== undefined) {
                                    if (testData.expectErrors) {
                                        // if (foundErrors.length > 0) {
                                        //     console.log(pr.JSONstringify(foundErrors))
                                        // }
                                        test.assert({
                                            testName: `${absolutePath}`,
                                            condition: foundErrors.length > 0,
                                        })
                                    } else {
                                        if (foundErrors.length > 0) {
                                            console.log(pr.JSONstringify(foundErrors))
                                        }
                                        test.assert({
                                            testName: absolutePath,
                                            condition: foundErrors.length === 0
                                        })
                                    }
                                }

                            },
                        )
                    },
                    onDirectory: ($, $i) => {

                    },
                    onEnd: () => { },
                }
            )
        })
    }
    $i.testContext.subset(
        "JSONTestSuite",
        ($i) => {
            $i.subset('parsing', ($i) => {

                //incorrect JSON string

                doTest(
                    {
                        name: "incorrect",
                        path: "test_parsing/n",
                        expectErrors: true,
                    },
                    $i,
                )
                doTest(
                    {
                        name: "correct",
                        path: "test_parsing/y",
                        expectErrors: false,
                    },
                    $i,
                )
                doTest(
                    {
                        name: "other",
                        path: "test_parsing/i",
                        expectErrors: undefined,
                    },
                    $i,
                )
            })
            doTest(
                {
                    name: "transform",
                    path: "test_transform",
                    expectErrors: undefined,
                },
                $i,
            )

        }
    )
}