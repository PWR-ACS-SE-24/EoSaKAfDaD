import { computed, Signal } from "@angular/core";

export function computedOpt<T, R>(
  signal: Signal<T | undefined>,
  computation: (data: T) => R
): Signal<R | undefined> {
  return computed(() => {
    const data = signal();
    return data ? computation(data) : undefined;
  });
}
