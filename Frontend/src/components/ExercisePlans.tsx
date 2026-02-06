import { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, Flame, ChevronRight, Pin, Edit2, Trash2, MoreVertical, List, MessageCircle, Sparkles, Plus, Target } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from './AuthContext';

// Standard interfaces preserved
export interface Exercise { id: string; duration?:string; name: string; sets: number; reps: string; calories: number; description: string; instructions: string[]; tips: string[]; }
export interface ExercisePlan { 
  id: string; 
  name: string; 
  difficulty: string; 
  days: any[]; 
  isPinned?: boolean;
}



export function ExercisePlans({ plans, availableExercises, ...props }: any) {
  const { user } = useContext(AuthContext);
  const [bigPlans, setBigPlans] = useState<ExercisePlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

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

  const createBlankPlan = async () => {
    if (!user) return;
    const newName = prompt("Enter name for your new Big Plan:");
    if (!newName) return;
    const newPlan: ExercisePlan = { id: `plan_${Date.now()}`, name: newName, difficulty: 'Beginner', days: [] };
    await setDoc(doc(db, "userPlans", user.uid), {
      plans: [...bigPlans, newPlan]
    }, { merge: true });
  };

  const handleSetActive = async (id: string) => {
    if (!user) return;
    await setDoc(doc(db, "userPlans", user.uid), { activePlanId: id }, { merge: true });
    setShowMenu(null);
  };

  const handlePinPlan = async (id: string) => {
    if (!user) return;
    const updated = bigPlans.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p);
    await setDoc(doc(db, "userPlans", user.uid), { plans: updated }, { merge: true });
    setShowMenu(null);
  };

  const handleDeletePlan = async (id: string) => {
    if (!user || !confirm("Delete this entire Big Plan?")) return;
    const updated = bigPlans.filter(p => p.id !== id);
    const newActiveId = activePlanId === id ? null : activePlanId;
    await setDoc(doc(db, "userPlans", user.uid), { plans: updated, activePlanId: newActiveId }, { merge: true });
    setShowMenu(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 animate-slide-up">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">My Workout Collections</h2>
          <p className="text-gray-600">Create a container and set it as "Active" to let AI generate your workouts.</p>
        </div>
        <button onClick={createBlankPlan} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          <Plus className="w-5 h-5" /> New Big Plan
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bigPlans.map((plan) => {
          const isActive = activePlanId === plan.id;
          const isPinned = plan.isPinned;
          
          return (
            <div key={plan.id} 
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                isActive ? 'border-blue-500 ring-4 ring-blue-50' : isPinned ? 'border-yellow-400' : 'border-gray-100'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {isActive && <span className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 mt-1"><Target className="w-3 h-3"/> Active for AI</span>}
                  </div>
                  <button onClick={() => setShowMenu(plan.id)} className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-5 h-5 text-gray-500"/></button>
                </div>

                <div className="space-y-3">
                   <p className="text-sm text-gray-500">{plan.days.length > 0 ? `${plan.days.length} Days of workouts` : "Empty Plan - Set Active to fill with AI"}</p>
                   <button onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)} className="w-full py-2 bg-gray-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                     {expandedPlan === plan.id ? "Hide Details" : "View Exercises"}
                   </button>
                </div>

                {expandedPlan === plan.id && plan.days.map((day, dIdx) => (
                  <div key={dIdx} className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <p className="font-bold text-indigo-900 text-sm mb-2">{day.day}</p>
                    {day.exercises.map((ex: any, eIdx: number) => (
                      <div key={eIdx} className="text-xs text-gray-600 flex justify-between border-b border-indigo-100 py-1 last:border-0">
                        <span>{ex.name}</span>
                        <span className="font-medium">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Options Menu Modal logic preserved here... */}
              {showMenu === plan.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowMenu(null)}>
                  <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                    <h4 className="font-bold mb-4">Plan Options</h4>
                    <div className="space-y-2">
                      <button onClick={() => handleSetActive(plan.id)} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl text-blue-700 font-medium">
                        <Target className="w-5 h-5"/> Set as Active (Target AI)
                      </button>
                      <button onClick={() => handlePinPlan(plan.id)} className="w-full flex items-center gap-3 p-3 hover:bg-yellow-50 rounded-xl text-yellow-700 font-medium">
                        <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`}/> {isPinned ? 'Unpin' : 'Pin'} Plan
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl text-red-600 font-medium">
                        <Trash2 className="w-5 h-5"/> Delete Container
                      </button>
                    </div>
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