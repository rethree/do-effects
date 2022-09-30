import { Do, interpret } from "../lib/interpreter";
import { result } from "../lib/result";

function* G(): Do<number> {
  const x = yield result(Promise.resolve(42));
  const y = yield result(Promise.resolve(x + 8));
  return result(Promise.reject(Error("42")), y + 12);
}

interpret(G).then(console.log);
