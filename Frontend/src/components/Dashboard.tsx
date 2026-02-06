import { useEffect, useState } from "react";
import { MessageCircle, Dumbbell, LogOut, X, List, User, BookOpen } from 'lucide-react';
import { ExercisePlans } from './ExercisePlans';
import { Chatbot } from './Chatbot';
import { ProfilePage } from './ProfilePage';
import { Exercise } from './ExercisePlans';
import { getExercises } from "../services/exerciseService";
import { WorkoutLibrary } from "./WorkoutLibrary";
<<<<<<< HEAD
import { ExerciseDetail } from "./ExerciseDetail";
=======
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
>>>>>>> b3412f7b81e228779c27a1862f675e5c82137629

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

  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutStreak[]>([
    { date: '2024-01-20', completed: true },
    { date: '2024-01-21', completed: true },
    { date: '2024-01-22', completed: true },
    { date: '2024-01-23', completed: true },
    { date: '2024-01-24', completed: true },
  ]);

  // Exercise library
const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
useEffect(() => {
  const fetchExercises = async () => {
    try {
      const data = await getExercises();
      setExerciseLibrary(data);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    }
  };

  fetchExercises();
}, []);

<<<<<<< HEAD
  const handleWorkoutComplete = (date: string) => {
    setCompletedWorkouts(prev => {
      const existing = prev.find(w => w.date === date);
      if (existing) {
        return prev.map(w => w.date === date ? { ...w, completed: true } : w);
      }
      return [...prev, { date, completed: true }];
    });
  };
=======

  const handlePlanCreated = (plan: ExercisePlan) => {
    setPersonalizedPlans(prev => [...prev, plan]);
  };

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
>>>>>>> b3412f7b81e228779c27a1862f675e5c82137629

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
              <Chatbot userName={user.name} /> 
              {/* onPlanCreated={handlePlanCreated} */}
            </div>
          </div>
        ) : view === 'plans' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <ExercisePlans
              availableExercises={exerciseLibrary}
              onStartExercise={(exerciseFromPlan, planName) => {

                const fullExercise = exerciseLibrary.find(
                  ex => ex.name === exerciseFromPlan.name
                );

                if (!fullExercise) {
                  console.error("Exercise not found in library:", exerciseFromPlan);
                  return;
                }

                setSelectedExercise(fullExercise);
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
                planName={selectedPlanName}
                onBack={() => setView('plans')}
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