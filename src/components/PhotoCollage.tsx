import React, { useState, useEffect, useCallback } from 'react';
import styles from './PhotoCollage.module.css';

interface Photo {
  source: string;
  alt: string;
}

interface PhotoCollageProps {
  width: string;
  height: string[];
  layout: number[];
  photos: Photo[];
  showNumOfRemainingPhotos?: boolean;
  caption?: React.ReactNode;
}

const PhotoCollage: React.FC<PhotoCollageProps> = ({ width, height, layout, photos, caption }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = 'unset'; // Restore scrolling
  }, []);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
    }
  }, [lightboxIndex, photos.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
    }
  }, [lightboxIndex, photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  const renderRow = (rowPhotos: Photo[], rowHeight: string, rowIndex: number, startIndex: number) => {
    const isSingleTotal = photos.length === 1;
    return (
      <div key={rowIndex} className={styles.row} style={{ height: rowHeight }}>
        {rowPhotos.map((photo, i) => {
          const globalIndex = startIndex + i;
          return (
            <div key={i} className={styles.photoContainer} onClick={() => openLightbox(globalIndex)}>
              <img
                src={photo.source}
                alt={photo.alt}
                className={styles.photo}
                style={isSingleTotal ? { objectFit: 'contain' } : undefined}
              />
            </div>
          );
        })}
      </div>
    );
  };

  let photoIndex = 0;

  return (
    <>
      <div className={styles.collage} style={{ width }}>
        {layout.map((numPhotos, rowIndex) => {
          if (photoIndex >= photos.length) return null;

          const startIndex = photoIndex;
          const rowPhotos = photos.slice(photoIndex, photoIndex + numPhotos);
          const rowHeight = height[rowIndex];
          photoIndex += numPhotos;
          return renderRow(rowPhotos, rowHeight, rowIndex, startIndex);
        })}
        {caption && (
          <div className={styles.collageCaption}>
            {caption}
          </div>
        )}
      </div>


      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.closeButton} onClick={closeLightbox}>×</button>

          <button className={`${styles.navButton} ${styles.prevButton}`} onClick={prevImage}>
            ‹
          </button>

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIndex].source}
              alt={photos[lightboxIndex].alt}
              className={styles.lightboxImage}
            />
            <div className={styles.caption}>{photos[lightboxIndex].alt}</div>
          </div>

          <button className={`${styles.navButton} ${styles.nextButton}`} onClick={nextImage}>
            ›
          </button>
        </div>
      )}
    </>
  );
};

export default PhotoCollage;
