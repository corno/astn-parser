import * as pr from "pareto-runtime"
import * as pt from "pareto-test"

import * as fs from "pareto-filesystem"

import * as testSets from "../implementation/testTestSets"
import * as jsonTestSuite from "../implementation/JSONTestSuite"
import * as formatting from "../implementation/testFormatting"
import { processExit } from "pareto-runtime"

const [, , testDataDir] = pr.getProcessArguments()

if (testDataDir === undefined) {
    throw new Error("missing testDataDir")
}

pt.createTestContext(
    {
        numberOfFirstLine: 1,
    },
    {
        callback: ($i) => {

            $i.asyncSubset(
                {
                    name: "tests",
                },
                {
                    registerListener: ($i) => {
                        const asyncTest = $i
                        fs.wrapDirectory(
                            {
                                startPath: testDataDir
                            },
                            {
                                callback: ($i) => {
                                    testSets.test(
                                        {
                                            testContext: asyncTest.testSet,
                                            fsContext: $i,
                                        }
                                    )
                                    jsonTestSuite.test(
                                        {
                                            testContext: asyncTest.testSet,
                                            fsContext: $i,
                                        }
                                    )
                                    formatting.test(
                                        {
                                            testContext: asyncTest.testSet,
                                            fsContext: $i,
                                        }
                                    )
                                },
                                onError: ($) => {
                                    console.log(`>>${fs.printFSError($)}`)
                                    //throw new Error(fs.printFSError($))
                                },
                                onEnd: () => {
                                    console.log("!!!!!!!!!!2")

                                    $i.done()
                                }
                            }
                        )
                    }
                }
            )

        },
        onEnd: ($) => {
            pt.serializeTestResult(
                {
                    testResult: $.result,
                    showSummary: true,
                },
                console.log,
            )

            if (pt.summarize($.result).numberOfErrors > 0) {
                processExit(1)
            }
        },
    }
)

