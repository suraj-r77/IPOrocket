
import React from 'react';
import { Account, ApplicationStatus, Broker } from '../types';
import { BROKER_URLS, ICONS } from '../constants';

interface AccountCardProps {
  account: Account;
  investmentPerAccount?: number; // Optional, used for Allotted calculation
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onApply: (id: string, phone: string, url: string) => void;
  onEdit: (account: Account) => void;
  onToggleSold?: (id: string, sold: boolean) => void;
  onToggleWithdrawn?: (id: string, withdrawn: boolean) => void;
  onUpdateProfit?: (id: string, value: string) => void;
  viewMode?: 'dashboard' | 'allotted';
}

const brokerDisplay: Record<Broker, { name: string, color: string }> = {
    [Broker.Upstox]: { name: 'Upstox', color: 'bg-blue-500' },
    [Broker.Zerodha]: { name: 'Zerodha', color: 'bg-sky-500' },
    [Broker.Groww]: { name: 'Groww', color: 'bg-green-500' },
    [Broker.AngleOne]: { name: 'Angle One', color: 'bg-red-500' },
    [Broker.Unknown]: { name: 'Unknown', color: 'bg-gray-500' },
};

const AccountCard: React.FC<AccountCardProps> = ({ 
    account, 
    investmentPerAccount = 0,
    onStatusChange, 
    onApply, 
    onEdit, 
    onToggleSold, 
    onToggleWithdrawn,
    onUpdateProfit,
    viewMode = 'dashboard'
}) => {
  const isApplied = account.status === ApplicationStatus.Applied;
  const isAllotted = account.status === ApplicationStatus.Allotted;
  const brokerInfo = brokerDisplay[account.broker];
  const brokerUrl = BROKER_URLS[account.broker];

  // Calculate individual profit dynamically
  const soldVal = parseFloat(account.soldValue || '0');
  const profit = soldVal > 0 && investmentPerAccount > 0 ? soldVal - investmentPerAccount : 0;

  const handleApplyClick = () => {
    onApply(account.id, account.phone, brokerUrl);
  };

  const toggleStatus = () => {
    const newStatus = isApplied ? ApplicationStatus.Pending : ApplicationStatus.Applied;
    onStatusChange(account.id, newStatus);
  };

  const toggleAllotment = () => {
    const newStatus = isAllotted ? ApplicationStatus.Applied : ApplicationStatus.Allotted;
    onStatusChange(account.id, newStatus);
  };
  
  const handleCopyFinancials = () => {
      const profitLabel = profit >= 0 ? 'Profit' : 'Loss';
      // Format numbers with commas (Indian system)
      const formatCurrency = (num: number) => num.toLocaleString('en-IN');

      const text = `👤 ${account.name}
Total Investment - ${formatCurrency(Math.round(investmentPerAccount))}rs
Total Sell Value - ${formatCurrency(soldVal)}rs
${profitLabel} - ${formatCurrency(Math.abs(profit))}rs
Withdrawn - ${account.amountWithdrawn ? 'Yes' : 'No'}`;
      
      navigator.clipboard.writeText(text);
  };
  
  const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string; isCopiable?: boolean }> = ({ icon, label, value, isCopiable }) => {
    if (!value) return null;
    
    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value);
        }
    }
    
    return (
        <div className="flex items-center text-sm text-gray-300 group">
            <span className="text-gray-400 mr-2 flex-shrink-0">{icon}</span>
            <span className="font-semibold mr-1 flex-shrink-0">{label}:</span>
            <span className="truncate flex-1 mr-1">{value}</span>
            {isCopiable && (
                <button onClick={handleCopy} className="opacity-50 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity" title="Copy">
                    {ICONS.COPY}
                </button>
            )}
        </div>
    );
  };

  let cardStyle = 'bg-gray-800 border-gray-700';
  if (isAllotted) {
      cardStyle = 'bg-yellow-900/40 border-yellow-500 shadow-yellow-500/20';
  } else if (isApplied) {
      cardStyle = 'bg-green-900/50 border-green-500';
  }

  return (
    <div className={`rounded-xl shadow-lg transition-all duration-300 border relative flex flex-col h-full ${cardStyle}`}>
      {/* Edit Button */}
      <button 
        onClick={() => onEdit(account)} 
        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors z-10"
        title="Edit Details"
      >
        {ICONS.EDIT}
      </button>

      <div className="p-5 flex-1">
        <div className="flex justify-between items-start pr-8">
          <h3 className="text-xl font-bold text-white capitalize truncate w-full">{account.name}</h3>
        </div>
        <div className="mt-1 mb-4 flex gap-2">
             <span className={`px-3 py-0.5 text-xs font-bold rounded-full text-white ${brokerInfo.color}`}>
                {brokerInfo.name}
            </span>
            {isAllotted && !account.sharesSold && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white bg-purple-600 animate-pulse">
                    Sell Now
                </span>
            )}
             {isAllotted && account.sharesSold && !account.amountWithdrawn && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white bg-blue-600">
                    Withdraw
                </span>
            )}
            {account.amountWithdrawn && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white bg-teal-600">
                    Completed
                </span>
            )}
        </div>

        <div className="space-y-3">
           {/* Allotted View: Financials + Details */}
           {viewMode === 'allotted' ? (
             <div className="space-y-3 pt-2">
                {/* Account Details for Login */}
                <div className="pb-4 mb-2 border-b border-gray-700/50 space-y-1">
                    <DetailItem icon={ICONS.PHONE} label="Phone" value={account.phone} isCopiable />
                    <DetailItem icon={ICONS.PAN} label="PAN" value={account.pan} isCopiable />
                    <DetailItem icon={ICONS.USER} label="ID" value={account.loginId} isCopiable />
                    <div className="grid grid-cols-2 gap-2">
                        <DetailItem icon={ICONS.LOCK} label="PIN" value={account.pin} isCopiable />
                        <DetailItem icon={ICONS.LOCK} label="TPIN" value={account.tpin} isCopiable />
                    </div>
                    <DetailItem icon={ICONS.EMAIL} label="Email" value={account.email} isCopiable />
                </div>

                <div>
                    <label className="text-xs text-gray-400 font-semibold uppercase">Total Sell Value (Rs)</label>
                    <div className="flex gap-2 mt-1">
                        <input 
                            type="number" 
                            value={account.soldValue || ''} 
                            onChange={(e) => onUpdateProfit && onUpdateProfit(account.id, e.target.value)}
                            placeholder="Enter Amount" 
                            className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                </div>
                
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Net Profit/Loss:</span>
                    <span className={`font-bold font-mono text-lg ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${account.sharesSold ? 'bg-indigo-600 border-indigo-600' : 'border-gray-500 bg-gray-700'}`}>
                            {account.sharesSold && ICONS.CHECK}
                        </div>
                        <input type="checkbox" className="hidden" checked={account.sharesSold || false} onChange={(e) => onToggleSold && onToggleSold(account.id, e.target.checked)} />
                        <span className="ml-2 text-sm text-gray-300 group-hover:text-white">Shares Sold</span>
                    </label>

                     <label className="flex items-center cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${account.amountWithdrawn ? 'bg-teal-600 border-teal-600' : 'border-gray-500 bg-gray-700'}`}>
                            {account.amountWithdrawn && ICONS.CHECK}
                        </div>
                        <input type="checkbox" className="hidden" checked={account.amountWithdrawn || false} onChange={(e) => onToggleWithdrawn && onToggleWithdrawn(account.id, e.target.checked)} />
                        <span className="ml-2 text-sm text-gray-300 group-hover:text-white">Withdrawn</span>
                    </label>
                </div>
                
                <button 
                    onClick={handleCopyFinancials}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg text-xs font-semibold transition-colors border border-gray-600"
                >
                    {ICONS.COPY} Copy Finance
                </button>
             </div>
           ) : (
             <>
              <DetailItem icon={ICONS.PHONE} label="Phone" value={account.phone} isCopiable />
              <DetailItem icon={ICONS.PAN} label="PAN" value={account.pan} isCopiable />
              <DetailItem icon={ICONS.USER} label="ID" value={account.loginId} isCopiable />
              <div className="grid grid-cols-2 gap-2">
                  <DetailItem icon={ICONS.LOCK} label="PIN" value={account.pin} isCopiable />
                  <DetailItem icon={ICONS.LOCK} label="TPIN" value={account.tpin} isCopiable />
              </div>
              <DetailItem icon={ICONS.EMAIL} label="Email" value={account.email} isCopiable />
              {account.notes && <DetailItem icon={ICONS.NOTES} label="Notes" value={account.notes} />}
            </>
           )}
        </div>
      </div>

      {/* Actions - Only show main actions in dashboard mode */}
      {viewMode === 'dashboard' && (
        <div className="bg-gray-900/50 p-3 border-t border-gray-700 rounded-b-xl flex justify-between items-center gap-2 backdrop-blur-sm">
            <div onClick={toggleStatus} className="cursor-pointer">
                {isApplied ? (
                    <span className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-900/30 px-2 py-1 rounded border border-green-800">
                        {ICONS.CHECK} Applied
                    </span>
                ) : (
                    <span className="text-gray-500 text-xs">Pending</span>
                )}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={toggleAllotment}
                    className={`p-2 rounded-lg transition-colors ${isAllotted ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20' : 'bg-gray-700 text-gray-400 hover:text-yellow-400 hover:bg-gray-600'}`}
                    title={isAllotted ? "Allotment Received" : "Mark Allotted"}
                >
                    {ICONS.MONEY}
                </button>
                <button
                    onClick={handleApplyClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-1"
                >
                    Apply ↗
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountCard;
