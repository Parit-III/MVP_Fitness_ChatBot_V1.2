import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth , db} from "./firebase";

import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  console.log("Firebase Auth:", auth);
  console.log("Firestore DB:", db);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName ?? "User",
          email: firebaseUser.email ?? "",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
