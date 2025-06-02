import { DisplayMode } from "./DisplayMode";
import { ScanMode } from "./ScanMode";
import { Title } from "./Title";

export const Configuration = () => {
  return (
    <div>
      <Title />
      <div className="space-y-8">
        <DisplayMode />
        <ScanMode />
      </div>
    </div>
  );
};
