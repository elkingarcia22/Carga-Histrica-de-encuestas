interface UploadLiveRegionProps {
  message: string | null;
}

export function UploadLiveRegion({ message }: UploadLiveRegionProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
