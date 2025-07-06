import { FieldMetadata, FieldName } from "@conform-to/react";
import { useState, useCallback, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useFileUpload } from "~/routes/api/v1/upload";
import { cn } from "~/lib/utils";

interface Image {
  url: string;
  name: string | null;
  id?: string;
}

export function ImagesPickerConform({
  name,
  initialValue,
  maxImages = 5,
}: {
  name?: string;
  initialValue?: Image[];
  maxImages?: number;
}) {
  const { submit, data: uploadData, isUploading } = useFileUpload();
  const [images, setImages] = useState<Image[]>(initialValue ?? []);
  const [animateIn, setAnimateIn] = useState<number | null>(null);
  const [animateOut, setAnimateOut] = useState<number | null>(null);

  // Обработка завершения загрузки
  useEffect(() => {
    if (uploadData) {
      const newImages = [...images, { ...uploadData.file }];
      setImages(newImages);
      setAnimateIn(newImages.length - 1);
      setTimeout(() => setAnimateIn(null), 500);
    }
  }, [uploadData]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      submit(file);
    },
    [submit]
  );

  const removeImage = useCallback((index: number) => {
    setAnimateOut(index);
    setTimeout(() => {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setAnimateOut(null);
    }, 300);
  }, []);

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: isUploading || images.length >= maxImages,
  });

  const totalImagesCount = images.length;
  const canUploadMore = totalImagesCount < maxImages;
  const imageIds = images.map((image) => ({ id: image.id }));

  return (
    <div>
      <input
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        name={name}
        value={JSON.stringify(imageIds)}
        readOnly
      />

      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => {
            const animationClasses =
              animateIn === index
                ? "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                : animateOut === index
                ? "animate-out fade-out-0 slide-out-to-right-4 duration-300"
                : "";

            return (
              <div
                key={image.id || `image-${index}`}
                className={cn(
                  "relative rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 h-full transform",
                  animationClasses
                )}
              >
                <div className="relative aspect-video w-full bg-slate-50 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name || `Изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="400"
                    height="225"
                  />
                </div>
                <div className="p-3 flex items-center justify-between border-t">
                  <span className="text-sm text-muted-foreground truncate max-w-xs">
                    {image.name || `Изображение ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="group p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                    aria-label="Удалить изображение"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors duration-200 ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "hover:border-primary"
          } ${
            !canUploadMore ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input {...getInputProps()} />
          <div
            className={`p-3 mb-3 rounded-full transition-colors ${
              isDragActive
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isUploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : isDragActive ? (
              <ImageIcon size={24} className="animate-pulse" />
            ) : (
              <Upload size={24} />
            )}
          </div>
          <p className="text-sm font-medium transition-colors duration-300">
            {isUploading
              ? "Загрузка..."
              : isDragActive
              ? "Отпустите для загрузки"
              : "Нажмите или перетащите сюда"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG до 10 МБ ({totalImagesCount}/{maxImages})
          </p>
        </div>
      )}

      {totalImagesCount >= maxImages && !isUploading && (
        <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg transition-all duration-300 animate-in fade-in-0">
          Достигнуто максимальное количество изображений ({maxImages})
        </div>
      )}
    </div>
  );
}
