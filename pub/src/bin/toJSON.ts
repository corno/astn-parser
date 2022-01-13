#!/usr/bin/env node

import { init } from ".."

const astnImp = init()
astnImp.runProgram(
    astnImp.toJSON
)