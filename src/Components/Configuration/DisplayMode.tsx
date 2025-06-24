import { useContext } from "react";
import { AppContext, AppDispatchContext } from "../../Context/AppContext";

export const DisplayMode = () => {
  const state = useContext(AppContext);
  const dispatch = useContext(AppDispatchContext);

  return (
    <div className="text-white max-w-xl mx-auto">
      <section>
        <h2 className="text-xl font-bold mb-2">Feedback mode</h2>
        <p className="mb-4">
          How would you like to display feedback to the user?
        </p>
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
              <span className="font-semibold text-lg">Icons</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              Guide users to pass all checks step-by-step
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
              <span className="font-semibold text-lg">Detailed text</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              Directly suggest desired user behavior changes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
