import { useReducer, useState, createContext } from "react";
import { Configuration } from "./Components/Configuration";
import { Phone } from "./Components/Phone";
import { AppContext, AppDispatchContext } from "./Context/AppContext";

const PendingAppContext = createContext<State | null>(null);

const App = () => {
  const [pendingConfig, dispatch] = useReducer(appReducer, initialState);
  const [appliedConfig, setAppliedConfig] = useState(initialState);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [resetPhone, setResetPhone] = useState(0);

  // Handler to apply config to phone
  const handleApplyConfig = () => {
    setAppliedConfig(pendingConfig);
  };

  return (
    <PendingAppContext.Provider value={pendingConfig}>
      <AppContext.Provider value={appliedConfig}>
        <AppDispatchContext.Provider value={dispatch}>
          <div className="flex flex-col justify-around p-8 h-screen items-center lg:flex-row">
            <Configuration
              isConfirmed={isConfirmed}
              setIsConfirmed={setIsConfirmed}
              uploadedVideoName={uploadedVideoName}
              setUploadedVideoName={setUploadedVideoName}
              resetPhone={resetPhone}
              setResetPhone={setResetPhone}
              handleApplyConfig={handleApplyConfig}
              PendingAppContext={PendingAppContext}
            />
            <Phone
              isConfirmed={isConfirmed}
              setIsConfirmed={setIsConfirmed}
              uploadedVideoName={uploadedVideoName}
              setUploadedVideoName={setUploadedVideoName}
              resetPhone={resetPhone}
              setResetPhone={setResetPhone}
            />
          </div>
        </AppDispatchContext.Provider>
      </AppContext.Provider>
    </PendingAppContext.Provider>
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
