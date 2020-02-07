import {
  trigger,
  transition,
  style,
  stagger,
  query,
  animate
} from "@angular/animations";
export const fadeInOut = [
  trigger("fadeInOut", [
    transition(":enter", [
      style({ opacity: 0 }),
      animate("200ms", style({ opacity: 1, transform: "translateX(0)" }))
    ]),
    transition(":leave", [
      animate("200ms", style({ opacity: 0, transform: "translateX(100%)" }))
    ])
  ])
];
