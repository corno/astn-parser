import * as grammar from "../../../modules/grammar"
import { CreateDummyTreeHandler } from "../../Functions"

export function createDummyTreeHandler<EventAnnotation>(
): CreateDummyTreeHandler<EventAnnotation> {
    return () => {

        function createDummyRequiredValueHandler<EventAnnotation>(
        ): grammar.IRequiredValueHandler<EventAnnotation> {
            return {
                exists: createDummyValueHandler(),
                missing: () => { },
            }
        }

        function createDummyValueHandler<EventAnnotation>(
        ): grammar.IValueHandler<EventAnnotation> {
            return {
                array: () => createDummyArrayHandler(),
                object: () => createDummyObjectHandler(),
                simpleString: () => { },
                multilineString: () => { },
                taggedUnion: () => createDummyTaggedUnionHandler(),
            }
        }

        function createDummyTaggedUnionHandler<EventAnnotation>(
        ): grammar.ITaggedUnionHandler<EventAnnotation> {
            return {
                option: () => createDummyRequiredValueHandler(),
                missingOption: () => { },
                end: () => { },
            }
        }

        function createDummyArrayHandler<EventAnnotation>(
        ): grammar.IArrayHandler<EventAnnotation> {
            return {
                element: () => createDummyValueHandler(),
                onEnd: () => { },
            }
        }

        function createDummyObjectHandler<EventAnnotation>(
        ): grammar.IObjectHandler<EventAnnotation> {
            return {
                property: () => {
                    return createDummyRequiredValueHandler()
                },
                onEnd: () => { },
            }
        }

        return {
            root: createDummyRequiredValueHandler(),
            onEnd: () => { },
        }
    }
}
