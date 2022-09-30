type _ = unknown;

export const SymbolEffect = Symbol("Effect");

export class Effect<A = _> {
  readonly [SymbolEffect]: Handler | null = null;

  constructor(
    readonly promise: Promise<A>,
    readonly continuation?: ((fault: _) => A) | A
  ) {}
}

export type Binding<A, F> = Readonly<
  { exit: false; value: A; pure: F } | { exit: true; value: A | _; pure: F }
>;

export type Handler<A = any, F = any> = (
  expr: Effect<A> | A
) => Promise<Binding<A, F>>;

export type Do<I> = Generator<Effect<I>, Effect<I>, I>;

export const interpreter =
  (defaultHandler: Handler) =>
  async <I, F>(init: () => Do<I>): Promise<F> => {
    const generator = init();
    let binding: Binding<I, F> | null = null;
    let item = generator.next();

    do {
      const bind: Handler<I, F> = item.value?.[SymbolEffect] ?? defaultHandler;
      binding = await bind(item.value);
      if (binding.exit) return binding.pure;
      item = generator.next(binding.value);
    } while (!item.done);

    return binding?.pure;
  };
