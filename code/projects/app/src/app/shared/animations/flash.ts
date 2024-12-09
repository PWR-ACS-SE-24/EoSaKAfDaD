import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

export type Flash = "red" | "green" | "default";

export const flashAnimation = (initialColor: string) => [
  trigger("flash", [
    state("red", style({ backgroundColor: "var(--app-red)" })),
    state("green", style({ backgroundColor: "var(--app-green)" })),
    state("default", style({ backgroundColor: initialColor })),
    transition("red => default", animate("300ms")),
    transition("green => default", animate("300ms")),
    transition("default => red", animate("0ms")),
    transition("default => green", animate("0ms")),
  ]),
];
