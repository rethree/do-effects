import { valueOf } from "../lib/dsl";
import { Do } from "../lib/interpreter";
import { result } from "../lib/result";

function* R(): Do<number> {
  const x = yield Promise.resolve(42);
  const y = yield Promise.resolve(x + 8);
  return valueOf(Promise.reject(Error("42")), y + 12);
}

result(R).then(console.log);
