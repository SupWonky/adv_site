import React, { useEffect } from "react";

interface SidebarConetextValues {
  navigate: (to: string) => void;
  navigateBack: () => void;
  paths: string[];
}

export const SidebarContext = React.createContext<
  SidebarConetextValues | undefined
>(undefined);

type TabsType = Record<string, { level: number }>;

interface SidebarState {
  tabs: TabsType;
}

type SidebarAction =
  | { type: "NEXT"; payload: { tabId: string } }
  | { type: "BACK"; payload: { tabId: string } };

function sidebarReducer(
  state: SidebarState,
  action: SidebarAction
): SidebarState {
  switch (action.type) {
    case "NEXT": {
      const { tabId } = action.payload;
      const item = state.tabs[tabId];
      if (!item) {
        // either ignore unknown tabs or initialize them
        return state;
      }
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [tabId]: { level: item.level + 1 },
        },
      };
    }

    case "BACK": {
      const { tabId } = action.payload;
      const item = state.tabs[tabId];
      if (!item) {
        return state;
      }
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [tabId]: { level: item.level - 1 },
        },
      };
    }

    default: {
      // exhaustiveness check: if you add a new action, TS will error here
      const _exhaustive: never = action;
      return state;
    }
  }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [paths, setPaths] = React.useState<string[]>([]);

  const navigate = (to: string) => {
    setPaths((prev) => [...prev, to]);
  };

  const navigateBack = () => {
    setPaths((prev) => prev.slice(0, paths.length - 1));
  };

  return (
    <SidebarContext.Provider value={{ navigate, navigateBack, paths }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be within a SidebarProvider");
  }
  return context;
}
