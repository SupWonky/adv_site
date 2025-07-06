import { useState } from "react";
import { Combobox } from "./combobox";
import { ServiceNode } from "~/models/service.server";

interface ServiceSelectionProps extends React.ComponentProps<"input"> {
  services: ServiceNode[];
  initValue?: string; // note: consider renaming to defaultValue
}

export function ServiceSelector({
  services,
  initValue,
  ...props
}: ServiceSelectionProps) {
  // Helper function to recursively find the chain of category IDs from the root to the target
  const findCategoryChain = (
    nodes: ServiceNode[],
    targetId: string,
    path: string[] = []
  ): string[] | null => {
    for (const node of nodes) {
      const newPath = [...path, node.id];
      if (node.id === targetId) return newPath;
      if (node.children.length > 0) {
        const result = findCategoryChain(node.children, targetId, newPath);
        if (result) return result;
      }
    }
    return null;
  };

  // Initialize state with the default chain if a default value is provided
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    () => {
      if (initValue) {
        const chain = findCategoryChain(services, initValue);
        console.log(chain);
        return chain ? chain : [];
      }
      return [];
    }
  );

  // Build category hierarchy levels based on selections
  const serviceLevels: ServiceNode[][] = [services];
  for (let i = 0; i < selectedCategoryIds.length; i++) {
    const currentLevel = serviceLevels[i];
    const selectedCategory = currentLevel.find(
      (c) => c.id === selectedCategoryIds[i]
    );
    if (!selectedCategory) break;
    serviceLevels.push(selectedCategory.children);
  }

  const handleSelect = (level: number, value: string) => {
    // Update selections up to the current level and reset subsequent choices
    const newSelections = [...selectedCategoryIds.slice(0, level), value];
    setSelectedCategoryIds(newSelections);
  };

  return (
    <div className="flex flex-row flex-wrap gap-4">
      {serviceLevels.map((levelServices, levelIndex) => {
        if (levelServices.length === 0) return null;

        const comboboxItems = levelServices.map((category) => ({
          label: category.name,
          value: category.id,
        }));

        return (
          <Combobox
            key={levelIndex}
            title="Выберите рубрику"
            options={comboboxItems}
            selectedValue={selectedCategoryIds[levelIndex] || null}
            onSelect={(value) => handleSelect(levelIndex, value)}
          />
        );
      })}

      <input
        className="hidden"
        type="hidden"
        value={selectedCategoryIds.at(selectedCategoryIds.length - 1) || ""}
        {...props}
      />
    </div>
  );
}
