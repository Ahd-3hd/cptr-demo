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
}

export const Steps = ({ finalDecision }: Props) => {
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
    <div className="absolute bottom-30 left-1/2 w-[90%] -translate-x-1/2 transform rounded-xl bg-[#7D7D7D66] p-4 shadow-md">
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
