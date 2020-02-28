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
  const enteringHeaderEle = ionPageElement.querySelector("ion-header");
  const leavingHeaderEle = leavingEl && leavingEl.querySelector("ion-header");
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
  console.log("enteringHeaderEle",enteringHeaderEle)
  if (enteringHeaderEle) {
    const enteringToolBar = createAnimation();
    enteringToolBar.addElement(enteringHeaderEle);
    rootTransition.addAnimation(enteringToolBar);
  }
  if (leavingHeaderEle) {
    const backEl = leavingHeaderEle.querySelector("app-back-button");
    const leavingToolbarAnimation = createAnimation();
    leavingToolbarAnimation.addElement(leavingHeaderEle);
    if (backEl) {
      leavingToolbarAnimation.addElement(backEl);
    }
    leavingToolbarAnimation.fromTo("opacity", 1, 0);
    rootTransition.addAnimation(leavingToolbarAnimation);
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
      .fromTo("transform", `translateX(${CENTER})`, `translateX(${OFF_BOTTOM})`)
      .fromTo("opacity", 1, 0);

    rootTransition.addAnimation(leavingPage);
  }
  if (enteringEl && backDirection) {
    // const backEl = enteringEl.querySelector("app-back-button");
    // const enteringToolbarAnimation = createAnimation();
    // enteringToolbarAnimation.addElement(enteringEl);
    // if (backEl) {
    //   enteringToolbarAnimation.addElement(backEl);
    // }
    // enteringToolbarAnimation.fromTo("opacity", 1, 0);
    // rootTransition.addAnimation(enteringToolbarAnimation);
    rootTransition
      .duration(opts.duration || DURATION)
      .easing("cubic-bezier(0.47,0,0.745,0.715)");

    const enteringPage = createAnimation();

    enteringPage
      .addElement(getIonPageElement(enteringEl))
      .fromTo("opacity", 0, 1);

    rootTransition.addAnimation(enteringPage);
  }

  return (rootTransition as any) as Animation;
};
