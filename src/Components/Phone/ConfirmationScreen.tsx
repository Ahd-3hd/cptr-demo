export const ConfirmationScreen = ({
  onConfirm,
}: {
  onConfirm: () => void;
}) => {
  return (
    <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-between px-8 py-6">
      <div />
      <div className="text-center mb-8">
        <h2 className="text-white text-xl font-semibold mb-2">
          Confirm configuration
        </h2>
        <p className="text-gray-300 text-sm">
          Review delivery validation configuration
        </p>
      </div>

      <button
        onClick={onConfirm}
        className="bg-blue-600 hover:bg-blue-700 text-sm transition-colors text-white font-medium py-3 px-8 rounded-lg w-full max-w-xs cursor-pointer"
      >
        Confirm and Preview
      </button>
    </div>
  );
};
