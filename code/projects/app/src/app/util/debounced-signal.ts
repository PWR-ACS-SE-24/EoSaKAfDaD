import { Signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { debounceTime } from "rxjs";

export function debouncedSignal<T>(
  source: Signal<T>,
  dueTime: number,
): Signal<T> {
  const initialValue = source();
  const source$ = toObservable(source);
  const debounced$ = source$.pipe(debounceTime(dueTime));
  return toSignal(debounced$, { initialValue });
}
