const LineChart = ({ data, xKey, yKey, title, color = '#3b82f6' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item[yKey]));
  const minValue = Math.min(...data.map(item => item[yKey]));
  const range = maxValue - minValue || 1;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="relative h-64 border-l border-b border-gray-300">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            points={data.map((item, index) => {
              const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
              const y = 100 - ((item[yKey] - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          {data.map((item, index) => {
            const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
            const y = 100 - ((item[yKey] - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{`${item[xKey]}: ${item[yKey]}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600">
          {data.map((item, index) => {
            if (data.length <= 7 || index % Math.ceil(data.length / 7) === 0 || index === data.length - 1) {
              return (
                <span key={index} className="transform -rotate-45 origin-top-left">
                  {item[xKey]}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
      <div className="mt-8 flex justify-between text-sm text-gray-600">
        <span>Min: {minValue.toFixed(2)}</span>
        <span>Max: {maxValue.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default LineChart;
