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
      style({ opacity: 0, transform: "translate3d(-10%,0,0)" }),
      animate("200ms", style({ opacity: 1, transform: "translate3d(0,0,0)" }))
    ]),
    transition(":leave", [
      style({ transform: "translate3d(-10%,0,0)" }),
      animate(
        "200ms",
        style({ opacity: 0, transform: "translate3d(100%,0,0)" })
      )
    ])
  ])
];
