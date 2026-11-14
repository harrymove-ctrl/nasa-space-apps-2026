import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './parallax-slider.css';

export interface ParallaxSlide {
  title: string;
  image: string;
  alt?: string;
  href?: string;
  focus?: string;
}

export type ParallaxSliderOrientation = 'portrait' | 'landscape';

export interface ParallaxSliderProps {
  slides?: ParallaxSlide[];
  orientation?: ParallaxSliderOrientation;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  parallax?: number;
  zoom?: number;
  scrollOnWheel?: boolean;
  label?: string;
  className?: string;
  onSelectSlide?: (slide: ParallaxSlide) => void;
}

export const defaultParallaxSlides: ParallaxSlide[] = [
  {
    title: 'Terra + Suomi NPP Pass',
    image: '/nasa-gallery/earthrise-orbital-pass.jpg',
    alt: 'Earth observation satellite scanning curved thermal contours',
    focus: '48% 54%',
  },
  {
    title: 'NISAR Phase Corridor',
    image: '/nasa-gallery/sar-interferometry-corridor.jpg',
    alt: 'High-voltage transmission corridor intersected by radar swath contours',
    focus: '52% 50%',
  },
  {
    title: 'GOES-18 Flare Bowshock',
    image: '/nasa-gallery/solar-storm-magnetosphere.jpg',
    alt: 'Solar mass ejection compressing geomagnetic dipole lines',
    focus: '50% 50%',
  },
  {
    title: 'Shackleton Solar Tower',
    image: '/nasa-gallery/shackleton-lunar-station.jpg',
    alt: 'Cutaway Artemis lunar south pole station and vertical solar array',
    focus: '48% 50%',
  },
  {
    title: 'Deep Field Lensing Grid',
    image: '/nasa-gallery/galaxy-deep-field.jpg',
    alt: 'Astronomical halftone survey plate of spiral galaxies',
    focus: '50% 50%',
  },
];

const LERP = 0.05;
const WHEEL_SPEED = 1.75;
const MAX_WHEEL_STEP = 150;
const MOUSE_DRAG = 2;
const TOUCH_DRAG = 1.5;
const DRAG_THRESHOLD = 5;
const SETTLE_MS = 200;
const LEAD_COPIES = 2;
const MIN_COPIES = 6;

function parseFocus(focus: string | undefined): [number, number] {
  const [x, y = x] = (focus ?? '')
    .trim()
    .split(/\s+/)
    .map((part) => parseFloat(part) / 100);
  const clamp = (value: number | undefined) =>
    value === undefined || Number.isNaN(value) ? 0.5 : Math.min(1, Math.max(0, value));
  return [clamp(x), clamp(y)];
}

export function ParallaxSlider({
  slides = defaultParallaxSlides,
  orientation = 'portrait',
  eyebrow,
  title,
  description,
  parallax = 0.2,
  zoom,
  scrollOnWheel = true,
  label = 'Orbital Plates Gallery',
  className,
  onSelectSlide,
}: ParallaxSliderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<number | null>(null);
  const [copies, setCopies] = useState(MIN_COPIES);
  const count = slides.length;
  const hasHeader = Boolean(eyebrow || title || description);
  const scale = Math.max(1, zoom ?? (orientation === 'landscape' ? 1.3 : 1));

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !viewport || !track || count === 0) return;

    const slideElements = Array.from(track.children) as HTMLElement[];
    const images = slideElements.map((slide) =>
      slide.querySelector<HTMLImageElement>('img[data-parallax-image]')
    );
    const room = images.map(() => ({ left: 0, right: 0 }));
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const state = {
      current: 0,
      target: 0,
      width: 0,
      slideWidth: 0,
      slideHeight: 0,
      offset: 0,
      pitch: 0,
      sequence: 0,
      lastInput: 0,
      moving: false,
      frame: 0,
      pointer: null as number | null,
      pointerX: 0,
      dragDistance: 0,
      dragged: false,
      reduce: motionQuery.matches,
    };
    let releaseTimer = 0;

    const setMoving = (moving: boolean) => {
      if (moving === state.moving) return;
      state.moving = moving;
      root.dataset.moving = String(moving);
    };

    const wrap = () => {
      if (!state.sequence) return;
      while (state.current > -state.sequence) {
        state.current -= state.sequence;
        state.target -= state.sequence;
      }
      while (state.current < -state.sequence * 4) {
        state.current += state.sequence;
        state.target += state.sequence;
      }
    };

    const paintImage = (index: number) => {
      const image = images[index];
      if (!image) return;
      const distance =
        state.current +
        state.offset +
        index * state.pitch +
        state.slideWidth / 2 -
        state.width / 2;
      if (Math.abs(distance) > state.width / 2 + state.slideWidth + 500) return;
      const drift = state.reduce ? 0 : distance * -parallax;
      const shift = Math.max(-room[index].right, Math.min(room[index].left, drift));
      image.style.transform = `translate3d(${shift}px, 0, 0)`;
    };

    const paint = () => {
      track.style.transform = `translate3d(${state.current}px, 0, 0)`;
      for (let index = 0; index < images.length; index += 1) paintImage(index);
    };

    const fit = (index: number) => {
      const image = images[index];
      if (!image?.naturalWidth || !state.slideWidth || !state.slideHeight) return;
      const frameWidth = state.slideWidth;
      const frameHeight = state.slideHeight;
      const ratio = image.naturalWidth / image.naturalHeight;
      const width = Math.max(frameWidth, frameHeight * ratio) * scale;
      const height = Math.max(frameHeight, frameWidth / ratio) * scale;
      const [focusX, focusY] = parseFocus(image.dataset.focus);
      Object.assign(image.style, {
        width: `${width}px`,
        height: `${height}px`,
        left: `${(frameWidth - width) * focusX}px`,
        top: `${(frameHeight - height) * focusY}px`,
      });
      room[index] = {
        left: (width - frameWidth) * focusX,
        right: (width - frameWidth) * (1 - focusX),
      };
      paintImage(index);
    };

    const step = () => {
      state.frame = 0;
      const delta = (state.target - state.current) * (state.reduce ? 1 : LERP);
      state.current =
        Math.abs(state.target - state.current - delta) < 0.05
          ? state.target
          : state.current + delta;
      wrap();
      const recent = performance.now() - state.lastInput < SETTLE_MS;
      setMoving(state.dragged || Math.abs(delta) >= 0.1 || recent);
      paint();
      if (state.current !== state.target || recent || state.dragged || state.pointer !== null) {
        state.frame = requestAnimationFrame(step);
      } else {
        setMoving(false);
      }
    };

    const tick = () => {
      if (!state.frame) state.frame = requestAnimationFrame(step);
    };

    const nudge = (amount: number) => {
      state.target += amount;
      state.lastInput = performance.now();
      tick();
    };

    const measure = () => {
      const previousPitch = state.pitch;
      state.width = viewport.clientWidth;
      state.slideWidth = slideElements[0].offsetWidth;
      state.slideHeight = slideElements[0].offsetHeight;
      state.offset = slideElements[0].offsetLeft;
      state.pitch =
        slideElements.length > 1
          ? slideElements[1].offsetLeft - slideElements[0].offsetLeft
          : state.slideWidth;
      state.sequence = state.pitch * count;
      if (!state.sequence) return;

      if (previousPitch) {
        state.current *= state.pitch / previousPitch;
        state.target *= state.pitch / previousPitch;
      } else {
        const start = positionRef.current ?? -count * LEAD_COPIES;
        state.current = state.target = start * state.pitch;
      }
      const needed = Math.max(MIN_COPIES, 5 + Math.ceil(state.width / state.sequence));
      if (needed > copies) setCopies(needed);
      wrap();
      paint();
      images.forEach((_, index) => fit(index));
    };

    const onImageLoad = (event: Event) => {
      const index = images.indexOf(event.currentTarget as HTMLImageElement);
      if (index >= 0) fit(index);
    };

    const onWheel = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? state.width : 1;
      const delta = (horizontal ? event.deltaX : event.deltaY) * unit;
      if (!delta) return;
      event.preventDefault();
      nudge(-Math.max(-MAX_WHEEL_STEP, Math.min(MAX_WHEEL_STEP, delta * WHEEL_SPEED)));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || state.pointer !== null) return;
      window.clearTimeout(releaseTimer);
      state.pointer = event.pointerId;
      state.pointerX = event.clientX;
      state.dragDistance = 0;
      state.dragged = false;
      state.lastInput = performance.now();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== state.pointer) return;
      const delta =
        (event.clientX - state.pointerX) *
        (event.pointerType === 'mouse' ? MOUSE_DRAG : TOUCH_DRAG);
      state.pointerX = event.clientX;
      state.dragDistance += Math.abs(delta);
      if (!state.dragged && state.dragDistance > DRAG_THRESHOLD) {
        state.dragged = true;
        root.dataset.dragging = 'true';
      }
      nudge(delta);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== state.pointer) return;
      state.pointer = null;
      root.dataset.dragging = 'false';
      if (!state.dragged) return;
      releaseTimer = window.setTimeout(() => {
        state.dragged = false;
        tick();
      }, 100);
    };

    const onClick = (event: MouseEvent) => {
      if (!state.dragged) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      nudge(event.key === 'ArrowLeft' ? state.pitch : -state.pitch);
    };

    const onFocusIn = (event: FocusEvent) => {
      viewport.scrollLeft = 0;
      const slide = (event.target as HTMLElement).closest<HTMLElement>('[data-parallax-slide]');
      const index = slide ? slideElements.indexOf(slide) : -1;
      if (index < 0) return;
      state.target =
        state.width / 2 - (state.offset + index * state.pitch + state.slideWidth / 2);
      state.lastInput = performance.now();
      tick();
    };

    const onMotionChange = () => {
      state.reduce = motionQuery.matches;
      paint();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    images.forEach((image) => image?.addEventListener('load', onImageLoad));
    if (scrollOnWheel) viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('click', onClick, true);
    viewport.addEventListener('keydown', onKeyDown);
    viewport.addEventListener('focusin', onFocusIn);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      if (state.pitch) positionRef.current = state.current / state.pitch;
      cancelAnimationFrame(state.frame);
      window.clearTimeout(releaseTimer);
      resizeObserver.disconnect();
      images.forEach((image) => image?.removeEventListener('load', onImageLoad));
      viewport.removeEventListener('wheel', onWheel);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('click', onClick, true);
      viewport.removeEventListener('keydown', onKeyDown);
      viewport.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, [count, copies, parallax, scale, orientation, scrollOnWheel]);

  return (
    <section
      ref={rootRef}
      className={cn('obsidian-parallax-slider', className)}
      aria-label={hasHeader ? undefined : label}
      data-orientation={orientation}
      data-moving="false"
    >
      <div className="obsidian-parallax-slider__inner">
        {hasHeader && (
          <div className="obsidian-parallax-slider__header">
            <div>
              {eyebrow && <p className="obsidian-parallax-slider__eyebrow">{eyebrow}</p>}
              {title && <h2 className="obsidian-parallax-slider__title">{title}</h2>}
            </div>
            {description && <p className="obsidian-parallax-slider__description">{description}</p>}
          </div>
        )}
        <div
          ref={viewportRef}
          className="obsidian-parallax-slider__viewport"
          role="group"
          aria-roledescription="carousel"
          aria-label={`${label}. Drag or use Left and Right arrow keys to browse.`}
          tabIndex={0}
        >
          <div ref={trackRef} className="obsidian-parallax-slider__track">
            {Array.from({ length: copies }, (_, copy) =>
              slides.map((slide, index) => {
                const readable = copy === LEAD_COPIES;
                const content = (
                  <>
                    <span className="obsidian-parallax-slider__frame">
                      <img
                        data-parallax-image=""
                        data-focus={slide.focus}
                        className="obsidian-parallax-slider__image"
                        src={slide.image}
                        alt={readable ? slide.alt ?? slide.title : ''}
                        draggable={false}
                        loading="eager"
                        decoding="async"
                        style={{ objectPosition: slide.focus }}
                      />
                    </span>
                    <span className="obsidian-parallax-slider__caption">
                      <span className="truncate">{slide.title}</span>
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </>
                );
                return (
                  <div
                    key={`${copy}-${index}`}
                    data-parallax-slide=""
                    className="obsidian-parallax-slider__slide"
                    role={readable ? 'group' : undefined}
                    aria-roledescription={readable ? 'slide' : undefined}
                    aria-label={readable ? `${index + 1} of ${count}: ${slide.title}` : undefined}
                    aria-hidden={readable ? undefined : true}
                  >
                    {slide.href ? (
                      <a
                        className="obsidian-parallax-slider__link"
                        href={slide.href}
                        draggable={false}
                        tabIndex={readable ? undefined : -1}
                        onClick={() => onSelectSlide?.(slide)}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="obsidian-parallax-slider__link text-left cursor-pointer"
                        draggable={false}
                        tabIndex={readable ? undefined : -1}
                        onClick={() => onSelectSlide?.(slide)}
                      >
                        {content}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ParallaxSlider;
