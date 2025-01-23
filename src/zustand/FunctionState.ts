import { create, StateCreator } from "zustand";

export interface FunctionState {
  functions: { [key: string]: Function };
  addFunction: (name: string, func: Function) => void;
}

const functionStateCreator: StateCreator<FunctionState> = (set) => ({
  functions: {},
  addFunction: (name, func) =>
    set((state) => ({
      functions: { ...state.functions, [name]: func },
    })),
});

export const useFunctionState = create(functionStateCreator);

export default useFunctionState;
