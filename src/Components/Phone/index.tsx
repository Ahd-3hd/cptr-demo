import { useContext, useEffect, useRef, useState } from "react";
import { Suggestions } from "../Suggestions";
import { Steps } from "../Steps";
import { AppContext } from "../../Context/AppContext";

const StatusBar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-6 py-2 text-white text-sm font-medium bg-transparent">
      <div className="flex items-center">
        <span>14:17</span>
      </div>

      <div className="flex items-center bg-black px-1 h-5 w-[30%] rounded-full justify-between">
        <div className="w-3 h-3 bg-red-500/80 rounded-full mr-1"></div>
      </div>

      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>

        <div className="relative">
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
          </div>
          <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-white rounded-r-sm"></div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationScreen = ({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-between px-8 py-6">
      <div />
      <div className="text-center mb-8">
        <h2 className="text-white text-xl font-semibold mb-2">
          Confirm configuration
        </h2>
        <p className="text-gray-300 text-sm">
          Review delivery validation configuration
        </p>
      </div>

      <button
        onClick={onConfirm}
        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium py-3 px-8 rounded-lg w-full max-w-xs cursor-pointer"
      >
        Confirm and Preview
      </button>
    </div>
  );
};

export interface Prediction {
  name: string;
  confidence: number;
}

const MODEL_PATH =
  "/production_package_small_delivery_0_1_0_image_artifacts_1_0_4_image_quality_package_delivery_1_0_0.tflite";
const MODEL_WIDTH = 256;
const MODEL_HEIGHT = 341;

export const Phone = () => {
  const state = useContext(AppContext);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [finalDecision, setFinalDecision] = useState<{
    title: string;
    description: string;
    reasonCode: string;
  } | null>(null);

  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  useEffect(() => {
    if (!isConfirmed) return;

    let worker: Worker;
    let isLooping = false;
    let shouldContinuePredictions = false;

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
      if (!videoRef.current || isLooping) return;

      const video = videoRef.current;

      if (video.paused || video.ended || video.readyState < 2) {
        worker.postMessage({
          type: "video-not-playing",
          reason: video.paused ? "paused" : video.ended ? "ended" : "not-ready",
        });
        shouldContinuePredictions = false;
        isLooping = false;
        return;
      }

      if (!shouldContinuePredictions) {
        isLooping = false;
        return;
      }

      isLooping = true;

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      const videoAspectRatio = videoWidth / videoHeight;
      const modelAspectRatio = MODEL_WIDTH / MODEL_HEIGHT;

      let resizeWidth: number;
      let resizeHeight: number;

      if (videoAspectRatio > modelAspectRatio) {
        resizeWidth = MODEL_WIDTH;
        resizeHeight = Math.round(MODEL_WIDTH / videoAspectRatio);
      } else {
        resizeHeight = MODEL_HEIGHT;
        resizeWidth = Math.round(MODEL_HEIGHT * videoAspectRatio);
      }

      try {
        const bitmap = await createImageBitmap(video, {
          resizeWidth,
          resizeHeight,
          resizeQuality: "high",
        });

        worker.postMessage(
          {
            type: "predict",
            bitmap,
            width: MODEL_WIDTH,
            height: MODEL_HEIGHT,
          },
          [bitmap]
        );
      } catch (error) {
        console.error("Error creating bitmap:", error);
        isLooping = false;
      }
    }

    function startPredictionsWhenReady() {
      const video = videoRef.current;
      if (!video) return;

      if (video.readyState >= 2 && !video.paused && !video.ended) {
        console.log("Video is ready and playing, starting predictions");
        shouldContinuePredictions = true;
        isLooping = false;
        predictLoop();
      } else {
        console.log("Video not ready yet, waiting...", {
          readyState: video.readyState,
          paused: video.paused,
          ended: video.ended,
        });
        setTimeout(startPredictionsWhenReady, 30);
      }
    }

    async function main() {
      try {
        await initWorker();

        worker.onmessage = (e) => {
          if (e.data.type === "prediction") {
            const decision = e.data.decision;
            const image = e.data.originalImage;
            console.log(image);
            setFinalDecision(decision);

            isLooping = false;

            if (shouldContinuePredictions) {
              setTimeout(predictLoop, 30);
            }
          }
        };

        const video = videoRef.current;
        if (video) {
          const handlePlay = () => {
            console.log("Video play event triggered");
            startPredictionsWhenReady();
          };

          const handleCanPlay = () => {
            console.log(
              "Video can play, checking if we should start predictions"
            );
            if (shouldContinuePredictions && !video.paused && !video.ended) {
              predictLoop();
            }
          };

          const handlePause = () => {
            console.log("Video paused, stopping predictions");
            shouldContinuePredictions = false;
            isLooping = false;
            worker.postMessage({ type: "video-not-playing", reason: "paused" });
          };

          const handleEnded = () => {
            console.log("Video ended, stopping predictions");
            shouldContinuePredictions = false;
            isLooping = false;
            worker.postMessage({ type: "video-not-playing", reason: "ended" });
          };

          const handleSeeking = () => {
            console.log("Video seeking");
            isLooping = false;
          };

          const handleSeeked = () => {
            console.log("Video seeked, resuming if playing");
            if (shouldContinuePredictions && !video.paused && !video.ended) {
              startPredictionsWhenReady();
            }
          };

          video.addEventListener("play", handlePlay);
          video.addEventListener("canplay", handleCanPlay);
          video.addEventListener("pause", handlePause);
          video.addEventListener("ended", handleEnded);
          video.addEventListener("seeking", handleSeeking);
          video.addEventListener("seeked", handleSeeked);

          if (!video.paused && !video.ended && video.readyState >= 2) {
            shouldContinuePredictions = true;
            predictLoop();
          }

          return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("seeking", handleSeeking);
            video.removeEventListener("seeked", handleSeeked);
          };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
      }
    }

    const cleanup = main();

    return () => {
      shouldContinuePredictions = false;
      if (worker) worker.terminate();

      if (cleanup && typeof cleanup.then === "function") {
        cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
      }

      const tracks =
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (videoRef.current?.srcObject as MediaStream)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, [isConfirmed]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative w-80 h-[600px] rounded-[2.5rem] bg-black shadow-xl overflow-hidden border-4 border-gray-900">
        <StatusBar />
        <video
          ref={videoRef}
          src="/Delivery.mp4"
          autoPlay={false}
          controls={false}
          muted
          loop={false}
          className="w-full h-full object-cover"
        />

        {state?.scanMode === "manual" && (
          <button
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:bg-gray-100 active:scale-95 transition-all duration-150 flex items-center justify-center"
            onClick={() => {
              console.log("Shutter clicked");
            }}
          />
        )}

        {!isConfirmed && <ConfirmationScreen onConfirm={handleConfirm} />}

        {finalDecision && isConfirmed && (
          <>
            {state?.displayMode === "checklist" && (
              <Steps finalDecision={finalDecision} />
            )}
            {state?.displayMode === "suggestion" && (
              <Suggestions finalDecision={finalDecision} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
