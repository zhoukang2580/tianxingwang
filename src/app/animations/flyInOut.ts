import {
  trigger,
  transition,
  style,
  stagger,
  query,
  animate
} from "@angular/animations";
export const flyInOut = [
  trigger("flyInOut", [
    transition(":enter", [
      style({ opacity: 0, transform: "translateX(-10%)" }),
      animate("200ms", style({ opacity: 1, transform: "translateX(0)" }))
    ]),
    transition(":leave", [
      style({ transform: "translateX(-10%)" }),
      animate("200ms", style({ opacity: 0, transform: "translateX(100%)" }))
    ])
  ])
];
