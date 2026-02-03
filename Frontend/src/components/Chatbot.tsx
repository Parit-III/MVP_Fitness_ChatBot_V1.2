import { useState, useRef, useEffect, useContext } from "react";
import { Send, Bot } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";


interface Message {
  id: string;
  text: string;
  senderRole: "user" | "bot";   // ใช้จัด UI
  senderId?: string;            // uid
  senderName?: string;          // ชื่อที่เอาไว้ดูใน Firebase
  timestamp: Date;
}


interface ChatbotProps {
  userName: string;
}

const API_URL = `${import.meta.env.VITE_API_URL}/api/ai/chat`;

export function Chatbot({ userName }: ChatbotProps) {
  const { user, loading } = useContext(AuthContext);//new
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ ต้องอยู่ใน component
  const sendToBackend = async (allMessages: Message[]) => {
    const formatted = [
      {
        role: "system",
        content:
          "You are FitPro AI Coach. Remember user goals and never repeat onboarding questions.",
      },
      ...allMessages.map((m) => ({
        role: m.senderRole === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: formatted }),
    });

    const data = await res.json();
    return data.reply;
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

  setInputText("");

  try {
    const reply = await sendToBackend([...messages, userMsg]);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: reply,
      senderRole: "bot",
      senderId: "bot",
      senderName: "FitPro AI",
      timestamp: new Date(),
    };


    const newMessages = [...messages, userMsg, botMsg];
    setMessages(newMessages);
    await saveChatToFirestore(newMessages);
  } catch {
    setMessages((prev) => [
      ...prev,
      {
        id: "err",
        text: "⚠️ Server error. Please try again.",
        senderRole: "bot",
        senderId: "bot",
        senderName: "FitPro AI",
        timestamp: new Date(),
      },
    ]);
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.senderRole === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                m.senderRole === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white shadow-md"
              }`}
            >

              {m.senderRole === "bot" && (
                <p className="text-xs text-gray-400 mb-1">{m.senderName}</p>
              )}

              <p className="text-sm whitespace-pre-line">{m.text}</p>
              <p className="text-xs mt-2 text-gray-400">
                {m.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t rounded-b-2xl">
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
            disabled={loading || !user}   // 👈 ใส่ตรงนี้
            className="flex-1 px-4 py-3 border rounded-full focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
             disabled={loading || !user}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
