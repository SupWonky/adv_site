import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(e: MediaQueryListEvent) {
      setValue(e.matches);
    }

    const result = matchMedia(query);
    setValue(result.matches);
    result.addEventListener("change", onChange);

    return () => {
      result.removeEventListener("change", onChange);
    };
  }, [query]);

  return value;
}
