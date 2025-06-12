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

  const [classes, setClasses] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".tflite")) {
      if (state?.model?.url) {
        dispatch?.({ type: "clearModel", value: null });
      }

      const url = URL.createObjectURL(file);

      const classArray = classes
        .split("\n")
        .map((cls) => cls.trim())
        .filter((cls) => cls.length > 0);

      const modelInfo = {
        file,
        url,
        name: file.name,
        width: dimensions.width,
        height: dimensions.height,
        classes: classArray.length > 0 ? classArray : undefined, // Only include if classes provided
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
      if (state.model.classes) {
        setClasses(state.model.classes.join("\n"));
      }
    }
  }, [state?.model]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Model Configuration
        </label>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1">Width</label>
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
            <label className="block text-xs font-medium mb-1">Height</label>
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

        <div className="mb-4">
          <label className="block text-xs font-medium mb-1">
            Class Names (one per line)
          </label>
          <textarea
            value={classes}
            onChange={(e) => setClasses(e.target.value)}
            placeholder={`cat
dog
bird
car
person`}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
          <p className="text-xs mt-1">
            Enter the class names that your model outputs, one per line. Order
            matters - they should match your model's output indices.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".tflite"
          onChange={handleFileUpload}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs mt-1">
          Select a .tflite model file. Make sure to set the correct dimensions
          and class names above.
        </p>
      </div>

      {state?.model && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Model Loaded: {state.model.name}
              </p>
              <p className="text-xs text-green-600">
                Input Dimensions: {state.model.width} × {state.model.height}
              </p>
              {state.model.classes && (
                <p className="text-xs text-green-600">
                  Classes: {state.model.classes.length} (
                  {state.model.classes.slice(0, 3).join(", ")}
                  {state.model.classes.length > 3 ? "..." : ""})
                </p>
              )}
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
            No model loaded. Configure the input dimensions, class names, and
            upload a .tflite file to enable scanning.
          </p>
        </div>
      )}

      <div className="border-t pt-4">
        <label className="block text-xs font-medium mb-2">Common Presets</label>
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
