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
        <div className="space-y-3 flex">
          <label className="flex items-start space-x-3 cursor-pointer m-0">
            <input
              type="radio"
              name="feedbackMode"
              value="checklist"
              checked={state?.displayMode === "checklist"}
              onChange={() => {
                dispatch?.({
                  type: "displayMode",
                  value: "checklist",
                });
              }}
            />
            <div>
              <span className="font-semibold">Icons</span>
              <p className="text-sm text-gray-300">
                Guide users to pass all checks step-by-step
              </p>
            </div>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer m-0">
            <input
              type="radio"
              name="feedbackMode"
              value="suggestion"
              checked={state?.displayMode === "suggestion"}
              onChange={() => {
                dispatch?.({
                  type: "displayMode",
                  value: "suggestion",
                });
              }}
            />
            <div>
              <span className="font-semibold">Detailed text</span>
              <p className="text-sm text-gray-300">
                Directly suggest desired user behavior changes
              </p>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
};
