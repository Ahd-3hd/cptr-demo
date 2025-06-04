import { useContext, useEffect, useRef, useState } from "react";
import { Suggestions } from "../Suggestions";
import { Steps } from "../Steps";
import { AppContext } from "../../Context/AppContext";

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

  useEffect(() => {
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
        {finalDecision && (
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
