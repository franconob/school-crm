import { useContext } from "react";
import { AppStateContext } from ".";

const useAppState = () => {
  const context = useContext(AppStateContext);

  if (!context) throw new Error("Cannot use context outside its provider");

  return context;
};

export { useAppState };
