import { useContext, useEffect, useRef, useState } from "react";
import { AppContext, AppDispatchContext } from "../../Context/AppContext";

export const ModelUpload = () => {
  const dispatch = useContext(AppDispatchContext);
  const state = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dimensions, setDimensions] = useState({
    width: 256,
    height: 341,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".tflite")) {
      if (state?.model?.url) {
        dispatch?.({ type: "clearModel", value: null });
      }

      const url = URL.createObjectURL(file);

      const modelInfo = {
        file,
        url,
        name: file.name,
        width: dimensions.width,
        height: dimensions.height,
      };

      dispatch?.({ type: "setModel", value: modelInfo });
    } else {
      alert("Please select a valid .tflite file");
    }
  };

  const handleClearModel = () => {
    dispatch?.({ type: "clearModel", value: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDimensionChange = (
    dimension: "width" | "height",
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    const newDimensions = { ...dimensions, [dimension]: numValue };
    setDimensions(newDimensions);

    if (state?.model) {
      dispatch?.({
        type: "updateModelDimensions",
        value: newDimensions,
      });
    }
  };

  useEffect(() => {
    if (state?.model) {
      setDimensions({
        width: state.model.width,
        height: state.model.height,
      });
    }
  }, [state?.model]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Configuration
        </label>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Width
            </label>
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="2048"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Height
            </label>
            <input
              type="number"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange("height", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="2048"
            />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".tflite"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Select a .tflite model file. Make sure to set the correct dimensions
          above.
        </p>
      </div>

      {state?.model && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                Model Loaded: {state.model.name}
              </p>
              <p className="text-xs text-green-600">
                Input Dimensions: {state.model.width} × {state.model.height}
              </p>
            </div>
            <button
              onClick={handleClearModel}
              className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {!state?.model && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            No model loaded. Configure the input dimensions and upload a .tflite
            file to enable scanning.
          </p>
        </div>
      )}

      <div className="border-t pt-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Common Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "256×341", width: 256, height: 341 },
            { name: "224×224", width: 224, height: 224 },
            { name: "299×299", width: 299, height: 299 },
            { name: "512×512", width: 512, height: 512 },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setDimensions({ width: preset.width, height: preset.height });
                if (state?.model) {
                  dispatch?.({
                    type: "updateModelDimensions",
                    value: { width: preset.width, height: preset.height },
                  });
                }
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
