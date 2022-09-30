class Continuation<A> {
  constructor(readonly value: A) {}
}

const ctl = <A>(
  procedure: () => A,
  handler?: (
    thrown: unknown,
    continuation: (a: A) => Continuation<A>
  ) => Continuation<A> | void
): A => {
  try {
    return procedure();
  } catch (effect: unknown) {
    const control = handler?.(effect, (a: A) => new Continuation(a));
    if (control instanceof Continuation) return control.value;
    throw effect;
  }
};

const f = ctl(
  (): number => {
    throw Error("aaaa");
  },
  (_, continuation) => continuation(42)
);
