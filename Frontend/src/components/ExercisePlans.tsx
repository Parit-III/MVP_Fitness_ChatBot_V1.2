import { useState, useEffect, useContext } from "react";
import {
  Pin,
  Trash2,
  MoreVertical,
  Plus,
  Target,
} from "lucide-react";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { AuthContext } from "./AuthContext";

/* =======================
   Interfaces
======================= */

// ExercisePlans.tsx
export interface Exercise {
  id: string;
  Title: string;      // Changed from 'name'
  Desc: string;       // Changed from 'description'
  Type: string;       // New field
  BodyPart: string;   // New field
  Equipment: string;  // New field
  Level: string;      // New field
  sets: number;
  reps: string;
  calories: number;
  instructions: string[];
  tips: string[];
  duration?: string;
  // ✅ เพิ่มฟิลด์รองรับชื่อที่อาจจะมาจาก Backend
  name?: string; 
  bodyPart?: string;
  equipment?: string;
  desc?: string;
  videoURL: string;
}

export interface ExercisePlan {
  id: string;
  name: string;
  difficulty: string;
  days: any[];
  isPinned?: boolean;
}

/* =======================
   Component
======================= */

export function ExercisePlans({
  availableExercises,
  onStartExercise,
  onViewDetail,
}: {
  availableExercises?: Exercise[];
  onStartExercise?: (exercise: Exercise, planName: string) => void;
  onViewDetail?: (planId: string) => void;
}) {
  const { user } = useContext(AuthContext);

  const [bigPlans, setBigPlans] = useState<ExercisePlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  /* =======================
     Firestore listener
  ======================= */

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "userPlans", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBigPlans(data.plans || []);
        setActivePlanId(data.activePlanId || null);
      }
    });

    return () => unsub();
  }, [user]);

  /* =======================
     Actions
  ======================= */

  const createBlankPlan = async () => {
    if (!user) return;

    const newName = prompt("Enter name for your new Big Plan:");
    if (!newName) return;

    const newPlan: ExercisePlan = {
      id: `plan_${Date.now()}`,
      name: newName,
      difficulty: "Beginner",
      days: [],
    };

    await setDoc(
      doc(db, "userPlans", user.uid),
      { plans: [...bigPlans, newPlan] },
      { merge: true }
    );
  };

  const handleSetActive = async (id: string) => {
    if (!user) return;

    await setDoc(
      doc(db, "userPlans", user.uid),
      { activePlanId: id },
      { merge: true }
    );
    setShowMenu(null);
  };

  const handlePinPlan = async (id: string) => {
    if (!user) return;

    const updated = bigPlans.map((p) =>
      p.id === id ? { ...p, isPinned: !p.isPinned } : p
    );

    await setDoc(
      doc(db, "userPlans", user.uid),
      { plans: updated },
      { merge: true }
    );
    setShowMenu(null);
  };

  const handleDeletePlan = async (id: string) => {
    if (!user || !confirm("Delete this entire Big Plan?")) return;

    const updated = bigPlans.filter((p) => p.id !== id);
    const newActiveId = activePlanId === id ? null : activePlanId;

    await setDoc(
      doc(db, "userPlans", user.uid),
      { plans: updated, activePlanId: newActiveId },
      { merge: true }
    );
    setShowMenu(null);
  };

  const sortPlans = (plans: ExercisePlan[]) => {
    return [...plans].sort((a, b) => {
      // 1️⃣ เช็คสถานะ Active: ใคร Active ให้ขึ้นก่อน (ซ้ายสุด)
      const aActive = a.id === activePlanId;
      const bActive = b.id === activePlanId;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // 2️⃣ เช็คสถานะ Pin: ใคร Pin ให้มาอยู่ทางซ้าย (ต่อจากอันที่ Active)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 3️⃣ ถ้าสถานะเหมือนกัน ให้เรียงตามลำดับเดิม
      return 0; 
    });
  };

  /* =======================
     Render
  ======================= */

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Workout Collections
          </h2>
          <p className="text-gray-600">
            Create a container and set it as Active to let AI generate workouts
          </p>
        </div>

        <button
          onClick={createBlankPlan}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortPlans(bigPlans).map((plan) => {
          const isActive = activePlanId === plan.id;
          const isPinned = plan.isPinned;

          let borderColor = "";
          if (isActive) {
            borderColor = "#3b82f6";
          } else if (isPinned) {
            borderColor = "#facc15";
          }

          // console.log(`${plan.name} Border is seted as ${borderColor}`)

          return (
            <div
              key={plan.id}
              // Keep your Tailwind classes for layout/rings
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all ${
                isActive ? "ring-4 ring-blue-100 z-10" : ""
              }`}
              // FORCE the border color using inline style to beat the "*" selector
              style={borderColor ? { borderColor: borderColor } : {}}
            >
              <div className="p-6">
                {/* Title */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {isActive && (
                      <div className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-1">
                        <Target className="w-3 h-3" />
                        Active for AI
                      </div>
                    )}
                  </div>

  <div className="relative">
  <button
    onClick={() => setShowMenu(showMenu === plan.id ? null : plan.id)}
    className="p-2 hover:bg-gray-100 rounded-lg"
  >
    <MoreVertical className="w-5 h-5 text-gray-500" />
  </button>

  {showMenu === plan.id && (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowMenu(null)}
      />

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-0.5 z-50">
        <div className="bg-white rounded-xl shadow-xl w-56 p-2 border border-gray-100 flex flex-col">
          <button
            onClick={() => handleSetActive(plan.id)}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-blue-700 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Active</span>
          </button>

          <button
            onClick={() => handlePinPlan(plan.id)}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-yellow-700 transition-colors"
          >
            <Pin className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isPinned ? "Unpin" : "Pin"}
            </span>
          </button>

          <button
            onClick={() => handleDeletePlan(plan.id)}
            className="w-full flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>
      </div>
    </>
  )}
</div>

                </div>

                {/* Content */}
                <p className="text-sm text-gray-500 mb-3">
                  {plan.days.length > 0
                    ? `${plan.days.length} Days of workouts`
                    : "Empty Plan - Set Active to fill with AI"}
                </p>
                <button
                  onClick={() => onViewDetail?.(plan.id)}
                  className="
                    px-4 py-2 
                    bg-indigo-50 
                    text-indigo-700 
                    rounded-lg 
                    font-medium 
                    shadow-md
                    hover:bg-indigo-100 
                    hover:shadow-lg
                    active:shadow-sm
                    active:translate-y-0.5
                    transition
                  "
                >
                  View Detail
                </button>

                {/* Expanded */}
                {expandedPlan === plan.id &&
                  plan.days.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="mt-4 p-3 bg-indigo-50 rounded-xl border"
                    >
                      <p className="font-bold text-sm mb-2">{day.day}</p>
                      {/* {day.exercises.map((ex: any, eIdx: number) => (
                        <div
                          key={eIdx}
                          className="text-xs flex justify-between border-b py-1 last:border-0"
                        >
                          <span>{ex.name}</span>
                          <span className="font-medium">
                            {ex.sets}x{ex.reps}
                          </span>
                        </div>
                      ))} */}
                      {day.exercises.map((ex: any, eIdx: number) => {
                        return (
                          <div 
                            key={eIdx}
                            onClick={() => onStartExercise?.(ex, plan.name)} 
                            className="text-xs flex justify-between border-b py-2 last:border-0 cursor-pointer hover:bg-indigo-100 px-1 rounded transition-colors"
                          >
                            {/* ใช้ ex.Title หรือ ex.name ตามที่ Backend ส่งมา */}
                            <div className="flex flex-col">
                              <span className="font-bold">{ex.Title || ex.name}</span>
                              <span className="text-[10px] text-gray-500">{ex.BodyPart || ex.bodyPart}</span>
                            </div>
                            <span className="font-medium text-indigo-600">
                              {ex.sets}x{ex.reps}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
              </div>

              {/* Menu */}
              {/* Menu */}
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
