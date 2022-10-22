import { Binding, IO, Resumable } from "./dsl";
import { join } from "./utils";
import { run } from "./interpreter";
import { _ } from "./types";

export class Success<A> {
  constructor(readonly value: A) {}
}

export class Fault {
  constructor(readonly reason: _) {}
}

export type Result<A> = Success<A> | Fault;

const success = <A>(value: A): Binding<A, Result<A>> => ({
  done: false,
  value,
  pure: new Success(value),
});

export const result = run(
  async <A>(io: IO<A> | Resumable<A>): Promise<Binding<A, Result<A>>> => {
    const { io, continuation } =
      io instanceof Resumable ? io : { effect: io, continuation: null };

    try {
      const value = join(io);
      return success(value instanceof Promise ? await value : value);
    } catch (reason: _) {
      if (continuation == null) {
        return {
          done: true,
          value: reason,
          pure: new Fault(reason),
        };
      }

      return success(
        continuation instanceof Function ? continuation(reason) : continuation
      );
    }
  }
);
