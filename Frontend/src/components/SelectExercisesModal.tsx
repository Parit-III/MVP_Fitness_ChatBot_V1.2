import { useState } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { Exercise } from './ExercisePlans';

interface SelectExercisesModalProps {
  availableExercises: Exercise[];
  selectedExercises: Exercise[];
  onSave: (exercises: Exercise[]) => void;
  onClose: () => void;
}

export function SelectExercisesModal({ 
  availableExercises, 
  selectedExercises, 
  onSave, 
  onClose 
}: SelectExercisesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Exercise[]>(selectedExercises);

  const filteredExercises = availableExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (exerciseId: string) => {
    return selected.some(ex => ex.id === exerciseId);
  };

  const toggleExercise = (exercise: Exercise) => {
    if (isSelected(exercise.id)) {
      setSelected(selected.filter(ex => ex.id !== exercise.id));
    } else {
      setSelected([...selected, exercise]);
    }
  };

  const handleSave = () => {
    onSave(selected);
  };

  const categorizeExercise = (exercise: Exercise): string => {
    const cardioKeywords = ['jump', 'run', 'cardio', 'jacks', 'burpee', 'climber'];
    const coreKeywords = ['plank', 'crunch', 'core', 'abs', 'twist', 'leg raise'];
    const name = exercise.name.toLowerCase();
    
    if (cardioKeywords.some(keyword => name.includes(keyword))) return 'cardio';
    if (coreKeywords.some(keyword => name.includes(keyword))) return 'core';
    return 'strength';
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Exercises</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selected.length} exercise{selected.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-3">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => toggleExercise(exercise)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isSelected(exercise.id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-1 ${
                    isSelected(exercise.id)
                      ? 'bg-indigo-600'
                      : 'border-2 border-gray-300'
                  }`}>
                    {isSelected(exercise.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Exercise Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {exercise.name}
                      </h3>
                      {getCategoryBadge(exercise)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{exercise.sets} sets × {exercise.reps}</span>
                      {exercise.duration && <span>{exercise.duration}</span>}
                      <span className="text-orange-600">{exercise.calories} cal</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No exercises found</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {selected.length} of {availableExercises.length} exercises selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
