import { Binding, Effect, SymbolEffect } from "./interpreter";

export class MaybeEffect<A> extends Effect<A> {
  readonly [SymbolEffect] = maybe;
}

export class Some<A> {
  constructor(readonly value: A) {}
}

export class None {
  constructor() {}
}

export type Maybe<A> = Some<A> | None;

const success = <A>(value: A): Binding<A, Maybe<A>> => ({
  exit: false,
  value,
  pure: new Some(value),
});

const evaluate = <A>(
  value: A,
  continuation?: ((value?: A | unknown) => A) | A
): Binding<A, Maybe<A>> => {
  if (value != null) return success(value);
  if (continuation instanceof Function) {
    return success(continuation(value));
  }
  if (continuation != null) return success(continuation);
  return { exit: true, value: null, pure: new None() };
};

const maybe = async <I>(expr: Effect<I> | I): Promise<Binding<I, Maybe<I>>> => {
  if (expr instanceof Effect) {
    const { promise, continuation } = expr;
    try {
      return evaluate(await promise, continuation);
    } catch (reason: unknown) {
      return evaluate(reason, continuation);
    }
  } else {
    return evaluate(expr);
  }
};
