import react, { useCallback, useEffect } from "react";

const setInterval = window.setInterval;

function Table() {
  const step = useCallback(function (t) {}, []);

  useEffect(() => {
    const handle = requestAnimationFrame(step);
    return () => cancelAnimationFrame(handle);
  }, [step]);
}

export default Table;
