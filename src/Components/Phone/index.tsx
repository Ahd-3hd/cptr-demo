import { useContext, useEffect, useRef, useState } from "react";
import { Suggestions } from "../Suggestions";
import { Steps } from "../Steps";
import { AppContext } from "../../Context/AppContext";
import { CapturedResultPage } from "../CapturedResultPage";

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
        className="bg-blue-600 hover:bg-blue-700 text-sm transition-colors text-white font-medium py-3 px-8 rounded-lg w-full max-w-xs cursor-pointer"
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
  const [capturedResult, setCapturedResult] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decision: any;
    image: {
      data: Uint8ClampedArray;
      width: number;
      height: number;
    };
  } | null>(null);

  const [videoSource, setVideoSource] = useState("/Delivery.mp4");
  const [isDragOver, setIsDragOver] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const CAPTURE_REASON_CODES = [
    "package_visible_and_dropoff_location_visible_and_address_visible",
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find((file) => file.type === "video/mp4");

    if (videoFile) {
      if (videoSource.startsWith("blob:")) {
        URL.revokeObjectURL(videoSource);
      }

      const objectURL = URL.createObjectURL(videoFile);
      setVideoSource(objectURL);

      setIsConfirmed(false);
      setCapturedResult(null);
      setFinalDecision(null);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoSource.startsWith("blob:")) {
        URL.revokeObjectURL(videoSource);
      }
    };
  }, [videoSource]);

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleBackToVideo = async () => {
    setCapturedResult(null);
    setFinalDecision(null);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(videoRef);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleManualCapture = async () => {
    if (!videoRef.current || !finalDecision) {
      console.log("No video or final decision available for manual capture");
      return;
    }

    const video = videoRef.current;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      video.pause();

      setCapturedResult({
        decision: finalDecision,
        image: {
          data: imageData.data,
          width: imageData.width,
          height: imageData.height,
        },
      });

      console.log("Manual capture completed");
    } catch (error) {
      console.error("Error during manual capture:", error);
    }
  };

  useEffect(() => {
    if (!isConfirmed || capturedResult) return;

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
            const reasonCode = decision.reasonCode;

            setFinalDecision(decision);

            if (
              state?.scanMode === "automatic" &&
              CAPTURE_REASON_CODES.includes(reasonCode)
            ) {
              console.log("Capturing result for reasonCode:", reasonCode);

              shouldContinuePredictions = false;
              isLooping = false;

              if (videoRef.current) {
                videoRef.current.pause();
              }

              setCapturedResult({
                decision,
                image: {
                  data: new Uint8ClampedArray(image.data),
                  width: image.width,
                  height: image.height,
                },
              });

              return;
            }

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
  }, [isConfirmed, capturedResult, CAPTURE_REASON_CODES, state?.scanMode]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className={`relative w-80 h-[600px] rounded-[2.5rem] bg-black shadow-xl overflow-hidden border-4 ${
          isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-900"
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <StatusBar />

        {isDragOver && (
          <div className="absolute inset-0 z-30 bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-medium">Drop MP4 video here</div>
            </div>
          </div>
        )}

        {capturedResult ? (
          <CapturedResultPage
            result={capturedResult}
            onBack={handleBackToVideo}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoSource}
              autoPlay={false}
              controls={false}
              muted
              loop={false}
              className="w-full h-full object-cover"
            />

            {state?.scanMode === "manual" && (
              <button
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:bg-gray-100 active:scale-95 transition-all duration-150 flex items-center justify-center"
                onClick={handleManualCapture}
              />
            )}

            {!isConfirmed && <ConfirmationScreen onConfirm={handleConfirm} />}

            {finalDecision && isConfirmed && !capturedResult && (
              <>
                {state?.displayMode === "checklist" && (
                  <Steps finalDecision={finalDecision} />
                )}
                {state?.displayMode === "suggestion" && (
                  <Suggestions finalDecision={finalDecision} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
