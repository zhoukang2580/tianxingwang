import { empty, Observable, Subject } from 'rxjs';
import { sampleTime, share, startWith } from 'rxjs/operators';

const scrollListeners = new WeakMap<any, Observable<any>>();

export function sampleObservable<T>(obs: Observable<T>, scheduler?: any): Observable<T> {
  return obs.pipe(
    sampleTime(100, scheduler),
    share(),
    startWith('' as any as T)
  );
}

// Only create one scroll listener per target and share the observable.
// Typical, there will only be one observable per application
export const getScrollListener = (scrollTarget?: HTMLElement | Window): Observable<Event> => {
  if (!scrollTarget || typeof scrollTarget.addEventListener !== 'function') {
    console.warn('`addEventListener` on ' + scrollTarget + ' (scrollTarget) is not a function. Skipping this target');
    return empty();
  }
  const scrollListener = scrollListeners.get(scrollTarget);
  if (scrollListener) {
    return scrollListener;
  }

  const srollEvent: Observable<Event> = Observable.create((observer: Subject<Event>) => {
    const eventName = 'scroll';
    const handler = (event: Event) => observer.next(event);
    const options = { passive: true, capture: false };
    scrollTarget.addEventListener(eventName, handler, options);
    return () => scrollTarget.removeEventListener(eventName, handler, options);
  });

  const listener = sampleObservable<Event>(srollEvent);
  scrollListeners.set(scrollTarget, listener);
  return listener as any ;
};
