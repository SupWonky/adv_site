import {
  FieldMetadata,
  unstable_useControl as useControl,
} from "@conform-to/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useFileUpload } from "~/routes/api/v1/upload";
import { cn } from "~/lib/utils";

interface Image {
  url: string;
  name: string | null;
  id?: string;
}

export function ImagePickerConform({
  meta,
  initialValue,
}: {
  meta: FieldMetadata<string>;
  initialValue?: Image;
}) {
  const [temporaryPreview, setTemporaryPreview] = useState<string | null>(null);
  const { submit, isUploading, data: uploadData } = useFileUpload();
  const [image, setImage] = useState<Image | undefined>(initialValue);
  const [isRemoving, setIsRemoving] = useState(false);
  const control = useControl(meta);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Чтение для временного предпросмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemporaryPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Начать загрузку
      submit(file);
    },
    [submit]
  );

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: isUploading,
  });

  // Обработка завершения загрузки
  useEffect(() => {
    if (uploadData) {
      control.change(uploadData.file.id);
      setImage({ ...uploadData.file });
      setTemporaryPreview(null);
    }
  }, [uploadData]);

  const removeImage = () => {
    setIsRemoving(true);
    // Задержка фактического удаления для анимации
    setTimeout(() => {
      setTemporaryPreview(null);
      setImage(undefined);
      setIsRemoving(false);
    }, 300);
  };

  const currentPreview = temporaryPreview || image?.url;
  const currentName = temporaryPreview ? "Загрузка..." : image?.name;

  return (
    <div>
      <input
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        defaultValue={meta.initialValue}
        name={meta.name}
        ref={control.register}
        onFocus={() => {
          inputRef.current?.focus();
        }}
      />

      {currentPreview ? (
        <div
          className={`relative rounded-lg overflow-hidden border transform transition-all duration-200 ease-in-out ${
            isRemoving ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="relative aspect-video w-full bg-gray-100">
            <img
              src={currentPreview}
              alt={currentName || "Выбранное изображение"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="animate-spin text-white h-8 w-8" />
              </div>
            )}
          </div>
          <div className="p-3 flex items-center justify-between border-t">
            <span className="text-sm text-muted-foreground truncate max-w-xs">
              {currentName || "Выбранное изображение"}
            </span>
            {!isUploading && (
              <button
                type="button"
                onClick={removeImage}
                className="group p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                aria-label="Удалить изображение"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200",
            meta.errors && "border-destructive",
            isDragActive
              ? "border-primary bg-primary/10"
              : "hover:border-primary",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div
            className={`p-3 mb-3 rounded-full bg-muted text-muted-foreground ${
              isDragActive ? "bg-primary/20 text-primary" : ""
            }`}
          >
            {isUploading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : isDragActive ? (
              <ImageIcon size={24} className="animate-pulse" />
            ) : (
              <Upload
                size={24}
                className="transform transition-transform group-hover:translate-y-1 duration-200"
              />
            )}
          </div>
          <p className="text-sm font-medium transition-colors duration-300">
            {isUploading
              ? "Загрузка..."
              : isDragActive
              ? "Отпустите для загрузки"
              : "Нажмите или перетащите сюда"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG до 10МБ</p>
        </div>
      )}
    </div>
  );
}
