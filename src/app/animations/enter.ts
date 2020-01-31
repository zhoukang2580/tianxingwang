import { Animation } from "@ionic/core";

export function myEnterAnimation(
  AnimationC: Animation,
  baseEl: HTMLElement
): Promise<Animation> {
  const baseAnimation = new AnimationC();

  const backdropAnimation = new AnimationC();
//   backdropAnimation.addElement(baseEl.querySelector("ion-backdrop"));
  backdropAnimation.addElement(baseEl);

  const wrapperAnimation = new AnimationC();
//   wrapperAnimation.addElement(baseEl.querySelector(".modal-wrapper"));
  wrapperAnimation.addElement(baseEl);

  wrapperAnimation
    .beforeStyles({ opacity: 1 })
    .fromTo("translateY", "100%", "0%");

//   backdropAnimation.fromTo("opacity", 0.01, 0.4);

  return Promise.resolve(
    baseAnimation
      .addElement(baseEl)
      .easing("cubic-bezier(0.36,0.66,0.04,1)")
      .duration(400)
    //   .beforeAddClass("show-modal")
    //   .add(backdropAnimation)
      .add(wrapperAnimation)
  );
}
