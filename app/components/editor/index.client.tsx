import React, { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import List from "@editorjs/list";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import { i18nConfig } from "./i18n";

interface EdtiorProps extends React.HTMLAttributes<HTMLDivElement> {
  initialValue?: OutputData;
  onValueChange?: (value: OutputData) => void;
}

const Editor = React.forwardRef<HTMLDivElement, EdtiorProps>(
  ({ onValueChange, initialValue, className }, ref) => {
    const editorRef = useRef<EditorJS | null>(null);

    useEffect(() => {
      if (!editorRef.current) {
        const editor = new EditorJS({
          holder: "editorjs",
          data: initialValue,
          onChange: async (api) => {
            const savedData = await api.saver.save();
            onValueChange?.(savedData);
          },
          tools: {
            list: List,
            header: {
              // @ts-expect-error type issue
              class: Header,
              config: {
                placeholder: "Введите заголовок...",
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            image: {
              class: Image,
              config: {
                endpoints: {
                  byFile: "http://localhost:5173/api/v1/upload", // Backend file uploader endpoint
                  byUrl: "http://localhost:5173/api/v1/uploadByUrl", // Endpoint that provides uploading by Url
                },
                field: "file",
                buttonContent: "Выберите изображение",
              },
            },
          },
          i18n: i18nConfig,
        });

        editorRef.current = editor;
      }
    }, [onValueChange, initialValue]);

    return <div id="editorjs" ref={ref} className={className} />;
  }
);
Editor.displayName = "Editor";

export { Editor };
