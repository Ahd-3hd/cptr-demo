import classNames from "classnames";

interface Props {
  finalDecision: {
    reasonCode: string;
    title: string;
    description: string;
  };
  mode?: 'automatic' | 'manual';
}

export const Suggestions = ({ finalDecision, mode }: Props) => {
  return (
    <div
      className={classNames(
        `w-[90%] absolute left-1/2 transform -translate-x-1/2 bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm font-medium z-10 text-center shadow-md ${mode === 'automatic' ? 'bottom-[24px]' : 'bottom-30'}`,
        {
          "bg-[#0E9B32D9]":
            finalDecision.reasonCode ===
            "package_visible_and_dropoff_location_visible_and_address_visible",
          "bg-[#EB0000D9]":
            finalDecision.reasonCode !==
            "package_visible_and_dropoff_location_visible_and_address_visible",
        }
      )}
    >
      <p className="mb-1 font-bold text-sm">{finalDecision.title}</p>
      <p className="text-xs text-[#ffffffc6]">{finalDecision.description}</p>
    </div>
  );
};
