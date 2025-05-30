import { DisplayMode } from "./DisplayMode";
import { ScanMode } from "./ScanMode";
import { Title } from "./Title";

export const Configuration = () => {
  return (
    <div>
      <Title />
      <DisplayMode />
      <ScanMode />
    </div>
  );
};
