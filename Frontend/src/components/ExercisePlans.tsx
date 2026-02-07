import { useState, useEffect, useContext } from "react";
import { Pin, Trash2, MoreVertical, Plus, Target } from "lucide-react";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { AuthContext } from "./AuthContext";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
}

export interface ExercisePlan {
  id: string;
  name: string;
  difficulty: string;
  days: any[];
  isPinned?: boolean;
}

export function ExercisePlans() {
  const { user } = useContext(AuthContext);

  const [plans, setPlans] = useState<ExercisePlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ExercisePlan | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "userPlans", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPlans(data.plans || []);
        setActivePlanId(data.activePlanId || null);
      }
    });
    return () => unsub();
  }, [user]);

  const createBlankPlan = async () => {
    if (!user) return;
    const name = prompt("Enter name for your new plan:");
    if (!name) return;
    const newPlan: ExercisePlan = {
      id: `plan_${Date.now()}`,
      name,
      difficulty: "Beginner",
      days: [],
    };
    await setDoc(
      doc(db, "userPlans", user.uid),
      { plans: [...plans, newPlan] },
      { merge: true }
    );
  };

  const setActive = async (id: string) => {
    if (!user) return;
    await setDoc(
      doc(db, "userPlans", user.uid),
      { activePlanId: id },
      { merge: true }
    );
    setShowMenu(null);
  };

  const togglePin = async (id: string) => {
    if (!user) return;
    const updated = plans.map((p) =>
      p.id === id ? { ...p, isPinned: !p.isPinned } : p
    );
    await setDoc(
      doc(db, "userPlans", user.uid),
      { plans: updated },
      { merge: true }
    );
    setShowMenu(null);
  };

  const deletePlan = async (id: string) => {
    if (!user || !confirm("Delete this plan?")) return;
    const updated = plans.filter((p) => p.id !== id);
    await setDoc(
      doc(db, "userPlans", user.uid),
      { plans: updated, activePlanId: activePlanId === id ? null : activePlanId },
      { merge: true }
    );
    setShowMenu(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Workout Collections
          </h2>
          <p className="text-gray-600 mt-1">
            Select a plan and let AI help you build workouts.
          </p>
        </div>
        <button
          onClick={createBlankPlan}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" /> New Plan
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isActive = activePlanId === plan.id;
          const isPinned = plan.isPinned;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg border-2 ${
                isActive
                  ? "border-blue-500 ring-4 ring-blue-50"
                  : isPinned
                  ? "border-yellow-400"
                  : "border-gray-100"
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {isActive && (
                      <div className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-1">
                        <Target className="w-3 h-3" /> Active for AI
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

                <p className="text-sm text-gray-500 mb-3">
                  {plan.days.length > 0
                    ? `${plan.days.length} workout days`
                    : "Empty plan"}
                </p>

                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="w-full py-2 bg-gray-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
                >
                  View Exercises
                </button>
              </div>

              {showMenu === plan.id && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                  onClick={() => setShowMenu(null)}
                >
                  <div
                    className="bg-white rounded-xl p-6 w-full max-w-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setActive(plan.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg text-blue-700"
                    >
                      <Target className="w-5 h-5" /> Set Active
                    </button>
                    <button
                      onClick={() => togglePin(plan.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-yellow-50 rounded-lg text-yellow-700"
                    >
                      <Pin className="w-5 h-5" />{" "}
                      {isPinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-5 h-5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== POPUP VIEW EXERCISES ===== */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-indigo-700">
                {selectedPlan.name}
              </h3>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>

            {selectedPlan.days.length === 0 ? (
              <p className="text-gray-500 text-sm">
                This plan has no exercises yet.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedPlan.days.map((day: any, dIdx: number) => (
                  <div
                    key={dIdx}
                    className="border rounded-xl p-4 bg-indigo-50"
                  >
                    <p className="font-bold text-indigo-800 mb-2">
                      {day.day}
                    </p>
                    {day.exercises.map((ex: any, eIdx: number) => (
                      <div
                        key={eIdx}
                        className="flex justify-between text-sm border-b last:border-0 py-1"
                      >
                        <span>{ex.name}</span>
                        <span className="font-medium">
                          {ex.sets} x {ex.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
