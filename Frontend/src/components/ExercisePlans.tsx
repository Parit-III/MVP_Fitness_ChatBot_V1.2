import { useState } from 'react';
import { Calendar, Clock, Flame, ChevronRight, Pin, Edit2, Trash2, MoreVertical, List } from 'lucide-react';
import { ExerciseDetail } from './ExerciseDetail';
import { MessageCircle, Sparkles } from 'lucide-react';
import { EditPlanModal } from './EditPlanModal';
import { ManagePlanExercisesModal } from './ManagePlanExercisesModal';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  calories: number;
  description: string;
  instructions: string[];
  tips: string[];
}

export interface ExercisePlan {
  id: string;
  name: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalCalories: number;
  exercises: Exercise[];
  isPinned?: boolean;
}

const mockPlans: ExercisePlan[] = [
  {
    id: '1',
    name: 'Full Body Strength',
    duration: '45 min',
    difficulty: 'Intermediate',
    totalCalories: 350,
    exercises: [
      {
        id: '1-1',
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
          'Don\'t let your hips sag',
          'Breathe out as you push up'
        ]
      },
    ]
  }
];

interface ExercisePlansProps {
  plans: ExercisePlan[];
  availableExercises: Exercise[];
  onWorkoutComplete?: (date: string) => void;
  onUpdatePlan?: (plan: ExercisePlan) => void;
  onDeletePlan?: (planId: string) => void;
  onPinPlan?: (planId: string) => void;
}

export function ExercisePlans({ 
  plans, 
  availableExercises,
  onWorkoutComplete, 
  onUpdatePlan, 
  onDeletePlan, 
  onPinPlan 
}: ExercisePlansProps) {
  const [selectedExercise, setSelectedExercise] = useState<{
    exercise: Exercise;
    planName: string;
  } | null>(null);
  const [editingPlan, setEditingPlan] = useState<ExercisePlan | null>(null);
  const [selectingExercisesFor, setSelectingExercisesFor] = useState<ExercisePlan | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showSelectExercisesModal, setShowSelectExercisesModal] = useState(false);

  const handleExerciseComplete = () => {
    if (onWorkoutComplete) {
      const today = new Date().toISOString().split('T')[0];
      onWorkoutComplete(today);
    }
  };

  const handleEditPlan = (plan: ExercisePlan) => {
    setEditingPlan(plan);
    setShowMenu(null);
  };

  const handleSavePlan = (updatedPlan: ExercisePlan) => {
    if (onUpdatePlan) {
      onUpdatePlan(updatedPlan);
    }
    setEditingPlan(null);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      if (onDeletePlan) {
        onDeletePlan(planId);
      }
      setShowMenu(null);
    }
  };

  const handlePinPlan = (planId: string) => {
    if (onPinPlan) {
      onPinPlan(planId);
    }
    setShowMenu(null);
  };

  const handleEditExercises = (plan: ExercisePlan) => {
    setSelectingExercisesFor(plan);
    setShowMenu(null);
  };

  const handleSaveExercises = (exercises: Exercise[]) => {
    if (selectingExercisesFor && onUpdatePlan) {
      // Recalculate total calories
      const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);
      
      onUpdatePlan({
        ...selectingExercisesFor,
        exercises,
        totalCalories,
      });
    }
    setSelectingExercisesFor(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Sort plans: pinned first
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  if (selectedExercise) {
    return (
      <ExerciseDetail
        exercise={selectedExercise.exercise}
        planName={selectedExercise.planName}
        onBack={() => setSelectedExercise(null)}
        onComplete={handleExerciseComplete}
      />
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-20 animate-slide-up">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse-glow">
          <MessageCircle className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">No Plans Yet</h2>
        <p className="text-gray-600 mb-8 text-lg">Chat with the AI coach to create your first personalized workout plan!</p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Click "Chat" to get started</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 animate-slide-up">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Your Personalized Plans</h2>
        <p className="text-gray-600 text-lg">Click on any exercise to view detailed instructions and start your workout</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlans.map((plan, index) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative border animate-slide-up ${ 
              plan.isPinned ? 'border-yellow-400 shadow-yellow-400/20' : 'border-gray-100'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Pin Badge */}
            {plan.isPinned && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-white rounded-xl p-2 shadow-lg animate-pulse">
                  <Pin className="w-4 h-4 fill-current" />
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 pr-8 leading-tight">{plan.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${getDifficultyColor(
                      plan.difficulty
                    )}`}
                  >
                    {plan.difficulty}
                  </span>
                  
                  {/* Menu Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowMenu(showMenu === plan.id ? null : plan.id);
                      }}
                      className="p-3 hover:bg-gray-100 rounded-xl transition-colors relative z-20"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 flex-wrap">
                <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">{plan.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-700">{plan.totalCalories} cal</span>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-700">{plan.exercises.length} exercises</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                  Exercises
                </h4>
                {plan.exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() =>
                      setSelectedExercise({ exercise, planName: plan.name })
                    }
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl hover:from-indigo-50 hover:to-purple-50 border border-transparent hover:border-indigo-200 transition-all duration-200 group hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full group-hover:scale-125 transition-transform"></div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{exercise.name}</p>
                        <p className="text-sm text-gray-600">
                          {exercise.sets} sets × {exercise.reps}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onSave={handleSavePlan}
          onClose={() => setEditingPlan(null)}
        />
      )}

      {/* Select Exercises Modal */}
      {selectingExercisesFor && (
        <ManagePlanExercisesModal
          availableExercises={availableExercises}
          currentExercises={selectingExercisesFor.exercises}
          onSave={handleSaveExercises}
          onClose={() => setSelectingExercisesFor(null)}
        />
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setShowMenu(null)}
          ></div>
          
          {/* Popup Menu */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Plan Options</h3>
                
                <div className="space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const plan = sortedPlans.find(p => p.id === showMenu);
                      if (plan) handlePinPlan(plan.id);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Pin className={`w-5 h-5 text-indigo-600 ${sortedPlans.find(p => p.id === showMenu)?.isPinned ? 'fill-current' : ''}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{sortedPlans.find(p => p.id === showMenu)?.isPinned ? 'Unpin' : 'Pin'} Plan</p>
                      <p className="text-sm text-gray-500">Keep this plan at the top</p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const plan = sortedPlans.find(p => p.id === showMenu);
                      if (plan) handleEditExercises(plan);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <List className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Edit Exercises</p>
                      <p className="text-sm text-gray-500">Add or remove exercises</p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const plan = sortedPlans.find(p => p.id === showMenu);
                      if (plan) handleEditPlan(plan);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Edit Plan Details</p>
                      <p className="text-sm text-gray-500">Change name and settings</p>
                    </div>
                  </button>

                  <div className="my-3 border-t border-gray-200"></div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const plan = sortedPlans.find(p => p.id === showMenu);
                      if (plan) handleDeletePlan(plan.id);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left rounded-xl hover:bg-red-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-600">Delete Plan</p>
                      <p className="text-sm text-red-400">Remove this plan permanently</p>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowMenu(null)}
                  className="w-full mt-6 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}