
import React, { useState } from 'react';
import { Account, ApplicationStatus, Broker } from '../types';
import { ICONS } from '../constants';

interface AddAccountModalProps {
  onClose: () => void;
  onAddAccount: (account: Omit<Account, 'id' | 'status'>) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose, onAddAccount }) => {
  const [formData, setFormData] = useState({
    name: '',
    broker: Broker.Upstox,
    phone: '',
    email: '',
    pan: '',
    loginId: '',
    pin: '',
    year: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      onAddAccount(formData);
      onClose();
    } else {
      alert('Name and Phone are required.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Add New Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">{ICONS.CLOSE}</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Account Name*" value={formData.name} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full" />
            <select name="broker" value={formData.broker} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full">
              {Object.values(Broker).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <input type="tel" name="phone" placeholder="Phone Number*" value={formData.phone} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full" />
          <input type="text" name="pan" placeholder="PAN Number" value={formData.pan} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <input type="text" name="loginId" placeholder="Login ID" value={formData.loginId} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" />
             <input type="text" name="pin" placeholder="PIN" value={formData.pin} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" />
             <input type="text" name="year" placeholder="Birth Year" value={formData.year} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-4 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
            <button type="submit" className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-500 font-semibold">Add Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
