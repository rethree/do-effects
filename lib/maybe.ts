import { Binding, Effect, IO, Resumable } from "./dsl";
import { join } from "./utils";
import { run } from "./interpreter";
import { _ } from "./types";

export class Some<A> {
  constructor(readonly value: A) {}
}

export class None {}

export type Maybe<A> = Some<A> | None;

export type Nilable<A> = IO<A | null | undefined>;

const success = <A>(value: A): Binding<A, Maybe<A>> => ({
  done: false,
  value,
  pure: new Some(value),
});

const complete = <A>(
  value: A | _,
  continuation?: ((value?: A | _) => A) | A | null
): Binding<A, Maybe<A>> => {
  if (continuation == null)
    return { done: true, value: null, pure: new None() };

  return success(
    continuation instanceof Function ? continuation(value) : continuation
  );
};

export const maybe = run(
  async <A>(effect: Effect<A>): Promise<Binding<A, Maybe<A>>> => {
    const { io, continuation } =
      effect instanceof Resumable ? effect : { io: effect, continuation: null };

    try {
      const value = join(io);
      const done = value instanceof Promise ? await value : value;
      return done == null ? complete(done, continuation) : success(done);
    } catch (reason: _) {
      return complete(reason, continuation);
    }
  }
);

export const unwrap = <A>(maybe: Maybe<A>): Promise<A | null> =>
  maybe instanceof Some ? Promise.resolve(maybe.value) : Promise.reject(null);
