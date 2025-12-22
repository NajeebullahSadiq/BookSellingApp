import { useState, useEffect } from 'react';

const InputModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  placeholder = '', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  type = 'info',
  required = false 
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (required && !value.trim()) return;
    onConfirm(value);
    onClose();
  };

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          {message && <p className="text-gray-600 mb-4">{message}</p>}
          
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows="4"
            className="input-field mb-4 w-full"
            autoFocus
          />
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={required && !value.trim()}
              className={`px-4 py-2 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${typeStyles[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
