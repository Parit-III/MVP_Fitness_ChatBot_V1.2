import { useState } from "react";
import { User } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification, // ✅ เพิ่มเพื่อส่งเมล
  signOut,               // ✅ เพิ่มเพื่อเตะออกหากยังไม่ verify
} from "firebase/auth";
import { auth } from "../firebase";
import { createUserDoc } from "../services/userService";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !name)) {
      alert("Please fill all fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        // --- ส่วนของ LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ เช็คว่ายืนยันอีเมลหรือยัง
        if (!user.emailVerified) {
          alert("กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ! (Check your inbox)");
          await signOut(auth); // บังคับออกจากระบบหากยังไม่ยืนยัน
          setLoading(false);
          return;
        }

        alert("เข้าสู่ระบบสำเร็จ");
      } else {
        // --- ส่วนของ SIGN UP ---
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // อัปเดตชื่อ Profile
        await updateProfile(userCredential.user, {
          displayName: name,
        });

        // ✅ ส่งอีเมลยืนยันตัวตน (Email Verification)
        await sendEmailVerification(userCredential.user);

        // สร้าง Document ใน Database
        await createUserDoc(userCredential.user);

        alert("สร้างบัญชีสำเร็จ! กรุณาตรวจสอบอีเมลและคลิกลิงก์ยืนยันก่อนเข้าสู่ระบบ");
        
        // หลังจากสมัครเสร็จ ให้เตะออกไปหน้า Login เพื่อให้เขารอกด Link
        await signOut(auth);
        setIsLogin(true);
        setConfirmPassword("");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      // จัดการ Error ข้อความให้อ่านง่ายขึ้น
      if (error.code === "auth/email-already-in-use") {
        alert("อีเมลนี้ถูกใช้งานแล้ว");
      } else if (error.code === "auth/wrong-password") {
        alert("รหัสผ่านไม่ถูกต้อง");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 relative overflow-hidden">
      <div className="glass-effect rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-white/20 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mb-4 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            FitPro
          </h1>
          <p className="text-gray-600">Your personal fitness companion</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-xl transition-all ${
              isLogin
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-white/60 hover:bg-white/80"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-xl transition-all ${
              !isLogin
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-white/60 hover:bg-white/80"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 transition-all mt-4"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}