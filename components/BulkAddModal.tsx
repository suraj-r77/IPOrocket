
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface BulkAddModalProps {
  onClose: () => void;
  onProcess: (text: string) => void;
}

const BulkAddModal: React.FC<BulkAddModalProps> = ({ onClose, onProcess }) => {
  const [text, setText] = useState('');

  const handleProcess = () => {
    if (text.trim()) {
      onProcess(text);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xl border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">{ICONS.BULK} Bulk Add Accounts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">{ICONS.CLOSE}</button>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            Paste your account list below. Format should be similar to:
            <br/>
            <span className="text-xs text-gray-500 font-mono">
                1) Name Broker<br/>
                Phone<br/>
                PAN<br/>
                Email<br/>
                ...
            </span>
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste account data here..."
            className="w-full h-64 bg-gray-900 text-gray-200 p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm"
          />
        </div>
        <div className="flex justify-end p-4 bg-gray-800/50 rounded-b-lg">
          <button type="button" onClick={onClose} className="mr-4 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 font-semibold transition-colors text-white">Cancel</button>
          <button type="button" onClick={handleProcess} className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-500 font-semibold transition-colors text-white">
            Process & Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAddModal;
