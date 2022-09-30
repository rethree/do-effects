import { Binding, Effect, Symbol_Effect } from "./interpreter";

export class Result<A> extends Effect<A> {
  static of<A>(...args: ConstructorParameters<typeof Effect<A>>) {
    return new Result(...args);
  }

  readonly [Symbol_Effect] = handler;
}

export const result = Result.of;

export class Success<A> {
  constructor(readonly value: A) {}
}

export class Fault {
  constructor(readonly reason: unknown) {}
}

type Variant<A> = Success<A> | Fault;

const success = <A>(value: A): Binding<A, Variant<A>> => ({
  exit: false,
  value,
  pure: new Success(value),
});

const handler = async <I>(expr: Effect<I>): Promise<Binding<I, Variant<I>>> => {
  const { promise, continuation } = expr;
  try {
    return success(await promise);
  } catch (reason: unknown) {
    if (continuation == null) {
      return {
        exit: true,
        value: reason,
        pure: new Fault(reason),
      };
    }
    if (continuation instanceof Function) return success(continuation(reason));
    return success(continuation);
  }
};
