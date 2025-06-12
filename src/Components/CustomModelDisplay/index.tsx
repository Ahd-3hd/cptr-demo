interface CustomModelDisplayProps {
  finalDecision: {
    title: string;
    description: string;
    predictions?: Array<{
      name: string;
      confidence: number;
    }>;
    isCustomModel?: boolean;
  };
}

export const CustomModelDisplay: React.FC<CustomModelDisplayProps> = ({
  finalDecision,
}) => {
  if (!finalDecision.isCustomModel || !finalDecision.predictions) {
    return null;
  }

  console.log(finalDecision);

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{finalDecision.title}</h3>
      <div className="space-y-2">
        {finalDecision.predictions.slice(0, 5).map((prediction, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm">{prediction.name}</span>
            <span className="text-sm font-mono">
              {(prediction.confidence * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
