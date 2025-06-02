import { useState } from "react";

export const ScanMode = () => {
  const [endScanMode, setEndScanMode] = useState("auto");

  return (
    <div className="text-white max-w-xl mx-auto">
      <section>
        <h2 className="text-xl font-bold mb-2">End scan</h2>
        <p className="mb-4">
          Would you like to end the scan automatically by the model or manually
          by user?
        </p>
        <div className="space-y-3 flex">
          <label className="flex items-start space-x-3 cursor-pointer m-0">
            <input
              type="radio"
              name="endScanMode"
              value="auto"
              checked={endScanMode === "auto"}
              onChange={() => setEndScanMode("auto")}
            />
            <div>
              <span className="font-semibold">Automatically</span>
              <p className="text-sm text-gray-300">
                Automatically take valid photo (best practice for time sensitive
                cases)
              </p>
            </div>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer m-0">
            <input
              type="radio"
              name="endScanMode"
              value="manual"
              checked={endScanMode === "manual"}
              onChange={() => setEndScanMode("manual")}
            />
            <div>
              <span className="font-semibold">Manually</span>
              <p className="text-sm text-gray-300">
                User decide when to take photo (best practice for better image
                quality)
              </p>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
};
