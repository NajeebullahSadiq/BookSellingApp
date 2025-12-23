import { useState } from 'react';

const ProductPreview = ({ previewPages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  if (!previewPages || previewPages.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : previewPages.length - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < previewPages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary w-full py-3 text-lg flex items-center justify-center gap-2"
      >
        <span>📖</span>
        <span>Preview Sample Pages ({previewPages.length})</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold">
                Sample Preview - Page {currentPage + 1} of {previewPages.length}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
              <img
                src={`${import.meta.env.VITE_API_URL}${previewPages[currentPage]}`}
                alt={`Preview page ${currentPage + 1}`}
                className="max-w-full max-h-full object-contain shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-white">
              <button
                onClick={handlePrevious}
                className="btn-secondary px-6 py-2"
                disabled={previewPages.length <= 1}
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {previewPages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPage
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="btn-secondary px-6 py-2"
                disabled={previewPages.length <= 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPreview;
