import { OutputData } from "@editorjs/editorjs";
import { Fragment, JSX, createElement } from "react";

interface Props {
  content: OutputData;
}

export function serializeData({ content }: Props) {
  return (
    <Fragment>
      {content.blocks.map((_block, index): JSX.Element | null => {
        const blockType = _block.type;
        const data = _block.data;

        switch (blockType) {
          case "header": {
            const level = data.level as number;
            const text = data.text as string;

            return createElement(`h${level}`, { key: index }, text);
          }
          case "paragraph": {
            return (
              <p key={index} dangerouslySetInnerHTML={{ __html: data.text }} />
            );
          }
          case "image": {
            return (
              <div className="mx-auto">
                <img
                  className="object-contain w-full h-auto rounded-lg"
                  src={data.file.url}
                />
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </Fragment>
  );
}
