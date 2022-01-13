#!/usr/bin/env node

import { init } from "../index"

const astnImp = init()

astnImp.runProgram(
    astnImp.normalize
)