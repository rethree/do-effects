import { Binding, Effect } from "./dsl";
import { _ } from "./types";

export type Do<O, I = O> = Generator<Effect<O>, Effect<O>, I>;

export const run =
  <A, F extends Binding<B, _>, B = A>(
    interpreter: (effect: Effect<A>) => Promise<F> | F
  ) =>
  async (init: () => Do<A, B>): Promise<F["pure"]> => {
    const generator = init();
    let item = generator.next();
    let binding: Binding<B, F["pure"]> | null = null;
    let done = false;

    do {
      done = item.done ?? false;
      binding = await interpreter(item.value);
      if (binding.done) return binding.pure;
      item = generator.next(binding.value);
    } while (!done);

    return binding.pure;
  };
