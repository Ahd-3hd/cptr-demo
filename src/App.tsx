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
    case "video":
      return {
        ...state,
        video: action.value,
      };
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export interface State {
  displayMode: "checklist" | "suggestion";
  scanMode: "automatic" | "manual";
  video: string;
}
const initialState: State = {
  displayMode: "checklist",
  scanMode: "automatic",
  video: "/Delivery.mp4",
};

export default App;
