import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";

export const ModelInfo = () => {
  const state = useContext(AppContext);

  if (!state?.model) return null;

  const { model } = state;
  const fileSizeMB =
    model && model.file ? (model.file.size / (1024 * 1024)).toFixed(2) : "NA";

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">
        Active Model Details
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-blue-700">Name:</span>
          <span className="text-blue-900 font-medium">{model.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Size:</span>
          <span className="text-blue-900 font-medium">{fileSizeMB} MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Input Size:</span>
          <span className="text-blue-900 font-medium">
            {model.width} × {model.height}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Aspect Ratio:</span>
          <span className="text-blue-900 font-medium">
            {(model.width / model.height).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
