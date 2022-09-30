import { Binding, Effect, Symbol_Effect } from "./interpreter";
import { make } from "./types";

export class Maybe<A> extends Effect<A> {
  static of = make(Maybe);

  readonly [Symbol_Effect] = handler;
}

export const maybe = Maybe.of;

export class Some<A> {
  constructor(readonly value: A) {}
}

export class None {}

type Variant<A> = Some<A> | None;

const success = <A>(value: A): Binding<A, Variant<A>> => ({
  exit: false,
  value,
  pure: new Some(value),
});

const tryContinue = <A>(
  value: A | unknown,
  continuation?: ((value?: A | unknown) => A) | A
): Binding<A, Variant<A>> => {
  if (continuation == null)
    return { exit: true, value: null, pure: new None() };
  if (continuation instanceof Function) {
    return success(continuation(value));
  }
  return success(continuation);
};

const handler = async <I>(expr: Effect<I>): Promise<Binding<I, Variant<I>>> => {
  const { promise, continuation } = expr;
  try {
    const value = await promise;
    return value == null ? tryContinue(value, continuation) : success(value);
  } catch (reason: unknown) {
    return tryContinue(reason, continuation);
  }
};
