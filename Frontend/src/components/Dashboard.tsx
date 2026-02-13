import { useEffect, useState } from "react";
import { MessageCircle, Dumbbell, LogOut, X, List, User, BookOpen } from 'lucide-react';
import { ExercisePlans } from './ExercisePlans';
import { Chatbot } from './Chatbot';
import { ProfilePage } from './ProfilePage';
import { Exercise } from './ExercisePlans';
import { getExercises } from "../services/exerciseService";
import { WorkoutLibrary } from "./WorkoutLibrary";
import { ExerciseDetail } from "./ExerciseDetail";
import { doc, collection, query, setDoc, serverTimestamp, onSnapshot, limit } from "firebase/firestore";
import { db } from "../firebase";

interface DashboardProps {
  user: { name: string; email: string; uid: string};
  onLogout: () => void;
}

interface WorkoutStreak {
  date: string;
  completed: boolean;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");

  const [view, setView] = useState<'chat' | 'plans' | 'profile' | 'workouts' | 'exercise'>('chat');

const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutStreak[]>([]);

  // Exercise library
const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
// Dashboard.tsx

useEffect(() => {
  // 1. Reference the collection
  const q = query(collection(db, "exercises"), limit(20));
  
  // 2. Use onSnapshot for real-time updates
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const exercises = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // IMPORTANT: Apply the same mapping here as you did in your service
      return {
        id: doc.id,
        Title: data.Title || data.title || "Unknown Exercise",
        Desc: data.Desc || data.description || "",
        Type: data.Type || "Strength",
        BodyPart: data.BodyPart || "N/A",
        Equipment: data.Equipment || "N/A",
        Level: data.Level || "Intermediate",
        // Add default values for the UI logic
        sets: data.sets || 3,
        reps: data.reps || "8-12",
        calories: data.calories || 60,
        instructions: data.instructions || [],
        tips: data.tips || []
      } as Exercise;
    });

    console.log("Library Updated:", exercises);
    setExerciseLibrary(exercises);
  });

  return () => unsubscribe();
}, []);

  // Inside Dashboard.tsx
const handleWorkoutComplete = async (date: string) => {
  if (!user.uid) return;

  try {
    const workoutRef = doc(db, 'users', user.uid, 'workouts', date);
    await setDoc(workoutRef, {
      completed: true,
      timestamp: serverTimestamp()
    }, { merge: true });
    
    console.log("Workout saved to Firestore!");
  } catch (error) {
    console.error("Error saving workout:", error);
  }
};

  const handleUpdateExercise = (exercise: Exercise) => {
    setExerciseLibrary(prev =>
      prev.map(ex => ex.id === exercise.id ? exercise : ex)
    );
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExerciseLibrary(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const handleAddExercise = (exercise: Exercise) => {
    setExerciseLibrary(prev => [...prev, exercise]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-glow">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FitPro</h1>
              <p className="text-xs text-gray-600">Your fitness journey starts here</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('chat')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                view === 'chat' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                  : 'text-gray-700 hover:bg-white/60 hover:scale-105'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => setView('plans')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                view === 'plans' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                  : 'text-gray-700 hover:bg-white/60 hover:scale-105'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="hidden sm:inline">My Plans</span>
            </button>
            <button
              onClick={() => setView('profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                view === 'profile' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                  : 'text-gray-700 hover:bg-white/60 hover:scale-105'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={() => setView('workouts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                view === 'workouts' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                  : 'text-gray-700 hover:bg-white/60 hover:scale-105'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">Workouts</span>
            </button>
            <div className="w-px h-8 bg-gray-300 mx-2 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-white/60 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-800 font-medium">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {view === 'chat' ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[calc(100vh-120px)] bg-white rounded-2xl shadow-xl flex flex-col">
              <Chatbot userName={user.name}
                availableExercises={exerciseLibrary} /> 
              {/* onPlanCreated={handlePlanCreated} */}
            </div>
          </div>
        ) : view === 'plans' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            // ใน Dashboard.tsx
// ✅ แก้ไขฟังก์ชัน onStartExercise
<ExercisePlans
  availableExercises={exerciseLibrary}
  onStartExercise={(exerciseFromPlan, planName) => {
    // ข้อมูลจาก Plan (exerciseFromPlan) ตอนนี้มีข้อมูล Master ติดมาด้วยแล้ว
    // สร้าง Object ที่สมบูรณ์จากข้อมูลใน Plan ได้เลย
    const exerciseToView = {
      ...exerciseFromPlan,
      // Mapping ชื่อฟิลด์ให้ตรงกับที่ Component ปลายทางต้องการ
      Title: exerciseFromPlan.Title || exerciseFromPlan.name,
      Desc: exerciseFromPlan.Desc || exerciseFromPlan.desc,
      BodyPart: exerciseFromPlan.BodyPart || exerciseFromPlan.bodyPart,
      id: exerciseFromPlan.id || `ex_${Date.now()}`
    } as Exercise;

    setSelectedExercise(exerciseToView);
    setSelectedPlanName(planName);
    setView('exercise');
  }}
/>

          </div>
        ) : view === 'profile' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <ProfilePage 
              userId={user.uid} // Now passing the uid for Firestore
              userName={user.name}
            />
          </div>
        )  : view === 'exercise' ? (
          <div className="max-w-4xl mx-auto px-4 py-8 w-full">
            {selectedExercise && (
              <ExerciseDetail 
                exercise={selectedExercise}
                planName={selectedPlanName} // ✅ แก้จาก selectedPlan.name เป็น selectedPlanName
                userId={user.uid}
                onBack={() => {
                  setSelectedExercise(null);
                  setView('plans'); // เมื่อกด Back ให้กลับไปหน้าแผนงาน
                }}
                onComplete={() => {
                  // เพิ่มเติม: เมื่อกดเสร็จสิ้น อาจจะให้กลับไปหน้า Profile เพื่อดู Streak
                  setView('profile');
                }}
              />

            )}
          </div>

        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <WorkoutLibrary
              exercises={exerciseLibrary}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
              onAddExercise={handleAddExercise}
            />
          </div>
        )
        
        }
      </main>
    </div>
  );
}