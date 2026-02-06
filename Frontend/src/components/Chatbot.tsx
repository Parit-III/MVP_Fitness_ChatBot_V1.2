import { useState, useRef, useEffect, useContext } from "react";
import { Send, Bot } from "lucide-react";
import { AuthContext } from "./AuthContext";
import PlanForm from "./PlanForm";
import { doc, getDoc, setDoc, serverTimestamp , collection, getDocs} from "firebase/firestore";
import { db } from "../firebase";


interface Message {
  id: string;
  text: string;
  senderRole: "user" | "bot";   // ใช้จัด UI
  senderId?: string;            // uid
  senderName?: string;          // ชื่อที่เอาไว้ดูใน Firebase
  timestamp: Date;
  isLoading?: boolean;

  planData?: any;   // ✅ เพิ่ม
}

interface Exercise {
  id: string;
  name: string;
}

interface ChatbotProps {
  userName: string;
}

const CHAT_API = `${import.meta.env.VITE_API_URL}/api/ai/chat`;
const PLAN_API = `${import.meta.env.VITE_API_URL}/api/ai/plan`;


export function Chatbot({ userName }: ChatbotProps) {
  type ChatMode = "chat" | "plan";//new
  const [mode, setMode] = useState<ChatMode>("chat");//new
  const { user, loading } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ ต้องอยู่ใน component
  const sendToBackend = async (allMessages: Message[]) => {
    const formatted = allMessages.map((m) => ({
      role: m.senderRole === "user" ? "user" : "assistant",
      content: m.text,
    }));


    const res = await fetch(CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: formatted }),
    });

    const data = await res.json();
    return data.reply;
  };

  const handleSavePlan = async (plan: any) => {
    if (!user) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/userPlans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        plan,
      }),
    });

    alert("✅ Save plan สำเร็จ");
  };

  // ✅ ต้องอยู่ใน component
  const handleSendMessage = async () => {
  if (loading || !user || !inputText.trim()) return;

  const userMsg: Message = {
    id: Date.now().toString(),
    text: inputText,
    senderRole: "user",
    senderId: user.uid,
    senderName: user.displayName || user.email || "Unknown",
    timestamp: new Date(),
  };

  const loadingMsg: Message = {
    id: "loading",
    text: "🤖 AI is thinking...",
    senderRole: "bot",
    senderId: "bot",
    senderName: "FitPro AI",
    timestamp: new Date(),
    isLoading: true,
  };

  setInputText("");
  setMessages((prev) => [...prev, userMsg, loadingMsg]);

  try {
    const reply = await sendToBackend(
      messages.filter((m) => !m.isLoading).concat(userMsg)
    );

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: reply,
      senderRole: "bot",
      senderId: "bot",
      senderName: "FitPro AI",
      timestamp: new Date(),
    };

    setMessages((prev) =>
      prev
        .filter((m) => !m.isLoading) // 👈 ลบ loading
        .concat(botMsg)
    );
  } catch {
    setMessages((prev) =>
      prev
        .filter((m) => !m.isLoading)
        .concat({
          id: "err",
          text: "⚠️ Server error. Please try again.",
          senderRole: "bot",
          senderId: "bot",
          senderName: "FitPro AI",
          timestamp: new Date(),
        })
    );
  }
};



  //new
  useEffect(() => {
  if (!user) return;

  const loadChat = async () => {
    const ref = doc(db, "chats", user.uid);
    const snap = await getDoc(ref);

    // 👉 ถ้ามี chat เก่า
    if (snap.exists() && snap.data().messages?.length > 0) {
      const savedMessages = snap.data().messages;

      // ✅ limit 100 ล่าสุด
      const limitedMessages = savedMessages.slice(-100);

      setMessages(
        limitedMessages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      );
    } 
    // 👉 ถ้าไม่มี chat เก่า → ใส่ greeting
    else {
      setMessages([
        {
          id: "greeting",
          text: `Hi ${userName}! 👋 I'm your AI fitness assistant. Ask me anything.`,
          senderRole: "bot",
          senderId: "bot",
          senderName: "FitPro AI",
          timestamp: new Date(),
        },
      ]);
    }
  };

  loadChat();
}, [user, userName]);


const saveChatToFirestore = async (allMessages: Message[]) => {
  if (!user) return;

  const limitedMessages = allMessages.slice(-100);

  await setDoc(
    doc(db, "chats", user.uid),
    {
      messages: limitedMessages.map((m) => ({
        ...m,
        timestamp: m.timestamp.getTime(),
      })),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// 👇 เพิ่มตรงนี้
useEffect(() => {
  if (!user) return;
  if (messages.length > 0) {
    saveChatToFirestore(messages);
  }
}, [messages, user]);

const [exercises, setExercises] = useState<Exercise[]>([]);

const exerciseMap = new Map<string, string>();
exercises.forEach((e) => {
  exerciseMap.set(e.id, e.name);
});

// 👇 โหลดรายชื่อท่าจาก Firestore
useEffect(() => {
  const loadExercises = async () => {
    const snap = await getDocs(collection(db, "exercises"));

    const list: Exercise[] = snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().Title, // 👈 ถ้า Firestore ใช้ name ให้เปลี่ยนตรงนี้
    }));

    setExercises(list);
  };

  loadExercises();
}, []);


//new

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <Bot className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold">FitPro AI Coach</h3>
          <p className="text-sm text-indigo-100">
            Your personalized fitness assistant
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
        <div className="flex gap-2 px-6 py-3 bg-white border-b">
          <button
            onClick={() => setMode("chat")}
            className={`px-4 py-2 rounded-full text-sm ${
              mode === "chat"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            คุยทั่วไป
          </button>

          <button
            onClick={() => setMode("plan")}
            className={`px-4 py-2 rounded-full text-sm ${
              mode === "plan"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            สร้างแผน
          </button>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((m) => (
  <div
    key={m.id}
    className={`flex ${
      m.senderRole === "user" ? "justify-end" : "justify-start"
    }`}
  >
    <div className="flex flex-col items-start max-w-full">
      {/* ===== CHAT BUBBLE ===== */}
      <div
        className={`rounded-2xl px-4 py-3 w-fit ${
          m.senderRole === "user"
            ? "bg-indigo-600 text-white max-w-[95%]"
            : "bg-white shadow-md max-w-[90%]"
        }`}
      >
        {m.senderRole === "bot" && (
          <p className="text-xs text-gray-400 mb-1">{m.senderName}</p>
        )}

        <p className="text-sm whitespace-pre-line break-words leading-relaxed">
          {m.text}
        </p>

        <p className="text-xs mt-2 text-gray-400 text-right">
          {m.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* ===== SAVE PLAN BUTTON ===== */}
      {m.planData && (
        <button
          onClick={() => handleSavePlan(m.planData)}
          className="mt-2 self-start px-3 py-1 bg-green-600 text-white rounded-full text-xs w-fit hover:bg-green-700"
        >
          💾 Save This Plan
        </button>
      )}
    </div>
  </div>
))}



        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t rounded-b-2xl">

        {/* ===== CHAT MODE ===== */}
        {mode === "chat" && (
          <div className="flex gap-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                loading
                  ? "Checking login..."
                  : !user
                  ? "Please login to chat"
                  : "Type your message..."
              }
              disabled={loading || !user}
              className="flex-1 px-4 py-3 border rounded-full focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !user}
              className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ===== PLAN MODE (ยังไม่ต่อ AI) ===== */}
        {mode === "plan" && (
          <PlanForm
            onGenerate={async (data) => {
              if (!user) return;

              const userPlanMsg: Message = {
                id: Date.now().toString(),
                text: "ขอแผนออกกำลังกายส่วนตัว",
                senderRole: "user",
                senderId: user.uid,
                senderName: user.displayName || "User",
                timestamp: new Date(),
              };

              const loadingMsg: Message = {
                id: "loading",
                text: "🤖 กำลังสร้างแผนออกกำลังกาย...",
                senderRole: "bot",
                senderName: "FitPro AI",
                timestamp: new Date(),
                isLoading: true,
              };

              setMessages((prev) => [...prev, userPlanMsg, loadingMsg]);

              try {
                const res = await fetch(PLAN_API, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    age: data.age,
                    weight: data.weight,
                    height: data.height,
                    goal: data.goal,
                  }),
                });

                const result = await res.json();

                // ✅ ตรงนี้แหละที่คุณถามว่า “ใส่ตรงไหน”
                const planText = result.plan.days
                  .map((d: any) =>
                    `${d.day}\n` +
                    d.exercises
                      .map((e: any) => `- ${exerciseMap.get(e.exerciseId) || e.exerciseId}: ${e.sets} x ${e.reps}`)
                      .join("\n")
                  )
                  .join("\n\n");

                // ✅ แสดงผลเป็น bot message
                setMessages((prev) =>
                  prev.filter((m) => !m.isLoading).concat({
                    id: Date.now().toString(),
                    text: planText,
                    senderRole: "bot",
                    senderName: "FitPro AI",
                    timestamp: new Date(),
                    planData: result.plan,   // ⭐ ผูก plan กับข้อความนี้
                  })
                );

                setMode("chat"); // 👈 สำคัญ: กลับไปหน้าแชท
              } catch {
                setMessages((prev) =>
                  prev.filter((m) => !m.isLoading).concat({
                    id: "err",
                    text: "❌ สร้างแผนไม่สำเร็จ ลองใหม่อีกครั้ง",
                    senderRole: "bot",
                    senderName: "FitPro AI",
                    timestamp: new Date(),
                  })
                );
              }


            }}
          />
        )}

      </div>

    </>
  );
}
