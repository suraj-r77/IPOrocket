
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface PasteSummaryModalProps {
  onClose: () => void;
  onProcess: (text: string, markAsAllotted: boolean) => void;
}

const PasteSummaryModal: React.FC<PasteSummaryModalProps> = ({ onClose, onProcess }) => {
  const [text, setText] = useState('');

  const handleProcess = (markAsAllotted: boolean) => {
    if (text.trim()) {
      onProcess(text, markAsAllotted);
      onClose();
    } else {
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Import Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">{ICONS.CLOSE}</button>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            <strong>Option 1:</strong> Paste text containing PAN numbers to mark accounts as Applied or Allotted.
            <br/>
            <strong>Option 2:</strong> Paste "Copy Finance" text (e.g. "Sold: 15000") to restore financial data for allotted accounts.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here..."
            className="w-full h-48 bg-gray-900 text-gray-200 p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        </div>
        <div className="flex justify-end p-4 bg-gray-800/50 rounded-b-lg gap-3">
          <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 font-semibold transition-colors text-white">Cancel</button>
          <button type="button" onClick={() => handleProcess(false)} className="bg-teal-600 px-4 py-2 rounded-md hover:bg-teal-500 font-semibold transition-colors text-white">
            Process Import
          </button>
          <button type="button" onClick={() => handleProcess(true)} className="bg-yellow-600 px-4 py-2 rounded-md hover:bg-yellow-500 font-semibold transition-colors text-white shadow-lg shadow-yellow-600/20">
             Mark Allotted 💰
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasteSummaryModal;
