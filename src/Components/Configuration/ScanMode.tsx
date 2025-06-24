import { useContext } from "react";
import { AppContext, AppDispatchContext } from "../../Context/AppContext";

export const ScanMode = () => {
  const state = useContext(AppContext);
  const dispatch = useContext(AppDispatchContext);

  return (
    <div className="text-white max-w-xl mx-auto">
      <section>
        <h2 className="text-xl font-bold mb-2">End scan</h2>
        <p className="mb-4">
          Would you like the scan to end automatically or manually?
        </p>
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
              <span className="font-semibold text-lg">Automatically</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              Automatically take valid photo (best practice for time sensitive
              cases)
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
              <span className="font-semibold text-lg">Manually</span>
            </div>
            <p className="text-sm text-gray-300 text-left">
              User decide when to take photo (best practice for better image
              quality)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
