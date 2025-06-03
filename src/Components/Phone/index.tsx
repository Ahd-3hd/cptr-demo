import { useEffect, useRef, useState } from "react";

export interface Prediction {
  name: string;
  confidence: number;
}

const MODEL_PATH =
  "/production_package_small_delivery_0_1_0_image_artifacts_1_0_4_image_quality_package_delivery_1_0_0.tflite";
const MODEL_WIDTH = 256;
const MODEL_HEIGHT = 341;

export const Phone = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [finalDecision, setFinalDecision] = useState(null);

  useEffect(() => {
    let worker: Worker;

    async function initWorker() {
      worker = new Worker("/worker.js", { type: "classic" });
      await new Promise<void>((resolve, reject) => {
        worker.onmessage = (e) => {
          if (e.data.type === "init-done") resolve();
          if (e.data.type === "error") reject(new Error(e.data.error));
        };
        worker.postMessage({ type: "init", modelPath: MODEL_PATH });
      });
    }

    async function predictLoop() {
      if (!videoRef.current) return;
      const bitmap = await createImageBitmap(videoRef.current);
      worker.postMessage(
        { type: "predict", bitmap, width: MODEL_WIDTH, height: MODEL_HEIGHT },
        [bitmap]
      );
    }

    async function main() {
      try {
        await initWorker();

        worker.onmessage = (e) => {
          if (e.data.type === "prediction") {
            const decision = e.data.decision;

            setFinalDecision(decision.description);

            predictLoop();
          }
        };

        predictLoop();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
      }
    }

    main();

    return () => {
      if (worker) worker.terminate();
      const tracks =
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (videoRef.current?.srcObject as MediaStream)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative w-80 h-[600px] rounded-[2.5rem] bg-black shadow-xl overflow-hidden border-4 border-gray-900">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>

        <video
          ref={videoRef}
          src="/Delivery.mp4"
          autoPlay={false}
          controls
          muted
          loop={false}
          className="w-full h-full object-cover"
        ></video>

        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm font-medium z-10">
          {finalDecision}
        </div>
      </div>
    </div>
  );
};
