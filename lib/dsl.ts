import { _ } from "./types";

export type Binding<A, F> = Readonly<
  { done: false; value: A; pure: F } | { done: true; value: A | _; pure: F }
>;

export type IO<A> = Promise<A> | (() => A | Promise<A>);

export type Value<A, B extends IO<A>> = B extends () => infer C ? C : B;

export class Resumable<A> {
  constructor(
    readonly io: IO<A>,
    readonly continuation?: ((fault: _) => A) | A
  ) {}
}

export type Effect<A> = IO<A> | Resumable<A>;

export const resume = <A>(
  io: IO<A>,
  continuation?: ((fault: _) => A) | A
) => new Resumable(io, continuation);
