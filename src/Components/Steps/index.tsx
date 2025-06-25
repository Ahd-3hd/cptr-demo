import packageIcon from "../../assets/package.svg";
import qualityIcon from "../../assets/quality.svg";
import dropoffIcon from "../../assets/dropoff_location.svg";
import checkCircle from "../../assets/check_circle.svg";

interface Props {
  finalDecision: {
    reasonCode: string;
    title: string;
    description: string;
  };
  mode?: 'automatic' | 'manual';
}

export const Steps = ({ finalDecision, mode }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reasonMap: any = {
    too_dark: {
      quality: false,
      package: false,
      address: false,
      location: false,
    },

    package_not_visible_and_dropoff_location_not_visible_and_address_not_visible:
      {
        quality: true,
        package: false,
        address: false,
        location: false,
      },

    package_visible_and_dropoff_location_not_visible_and_address_not_visible: {
      quality: true,
      package: true,
      address: false,
      location: false,
    },

    package_not_visible_and_dropoff_location_visible_and_address_not_visible: {
      quality: true,
      package: false,
      address: false,
      location: true,
    },
    package_not_visible_and_dropoff_location_not_visible_and_address_visible: {
      quality: true,
      package: false,
      address: true,
      location: false,
    },
    package_not_visible_and_dropoff_location_visible_and_address_visible: {
      quality: true,
      package: false,
      address: true,
      location: true,
    },
    package_visible_and_dropoff_location_not_visible_and_address_visible: {
      quality: true,
      package: true,
      address: true,
      location: false,
    },
    package_visible_and_dropoff_location_visible_and_address_not_visible: {
      quality: true,
      package: true,
      address: false,
      location: true,
    },
    package_visible_and_dropoff_location_visible_and_address_visible: {
      quality: true,
      package: true,
      address: true,
      location: true,
    },
    no_clear_decision: {
      quality: false,
      package: false,
      address: false,
      location: false,
    },
  };

  return (
    <div
      style={{
        borderRadius: '5.28px',
        border: '0.551px solid rgba(255,255,255,0.5)',
        background: 'linear-gradient(84deg, rgba(152,152,152,0.40) 13.33%, rgba(108,108,108,0.07) 167.68%)',
        boxShadow: '0px 0.66px 16.491px 0px rgba(69, 42, 124, 0.05)',
        backdropFilter: 'blur(13.78px)',
      }}
      className={`absolute left-1/2 w-[90%] -translate-x-1/2 transform p-4 shadow-md ${mode === 'automatic' ? 'bottom-6' : 'bottom-30'}`}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2 text-white">
          <img
            src={
              reasonMap[finalDecision.reasonCode].package
                ? checkCircle
                : packageIcon
            }
            alt="package"
            className="h-5 w-5"
          />
          <span className="text-xs font-bold">Show package</span>
        </div>
        <div className="flex items-center space-x-2 text-white">
          <img
            src={
              reasonMap[finalDecision.reasonCode].location
                ? checkCircle
                : dropoffIcon
            }
            alt="drop off location"
            className="h-5 w-5"
          />
          <span className="text-xs font-bold">Show drop-off location</span>
        </div>

        <div className="flex items-center space-x-2 text-white">
          <img
            src={
              reasonMap[finalDecision.reasonCode].address
                ? checkCircle
                : dropoffIcon
            }
            alt="address"
            className="h-5 w-5"
          />
          <span className="text-xs font-bold">Show address</span>
        </div>
        <div className="flex items-center space-x-2 text-white">
          <img
            src={
              reasonMap[finalDecision.reasonCode].quality
                ? checkCircle
                : qualityIcon
            }
            alt="quality"
            className="h-5 w-5"
          />
          <span className="text-xs font-bold">Photo quality</span>
        </div>
      </div>
    </div>
  );
};
