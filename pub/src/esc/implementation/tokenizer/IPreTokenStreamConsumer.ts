import * as pr from "pareto-runtime"
import * as astn from "../../../interface"

import { PreToken } from "./PreToken"


export type IPreTokenStreamConsumer = pr.IStreamConsumer<PreToken, astn.Location>