import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";

import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 🔄 reload เพื่ออัปเดต emailVerified
        await firebaseUser.reload();

        // ❌ ยังไม่ยืนยันอีเมล → ไม่ให้เข้าแอพ
        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }

        // ✅ ยืนยันแล้ว
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

  // ❌ ยังไม่ login หรือยังไม่ verify
  if (!user) {
    return <AuthPage />;
  }

  // ✅ verify แล้วเท่านั้นถึงเข้าได้
  return <Dashboard user={user} onLogout={handleLogout} />;
}
