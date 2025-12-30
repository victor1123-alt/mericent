import React, { createContext, useContext, useState, ReactNode } from 'react';
import Alert from '../components/Alert';

interface AlertItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showCancelButton?: boolean;
}

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number, showCancelButton?: boolean) => void;
  hideAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000,
    showCancelButton: boolean = true
  ) => {
    const id = Date.now().toString();
    const newAlert: AlertItem = {
      id,
      message,
      type,
      duration,
      showCancelButton,
    };
    setAlerts((prev) => [...prev, newAlert]);
  };

  const hideAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => hideAlert(alert.id)}
          duration={alert.duration}
          showCancelButton={alert.showCancelButton}
        />
      ))}
    </AlertContext.Provider>
  );
};