import { useContext } from "react";
import { AppContext, AppDispatchContext } from "../../Context/AppContext";

export const VideoSelection = () => {
  const state = useContext(AppContext);
  const dispatch = useContext(AppDispatchContext);

  const setVideo = (video: string) => {
    dispatch?.({
      type: "video",
      value: video,
    });
  };

  return (
    <div className="text-white max-w-xl mx-auto">
      <section>
        <h2 className="text-xl font-bold mb-2">Sample Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 flex flex-col justify-center items-center min-h-[80px] ${
              state?.video === "/Delivery.mp4"
                ? "border-[#4930e2] bg-[#4930e2]/10"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
            }`}
            onClick={() => setVideo("/Delivery.mp4")}
          >
            <span className="font-semibold text-lg text-center">
              Success Delivery Attempt
            </span>
          </div>
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 flex flex-col justify-center items-center min-h-[80px] ${
              state?.video === "/Delivery_unhappy_path.mov"
                ? "border-[#4930e2] bg-[#4930e2]/10"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
            }`}
            onClick={() => setVideo("/Delivery_unhappy_path.mov")}
          >
            <span className="font-semibold text-lg text-center">
              Unsuccess Delivery Attempt
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}; 