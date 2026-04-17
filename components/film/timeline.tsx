"use client";

import { useMemo } from "react";
import type { FilmPhoto } from "@/data/film";
import styles from "./film-experience.module.css";

type TimelineProps = {
  photos: FilmPhoto[];
  progress: number;
  currentIndex: number;
  hoveredIndex: number | null;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
  viewportWidth: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function Timeline({
  photos,
  progress,
  currentIndex,
  hoveredIndex,
  onSelect,
  onHover,
  viewportWidth,
}: TimelineProps) {
  const activePhoto = photos[currentIndex];
  const activeIndex = clamp(progress, 0, Math.max(0, photos.length - 1));

  const timeline = useMemo(() => {
    const width = photos.length * 6 + Math.max(0, photos.length - 1) * 4;
    const shift = -(currentIndex * 10) + Math.min(0, viewportWidth < 640 ? 0 : 3);
    const barHeights = photos.map((_, index) => {
      const distance = Math.abs(activeIndex - index);
      const intensity = smoothstep(1 - Math.min(1, distance / 6));
      const activeBoost = index === currentIndex ? 8 : 0;
      return 28 + intensity * 8 + activeBoost;
    });
    const markerLeft = currentIndex * 10 + 3;
    const hoverLeft = hoveredIndex === null ? null : hoveredIndex * 10 + 3;

    return {
      width,
      shift,
      barHeights,
      markerLeft,
      hoverLeft,
    };
  }, [photos, currentIndex, hoveredIndex, activeIndex, viewportWidth]);

  if (!activePhoto) {
    return null;
  }

  return (
    <div className={styles.timelineInner}>
      <div className={styles.noteLabel}>{activePhoto.note}</div>

      <div className={styles.timelineStage} style={{ ["--timeline-shift" as string]: `${timeline.shift}px` }}>
        <div className={styles.timelineSpacer} aria-hidden="true" />
        <div className={styles.timelineRail} style={{ ["--timeline-width" as string]: `${timeline.width}px` }}>
          <div className={styles.timelineNoteSpacer} aria-hidden="true" />

          <div className={styles.timelineTabs} role="tablist" aria-label="Film photos timeline">
            {photos.map((photo, index) => {
              const isActive = index === currentIndex;

              return (
                <button
                  key={photo.id}
                  type="button"
                  className={`${styles.timelineTab} ${isActive ? styles.timelineTabActive : ""}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${photo.month} ${photo.year}, photo ${index + 1} of ${photos.length}`}
                  onClick={() => onSelect(index)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") {
                      onHover(index);
                    }
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") {
                      onHover(null);
                    }
                  }}
                >
                  <span className={styles.timelineBar} style={{ height: `${timeline.barHeights[index]}px` }} />
                </button>
              );
            })}
          </div>

          <div className={styles.timelineMeta}>
            {hoveredIndex !== null ? (
              <div className={`${styles.timelineMarker} ${styles.timelineHover}`} style={{ left: `${timeline.hoverLeft}px` }}>
                <span className={styles.timelineMonth}>{photos[hoveredIndex].month}</span>
                <span className={styles.timelineYear}>{photos[hoveredIndex].year}</span>
              </div>
            ) : null}

            <div className={styles.timelineMarker} style={{ left: `${timeline.markerLeft}px` }}>
              <span className={styles.timelineMonth}>{activePhoto.month}</span>
              <span className={styles.timelineYear}>{activePhoto.year}</span>
            </div>
          </div>
        </div>
        <div className={styles.timelineSpacer} aria-hidden="true" />
      </div>
    </div>
  );
}
