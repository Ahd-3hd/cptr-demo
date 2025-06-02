export const Phone = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative w-80 h-[600px] rounded-[2.5rem] bg-black shadow-xl overflow-hidden border-4 border-gray-900">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>

        <video
          src="/Delivery.mp4"
          autoPlay={false}
          controls
          muted
          loop
          className="w-full h-full object-cover"
        ></video>
      </div>
    </div>
  );
};
