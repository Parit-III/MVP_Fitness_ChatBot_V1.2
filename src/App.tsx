import { useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock authentication
    setUser({ name: email.split("@")[0], email });
    setIsAuthenticated(true);
  };

  const handleSignup = (
    name: string,
    email: string,
    password: string,
  ) => {
    // Mock signup
    setUser({ name, email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <AuthPage onLogin={handleLogin} onSignup={handleSignup} />
    );
  }

  return <Dashboard user={user!} onLogout={handleLogout} />;
}