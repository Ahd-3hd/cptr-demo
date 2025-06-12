import { useContext, useEffect, useRef, useState } from "react";
import { Suggestions } from "../Suggestions";
import { Steps } from "../Steps";
import { AppContext } from "../../Context/AppContext";
import { CapturedResultPage } from "../CapturedResultPage";
import { StatusBar } from "./StatusBar";
import { ConfirmationScreen } from "./ConfirmationScreen";
import { CustomModelDisplay } from "../CustomModelDisplay";

export interface Prediction {
  name: string;
  confidence: number;
}

export const Phone = () => {
  const state = useContext(AppContext);

  const modelInfo = state?.model;
  const MODEL_WIDTH = modelInfo?.width || 256;
  const MODEL_HEIGHT = modelInfo?.height || 341;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [finalDecision, setFinalDecision] = useState<{
    title: string;
    description: string;
    reasonCode: string;
    predictions?: Array<{
      name: string;
      confidence: number;
    }>;
    isCustomModel?: boolean;
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
    if (!isConfirmed || capturedResult || !modelInfo) return;

    let worker: Worker;
    let isLooping = false;
    let shouldContinuePredictions = false;

    async function initWorker(): Promise<boolean> {
      if (!modelInfo) return false;

      try {
        worker = new Worker("/worker.js", { type: "classic" });
        await new Promise<void>((resolve, reject) => {
          worker.onmessage = (e) => {
            if (e.data.type === "init-done") resolve();
            if (e.data.type === "error") reject(new Error(e.data.error));
          };

          console.log(modelInfo.url);
          const isDefaultModel = modelInfo.url === "/default.tflite";

          worker.postMessage({
            type: "init",
            modelPath: modelInfo.url,
            isDefaultModel: isDefaultModel,
            classes: modelInfo.classes, // This should be undefined for default model
          });
        });
        return true;
      } catch (error) {
        console.error("Failed to initialize worker:", error);
        if (worker) worker.terminate();
        return false;
      }
    }

    async function predictLoop() {
      if (!videoRef.current || isLooping || !worker) return;

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
      if (!video || !worker) return;

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
        const workerInitialized = await initWorker();

        if (!workerInitialized || !worker) {
          console.error("Worker initialization failed");
          return;
        }

        worker.onmessage = (e) => {
          if (e.data.type === "prediction") {
            const decision = e.data.decision;
            const image = e.data.originalImage;
            const reasonCode = decision.reasonCode;

            setFinalDecision(decision);

            if (
              state?.scanMode === "automatic" &&
              !decision.isCustomModel &&
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
            if (worker) {
              worker.postMessage({
                type: "video-not-playing",
                reason: "paused",
              });
            }
          };

          const handleEnded = () => {
            console.log("Video ended, stopping predictions");
            shouldContinuePredictions = false;
            isLooping = false;
            if (worker) {
              worker.postMessage({
                type: "video-not-playing",
                reason: "ended",
              });
            }
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
        console.error("Error in main function:", err);
      }
    }

    const cleanup = main();

    return () => {
      shouldContinuePredictions = false;
      if (worker) {
        worker.terminate();
      }

      if (cleanup && typeof cleanup.then === "function") {
        cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
      }

      const tracks =
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (videoRef.current?.srcObject as MediaStream)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, [
    isConfirmed,
    capturedResult,
    CAPTURE_REASON_CODES,
    state?.scanMode,
    modelInfo,
    MODEL_WIDTH,
    MODEL_HEIGHT,
  ]);

  if (!modelInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative w-80 h-[600px] rounded-[2.5rem] bg-gray-100 shadow-xl overflow-hidden border-4 border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <div className="text-4xl mb-4">📱</div>
            <div className="text-lg font-medium mb-2">No Model Loaded</div>
            <div className="text-sm">Upload a .tflite model to get started</div>
          </div>
        </div>
      </div>
    );
  }

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
                {finalDecision.isCustomModel ? (
                  <CustomModelDisplay finalDecision={finalDecision} />
                ) : (
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
          </>
        )}
      </div>
    </div>
  );
};
