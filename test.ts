import { Do, interpreter } from "./interpreter";
import { result, ResultEffect } from "./result";

function* G(): Do<number> {
  const x = yield new ResultEffect(Promise.resolve(42));
  const y = yield new ResultEffect(Promise.resolve(x + 8));
  return new ResultEffect(Promise.reject(Error("42")), y + 12);
}

const interpret = interpreter(result);

interpret(G).then(console.log);
