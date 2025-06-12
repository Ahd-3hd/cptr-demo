import capturLogo from "../../assets/captur-logo.png";

export const Title = () => {
  return (
    <div className="flex items-center gap-x-2 mb-16">
      <img src={capturLogo} alt="Captur" className="h-11" />
    </div>
  );
};
