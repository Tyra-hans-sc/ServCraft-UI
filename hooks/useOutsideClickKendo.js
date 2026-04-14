//from https://medium.com/@kevinfelisilda/click-outside-element-event-using-react-hooks-2c540814b661
import { useEffect } from "react";

const useOutsideClickKendo = (ref, callback) => {
  const handleClick = e => {
    if (ref.current && ref.current.element && !ref.current.element.contains(e.target)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useOutsideClickKendo;
