export const StatusBar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-6 py-2 text-white text-sm font-medium bg-transparent">
      <div className="flex items-center">
        <span>14:17</span>
      </div>

      <div className="flex items-center bg-black px-1 h-5 w-[30%] rounded-full justify-between">
        <div className="w-3 h-3 bg-red-500/80 rounded-full mr-1"></div>
      </div>

      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>

        <div className="relative">
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
          </div>
          <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-white rounded-r-sm"></div>
        </div>
      </div>
    </div>
  );
};
