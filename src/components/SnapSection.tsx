import { useRef, type HTMLAttributes, type MouseEvent } from "react";

/** Anything already interactive keeps its own tap — we only claim dead space. */
const INTERACTIVE = "a,button,input,textarea,select,summary,label,[role='tab']";

/**
 * A snap-scroll section: flicking the page lands it flush at the top of the
 * screen (see html[data-snap] in theme.css), and tapping anywhere inside that
 * isn't a control scrolls it fully into view — no half-visible boxes.
 */
export function SnapSection({ children, className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  function onClick(e: MouseEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <section ref={ref} className={`snap-section ${className}`} onClick={onClick} {...rest}>
      {children}
    </section>
  );
}
