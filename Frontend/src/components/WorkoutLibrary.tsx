import { useState } from 'react';
import { Search, Dumbbell, Filter } from 'lucide-react';
import { Exercise } from './ExercisePlans';
import { ExerciseDetailModal } from './ExerciseDetailModal';

interface WorkoutLibraryProps {
  exercises: Exercise[];
  onUpdateExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onAddExercise: (exercise: Exercise) => void;
}

export function WorkoutLibrary({ exercises, onUpdateExercise, onDeleteExercise, onAddExercise }: WorkoutLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'cardio' | 'strength' | 'core'>('all');
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);

  // Inside WorkoutLibrary.tsx
const categorizeExercise = (exercise: Exercise): string => {
  const cardioKeywords = ['jump', 'run', 'cardio', 'jacks', 'burpee', 'climber'];
  const coreKeywords = ['plank', 'crunch', 'core', 'abs', 'twist', 'leg raise'];
  
  // Use nullish coalescing to ensure 'name' is at least an empty string
  const name = (exercise.name || "").toLowerCase();
  
  if (cardioKeywords.some(keyword => name.includes(keyword))) return 'cardio';
  if (coreKeywords.some(keyword => name.includes(keyword))) return 'core';
  return 'strength';
};

  const filteredExercises = exercises.filter(exercise => {
  // Safe string conversion for name and description
  const name = (exercise.name || "").toLowerCase();
  const description = (exercise.description || "").toLowerCase();
  const search = searchTerm.toLowerCase();

  const matchesSearch = name.includes(search) || description.includes(search);
  const matchesCategory = filterCategory === 'all' || categorizeExercise(exercise) === filterCategory;
  
  return matchesSearch && matchesCategory;
});

  const getCategoryBadge = (exercise: Exercise) => {
    const category = categorizeExercise(exercise);
    const colors = {
      cardio: 'bg-red-100 text-red-700',
      strength: 'bg-blue-100 text-blue-700',
      core: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category as keyof typeof colors]}`}>
        {category}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Exercise Library</h2>
        <p className="text-gray-600">Browse and explore all available exercises</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory('cardio')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'cardio'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cardio
          </button>
          <button
            onClick={() => setFilterCategory('strength')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'strength'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Strength
          </button>
          <button
            onClick={() => setFilterCategory('core')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'core'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Core
          </button>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => setViewingExercise(exercise)}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-[1.02] text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {exercise.name}
                </h3>
                {getCategoryBadge(exercise)}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {exercise.description}
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-700">
                <span className="font-medium">{exercise.sets}</span>
                <span className="text-gray-500">sets</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <span className="font-medium">{exercise.reps}</span>
                <span className="text-gray-500">reps</span>
              </div>
              {exercise.duration && (
                <div className="flex items-center gap-1 text-indigo-600">
                  <span className="font-medium">{exercise.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-orange-600">
                <span className="font-medium">{exercise.calories}</span>
                <span>cal</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No exercises found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* View Exercise Detail Modal */}
      {viewingExercise && (
        <ExerciseDetailModal
          exercise={viewingExercise}
          onClose={() => setViewingExercise(null)}
        />
      )}
    </div>
  );
}