import { createContext } from "react";
import { useNotification } from "../hooks/useNotification";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const api = useNotification();
  return (
    <NotificationContext.Provider value={api}>
      {children}
    </NotificationContext.Provider>
  );
}
