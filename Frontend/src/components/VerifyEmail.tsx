import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { deleteUser, signOut } from "firebase/auth";

export default function VerifyEmail() {
  const user = auth.currentUser;

  const handleCancel = async () => {
  const user = auth.currentUser;
  if (!user) return;  
  await deleteUser(user); // 🔥 ลบออกจาก Firebase Auth
  await signOut(auth);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">📧 Verify your email</h1>

      <p className="text-center">
        We’ve sent a verification link to <br />
        <b>{user?.email}</b>
      </p>

      <button
        onClick={() => sendEmailVerification(user!)}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Resend verification email
      </button>

      <button
        onClick={async () => {
          await user?.reload();
          window.location.reload();
        }}
        className="text-sm underline text-gray-600"
      >
        I’ve verified already
      </button>

      <button onClick={handleCancel}>
        ยกเลิกการสมัคร
      </button>

    </div>
  );
}
