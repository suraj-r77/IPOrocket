
import React from 'react';
import { ICONS } from '../constants';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">{ICONS.CLOSE}</button>
        </div>
        <div className="p-6">
          <p className="text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end p-4 bg-gray-800/50 rounded-b-lg">
          <button onClick={onClose} className="mr-4 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 font-semibold transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 font-semibold transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
