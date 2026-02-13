import { useState, useRef, useEffect, useContext } from "react";
import { Send, Bot } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Exercise } from './ExercisePlans';

interface Message {
  id: string;
  text: string;
  senderRole: "user" | "bot" | "system";
  senderId?: string;
  senderName?: string;
  timestamp: Date;
}

interface ChatbotProps {
  userName: string;
  availableExercises: Exercise[]; 
}

const CHAT_API_URL = `${import.meta.env.VITE_API_URL}/api/ai/chat`;
const PLAN_GEN_URL = `${import.meta.env.VITE_API_URL}/api/ai/plan`;
const PLAN_UPDATE_URL = `${import.meta.env.VITE_API_URL}/api/ai/update-plan`;

export function Chatbot({ userName, availableExercises }: ChatbotProps) {
  // const [isThinking, setIsThinking] = useState(false);// ai กำลังคิด

  const { user, loading } = useContext(AuthContext);

  const [chatMessages, setChatMessages] = useState<Message[]>([]); // new
  const [planMessages, setPlanMessages] = useState<Message[]>([]); // new
  const [inputText, setInputText] = useState("");
  const [toggled, setToggled] = useState(true);
  const currentMessages = toggled ? chatMessages : planMessages; // new
  const setCurrentMessages = toggled ? setChatMessages : setPlanMessages; // new
  const [activePlan, setActivePlan] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [planStep, setPlanStep] = useState(0);
  const [formData, setFormData] = useState({ age: "", weight: "", height: "", goal: "", injury: "", time: "", pref:""});

  const questions = [
    "What is your age?",
    "What is your weight (kg)?",
    "What is your height (cm)?",
    "What is your fitness goal (e.g., lose weight, build muscle)?",
    "Do you have any injuries? (Type 'none' if not)",
    "How many minutes per day can you exercise?",
    "Additional Preference?"
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [currentMessages]); // new

  useEffect(() => {
  if (!user) return;

  const loadChat = async () => {
    const snap = await getDoc(doc(db, "chats", user.uid));

    if (snap.exists()) {
      const data = snap.data();

      if (data.chatMessages) {
        setChatMessages(
          data.chatMessages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      }

      if (data.planMessages) {
        setPlanMessages(
          data.planMessages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      }
    } else {
      // ยังไม่เคยมี chat → ใส่ welcome เฉพาะ Chat Mode
      setChatMessages([
        {
          id: crypto.randomUUID(),
          text: `Hi ${userName}! 👋 I'm your AI fitness assistant.`,
          senderRole: "bot",
          senderName: "FitPro AI",
          timestamp: new Date(),
        },
      ]);
    }
  };

  loadChat();
}, [user]); // new

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "userPlans", user.uid), async (docSnap) => {
      const data = docSnap.data();
      if (!docSnap.exists() || !data?.plans || data.plans.length === 0) {
        const firstPlan = { id: crypto.randomUUID(), name: "MyPlan", difficulty: 'Beginner', days: [] };
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
    addSystemMessage(modeText);
  }, [toggled]);

  const addBotMessage = (text: string) => {
  setCurrentMessages(prev => {
    const updated = [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        senderRole: "bot" as const,
        senderId: "bot",
        senderName: "FitPro AI",
        timestamp: new Date(),
      },
    ];

    // ✅ save เฉพาะ bot / user เท่านั้น
    saveChatHistory(
      toggled ? updated : chatMessages,
      toggled ? planMessages : updated
    );

    return updated;
  });
};


  const addSystemMessage = (text: string) => {
  setCurrentMessages(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      text,
      senderRole: "system",
      senderId: "system",
      senderName: "System",
      timestamp: new Date(),
    }
  ]);
};

  
  const saveChatHistory = async (
  chatMsgs: Message[],
  planMsgs: Message[]
) => {
  if (!user) return;

  await setDoc(doc(db, "chats", user.uid), {
    chatMessages: chatMsgs.map(m => ({ ...m, timestamp: m.timestamp.getTime() })),
    planMessages: planMsgs.map(m => ({ ...m, timestamp: m.timestamp.getTime() })),
    updatedAt: serverTimestamp()
  }, { merge: true });
}; // new
  const handleSendMessage = async () => {
  if (loading || !user || !inputText.trim()) return;
  
  const currentInput = inputText.trim();
  
  // --- 1. VALIDATION LOGIC FOR PLAN MODE ---
  if (!toggled && activePlan && activePlan.days.length === 0) {
    let isValid = true;
    let errorMsg = "";

    switch (planStep) {
      case 0: // Age
        const age = parseInt(currentInput);
        if (isNaN(age) || age < 10 || age > 100) {
          isValid = false;
          errorMsg = "Please enter a valid age (10-100).";
        }
        break;
      case 1: // Weight
      case 2: // Height
        const val = parseFloat(currentInput);
        if (isNaN(val) || val <= 0) {
          isValid = false;
          errorMsg = "Please enter a valid positive number.";
        }
        break;
      case 3: // Goal
      case 6: // Preference
        if (currentInput.length < 3) {
          isValid = false;
          errorMsg = "Please be a bit more descriptive.";
        }
        break;
      case 5: // Time
        const mins = parseInt(currentInput);
        if (isNaN(mins) || mins < 5 || mins > 300) {
          isValid = false;
          errorMsg = "Please enter minutes between 5 and 300.";
        }
        break;
    }

    if (!isValid) {
      addBotMessage(`⚠️ ${errorMsg}`);
      return; // Stop execution here
    }
  }

  // --- 2. PREPARE MESSAGES ---
  const userMsg: Message = { 
    id: crypto.randomUUID(), 
    text: currentInput, 
    senderRole: "user", 
    senderId: user.uid, 
    senderName: user.displayName || "User", 
    timestamp: new Date() 
  };

  const newMsgs = [...currentMessages, userMsg];
  setCurrentMessages(newMsgs);
  setInputText("");
  
  // Save to Firebase immediately
  saveChatHistory(
    toggled ? newMsgs : chatMessages,
    toggled ? planMessages : newMsgs
  );

  try {
    const hydratePlan = (planData: any) => {
      return planData.days.map((day: any) => ({
        ...day,
        exercises: day.exercises.map((planEx: any) => {
          // Find matching exercise in the library passed via props
          const fullDetail = availableExercises.find(
            (libEx) => (libEx.Title || "").toLowerCase() === planEx.name.toLowerCase()
          );

          if (fullDetail) {
            // Return full library data but keep the AI-generated sets/reps
            return {
              ...fullDetail,
              sets: planEx.sets || 3,
              reps: planEx.reps || "12",
            };
          }
          // If not in library, keep the AI version (prevents data loss)
          return {
            ...planEx,
            Title: planEx.name, // Ensure it has a Title field for your UI
            id: planEx.id || Math.random().toString(36).substr(2, 9)
          };
        })
      }));
    };

    if (toggled) {
  // Logic for generating a NEW plan
        const res = await fetch(PLAN_GEN_URL, { /* your existing fetch config */ });
        const result = await res.json();

        if (result.plan) {
          // HYDRATE the plan before saving
          const hydratedDays = hydratePlan(result.plan);
          
          const newPlan = {
            ...result.plan,
            days: hydratedDays,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
          };

          // Save full data to Firestore
          await setDoc(doc(db, "userPlans", user.uid), { 
            plans: [...allPlans, newPlan] 
          }, { merge: true });
        }
      } else {
        // Logic for UPDATING the active plan
        const res = await fetch(PLAN_UPDATE_URL, { /* your existing fetch config */ });
        const result = await res.json();

        if (result.plan && activePlan) {
          // HYDRATE the updated plan before saving
          const hydratedDays = hydratePlan(result.plan);

          const updatedPlans = allPlans.map(p => 
            p.id === activePlan.id ? { ...p, days: hydratedDays } : p
          );

          // Save updated full data to Firestore
          await setDoc(doc(db, "userPlans", user.uid), { 
            plans: updatedPlans 
          }, { merge: true });
        }
      }
  } catch (err) { 
    addBotMessage("I'm sorry, I'm having trouble connecting to the server. Please try again."); 
  }
};

  return (
    // Added h-[700px] and flex-col to keep it contained
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl shadow-xl overflow-hidden">
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
        {currentMessages.map((m) => (
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
