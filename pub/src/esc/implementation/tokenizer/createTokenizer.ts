import { CreateTokenizer } from "../../Functions"

import { createStreamPreTokenizer } from "./createStreamPreTokenizer"
import { createTokenizer2 } from "./createTokenizer2"

export function createTokenizer(): CreateTokenizer {
    return ($p) => {
        return createStreamPreTokenizer(
            createTokenizer2(
                $p.parser,
                ($) => {
                    $p.onError({
                        error: ["tokenizer", $.error],
                        range: $.range,
                    })
                },
            ),
            ($) => {
                $p.onError({
                    error: ["pre", $.error],
                    range: $.range,
                })
            },
        )
    }
}