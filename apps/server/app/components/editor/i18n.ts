import { I18nConfig } from "@editorjs/editorjs";

const i18nConfig: I18nConfig = {
  messages: {
    blockTunes: {
      delete: {
        Delete: "Удалить",
        "Click to delete": "Подтвердите удалние",
      },
      moveUp: {
        "Move up": "Переместить вверх",
      },
      moveDown: {
        "Move down": "Переместить вниз",
      },
      filter: {
        Filter: "Фильтр",
      },
      convertTo: {
        "Convert to": "Конвертировать в",
      },
    },

    ui: {
      blockTunes: {
        toggler: {
          "Click to tune": "Нажмите, чтобы настроить",
          "or drag to move": "или перетащите",
        },
      },
      toolbar: {
        toolbox: {
          Add: "Добавить",
        },
      },
      inlineToolbar: {
        converter: {
          "Convert to": "Конвертировать в",
        },
      },
      popover: {
        Filter: "Фильтр",
        "Nothing found": "Ничего не найдено",
        "Convert to": "Изменить",
        Link: "Ссылка",
      },
      tooltip: {
        Link: "Ссылка",
      },
    },
    toolNames: {
      Text: "Параграф",
      "Ordered List": "Нумерованный лист",
      "Unordered List": "Маркированный лист",
      Checklist: "Чеклист",
      Image: "Изображение",
      Heading: "Заголовок",
      Link: "Ссылка",
      Bold: "Жирный",
      Italic: "Курсив",
    },
    tools: {
      list: {
        Unordered: "Маркированный",
        Ordered: "Нумерованный",
        Checklist: "Чеклист",
        "Start with": "Начинаеться с",
        "Counter type": "Тип списка",
        Numeric: "Цифры",
        "Lower Roman": "Строчные римские",
        "Upper Roman": "Прописные римские",
        "Lower Alpha": "Строчные буквы",
        "Upper Alpha": "Прописные буквы",
      },
      link: {
        "Add a link": "Добавить ссылку",
      },
      header: {
        "Heading 2": "Заголовок 2",
        "Heading 3": "Заголовок 3",
        "Heading 4": "Заголовок 4",
      },
    },
  },
};

export { i18nConfig };
