import { DisplayMode } from "./DisplayMode";
import { ScanMode } from "./ScanMode";
import { Title } from "./Title";
import { VideoSelection } from "./VideoSelection";

export const Configuration = () => {
  return (
    <div>
      <Title />
      <div className="space-y-8">
        <VideoSelection />
        <DisplayMode />
        <ScanMode />
      </div>
    </div>
  );
};
