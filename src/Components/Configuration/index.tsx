import { DisplayMode } from "./DisplayMode";
import { ScanMode } from "./ScanMode";
import { Title } from "./Title";
import { VideoSelection } from "./VideoSelection";
import React, { useContext, useEffect, useState } from "react";

export const Configuration = ({
  isConfirmed,
  setIsConfirmed,
  setResetPhone,
  handleApplyConfig,
  PendingAppContext,
}: {
  isConfirmed: boolean;
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  uploadedVideoName: string | null;
  setUploadedVideoName: React.Dispatch<React.SetStateAction<string | null>>;
  resetPhone: number;
  setResetPhone: React.Dispatch<React.SetStateAction<number>>;
  handleApplyConfig: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PendingAppContext: React.Context<any>;
}) => {
  const state = useContext(PendingAppContext);
  const [lastAppliedConfig, setLastAppliedConfig] = useState({
    video: state?.video,
    displayMode: state?.displayMode,
    scanMode: state?.scanMode,
  });
  const [pendingRestart, setPendingRestart] = useState(false);

  // Detect config changes after Apply
  useEffect(() => {
    if (
      isConfirmed &&
      (state?.video !== lastAppliedConfig.video ||
        state?.displayMode !== lastAppliedConfig.displayMode ||
        state?.scanMode !== lastAppliedConfig.scanMode)
    ) {
      setPendingRestart(true);
    } else if (
      isConfirmed &&
      state?.video === lastAppliedConfig.video &&
      state?.displayMode === lastAppliedConfig.displayMode &&
      state?.scanMode === lastAppliedConfig.scanMode
    ) {
      setPendingRestart(false);
    }
  }, [
    state?.video,
    state?.displayMode,
    state?.scanMode,
    isConfirmed,
    lastAppliedConfig,
  ]);

  const handleApply = () => {
    setLastAppliedConfig({
      video: state?.video,
      displayMode: state?.displayMode,
      scanMode: state?.scanMode,
    });
    setIsConfirmed(true);
    setPendingRestart(false);
    handleApplyConfig();
  };

  const handleRestart = () => {
    setIsConfirmed(false);
    setPendingRestart(false);
    setResetPhone((v) => v + 1);
  };

  const handleApplyAndRestart = () => {
    handleRestart();
    setTimeout(() => {
      handleApplyConfig();
      setLastAppliedConfig({
        video: state?.video,
        displayMode: state?.displayMode,
        scanMode: state?.scanMode,
      });
      setIsConfirmed(true);
      setPendingRestart(false);
    }, 0);
  };

  let buttonLabel = "Apply";
  let buttonAction = handleApply;
  if (isConfirmed && !pendingRestart) {
    buttonLabel = "Restart";
    buttonAction = handleRestart;
  } else if (isConfirmed && pendingRestart) {
    buttonLabel = "Apply and Restart";
    buttonAction = handleApplyAndRestart;
  }

  return (
    <div>
      <Title />
      <div className="space-y-8">
        <VideoSelection ContextOverride={PendingAppContext} />
        <DisplayMode ContextOverride={PendingAppContext} />
        <ScanMode ContextOverride={PendingAppContext} />
        <div className="flex flex-col items-start max-w-xl mx-auto mt-4">
          <button
            className="bg-[#4938e2] hover:bg-[#4938e2]/90 text-sm transition-colors text-white font-bold py-3 px-8 rounded-lg max-w-xs cursor-pointer"
            onClick={buttonAction}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
