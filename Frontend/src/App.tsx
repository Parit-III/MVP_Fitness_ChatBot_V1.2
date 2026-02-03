import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase";

import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import VerifyEmail from "./components/VerifyEmail";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // 🔄 อัปเดต emailVerified
        setFirebaseUser(user);
      } else {
        setFirebaseUser(null);
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

  // ❌ ยังไม่ login
  if (!firebaseUser) {
    return <AuthPage />;
  }

  // ⚠️ login แล้ว แต่ยังไม่ verify
  if (!firebaseUser.emailVerified) {
    return <VerifyEmail />;
  }

  // ✅ verify แล้ว → เข้าแอพได้
  return (
    <Dashboard
      user={{
        name: firebaseUser.displayName ?? "User",
        email: firebaseUser.email ?? "",
      }}
      onLogout={handleLogout}
    />
  );
}
