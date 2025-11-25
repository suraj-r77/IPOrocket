import React, { useState, useEffect, useRef } from 'react';

declare const chrome: any;

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize with the default value immediately so the UI renders
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // Track if the initial load from storage has happened
  const isLoaded = useRef(false);

  useEffect(() => {
    // 1. Check if we are running in a Chrome Extension environment
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result: any) => {
        if (result[key] !== undefined) {
          // Data found in Chrome Storage
          setStoredValue(result[key]);
        } else {
            // No data found, stick with initialValue
        }
        isLoaded.current = true;
      });
    } else {
      // 2. Fallback: Running in a normal browser (localhost/web)
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error('Error reading from localStorage', error);
      }
      isLoaded.current = true;
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // 1. Update React State
      setStoredValue(valueToStore);

      // 2. Save to Storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Save to Chrome Extension Storage
        chrome.storage.local.set({ [key]: valueToStore });
      } else {
        // Save to Browser LocalStorage (Fallback)
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;