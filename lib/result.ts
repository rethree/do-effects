import { Binding, Effect, SymbolEffect } from "./interpreter";

export class ResultEffect<A> extends Effect<A> {
  readonly [SymbolEffect] = result;
}

export class Success<A> {
  constructor(readonly value: A) {}
}

export class Fault {
  constructor(readonly reason: unknown) {}
}

export type Result<A> = Success<A> | Fault;

const success = <A>(value: A): Binding<A, Result<A>> => ({
  exit: false,
  value,
  pure: new Success(value),
});

const result = async <I>(
  expr: Effect<I> | I
): Promise<Binding<I, Result<I>>> => {
  if (expr instanceof Effect) {
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
      if (continuation instanceof Function)
        return success(continuation(reason));
      return success(continuation);
    }
  } else {
    return success(expr);
  }
};
