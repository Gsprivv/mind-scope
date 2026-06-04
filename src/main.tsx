import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CheckInsProvider } from "./context/CheckInsContext";
import { ChatWidgetProvider } from "./context/ChatWidgetContext";
import { StaffProvider } from "./context/StaffContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

function AppWithCheckIns() {
  const { user } = useAuth();
  return (
    <CheckInsProvider userId={user?.id}>
      <StaffProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </StaffProvider>
    </CheckInsProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppWithCheckIns />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
