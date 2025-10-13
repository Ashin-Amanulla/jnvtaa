import { useLazyImage } from "@/hooks/useLazyImage";

export default function LazyImage({ src, alt, className, ...props }) {
  const { imgRef, imageSrc, isLoaded } = useLazyImage(src);

  return (
    <div ref={imgRef} className={`relative ${className || ""}`} {...props}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className || ""} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-500`}
          {...props}
        />
      )}
    </div>
  );
}
