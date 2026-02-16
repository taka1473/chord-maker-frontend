import { useState, useEffect } from "react";

function getColumns(width: number): number {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 4;
}

export function useColumnsPerRow(): number {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    function handleResize() {
      setCols(getColumns(window.innerWidth));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cols;
}
