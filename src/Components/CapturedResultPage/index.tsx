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
    <div className="bg-white w-full h-full px-2 py-8 flex flex-col justify-between items-center text-black">
      <div className="w-full">
        <div className="flex items-center">
          <button onClick={onBack} className="cursor-pointer p-2">
            <img src={backIcon} alt="Back" className="h-4 w-4" />
          </button>

          <h2 className="font-medium">Package drop-off</h2>
        </div>
        <hr className="h-px my-4 bg-gray-200 border-0" />
        <div className="flex space-x-2">
          <img src={mapMarkerIcon} alt="Map marker" className="h-5 w-5" />

          <div>
            <p className="font-medium text-sm">19 Canning Street, flat 14</p>
            <p className="text-xs text-gray-500">London, UK</p>
          </div>
        </div>
      </div>

      <div className="w-full relative flex flex-col items-center">
        <div className="w-full">
          <h1 className="text-sm font-bold">🎉 Great job delivering!</h1>
        </div>
        <canvas
          ref={canvasRef}
          className="w-[60%] object-contain rounded my-4"
        />
      </div>

      <button
        onClick={() => {}}
        className="bg-black text-sm transition-colors text-white font-medium py-3 px-8 rounded-lg w-full max-w-xs cursor-pointer"
      >
        Complete delivery
      </button>
    </div>
  );
};
