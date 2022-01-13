import * as pt from "pareto-test"
import * as fs from "pareto-filesystem"
import * as astn from "../../../../pub"

const astnImp = astn.init()

export function test(
    $i: {
        testContext: pt.TestContext,
        fsContext: fs.Directory,
    }
) {
    const testContext = $i.testContext
    $i.fsContext.getDirectory(
        "formatting",
        {
            callback: ($i) => {
                const directory = $i
                testContext.subset("formatting", ($i) => {
                    function testProgram(
                        testName: string,
                        inputData: string,
                        outBasename: string,
                        outExtension: string,
                        createStreamConsumer: astn.CreateStreamConsumer,
                    ): void {
                        const actualOutFilePath = outBasename + ".actual." + outExtension
                        directory.readFile(
                            outBasename + ".expected." + outExtension,
                            ($) => {
            
                                let actualOut = ""
                                const sc = createStreamConsumer(
                                    (str) => actualOut += str,
                                    (str) => {
                                        throw new Error(`unexpected error: ${str}`)
                                    }
                                )
                                sc.onData(inputData)
                                sc.onEnd(null)
            
                                if (actualOut !== $) {
                                    directory.writeFile(
                                        {
                                            filePath: actualOutFilePath,
                                            data: actualOut
                                        },
                                        () => {
                                            //
                                        }
                                    )
                                }
                                $i.testString({
                                    testName: testName,
                                    expected: $,
                                    actual: actualOut,
                                })
                            }
                        )
                    }
            
                    //name: "normalized ASTN",
                    directory.readFile(
                        "in.astn",
                        ($) => {
                            testProgram(
                                "normalized",
                                $,
                                "normalized",
                                "astn",
                                astnImp.normalize,
                            )
                        }
                    )
                    //name: "JSON",
                    directory.readFile(
                        "in.astn",
                        ($) => {
                            testProgram(
                                "JSON",
                                $,
                                "out",
                                "json",
                                astnImp.toJSON,
                            )
                        }
                    )
                })
            }
        }
    )

}