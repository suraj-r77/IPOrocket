
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Account } from '../types';

interface RegistrarInfo {
  registrarName: string;
  allotmentUrl: string;
}

interface AllotmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onFindRegistrar: (ipoName: string) => Promise<RegistrarInfo | null>;
}

const AllotmentModal: React.FC<AllotmentModalProps> = ({ isOpen, onClose, accounts, onFindRegistrar }) => {
  const [ipoName, setIpoName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrarInfo, setRegistrarInfo] = useState<RegistrarInfo | null>(null);
  const [copiedPan, setCopiedPan] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFind = async () => {
    if (!ipoName.trim()) {
      setError('Please enter an IPO name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRegistrarInfo(null);
    try {
      const info = await onFindRegistrar(ipoName);
      if (info && info.registrarName && info.allotmentUrl) {
        setRegistrarInfo(info);
      } else {
        setError('Could not find registrar information for this IPO. Please check the name and try again.');
      }
    } catch (e) {
      setError('An error occurred while fetching data. Please try again later.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPan(text);
    setTimeout(() => setCopiedPan(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">{ICONS.RESULTS} IPO Allotment Assistant</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">{ICONS.CLOSE}</button>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-4">Enter the IPO name to find its registrar and quickly check your allotment status.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={ipoName}
              onChange={(e) => setIpoName(e.target.value)}
              placeholder="e.g., Zomato, LIC, etc."
              className="flex-grow bg-gray-700 p-2 rounded w-full border border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
              disabled={isLoading}
            />
            <button onClick={handleFind} disabled={isLoading || !ipoName.trim()} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center w-32 transition-colors">
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Find'}
            </button>
          </div>

          {error && <p className="mt-4 text-red-400">{error}</p>}
          
          {registrarInfo && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white">Registrar Found!</h3>
              <p className="text-gray-300 mt-1">Registrar: <span className="font-bold">{registrarInfo.registrarName}</span></p>
              <a href={registrarInfo.allotmentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-purple-400 hover:text-purple-300 underline">
                Go to Allotment Page &rarr;
              </a>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-200 mb-2">Your PAN Numbers:</h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {accounts.filter(acc => acc.pan).map(acc => (
                    <div key={acc.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                        <span className="font-mono text-gray-300">{acc.pan}</span>
                        <span className="text-sm text-gray-400 truncate ml-4 flex-1">{acc.name}</span>
                        <button onClick={() => handleCopy(acc.pan!)} className="ml-2 text-gray-400 hover:text-white transition-colors w-20 text-center">
                            {copiedPan === acc.pan ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AllotmentModal;
