
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Account, ApplicationStatus } from './types';
import { initialAccounts, parseRawAccountData } from './data/initialAccounts';
import useLocalStorage from './hooks/useLocalStorage';
import AccountCard from './components/AccountCard';
import Header from './components/Header';
import AddAccountModal from './components/AddAccountModal';
import PasteSummaryModal from './components/PasteSummaryModal';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';
import AllotmentModal from './components/AllotmentModal';
import EditAccountModal from './components/EditAccountModal';
import BulkAddModal from './components/BulkAddModal';
import { ICONS } from './constants';

interface RegistrarInfo {
  registrarName: string;
  allotmentUrl: string;
}

const App: React.FC = () => {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('ipo-accounts', initialAccounts);
  const [applyingAccountId, setApplyingAccountId] = useLocalStorage<string | null>('applying-account-id', null);
  const [totalInvestment, setTotalInvestment] = useLocalStorage<string>('total-investment', '');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isAllotmentModalOpen, setIsAllotmentModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMoneyAnimation, setShowMoneyAnimation] = useState(false);
  
  // New State for Tabs
  const [viewMode, setViewMode] = useState<'dashboard' | 'allotted'>('dashboard');

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const updateAccountStatus = useCallback((id: string, status: ApplicationStatus) => {
    setAccounts(prev =>
      prev.map(acc => (acc.id === id ? { ...acc, status } : acc))
    );
  }, [setAccounts]);
  
  const handleToggleSold = (id: string, sold: boolean) => {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, sharesSold: sold } : acc));
  };

  const handleToggleWithdrawn = (id: string, withdrawn: boolean) => {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, amountWithdrawn: withdrawn } : acc));
  };
  
  const handleUpdateSoldValue = (id: string, value: string) => {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, soldValue: value } : acc));
  };

  const handleSaveEdit = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
    showToast("Account updated successfully");
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && applyingAccountId) {
        updateAccountStatus(applyingAccountId, ApplicationStatus.Applied);
        showToast(`Marked account as Applied!`);
        setApplyingAccountId(null);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [applyingAccountId, setApplyingAccountId, updateAccountStatus]);

  useEffect(() => {
      if (showMoneyAnimation) {
          const timer = setTimeout(() => setShowMoneyAnimation(false), 5000);
          return () => clearTimeout(timer);
      }
  }, [showMoneyAnimation]);

  const handleApply = (id: string, phone: string, url: string) => {
    navigator.clipboard.writeText(phone).then(() => {
      showToast('Phone number copied to clipboard!');
      setApplyingAccountId(id);
      window.open(url, '_blank');
    });
  };

  const handleResetAll = () => {
    setConfirmModal({
        isOpen: true,
        title: 'Reset All Accounts',
        message: 'Are you sure you want to mark all accounts as "Pending"? This action cannot be undone.',
        onConfirm: () => {
            setAccounts(prev =>
              prev.map(acc => ({ ...acc, status: ApplicationStatus.Pending, sharesSold: false, amountWithdrawn: false, soldValue: undefined, profit: undefined }))
            );
            showToast('All accounts have been reset.');
        }
    });
  };

  const handleCopySummary = () => {
    const appliedAccounts = accounts.filter(acc => acc.status === ApplicationStatus.Applied || acc.status === ApplicationStatus.Allotted);
    if (appliedAccounts.length === 0) {
        showToast('No accounts have been marked as applied.');
        return;
    }
    const summary = appliedAccounts
      .map(acc => `${acc.name}\n${acc.pan || 'PAN not available'}`)
      .join('\n\n');
    const fullText = `${summary}\n\nTotal Applied Accounts: ${appliedAccounts.length}`;
    navigator.clipboard.writeText(fullText).then(() => {
        showToast('Applied accounts summary copied!');
    });
  };

  const handleCopyAllFinancials = () => {
      const allotted = accounts.filter(acc => acc.status === ApplicationStatus.Allotted);
      if (allotted.length === 0) {
          showToast("No allotted accounts to copy.");
          return;
      }
      const totalInv = parseFloat(totalInvestment) || 0;
      const invPerAccount = totalInv / allotted.length;
      const formatCurrency = (num: number) => num.toLocaleString('en-IN');

      const report = allotted.map(acc => {
          const soldVal = parseFloat(acc.soldValue || '0');
          const profit = soldVal > 0 && invPerAccount > 0 ? soldVal - invPerAccount : 0;
          const profitLabel = profit >= 0 ? 'Profit' : 'Loss';

          return `👤 ${acc.name}
Total Investment - ${formatCurrency(Math.round(invPerAccount))}rs
Total Sell Value - ${formatCurrency(soldVal)}rs
${profitLabel} - ${formatCurrency(Math.abs(profit))}rs
Withdrawn - ${acc.amountWithdrawn ? 'Yes' : 'No'}`;
      }).join('\n\n');

      navigator.clipboard.writeText(report).then(() => {
          showToast(`Copied financial data for ${allotted.length} accounts!`);
      });
  };

  const handleAddAccount = (newAccountData: Omit<Account, 'id' | 'status'>) => {
    const newAccount: Account = {
      ...newAccountData,
      id: crypto.randomUUID(),
      status: ApplicationStatus.Pending,
    };
    setAccounts(prev => [...prev, newAccount]);
    showToast('New account added successfully!');
  };

  const handleBulkAdd = (text: string) => {
      const newPotentialAccounts = parseRawAccountData(text);
      if (newPotentialAccounts.length === 0) {
          showToast("No valid accounts found.");
          return;
      }

      let addedCount = 0;
      const accountsToAdd: Account[] = [];

      newPotentialAccounts.forEach(newAcc => {
          const isDuplicate = accounts.some(existing => {
              if (newAcc.pan && existing.pan && newAcc.pan.toUpperCase() === existing.pan.toUpperCase()) return true;
              if (newAcc.loginId && existing.loginId && newAcc.loginId.toLowerCase() === existing.loginId.toLowerCase()) return true;
              if (newAcc.phone === existing.phone && newAcc.name.toLowerCase() === existing.name.toLowerCase()) return true;
              return false;
          });

          const isDuplicateInBatch = accountsToAdd.some(existing => {
               if (newAcc.pan && existing.pan && newAcc.pan.toUpperCase() === existing.pan.toUpperCase()) return true;
               if (newAcc.loginId && existing.loginId && newAcc.loginId.toLowerCase() === existing.loginId.toLowerCase()) return true;
               if (newAcc.phone === existing.phone && newAcc.name.toLowerCase() === existing.name.toLowerCase()) return true;
               return false;
          });

          if (!isDuplicate && !isDuplicateInBatch) {
              accountsToAdd.push(newAcc);
              addedCount++;
          }
      });

      if (addedCount === 0) {
          showToast("No new accounts added.");
      } else {
          setAccounts(prev => [...prev, ...accountsToAdd]);
          showToast(`Successfully added ${addedCount} new accounts.`);
      }
  }

  const handleProcessPaste = (pastedText: string, markAsAllotted: boolean) => {
    const lines = pastedText.trim().split('\n');
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]/i;
    
    let updatedStatusCount = 0;
    let updatedFinanceCount = 0;

    // Logic 1: Status Update via PAN (Legacy)
    const parsedPans = lines
      .map(line => {
        const match = line.trim().match(panRegex);
        return match ? match[0].toUpperCase() : null;
      })
      .filter((pan): pan is string => pan !== null);
    
    // Logic 2: Financial Restore via structured text (Name & Sold Value)
    // Format looked for: "👤 Name", "Total Sell Value - 15,000rs", "Withdrawn - Yes"
    let currentAccountName: string | null = null;
    const updatesByAccountName: Record<string, { soldValue?: string, withdrawn?: boolean }> = {};

    lines.forEach(line => {
        // Check for Name line
        const nameMatch = line.match(/👤\s*([^\n]+)/);
        if (nameMatch) {
            currentAccountName = nameMatch[1].trim();
        }
        
        if (currentAccountName) {
            // Check for Total Sell Value - 15,000rs
            const soldMatch = line.match(/Total Sell Value\s*-\s*([\d,]+)rs/i);
            // Check for Withdrawn - Yes
            const withdrawnMatch = line.match(/Withdrawn\s*-\s*(Yes|No)/i);
            
            if (soldMatch || withdrawnMatch) {
                if (!updatesByAccountName[currentAccountName]) {
                    updatesByAccountName[currentAccountName] = {};
                }
                if (soldMatch) {
                    // Remove commas before storing
                    updatesByAccountName[currentAccountName].soldValue = soldMatch[1].replace(/,/g, '');
                }
                if (withdrawnMatch) {
                    updatesByAccountName[currentAccountName].withdrawn = withdrawnMatch[1].toLowerCase() === 'yes';
                }
            }
        }
    });

    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        let updatedAcc = { ...acc };
        let changed = false;

        // 1. Status Update
        if (acc.pan && parsedPans.includes(acc.pan.toUpperCase())) {
             const targetStatus = markAsAllotted ? ApplicationStatus.Allotted : ApplicationStatus.Applied;
             if (acc.status !== targetStatus) {
                updatedAcc.status = targetStatus;
                updatedStatusCount++;
                changed = true;
             }
        }

        // 2. Financial Restore
        if (updatesByAccountName[acc.name]) {
             const update = updatesByAccountName[acc.name];
             if (update.soldValue !== undefined && update.soldValue !== acc.soldValue) {
                 updatedAcc.soldValue = update.soldValue;
                 updatedAcc.sharesSold = true; // implied by presence of sold value
                 updatedFinanceCount++;
                 changed = true;
             }
             if (update.withdrawn !== undefined && update.withdrawn !== acc.amountWithdrawn) {
                 updatedAcc.amountWithdrawn = update.withdrawn;
                 updatedFinanceCount++;
                 changed = true;
             }
        }

        return changed ? updatedAcc : acc;
      });
    });

    if (updatedStatusCount > 0) {
      showToast(`${updatedStatusCount} account(s) status updated.`);
      if (markAsAllotted) {
          setShowMoneyAnimation(true);
          setViewMode('allotted');
      }
    } else if (updatedFinanceCount > 0) {
        showToast(`Restored financial data for ${Math.ceil(updatedFinanceCount / 2)} accounts.`); 
    } else {
      showToast('No matching accounts found to update.');
    }
  };
  
  const handleFindRegistrar = async (ipoName: string): Promise<RegistrarInfo | null> => {
    if (!process.env.API_KEY) {
      throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `For the IPO named "${ipoName}", which registrar handled the allotment? The main registrars in India are Link Intime, KFintech, and Bigshare. Provide the registrar's name and the direct URL to their IPO allotment status check page. If you cannot find the information, respond with an empty object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        registrarName: {
                            type: Type.STRING,
                        },
                        allotmentUrl: {
                            type: Type.STRING,
                        },
                    },
                    required: ['registrarName', 'allotmentUrl'],
                },
            },
        });
      
        const jsonText = response.text.trim();
        if (!jsonText) return null;
        
        const parsedJson = JSON.parse(jsonText);
        if (parsedJson.registrarName && parsedJson.allotmentUrl) {
            return parsedJson as RegistrarInfo;
        }
        return null;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
  };

  // --- Math & Logic for Allotted View ---

  // 1. Get allotted accounts
  const allottedAccountsList = accounts.filter(acc => acc.status === ApplicationStatus.Allotted);
  const totalAllottedCount = allottedAccountsList.length;

  // 2. Calculate Investment Per Account
  const totalInvValue = parseFloat(totalInvestment) || 0;
  const investmentPerAccount = totalAllottedCount > 0 ? totalInvValue / totalAllottedCount : 0;

  // 3. Calculate Total Profit
  // Total Profit = (Sum of soldValues) - (Investment per account * number of accounts marked sold)
  // Or simpler: Total Sold Value - Total Investment (if all sold), but user wants partial tracking.
  // Let's calculate profit strictly for the ones sold.
  let totalSoldValue = 0;
  allottedAccountsList.forEach(acc => {
      if(acc.sharesSold && acc.soldValue) {
          totalSoldValue += (parseFloat(acc.soldValue) || 0);
      }
  });
  // Note: This profit stats is tricky if not all are sold. 
  // Logic: Current Realized Profit = Total Sold Value - (Investment Per Account * Count of Sold Accounts)
  const soldAccountsCount = allottedAccountsList.filter(acc => acc.sharesSold).length;
  const realizedProfit = totalSoldValue - (investmentPerAccount * soldAccountsCount);


  // Logic to filter accounts based on View Mode
  let displayedAccounts = accounts;
  if (viewMode === 'allotted') {
      displayedAccounts = allottedAccountsList;
      // Sort by action needed: Accounts not sold or withdrawn come first
      displayedAccounts.sort((a, b) => {
          const aDone = a.sharesSold && a.amountWithdrawn ? 1 : 0;
          const bDone = b.sharesSold && b.amountWithdrawn ? 1 : 0;
          return aDone - bDone;
      });
  }

  // Filter by search term
  displayedAccounts = displayedAccounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone.includes(searchTerm)
  );
  
  const pendingSale = allottedAccountsList.filter(a => !a.sharesSold).length;
  const pendingWithdrawal = allottedAccountsList.filter(a => !a.amountWithdrawn).length;

  return (
    <div className="min-h-screen bg-gray-900">
      {showMoneyAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute text-4xl animate-fall"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        animationDuration: `${Math.random() * 2 + 1}s`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                  >
                  💰
                  </div>
              ))}
          </div>
      )}

      <Header
        accounts={accounts}
        onCopySummary={handleCopySummary}
        onResetAll={handleResetAll}
        onAddAccount={() => setIsAddModalOpen(true)}
        onBulkAdd={() => setIsBulkAddModalOpen(true)}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenAllotmentModal={() => setIsAllotmentModalOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onCopyAllFinance={handleCopyAllFinancials}
      />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {viewMode === 'allotted' && (
            <div className="mb-8 animate-fade-in-up space-y-4">
                
                {/* Input for Total Investment - Prominent at Top */}
                <div className="bg-gray-800/80 p-6 rounded-xl border border-indigo-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 w-full">
                         <label className="text-sm text-indigo-300 font-bold uppercase tracking-wider mb-2 block">Total Batch Investment</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">₹</span>
                            <input 
                                type="number" 
                                value={totalInvestment} 
                                onChange={(e) => setTotalInvestment(e.target.value)}
                                placeholder="e.g. 150000"
                                className="w-full bg-gray-900 border border-gray-600 text-white text-2xl font-bold py-3 pl-8 pr-4 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600"
                            />
                         </div>
                         <p className="text-xs text-gray-500 mt-2">Enter the total amount blocked for all allotted applications.</p>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-w-[140px] text-center">
                             <h3 className="text-gray-400 text-[10px] uppercase mb-1">Cost Per App</h3>
                             <p className="text-xl font-mono text-white">₹ {investmentPerAccount.toFixed(0)}</p>
                        </div>
                        <div className="text-gray-600 hidden md:block text-3xl font-light">/</div>
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-w-[140px] text-center">
                             <h3 className="text-gray-400 text-[10px] uppercase mb-1">Realized Profit</h3>
                             <p className={`text-xl font-mono font-bold ${realizedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {realizedProfit >= 0 ? '+' : ''} ₹ {realizedProfit.toFixed(0)}
                             </p>
                        </div>
                    </div>
                </div>

                {/* Workflow Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center">
                        <h3 className="text-gray-400 text-[10px] uppercase">Allotted</h3>
                        <p className="text-xl font-bold text-white">{totalAllottedCount}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center">
                        <h3 className="text-gray-400 text-[10px] uppercase">To Sell</h3>
                        <p className={`text-xl font-bold ${pendingSale > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>{pendingSale}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center">
                        <h3 className="text-gray-400 text-[10px] uppercase">To Withdraw</h3>
                        <p className={`text-xl font-bold ${pendingWithdrawal > 0 ? 'text-blue-400' : 'text-gray-500'}`}>{pendingWithdrawal}</p>
                    </div>
                </div>
            </div>
        )}

        {displayedAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedAccounts.map(account => (
                <AccountCard
                key={account.id}
                account={account}
                investmentPerAccount={investmentPerAccount} // Pass the calculated cost
                onStatusChange={updateAccountStatus}
                onApply={handleApply}
                onEdit={setEditingAccount}
                onToggleSold={handleToggleSold}
                onToggleWithdrawn={handleToggleWithdrawn}
                onUpdateProfit={handleUpdateSoldValue} // Actually updates soldValue now
                viewMode={viewMode}
                />
            ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-gray-400">
                    {viewMode === 'allotted' ? 'No Allotments Yet' : 'No Accounts Found'}
                </h2>
                <p className="text-gray-500 mt-2">
                    {viewMode === 'allotted' ? 'Mark an account as "Allotted" and enter Total Investment above.' : 'Try adjusting your search or add a new account.'}
                </p>
                {viewMode === 'allotted' && (
                    <button onClick={() => setViewMode('dashboard')} className="mt-4 text-indigo-400 hover:text-indigo-300 underline">
                        Go back to Dashboard
                    </button>
                )}
            </div>
        )}
      </main>

      {isAddModalOpen && (
        <AddAccountModal
          onClose={() => setIsAddModalOpen(false)}
          onAddAccount={handleAddAccount}
        />
      )}
      {isBulkAddModalOpen && (
        <BulkAddModal 
            onClose={() => setIsBulkAddModalOpen(false)}
            onProcess={handleBulkAdd}
        />
      )}
      {isPasteModalOpen && (
        <PasteSummaryModal
          onClose={() => setIsPasteModalOpen(false)}
          onProcess={handleProcessPaste}
        />
      )}
      {isAllotmentModalOpen && (
        <AllotmentModal
            isOpen={isAllotmentModalOpen}
            onClose={() => setIsAllotmentModalOpen(false)}
            accounts={accounts}
            onFindRegistrar={handleFindRegistrar}
        />
      )}
      {editingAccount && (
          <EditAccountModal 
            account={editingAccount}
            onClose={() => setEditingAccount(null)}
            onSave={handleSaveEdit}
          />
      )}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({...prev, isOpen: false}))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default App;
