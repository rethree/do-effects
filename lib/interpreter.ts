import { Any, _ } from "./types";

export const Symbol_Effect = Symbol("@@Effect");

class UnknownEffectError extends Error {}

export abstract class Effect<A = _> {
  readonly [Symbol_Effect]: Handler | null = null;

  constructor(
    readonly promise: Promise<A>,
    readonly continuation?: ((fault: _) => A) | A
  ) {}
}

export type Binding<A, F> = Readonly<
  { exit: false; value: A; pure: F } | { exit: true; value: A | _; pure: F }
>;

export type Handler<A = Any, F = Any> = (
  expr: Effect<A>
) => Promise<Binding<A, F>>;

export type Do<I> = Generator<Effect<I>, Effect<I>, I>;

export const interpreter =
  (defaultHandler: Handler) =>
  async <I, F>(init: () => Do<I>): Promise<F> => {
    const generator = init();
    let item = generator.next();
    let bind: Handler<I, F> | null = null;
    let binding: Binding<I, F> | null = null;
    let done = false;

    do {
      done = Boolean(item.done);
      bind = item.value?.[Symbol_Effect] ?? defaultHandler;
      binding = await bind(item.value);
      if (binding.exit) return binding.pure;
      item = generator.next(binding.value);
    } while (!done);

    return binding.pure;
  };

export const interpret = interpreter(() => {
  throw new UnknownEffectError();
});
