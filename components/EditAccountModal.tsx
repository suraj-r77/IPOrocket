
import React, { useState, useEffect } from 'react';
import { Account, Broker } from '../types';
import { ICONS } from '../constants';

interface EditAccountModalProps {
  account: Account;
  onClose: () => void;
  onSave: (updatedAccount: Account) => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ account, onClose, onSave }) => {
  const [formData, setFormData] = useState<Account>(account);

  useEffect(() => {
      setFormData(account);
  }, [account]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">{ICONS.EDIT} Edit Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">{ICONS.CLOSE}</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Broker</label>
                <select name="broker" value={formData.broker} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600">
                {Object.values(Broker).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-gray-400 mb-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
             </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1">PAN</label>
                <input type="text" name="pan" value={formData.pan || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
             </div>
          </div>
          
          <div>
             <label className="block text-xs text-gray-400 mb-1">Email</label>
             <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
                <label className="block text-xs text-gray-400 mb-1">Login ID</label>
                <input type="text" name="loginId" value={formData.loginId || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
             </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1">PIN</label>
                <input type="text" name="pin" value={formData.pin || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
             </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1">TPIN</label>
                <input type="text" name="tpin" value={formData.tpin || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
             </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1">Year</label>
                <input type="text" name="year" value={formData.year || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
             </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600 h-24 resize-none" placeholder="Add any extra details here..." />
          </div>

          {/* Post Allotment Details */}
          <div className="border-t border-gray-700 pt-4 mt-2">
             <h3 className="text-sm font-semibold text-yellow-500 mb-2">Allotment Workflow</h3>
             <div className="grid grid-cols-2 gap-4 mb-2">
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="sharesSold" checked={formData.sharesSold || false} onChange={handleCheckboxChange} className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                    <span className="ml-2 text-sm text-white">Shares Sold</span>
                </label>
                 <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="amountWithdrawn" checked={formData.amountWithdrawn || false} onChange={handleCheckboxChange} className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                    <span className="ml-2 text-sm text-white">Amount Withdrawn</span>
                </label>
             </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1">Withdrawal Amount (Sold Value)</label>
                <input type="number" name="soldValue" value={formData.soldValue || ''} onChange={handleChange} placeholder="e.g., 15000" className="bg-gray-700 p-2 rounded w-full text-white border border-gray-600" />
             </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-4 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 text-white">Cancel</button>
            <button type="submit" className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-500 font-semibold text-white">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccountModal;
