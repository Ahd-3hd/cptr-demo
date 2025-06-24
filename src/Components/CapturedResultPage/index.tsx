import { useEffect, useRef } from "react";
import mapMarkerIcon from "../../assets/map_marker.svg";
import backIcon from "../../assets/back.svg";

interface CapturedResultPageProps {
  result: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decision: any;
    image: {
      data: Uint8ClampedArray;
      width: number;
      height: number;
    };
  };
  onBack: () => void;
}

export const CapturedResultPage = ({
  result,
  onBack,
}: CapturedResultPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && result.image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = result.image.width;
        canvas.height = result.image.height;

        const imageData = new ImageData(
          result.image.data,
          result.image.width,
          result.image.height
        );

        ctx.putImageData(imageData, 0, 0);
      }
    }
  }, [result.image]);

  return (
    <div className="bg-white w-full h-full px-4 py-8 flex flex-col justify-between items-center text-black">
      <div className="w-full">
        <div className="flex items-center justify-start mt-6 mb-6">
          <button onClick={onBack} className="cursor-pointer p-2">
            <img src={backIcon} alt="Back" className="h-4 w-4" />
          </button>

          <h2 className="font-bold ml-2 flex items-center">Package drop-off</h2>
        </div>
        <div className="flex space-x-2 mb-1">
          <img src={mapMarkerIcon} alt="Map marker" className="h-5 w-5" />

          <div>
            <p className="font-medium text-sm mb-1">19 Canning Street, flat 14</p>
            <p className="text-xs text-gray-500 mb-1">London, UK</p>
            <div className="mt-6" />
          </div>
        </div>
      </div>

      <div className="w-full relative flex flex-col items-center">
        <div className="w-full">
          {result.decision.reasonCode ===
            "package_visible_and_dropoff_location_visible_and_address_visible" && (
            <h1 className="text-sm font-bold text-center">🎉 Great job delivering!</h1>
          )}

          {result.decision.reasonCode !==
            "package_visible_and_dropoff_location_visible_and_address_visible" && (
            <p className="text-xs font-bold mb-2 text-center">
              ❗{result.decision.description}
            </p>
          )}
          {result.decision.reasonCode !==
            "package_visible_and_dropoff_location_visible_and_address_visible" && (
            <p className="text-[10px] text-center">
              Invalid proof could lead to a lost package claim.<br />
              Submit anyway?
            </p>
          )}
        </div>
        <canvas
          ref={canvasRef}
          className="w-[40%] object-contain rounded my-4"
        />
      </div>

      <div className="w-full flex flex-col items-center">
        <button
          onClick={onBack}
          className="text-sm transition-colors text-black font-bold py-3 px-8 rounded-lg w-full max-w-xs cursor-pointer mb-2"
        >
          Retake Photo
        </button>

        <button
          onClick={onBack}
          className="bg-black text-sm transition-colors text-white font-bold py-3 px-8 rounded-lg w-full max-w-xs cursor-pointer"
        >
          Complete Delivery
        </button>
      </div>
    </div>
  );
};
