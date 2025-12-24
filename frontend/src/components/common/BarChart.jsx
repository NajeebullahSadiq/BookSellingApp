const BarChart = ({ data, xKey, yKey, title, color = '#3b82f6' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item[yKey]));

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="flex items-end justify-between gap-2 h-64 border-b border-gray-300 pb-2">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item[yKey] / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${height}%`,
                    minHeight: item[yKey] > 0 ? '4px' : '0',
                    backgroundColor: color
                  }}
                  title={`${item[xKey]}: ${item[yKey]}`}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item[yKey]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-600 overflow-x-auto">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center min-w-0">
            <span className="block truncate" title={item[xKey]}>
              {item[xKey].length > 8 ? item[xKey].substring(0, 8) + '...' : item[xKey]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
