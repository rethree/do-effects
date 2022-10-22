import { IO, Value } from "./dsl";

export const join = <A, B extends IO<A>>(effect: B): Value<A, B> =>
  (effect instanceof Function ? effect() : effect) as Value<A, B>;
