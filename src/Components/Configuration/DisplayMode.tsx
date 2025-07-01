import { useContext } from "react";
import { AppContext, AppDispatchContext } from "../../Context/AppContext";

export const DisplayMode = ({ ContextOverride }: { ContextOverride?: React.Context<any> }) => {
  const state = useContext(ContextOverride || AppContext);
  const dispatch = useContext(AppDispatchContext);

  return (
    <div className="text-white max-w-xl mx-auto">
      <section>
        <p className="mb-4 text-lg font-bold">How would you like to display feedback to the user?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              state?.displayMode === "checklist"
                ? "border-[#4930e2] bg-[#4930e2]/10"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
            }`}
            onClick={() => {
              dispatch?.({
                type: "displayMode",
                value: "checklist",
              });
            }}
          >
            <div className="flex items-center mb-2 text-left">
              <span className="font-semibold text-lg">Show Separate Icons</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              Show each model output as an individual icon
            </p>
          </div>
          
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              state?.displayMode === "suggestion"
                ? "border-[#4930e2] bg-[#4930e2]/10"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
            }`}
            onClick={() => {
              dispatch?.({
                type: "displayMode",
                value: "suggestion",
              });
            }}
          >
            <div className="flex items-center mb-2 text-left">
              <span className="font-semibold text-lg">Stream One Message</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              Show one message based on all model outputs
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
