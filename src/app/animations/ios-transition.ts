import { createAnimation } from "@ionic/core";
import {
  TransitionOptions,
  getIonPageElement,
  Animation
} from "./animation-interface";

export const iosTransitionAnimation = (
  _: HTMLElement,
  opts: TransitionOptions
): Animation => {
  const OFF_BOTTOM = "40px";
  const CENTER = "0px";
  const DURATION = 200;
  const backDirection = opts.direction === "back";
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;

  const ionPageElement = getIonPageElement(enteringEl);
  const enteringToolbarEle = ionPageElement.querySelector("ion-toolbar");
  const rootTransition = createAnimation();

  rootTransition
    .addElement(ionPageElement)
    .fill("both")
    .beforeRemoveClass("ion-page-invisible");

  // animate the component itself
  if (backDirection) {
    rootTransition
      .duration(opts.duration || DURATION)
      .easing("cubic-bezier(0.47,0,0.745,0.715)");
  } else {
    rootTransition
      .duration(opts.duration || DURATION)
      .easing("cubic-bezier(0.36,0.66,0.04,1)")
      // .delay(50)
      .fromTo("transform", `translateX(${OFF_BOTTOM})`, `translateX(${CENTER})`)
      .fromTo("opacity", 0.01, 1);
  }

  // Animate toolbar if it's there
  if (enteringToolbarEle) {
    const enteringToolBar = createAnimation();
    enteringToolBar.addElement(enteringToolbarEle);
    rootTransition.addAnimation(enteringToolBar);
  }

  // setup leaving view
  if (leavingEl && backDirection) {
    // leaving content
    rootTransition
      .duration(opts.duration || DURATION)
      .easing("cubic-bezier(0.47,0,0.745,0.715)");

    const leavingPage = createAnimation();
    leavingPage
      .addElement(getIonPageElement(leavingEl))
      .addElement([
        leavingEl.querySelector("ion-header > *"),
        leavingEl.querySelector("app-back-button")
      ])
      .fromTo("transform", `translateX(${CENTER})`, `translateX(${OFF_BOTTOM})`)
      .fromTo("opacity", 1, 0);

    rootTransition.addAnimation(leavingPage);
  }

  return (rootTransition as any) as Animation;
};
