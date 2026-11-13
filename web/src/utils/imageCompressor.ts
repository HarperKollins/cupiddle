/**
 * Client-side image compression for mobile devices & web browsers.
 * 
 * Takes high-resolution camera photos (e.g. 12MP/48MP, 5MB - 18MB, HEIC/JPEG)
 * from iPhones, Android devices, and web cameras, resizes them to a web-optimized
 * dimension (max 1280px) and converts them to standard JPEG (~150KB - 300KB).
 * 
 * Benefits:
 * - Solves Vercel's 4.5MB serverless proxy body limit (prevents HTTP 413)
 * - Converts Apple HEIC / mobile camera formats into universal JPEGs
 * - Blazing fast upload on mobile networks (MTN, Airtel, Glo, Starlink)
 * - Zero external npm dependencies (pure HTML5 Canvas API)
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<File> {
  // If not an image, return original
  if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
    return file;
  }

  return new Promise((resolve) => {
    // Timeout safety: if canvas takes > 5 seconds, fallback to original
    const timer = setTimeout(() => {
      resolve(file);
    }, 5000);

    const reader = new FileReader();
    reader.onerror = () => {
      clearTimeout(timer);
      resolve(file);
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        clearTimeout(timer);
        resolve(file);
      };

      img.onload = () => {
        clearTimeout(timer);
        try {
          let { width, height } = img;

          // Compute aspect-ratio preserved dimensions
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Crisp image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Solid background fill so transparent PNGs render cleanly as JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw image scaled
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // Replace original extension with .jpg
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const safeName = `${baseName || 'photo'}.jpg`;

              const compressedFile = new File([blob], safeName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          console.warn('Canvas image compression fallback:', err);
          resolve(file);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
