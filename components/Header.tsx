
import React from 'react';
import { ICONS } from '../constants';
import { Account, ApplicationStatus } from '../types';

interface HeaderProps {
  accounts: Account[];
  onCopySummary: () => void;
  onResetAll: () => void;
  onAddAccount: () => void;
  onBulkAdd: () => void;
  onOpenPasteModal: () => void;
  onOpenAllotmentModal: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'dashboard' | 'allotted';
  setViewMode: (mode: 'dashboard' | 'allotted') => void;
  onCopyAllFinance: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    accounts, 
    onCopySummary, 
    onResetAll, 
    onAddAccount, 
    onBulkAdd, 
    onOpenPasteModal, 
    onOpenAllotmentModal, 
    searchTerm, 
    setSearchTerm,
    viewMode,
    setViewMode,
    onCopyAllFinance
}) => {
  const totalAccounts = accounts.length;
  const appliedAccounts = accounts.filter(acc => acc.status === ApplicationStatus.Applied || acc.status === ApplicationStatus.Allotted).length;
  const allottedAccounts = accounts.filter(acc => acc.status === ApplicationStatus.Allotted).length;

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-700">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 w-full xl:w-auto justify-between xl:justify-start">
                <h1 className="text-2xl font-bold text-white hidden sm:block">IPO Manager</h1>
                
                {/* View Toggle / Tabs */}
                <div className="bg-gray-900/80 p-1 rounded-lg flex border border-gray-700">
                   <button 
                      onClick={() => setViewMode('dashboard')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                   >
                      Dashboard
                   </button>
                   <button 
                      onClick={() => setViewMode('allotted')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'allotted' ? 'bg-yellow-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                   >
                      Allotted Zone 
                      {allottedAccounts > 0 && <span className="bg-white text-yellow-700 px-1.5 py-0.5 rounded-full text-xs font-bold">{allottedAccounts}</span>}
                   </button>
                </div>
            </div>
            
            {/* Stats - Only show relevant ones based on view */}
            <div className="flex items-center gap-2 sm:gap-4 text-center">
                {viewMode === 'dashboard' && (
                    <>
                        <div className="bg-gray-700 p-2 rounded-lg hidden sm:block">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total</div>
                            <div className="text-lg font-bold leading-none">{totalAccounts}</div>
                        </div>
                        <div className="bg-green-900/30 border border-green-800 p-2 rounded-lg">
                            <div className="text-[10px] text-green-400 uppercase tracking-wider">Applied</div>
                            <div className="text-lg font-bold text-green-200 leading-none">{appliedAccounts}</div>
                        </div>
                    </>
                )}
                
                {/* Global Actions */}
                <div className="flex flex-wrap justify-center gap-2 ml-2">
                    {viewMode === 'dashboard' ? (
                        <>
                            <button onClick={onAddAccount} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" title="Add Single">
                                {ICONS.ADD}
                            </button>
                            <button onClick={onBulkAdd} className="flex items-center gap-1 bg-indigo-800 hover:bg-indigo-900 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" title="Bulk Add">
                                {ICONS.BULK}
                            </button>
                            <button onClick={onOpenAllotmentModal} className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" title="Find Allotment">
                                {ICONS.RESULTS}
                            </button>
                            <button onClick={onCopySummary} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" title="Copy Applied List">
                                {ICONS.COPY}
                            </button>
                            <button onClick={onOpenPasteModal} className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" title="Check Allotment">
                                {ICONS.PASTE}
                            </button>
                             <button onClick={onResetAll} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" title="Reset">
                                {ICONS.RESET}
                            </button>
                        </>
                    ) : (
                        <>
                             <button onClick={onCopyAllFinance} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                                {ICONS.COPY} Copy All Finance
                            </button>
                            <button onClick={onOpenPasteModal} className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" title="Import Financials">
                                {ICONS.PASTE} Import Financials
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
        <div className="mt-4">
            <input
                type="text"
                placeholder={viewMode === 'dashboard' ? "Search by name, PAN or phone..." : "Search within allotted accounts..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
        </div>
      </div>
    </header>
  );
};

export default Header;
