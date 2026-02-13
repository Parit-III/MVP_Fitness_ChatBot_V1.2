// --- PlanDetail.tsx ---
import { useEffect, useState, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "./AuthContext";
import { ChevronLeft } from "lucide-react";
import { ExercisePlan, Exercise } from "./ExercisePlans";
import { ExerciseDetail } from "./ExerciseDetail";

// ✅ 1. กำหนด Interface สำหรับ Props ให้ถูกต้อง
interface PlanDetailProps {
  planId: string;
  onBack: () => void;
}

// ✅ 2. รับ Props เข้ามาใช้งาน
export function PlanDetail({ planId, onBack }: PlanDetailProps) {
  const { user } = useContext(AuthContext);
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (!user || !planId) return;
    
    // ✅ ดึงข้อมูลจาก Firestore แบบ Real-time
    const unsub = onSnapshot(doc(db, "userPlans", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const allPlans: ExercisePlan[] = data.plans || [];
        const foundPlan = allPlans.find((p) => p.id === planId);
        setPlan(foundPlan || null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user, planId]);

  // ✅ 3. ปรับฟังก์ชันการเลือกท่า (ใช้ Snapshot Data)
  const handleSelectExercise = (exFromPlan: any) => {
    const exerciseWithData = {
      ...exFromPlan,
      // Mapping ชื่อฟิลด์ให้ตรงกับ ExerciseDetail
      Title: exFromPlan.Title || exFromPlan.name || "Unknown Exercise",
      Desc: exFromPlan.Desc || exFromPlan.desc || "No description available",
      BodyPart: exFromPlan.BodyPart || exFromPlan.bodyPart || "N/A",
      // เผื่อค่าเริ่มต้นสำหรับฟิลด์ที่จำเป็นใน UI
      instructions: exFromPlan.instructions || [],
      tips: exFromPlan.tips || [],
      sets: exFromPlan.sets || 3,
      reps: exFromPlan.reps || "8-12",
      calories: exFromPlan.calories || 0,
    } as Exercise;

    setSelectedExercise(exerciseWithData);
  };

  if (loading) return <div className="p-8 text-center text-indigo-600 font-bold">Loading Plan Details...</div>;
  if (!plan) return <div className="p-8 text-center">Plan not found</div>;

  // ✅ 4. แสดงหน้าออกกำลังกาย (ExerciseDetail) เมื่อเลือกท่า
  if (selectedExercise) {
    return (
      <div className="p-4">
        <ExerciseDetail 
          exercise={selectedExercise} 
          planName={plan.name} 
          userId={user?.uid || ""}
          onBack={() => setSelectedExercise(null)}
          onComplete={() => setSelectedExercise(null)} // เมื่อเสร็จให้กลับมาหน้ารายการแผน
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-4 z-10 shadow-sm">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{plan.name}</h1>
          <p className="text-xs text-gray-500">{plan.difficulty} Plan</p>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {plan.days.map((day, dIdx) => (
            <div key={dIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-indigo-600 px-4 py-3">
                <h3 className="font-bold text-white">{day.day}</h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {day.exercises.map((ex: any, eIdx: number) => (
                  <div 
                    key={eIdx}
                    onClick={() => handleSelectExercise(ex)} 
                    className="flex justify-between items-center p-4 hover:bg-indigo-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {ex.Title || ex.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Focus: {ex.BodyPart || ex.bodyPart || "General"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-indigo-600 font-extrabold">{ex.sets} × {ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}