import { useContext } from "react";
import { AppContext, AppDispatchContext } from "../../Context/AppContext";

export const ScanMode = ({ ContextOverride }: { ContextOverride?: React.Context<any> }) => {
  const state = useContext(ContextOverride || AppContext);
  const dispatch = useContext(AppDispatchContext);

  return (
    <div className="text-white max-w-xl mx-auto">
      <section>
        <p className="mb-4 text-lg font-bold">Would you like the scan to end automatically or manually?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              state?.scanMode === "automatic"
                ? "border-[#4930e2] bg-[#4930e2]/10"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
            }`}
            onClick={() => {
              dispatch?.({
                type: "scanMode",
                value: "automatic",
              });
            }}
          >
            <div className="flex items-center mb-2 text-left">
              <span className="font-semibold text-lg">Auto-capture</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              Ends scan once image passes checks
            </p>
          </div>
          
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              state?.scanMode === "manual"
                ? "border-[#4930e2] bg-[#4930e2]/10"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
            }`}
            onClick={() => {
              dispatch?.({
                type: "scanMode",
                value: "manual",
              });
            }}
          >
            <div className="flex items-center mb-2 text-left">
              <span className="font-semibold text-lg">Manual capture</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              Ends scan when user clicks a button
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
