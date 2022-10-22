import { Resumable, resume } from "../lib/dsl";
import { maybe, Nilable, unwrap } from "../lib/maybe";
import { result } from "../lib/result";

function* M(): Generator<Nilable<number>, Resumable<number>, number> {
  const _ = yield Promise.resolve(42);
  const y = yield Promise.resolve(null);
  return resume(Promise.reject(Error("42")), y + 12);
}

function* R(): Generator<
  Nilable<number> | Resumable<number>,
  Nilable<number>,
  number
> {
  const _ = yield Promise.resolve(42);
  const y = yield maybe(M).then(unwrap);
  const z = yield resume(Promise.reject(Error("42")), y + 12);
  return new Promise((resolve) => setTimeout(() => resolve(9001 + z)));
}

result(R).then(console.log);
