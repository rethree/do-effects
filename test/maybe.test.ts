import { valueOf } from "../lib/dsl";
import { Do } from "../lib/interpreter";
import { maybe } from "../lib/maybe";

function* M(): Do<number | null, number> {
  const _ = yield valueOf(Promise.resolve(42));
  const y = yield valueOf(Promise.resolve(null));
  return valueOf(Promise.reject(Error("42")), y + 12);
}

maybe(M).then(console.log);
