import { useReducer } from "react";
import { Configuration } from "./Components/Configuration";
import { Phone } from "./Components/Phone";
import { AppContext, AppDispatchContext } from "./Context/AppContext";

const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        <div className="flex flex-col justify-around p-8 h-screen items-center lg:flex-row">
          <Configuration />
          <Phone />
        </div>
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function appReducer(state: State, action: { type: string; value: any }): State {
  switch (action.type) {
    case "displayMode":
      return {
        ...state,
        displayMode: action.value,
      };
    case "scanMode":
      return {
        ...state,
        scanMode: action.value,
      };
    case "setModel":
      if (state.model?.url && state.model.url.startsWith("blob:")) {
        URL.revokeObjectURL(state.model.url);
      }
      return {
        ...state,
        model: action.value,
      };
    case "updateModelDimensions":
      return {
        ...state,
        model: state.model
          ? {
              ...state.model,
              width: action.value.width,
              height: action.value.height,
            }
          : null,
      };
    case "clearModel":
      if (state.model?.url && state.model.url.startsWith("blob:")) {
        URL.revokeObjectURL(state.model.url);
      }
      return {
        ...state,
        model: null,
      };
    case "resetToDefault":
      if (state.model?.url && state.model.url.startsWith("blob:")) {
        URL.revokeObjectURL(state.model.url);
      }
      return {
        ...state,
        model: defaultModel,
      };
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export interface ModelInfo {
  file?: File;
  url: string;
  name: string;
  width: number;
  height: number;
  isDefault: boolean;
  classes?: string[];
}

export interface State {
  displayMode: "checklist" | "suggestion";
  scanMode: "automatic" | "manual";
  model: ModelInfo | null;
}

const defaultModel: ModelInfo = {
  url: "/default.tflite",
  name: "Default Package Delivery Model",
  width: 256,
  height: 341,
  isDefault: true,
};

const initialState: State = {
  displayMode: "checklist",
  scanMode: "automatic",
  model: defaultModel,
};

export default App;
