import { effect, signal, Signal } from "@angular/core";

export function asyncComputed<T>(
  initialValue: T,
  computation: () => Promise<T>,
): Signal<T> {
  const result = signal(initialValue);
  effect(() => {
    computation().then((r) => result.set(r));
  });
  return result.asReadonly();
}
