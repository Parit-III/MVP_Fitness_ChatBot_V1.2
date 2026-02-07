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

export interface Exercise {
  id: string;
  duration?: string;
  name: string;
  sets: number;
  reps: string;
  calories: number;
  description: string;
  instructions: string[];
  tips: string[];
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
}: {
  availableExercises?: Exercise[];
  onStartExercise?: (exercise: Exercise, planName: string) => void;
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
          New Big Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bigPlans.map((plan) => {
          const isActive = activePlanId === plan.id;
          const isPinned = plan.isPinned;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all
                ${
                  isActive
                    ? "border-blue-500 ring-4 ring-blue-50"
                    : isPinned
                    ? "border-yellow-400"
                    : "border-gray-100"
                }`}
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

                  <button
                    onClick={() => setShowMenu(plan.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-500 mb-3">
                  {plan.days.length > 0
                    ? `${plan.days.length} Days of workouts`
                    : "Empty Plan - Set Active to fill with AI"}
                </p>

                <button
                  onClick={() =>
                    setExpandedPlan(
                      expandedPlan === plan.id ? null : plan.id
                    )
                  }
                  className="w-full py-2 bg-gray-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
                >
                  {expandedPlan === plan.id
                    ? "Hide Details"
                    : "View Exercises"}
                </button>

                {/* Expanded */}
                {expandedPlan === plan.id &&
                  plan.days.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="mt-4 p-3 bg-indigo-50 rounded-xl border"
                    >
                      <p className="font-bold text-sm mb-2">{day.day}</p>
                      {day.exercises.map((ex: any, eIdx: number) => (
                        <div
                          key={eIdx}
                          className="text-xs flex justify-between border-b py-1 last:border-0"
                        >
                          <span>{ex.name}</span>
                          <span className="font-medium">
                            {ex.sets}x{ex.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>

              {/* Menu */}
              {showMenu === plan.id && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                  onClick={() => setShowMenu(null)}
                >
                  <div
                    className="bg-white rounded-2xl p-6 w-full max-w-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleSetActive(plan.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg text-blue-700"
                    >
                      <Target className="w-5 h-5" />
                      Set as Active
                    </button>

                    <button
                      onClick={() => handlePinPlan(plan.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-yellow-50 rounded-lg text-yellow-700"
                    >
                      <Pin className="w-5 h-5" />
                      {isPinned ? "Unpin" : "Pin"}
                    </button>

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
