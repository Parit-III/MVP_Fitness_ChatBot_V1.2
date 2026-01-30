import { useState } from 'react';
import { MessageCircle, Dumbbell, LogOut, X, List, User, BookOpen } from 'lucide-react';
import { ExercisePlans, ExercisePlan } from './ExercisePlans';
import { Chatbot } from './Chatbot';
import { ProfilePage } from './ProfilePage';
import { WorkoutLibrary } from './WorkoutLibrary';
import { Exercise } from './ExercisePlans';

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

interface WorkoutStreak {
  date: string;
  completed: boolean;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [view, setView] = useState<'chat' | 'plans' | 'profile' | 'workouts'>('chat');
  const [personalizedPlans, setPersonalizedPlans] = useState<ExercisePlan[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutStreak[]>([
    { date: '2024-01-20', completed: true },
    { date: '2024-01-21', completed: true },
    { date: '2024-01-22', completed: true },
    { date: '2024-01-23', completed: true },
    { date: '2024-01-24', completed: true },
  ]);

  // Exercise library
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([
    {
      id: 'ex-1',
      name: 'Push-ups',
      sets: 3,
      reps: '12-15',
      calories: 50,
      description: 'A classic upper body exercise that targets chest, shoulders, and triceps.',
      instructions: [
        'Start in a plank position with hands shoulder-width apart',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Keep your core engaged throughout the movement'
      ],
      tips: [
        'Keep your body in a straight line',
        "Don't let your hips sag",
        'Breathe out as you push up'
      ]
    },
    {
      id: 'ex-2',
      name: 'Squats',
      sets: 4,
      reps: '15-20',
      calories: 80,
      description: 'A fundamental lower body exercise that works quads, glutes, and hamstrings.',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your body by bending knees and hips',
        'Keep chest up and back straight',
        'Push through heels to return to starting position'
      ],
      tips: [
        'Keep knees aligned with toes',
        'Go as low as comfortable',
        'Engage your core for stability'
      ]
    },
    {
      id: 'ex-3',
      name: 'Plank',
      sets: 3,
      reps: '30-60 sec',
      duration: '45 sec',
      calories: 40,
      description: 'An isometric core exercise that builds overall stability and strength.',
      instructions: [
        'Start in a forearm plank position',
        'Keep body in a straight line from head to heels',
        'Hold the position without letting hips sag',
        'Breathe steadily throughout'
      ],
      tips: [
        "Don't hold your breath",
        'Squeeze your glutes',
        'Keep your neck neutral'
      ]
    },
    {
      id: 'ex-4',
      name: 'Lunges',
      sets: 3,
      reps: '10 each leg',
      calories: 70,
      description: 'A unilateral lower body exercise that improves balance and leg strength.',
      instructions: [
        'Step forward with one leg',
        'Lower your hips until both knees are bent at 90 degrees',
        'Push back to starting position',
        'Alternate legs'
      ],
      tips: [
        'Keep front knee behind toes',
        'Maintain upright posture',
        'Engage core for balance'
      ]
    },
    {
      id: 'ex-5',
      name: 'Burpees',
      sets: 3,
      reps: '8-10',
      calories: 110,
      description: 'A full-body cardio exercise that combines strength and endurance.',
      instructions: [
        'Start standing, drop into a squat',
        'Place hands on ground and jump feet back into plank',
        'Do a push-up (optional)',
        'Jump feet back to squat position',
        'Explode up into a jump'
      ],
      tips: [
        'Land softly to protect joints',
        'Modify by stepping instead of jumping',
        'Maintain steady breathing'
      ]
    },
    {
      id: 'ex-6',
      name: 'Jumping Jacks',
      sets: 3,
      reps: '20',
      calories: 60,
      description: 'A simple cardio exercise that gets your heart rate up quickly.',
      instructions: [
        'Start with feet together and arms at sides',
        'Jump while spreading legs and raising arms overhead',
        'Jump back to starting position',
        'Maintain a steady rhythm'
      ],
      tips: [
        'Land on balls of feet',
        'Keep movements controlled',
        'Breathe rhythmically'
      ]
    },
    {
      id: 'ex-7',
      name: 'Mountain Climbers',
      sets: 3,
      reps: '15 each leg',
      calories: 80,
      description: 'A cardio exercise that also works your core and upper body.',
      instructions: [
        'Start in plank position',
        'Drive one knee toward chest',
        'Quickly switch legs',
        'Continue alternating at a fast pace'
      ],
      tips: [
        'Keep hips level',
        "Don't bounce",
        'Maintain plank form'
      ]
    },
    {
      id: 'ex-8',
      name: 'Bicycle Crunches',
      sets: 3,
      reps: '20',
      calories: 50,
      description: 'A dynamic ab exercise that targets obliques and rectus abdominis.',
      instructions: [
        'Lie on back with hands behind head',
        'Bring one knee toward chest while rotating torso',
        'Touch opposite elbow to knee',
        'Alternate sides in a pedaling motion'
      ],
      tips: [
        "Don't pull on neck",
        'Focus on rotation',
        'Keep lower back pressed down'
      ]
    },
    {
      id: 'ex-9',
      name: 'High Knees',
      sets: 3,
      reps: '30 sec',
      duration: '30 sec',
      calories: 70,
      description: 'A dynamic cardio move that improves coordination and leg strength.',
      instructions: [
        'Run in place lifting knees high',
        'Pump arms vigorously',
        'Keep core engaged',
        'Maintain quick pace'
      ],
      tips: [
        'Lift knees to hip height',
        'Stay on balls of feet',
        'Keep back straight'
      ]
    },
    {
      id: 'ex-10',
      name: 'Russian Twists',
      sets: 3,
      reps: '15 each side',
      calories: 60,
      description: 'A rotational exercise that strengthens obliques and improves core stability.',
      instructions: [
        'Sit with knees bent and feet off ground',
        'Lean back slightly',
        'Rotate torso to touch hands to ground on each side',
        'Keep core engaged throughout'
      ],
      tips: [
        'Move with control',
        'Keep chest up',
        'Breathe steadily'
      ]
    },
  ]);

  const handlePlanCreated = (plan: ExercisePlan) => {
    setPersonalizedPlans(prev => [...prev, plan]);
  };

  const handleWorkoutComplete = (date: string) => {
    setCompletedWorkouts(prev => {
      const existing = prev.find(w => w.date === date);
      if (existing) {
        return prev.map(w => w.date === date ? { ...w, completed: true } : w);
      }
      return [...prev, { date, completed: true }];
    });
  };

  const handleUpdatePlan = (updatedPlan: ExercisePlan) => {
    setPersonalizedPlans(prev =>
      prev.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  };

  const handleDeletePlan = (planId: string) => {
    setPersonalizedPlans(prev => prev.filter(p => p.id !== planId));
  };

  const handlePinPlan = (planId: string) => {
    setPersonalizedPlans(prev =>
      prev.map(p => p.id === planId ? { ...p, isPinned: !p.isPinned } : p)
    );
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
              <Chatbot userName={user.name} onPlanCreated={handlePlanCreated} />
            </div>
          </div>
        ) : view === 'plans' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <ExercisePlans 
              plans={personalizedPlans}
              availableExercises={exerciseLibrary}
              onWorkoutComplete={handleWorkoutComplete}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
              onPinPlan={handlePinPlan}
            />
          </div>
        ) : view === 'profile' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <ProfilePage 
              userName={user.name}
              completedWorkouts={completedWorkouts}
              onWorkoutComplete={handleWorkoutComplete}
            />
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
        )}
      </main>
    </div>
  );
}