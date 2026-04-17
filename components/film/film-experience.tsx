"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { FILM_PHOTOS, LOADING_MESSAGES } from "@/data/film";
import { InfoIcon, PlaceholderLogo } from "./icons";
import { getFilmMediaSource } from "./media-placeholder";
import { ProjectInfoModal } from "./project-info-modal";
import { Timeline } from "./timeline";
import styles from "./film-experience.module.css";

const GAP = 4;
const DESKTOP_STEP = 124;
const MOBILE_STEP = 76;
const DESKTOP_DRAG_STEP = 180;
const DRAG_THRESHOLD = 6;
const FREE_DECAY_MS = 180;
const SNAP_EASE_MS = 112;
const VELOCITY_EPSILON = 0.00008;
const MAX_VELOCITY = 0.0135;
const WHEEL_IMPULSE = 0.000045;
const DRAG_RELEASE_WINDOW_MS = 120;

type ViewportState = {
  width: number;
  height: number;
};

type DragAxis = "x" | "y" | null;

type MotionMode = "idle" | "free" | "snap";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function frameBandHeight(viewportHeight: number, isDesktop: boolean) {
  if (isDesktop) {
    return Math.round(clamp(6 + 0.025 * viewportHeight, 12, 52)) + 172;
  }

  return Math.round(clamp(4 + 0.02 * viewportHeight, 8, 28)) + 148;
}

function topChromeSpace(viewportWidth: number, viewportHeight: number) {
  const base =
    viewportWidth >= 640
      ? clamp(26 + 0.07 * viewportHeight, 44, 116)
      : clamp(26 + 0.05 * viewportHeight, 36, 160);

  return base + 40;
}

export function FilmExperience() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const dragState = useRef<{
    active: boolean;
    moved: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startProgress: number;
    axis: DragAxis;
    samples: Array<{ t: number; x: number; y: number }>;
  }>({
    active: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startProgress: 0,
    axis: null,
    samples: [],
  });
  const motionRef = useRef<{
    rafId: number | null;
    lastTs: number;
    velocity: number;
    target: number;
    mode: MotionMode;
  }>({
    rafId: null,
    lastTs: 0,
    velocity: 0,
    target: 0,
    mode: "idle",
  });
  const suppressClickRef = useRef(false);

  const [viewport, setViewport] = useState<ViewportState>({ width: 0, height: 0 });
  const [progress, setProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMotionActive, setIsMotionActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  progressRef.current = progress;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    const legacyQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    updatePreference();
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    legacyQuery.addListener?.(updatePreference);
    return () => legacyQuery.removeListener?.(updatePreference);
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setMessageVisible(true);
      return;
    }

    const interval = window.setInterval(() => {
      setMessageVisible(false);
      window.setTimeout(() => {
        setMessageIndex((value) => (value + 1) % LOADING_MESSAGES.length);
        setMessageVisible(true);
      }, 300);
    }, 2800);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoadingVisible(false), prefersReducedMotion ? 120 : 1250);
    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion]);

  const isMobile = viewport.width > 0 && viewport.width < 640;

  const commitProgress = useCallback(
    (nextProgress: number, syncScroll: boolean) => {
      const clamped = clamp(nextProgress, 0, FILM_PHOTOS.length - 1);
      progressRef.current = clamped;
      setProgress(clamped);

      if (syncScroll && !isMobile) {
        window.scrollTo({
          top: clamped * DESKTOP_STEP,
          behavior: "auto",
        });
      }

      return clamped;
    },
    [isMobile],
  );

  const stopMotion = useCallback(() => {
    if (motionRef.current.rafId !== null) {
      window.cancelAnimationFrame(motionRef.current.rafId);
    }

    motionRef.current.rafId = null;
    motionRef.current.lastTs = 0;
    motionRef.current.velocity = 0;
    motionRef.current.mode = "idle";
    setIsMotionActive(false);
  }, []);

  const animateMotion = useCallback(
    (timestamp: number) => {
      const state = motionRef.current;
      if (state.lastTs === 0) {
        state.lastTs = timestamp;
      }

      const dt = Math.min(32, Math.max(8, timestamp - state.lastTs));
      state.lastTs = timestamp;

      if (prefersReducedMotion) {
        commitProgress(state.mode === "snap" ? state.target : Math.round(progressRef.current), !isMobile);
        stopMotion();
        return;
      }

      if (state.mode === "free") {
        const nextProgress = commitProgress(progressRef.current + state.velocity * dt, !isMobile);
        state.velocity *= Math.exp(-dt / FREE_DECAY_MS);

        if (nextProgress <= 0 || nextProgress >= FILM_PHOTOS.length - 1) {
          state.velocity = 0;
        }

        if (Math.abs(state.velocity) <= VELOCITY_EPSILON) {
          state.mode = "snap";
          state.target = Math.round(progressRef.current);
        }
      } else if (state.mode === "snap") {
        const diff = state.target - progressRef.current;
        if (Math.abs(diff) <= 0.001) {
          commitProgress(state.target, !isMobile);
          stopMotion();
          return;
        }

        const ease = 1 - Math.exp(-dt / SNAP_EASE_MS);
        commitProgress(progressRef.current + diff * ease, !isMobile);
      } else {
        stopMotion();
        return;
      }

      state.rafId = window.requestAnimationFrame(animateMotion);
    },
    [commitProgress, isMobile, prefersReducedMotion, stopMotion],
  );

  const startMotion = useCallback(
    (mode: Exclude<MotionMode, "idle">, options?: { velocity?: number; target?: number }) => {
      const state = motionRef.current;

      state.mode = mode;
      state.velocity = clamp(options?.velocity ?? state.velocity, -MAX_VELOCITY, MAX_VELOCITY);
      if (typeof options?.target === "number") {
        state.target = clamp(options.target, 0, FILM_PHOTOS.length - 1);
      }

      if (prefersReducedMotion) {
        commitProgress(mode === "snap" ? state.target : Math.round(progressRef.current), !isMobile);
        stopMotion();
        return;
      }

      setIsMotionActive(true);
      if (state.rafId === null) {
        state.lastTs = 0;
        state.rafId = window.requestAnimationFrame(animateMotion);
      }
    },
    [animateMotion, commitProgress, isMobile, prefersReducedMotion, stopMotion],
  );

  useEffect(() => {
    if (viewport.width === 0 || isMobile) {
      return;
    }

    const syncFromScroll = () => {
      if (dragState.current.active || motionRef.current.mode !== "idle") {
        return;
      }

      commitProgress(window.scrollY / DESKTOP_STEP, false);
    };

    syncFromScroll();
    window.addEventListener("scroll", syncFromScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncFromScroll);
    };
  }, [commitProgress, isMobile, viewport.width]);

  useEffect(() => {
    if (!isMobile) {
      setIsDragging(false);
      dragState.current.active = false;
      dragState.current.moved = false;
      dragState.current.pointerId = null;
      dragState.current.axis = null;
      dragState.current.samples = [];
    }
    stopMotion();
  }, [isMobile, stopMotion]);

  const snapToNearestFrame = useCallback(
    (targetIndex?: number) => {
      const nextTarget = typeof targetIndex === "number" ? targetIndex : Math.round(progressRef.current);
      if (prefersReducedMotion) {
        commitProgress(nextTarget, !isMobile);
        stopMotion();
        return;
      }

      startMotion("snap", { target: nextTarget, velocity: 0 });
    },
    [commitProgress, isMobile, prefersReducedMotion, startMotion, stopMotion],
  );

  useEffect(() => stopMotion, [stopMotion]);

  const selectIndex = useCallback(
    (index: number) => {
      const nextIndex = clamp(index, 0, FILM_PHOTOS.length - 1);
      setHoveredIndex(null);
      stopMotion();
      snapToNearestFrame(nextIndex);
    },
    [snapToNearestFrame, stopMotion],
  );

  const currentIndex = clamp(Math.round(progress), 0, FILM_PHOTOS.length - 1);
  const mediaSources = useMemo(() => FILM_PHOTOS.map((_, index) => getFilmMediaSource(index)), []);

  const layout = useMemo(() => {
    const viewportWidth = Math.max(viewport.width, 390);
    const viewportHeight = Math.max(viewport.height, 640);
    const baseWidth = viewportWidth < 640 ? 72 : 120;
    const focusLandscape = Math.min(viewportWidth < 640 ? viewportWidth * 0.64 : 495, viewportWidth - 64);
    const focusPortrait = Math.min(baseWidth * (viewportWidth < 640 ? 1.92 : 2.2), viewportWidth < 640 ? 160 : 264);

    const widths = FILM_PHOTOS.map((photo, index) => {
      const distance = Math.abs(progress - index);
      const emphasis = smoothstep(1 - Math.min(1, distance / 2.12));
      const targetWidth = photo.aspectRatio > 1 ? focusLandscape : focusPortrait;
      return baseWidth + (targetWidth - baseWidth) * emphasis;
    });

    const heights = widths.map((width, index) => width / FILM_PHOTOS[index].aspectRatio);
    const lefts: number[] = [];
    const centers: number[] = [];

    let cursor = 0;
    widths.forEach((width, index) => {
      lefts[index] = cursor;
      centers[index] = cursor + width / 2;
      cursor += width + GAP;
    });

    const startIndex = Math.floor(progress);
    const endIndex = Math.min(FILM_PHOTOS.length - 1, Math.ceil(progress));
    const factor = progress - startIndex;
    const activeCenter = centers[startIndex] + (centers[endIndex] - centers[startIndex]) * factor;
    const stripX = viewportWidth / 2 - activeCenter;

    const bandHeight = frameBandHeight(viewportHeight, viewportWidth >= 640);
    const anchorY = (topChromeSpace(viewportWidth, viewportHeight) + (viewportHeight - bandHeight)) / 2;

    const items = FILM_PHOTOS.map((photo, index) => ({
      photo,
      width: widths[index],
      height: heights[index],
      left: lefts[index],
      top: anchorY - heights[index] / 2,
      opacity: 0.5 + 0.5 * smoothstep(1 - Math.min(1, Math.abs(progress - index) / 2.12)),
    }));

    return {
      stripX,
      stripWidth: Math.max(cursor, viewportWidth),
      items,
      pageHeight: viewportWidth >= 640 ? viewportHeight + DESKTOP_STEP * (FILM_PHOTOS.length - 1) : viewportHeight,
    };
  }, [progress, viewport.height, viewport.width]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-no-drag]")) {
        return;
      }

      if (!isMobile && event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }

      stopMotion();
      dragState.current = {
        active: true,
        moved: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startProgress: progressRef.current,
        axis: isMobile ? "x" : null,
        samples: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }],
      };

      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    },
    [isMobile, stopMotion],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragState.current.active || dragState.current.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - dragState.current.startX;
      const deltaY = event.clientY - dragState.current.startY;
      const distance = Math.abs(deltaX) + Math.abs(deltaY);

      if (distance > DRAG_THRESHOLD) {
        dragState.current.moved = true;
      }

      if (dragState.current.axis === null) {
        dragState.current.axis = Math.abs(deltaX) >= Math.abs(deltaY) ? "x" : "y";
      }

      dragState.current.samples = [
        ...dragState.current.samples.slice(-5),
        { t: event.timeStamp, x: event.clientX, y: event.clientY },
      ];

      if (isMobile) {
        const nextProgress = clamp(dragState.current.startProgress - deltaX / MOBILE_STEP, 0, FILM_PHOTOS.length - 1);
        commitProgress(nextProgress, false);
        return;
      }

      const dominantDelta = dragState.current.axis === "y" ? deltaY : deltaX;
      const nextProgress = clamp(dragState.current.startProgress - dominantDelta / DESKTOP_DRAG_STEP, 0, FILM_PHOTOS.length - 1);
      commitProgress(nextProgress, true);
    },
    [commitProgress, isMobile],
  );

  const endDrag = useCallback(
    (pointerId: number | null) => {
      if (!dragState.current.active || dragState.current.pointerId !== pointerId) {
        return;
      }

      const shouldSuppressClick = dragState.current.moved;
      const axis = dragState.current.axis ?? "x";
      const samples = dragState.current.samples;
      dragState.current.active = false;
      dragState.current.moved = false;
      dragState.current.pointerId = null;
      setIsDragging(false);
      suppressClickRef.current = shouldSuppressClick;
      dragState.current.axis = null;
      dragState.current.samples = [];

      if (!shouldSuppressClick) {
        snapToNearestFrame();
        return;
      }

      const latest = samples[samples.length - 1];
      const earliest =
        [...samples].reverse().find((sample) => latest && latest.t - sample.t >= DRAG_RELEASE_WINDOW_MS) ?? samples[0];

      if (!latest || !earliest) {
        snapToNearestFrame();
        return;
      }

      const delta = axis === "y" ? latest.y - earliest.y : latest.x - earliest.x;
      const elapsed = Math.max(16, latest.t - earliest.t);
      const step = isMobile ? MOBILE_STEP : DESKTOP_DRAG_STEP;
      const releaseVelocity = clamp(-(delta / elapsed) / step, -MAX_VELOCITY, MAX_VELOCITY);

      if (prefersReducedMotion || Math.abs(releaseVelocity) <= VELOCITY_EPSILON) {
        snapToNearestFrame();
        return;
      }

      startMotion("free", { velocity: releaseVelocity });
    },
    [isMobile, prefersReducedMotion, snapToNearestFrame, startMotion],
  );

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-no-drag]")) {
        return;
      }

      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(dominantDelta) < 0.5) {
        return;
      }

      event.preventDefault();

      if (prefersReducedMotion) {
        const divisor = isMobile ? MOBILE_STEP : DESKTOP_STEP;
        commitProgress(progressRef.current + dominantDelta / divisor, !isMobile);
        snapToNearestFrame();
        return;
      }

      startMotion("free", {
        velocity: motionRef.current.velocity + dominantDelta * WHEEL_IMPULSE,
      });
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [commitProgress, isMobile, prefersReducedMotion, snapToNearestFrame, startMotion]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (infoOpen) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        selectIndex(currentIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        selectIndex(currentIndex - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        selectIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        selectIndex(FILM_PHOTOS.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, infoOpen, selectIndex]);

  return (
    <main className={styles.pageRoot}>
      <div
        ref={viewportRef}
        className={`${styles.viewport} ${isDragging ? styles.viewportDragging : ""}`}
        data-film-page
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => endDrag(event.pointerId)}
        onPointerCancel={(event) => endDrag(event.pointerId)}
        onLostPointerCapture={(event) => endDrag(event.pointerId)}
      >
        <div className={`${styles.loadingOverlay} ${loadingVisible ? "" : styles.loadingOverlayHidden}`}>
          <p>
            <span style={{ opacity: messageVisible ? 1 : 0, transition: prefersReducedMotion ? "none" : "opacity 300ms ease" }}>
              {LOADING_MESSAGES[messageIndex]}
            </span>
            <span className={styles.loadingDots}>
              <span className={styles.loadingDot}>.</span>
              <span className={styles.loadingDot} style={{ animationDelay: "0.2s" }}>
                .
              </span>
              <span className={styles.loadingDot} style={{ animationDelay: "0.4s" }}>
                .
              </span>
            </span>
          </p>
        </div>

        <div className={styles.topFade} aria-hidden="true" />
        <div className={styles.bottomFade} aria-hidden="true" />
        <div className={styles.leftFade} aria-hidden="true" />
        <div className={styles.rightFade} aria-hidden="true" />

        <button
          type="button"
          data-no-drag
          className={`${styles.headerButton} ${styles.backButton}`}
          aria-label="Go back to home"
          onClick={() => selectIndex(0)}
        >
          <PlaceholderLogo className={styles.logoBadge} />
        </button>

        <button
          type="button"
          data-no-drag
          className={`${styles.headerButton} ${styles.infoButton}`}
          aria-label="Project info"
          onClick={() => setInfoOpen(true)}
        >
          <InfoIcon />
        </button>

        <div className={styles.stripLayer}>
          <div
            className={styles.strip}
            style={{
              width: `${layout.stripWidth}px`,
              transform: `translate3d(${layout.stripX}px, 0, 0)`,
              transition: isDragging || isMotionActive || prefersReducedMotion ? "none" : "transform 260ms var(--ease-standard)",
            }}
          >
            {layout.items.map((item, index) => (
              <button
                key={item.photo.id}
                type="button"
                className={styles.frameButton}
                aria-label={`Show ${item.photo.title}`}
                aria-current={index === currentIndex || undefined}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }

                  selectIndex(index);
                }}
                style={{
                  left: `${item.left}px`,
                  top: `${item.top}px`,
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  opacity: item.opacity,
                  transition: isDragging || isMotionActive || prefersReducedMotion
                    ? "none"
                    : "left 280ms var(--ease-standard), top 280ms var(--ease-standard), width 280ms var(--ease-standard), height 280ms var(--ease-standard), opacity 220ms var(--ease-standard), box-shadow 220ms var(--ease-standard)",
                }}
              >
                <div className={styles.frameMedia}>
                  <div className={styles.placeholderShell}>
                    <Image
                      src={mediaSources[index].src}
                      alt={`${item.photo.note}, ${item.photo.month} ${item.photo.year}. ${mediaSources[index].alt}`}
                      fill
                      priority={index < 4}
                      unoptimized
                      className={styles.placeholderSvg}
                      style={{ objectPosition: mediaSources[index].position }}
                      sizes={`${Math.ceil(item.width)}px`}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.timelineDock}>
          <Timeline
            photos={FILM_PHOTOS}
            progress={progress}
            currentIndex={currentIndex}
            hoveredIndex={hoveredIndex}
            onSelect={selectIndex}
            onHover={setHoveredIndex}
            viewportWidth={viewport.width}
          />
        </div>

        <ProjectInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      </div>

      <div className={styles.heightFiller} aria-hidden="true" style={{ height: `${layout.pageHeight}px` }} />
    </main>
  );
}
