"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FILM_PROJECT } from "@/data/film";
import { getFeatureMediaSource } from "./media-placeholder";
import styles from "./film-experience.module.css";

type ProjectInfoModalProps = {
  open: boolean;
  onClose: () => void;
};

const featureMedia = getFeatureMediaSource();

export function ProjectInfoModal({ open, onClose }: ProjectInfoModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={styles.modalRoot} data-info-modal>
      <button className={styles.modalOverlay} aria-label="Close project info" onClick={onClose} />
      <div className={styles.modalPanel} role="dialog" aria-modal="true" aria-labelledby="film-project-title">
        <div className={styles.modalBody}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitleRow}>
              <div className={styles.modalTitleGroup}>
                <p id="film-project-title">{FILM_PROJECT.title}</p>
                <p className={styles.modalYearDot}>•</p>
                <p className={styles.modalYear}>{FILM_PROJECT.year}</p>
              </div>
            </div>
            <p className={styles.modalCopy}>{FILM_PROJECT.description}</p>
          </div>

          <div className={styles.toolSection}>
            {FILM_PROJECT.toolCategories.map((category) => (
              <div key={category.label} className={styles.toolColumn}>
                <p className={styles.toolLabel}>{category.label}</p>
                <p className={styles.toolValue}>{category.tools.join(", ")}</p>
              </div>
            ))}
          </div>

          <div className={styles.heroCard}>
            <Image
              src={featureMedia.src}
              alt={featureMedia.alt}
              fill
              unoptimized
              priority
              className={styles.heroMedia}
              style={{ objectPosition: featureMedia.position }}
              sizes="(max-width: 768px) 95vw, 56rem"
            />
            <div className={styles.heroCaption}>reference still</div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
