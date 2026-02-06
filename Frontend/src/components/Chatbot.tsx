import { useState, useRef, useEffect, useContext } from "react";
import { Send, Bot } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface Message {
  id: string;
  text: string;
  senderRole: "user" | "bot";
  senderId?: string;
  senderName?: string;
  timestamp: Date;
}

interface ChatbotProps {
  userName: string;
}

const CHAT_API_URL = `${import.meta.env.VITE_API_URL}/api/ai/chat`;
const PLAN_GEN_URL = `${import.meta.env.VITE_API_URL}/api/ai/plan`;
const PLAN_UPDATE_URL = `${import.meta.env.VITE_API_URL}/api/ai/update-plan`;

export function Chatbot({ userName }: ChatbotProps) {
  // const [isThinking, setIsThinking] = useState(false);// ai กำลังคิด

  const { user, loading } = useContext(AuthContext);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [toggled, setToggled] = useState(true);

  const [activePlan, setActivePlan] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [planStep, setPlanStep] = useState(0);
  const [formData, setFormData] = useState({ age: "", weight: "", height: "", goal: "", injury: "", time: "" });

  const questions = [
    "What is your age?",
    "What is your weight (kg)?",
    "What is your height (cm)?",
    "What is your fitness goal (e.g., lose weight, build muscle)?",
    "Do you have any injuries? (Type 'none' if not)",
    "How many minutes per day can you exercise?"
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const loadChat = async () => {
      const snap = await getDoc(doc(db, "chats", user.uid));
      if (snap.exists() && snap.data().messages) {
        setMessages(snap.data().messages.map((m: any) => ({
          ...m, timestamp: new Date(m.timestamp)
        })));
      } else {
        addBotMessage(`Hi ${userName}! 👋 I'm your AI fitness assistant.`);
      }
    };
    loadChat();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "userPlans", user.uid), async (docSnap) => {
      const data = docSnap.data();
      if (!docSnap.exists() || !data?.plans || data.plans.length === 0) {
        const firstPlan = { id: `plan_${Date.now()}`, name: "MyPlan", difficulty: 'Beginner', days: [] };
        await setDoc(doc(db, "userPlans", user.uid), {
          plans: [firstPlan],
          activePlanId: firstPlan.id
        }, { merge: true });
        return;
      }
      setAllPlans(data.plans || []);
      const active = data.plans.find((p: any) => p.id === data.activePlanId);
      setActivePlan(active || null);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    let modeText = "";
    if (toggled) {
      modeText = "Switched to Chat Mode.";
    } else {
      if (!activePlan) {
        modeText = "⚠️ Set an active plan first.";
      } else if (activePlan.days && activePlan.days.length > 0) {
        modeText = `Plan Mode: Updating "${activePlan.name}".`;
      } else {
        modeText = `Plan Mode: Filling "${activePlan.name}". ${questions[0]}`;
      }
    }
    addBotMessage(modeText);
  }, [toggled]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      text,
      senderRole: "bot",
      senderId: "bot",
      senderName: "FitPro AI",
      timestamp: new Date(),
    }]);
  };

  const saveChatHistory = async (msgs: Message[]) => {
    if (!user) return;
    await setDoc(doc(db, "chats", user.uid), {
      messages: msgs.map(m => ({ ...m, timestamp: m.timestamp.getTime() })),
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleSendMessage = async () => {
    if (loading || !user || !inputText.trim()) return;
    const currentInput = inputText;
    const userMsg: Message = { id: Date.now().toString(), text: currentInput, senderRole: "user", senderId: user.uid, senderName: user.displayName || "User", timestamp: new Date() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputText("");
    saveChatHistory(newMsgs);

    // setIsThinking(true);// ai กำลังคิด
    try {
      if (toggled) {
        const res = await fetch(CHAT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.senderRole === "user" ? "user" : "assistant", content: m.text }))})
        });
        const data = await res.json();
        const updated = [...newMsgs, { id: Date.now().toString(), text: data.reply, senderRole: "bot", senderName: "FitPro AI", timestamp: new Date() } as Message];
        setMessages(updated);
        saveChatHistory(updated);
        // setIsThinking(false); //ai 👈 หยุดคิด
      } else if (activePlan) {
        if (activePlan.days.length === 0) {
          const fieldNames = ["age", "weight", "height", "goal", "injury", "time"];
          const updatedFormData = { ...formData, [fieldNames[planStep]]: currentInput };
          setFormData(updatedFormData);
          if (planStep < questions.length - 1) {
            addBotMessage(questions[planStep + 1]);
            setPlanStep(planStep + 1);
          } else {
            addBotMessage("Calculating... 🏋️‍♂️");
            const res = await fetch(PLAN_GEN_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedFormData) });
            const result = await res.json();
            const updated = allPlans.map(p => p.id === activePlan.id ? { ...p, days: result.plan.days } : p);
            await setDoc(doc(db, "userPlans", user.uid), { plans: updated }, { merge: true });
            addBotMessage(`"${activePlan.name}" is ready.`);
            setPlanStep(0);
          }
        } else {
          addBotMessage("Updating... 🔄");
          const res = await fetch(PLAN_UPDATE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPlan: { days: activePlan.days }, instruction: currentInput }) });
          const result = await res.json();
          const updated = allPlans.map(p => p.id === activePlan.id ? { ...p, days: result.plan.days } : p);
          await setDoc(doc(db, "userPlans", user.uid), { plans: updated }, { merge: true });
          addBotMessage("Updated!");
        }
      }
    } catch (err) { addBotMessage("Error occurred."); }
  };

  return (
    // Added h-[700px] and flex-col to keep it contained
    <div className="flex flex-col h-[700px] bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center gap-3 shrink-0">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <Bot className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold">FitPro AI Coach</h3>
          <p className="text-sm text-indigo-100">Your personalized fitness assistant</p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <p className="text-xs mb-1">{toggled ? "Chat Mode" : "Plan Mode"}</p>
          <div style={{ width: 80, height: 40, backgroundColor: "white", borderRadius: 20, padding: 5 }}>
            <button style={{ width: "100%", height: "100%", background: "transparent", border: "none", cursor: "pointer" }}
              onClick={() => setToggled((p) => !p)}>
              <div style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: toggled ? "#4f46e5" : "#9333ea", 
                transform: toggled ? "translateX(40px)" : "translateX(0px)", transition: "transform 0.25s ease" }} />
            </button>
          </div>
        </div>
      </div>

      {/* This area is now flex-1 and overflow-y-auto to allow scrolling inside the fixed box */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${toggled ? "bg-gray-50" : "bg-indigo-50"}`}>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderRole === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.senderRole === "user" ? (toggled ? "bg-indigo-600" : "bg-blue-600") + " text-white" : "bg-white shadow-md"}`}>
              {m.senderRole === "bot" && <p className="text-xs text-gray-400 mb-1">{m.senderName}</p>}
              <p className="text-sm whitespace-pre-line">{m.text}</p>
              <p className="text-[10px] mt-2 opacity-50">
                {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <div className="flex gap-2">
          <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={toggled ? "Ask me anything..." : "Update your plan..."}
            className="flex-1 px-4 py-3 border rounded-full focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handleSendMessage} className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}