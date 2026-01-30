import { useState } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { Exercise } from './ExercisePlans';

interface ManagePlanExercisesModalProps {
  availableExercises: Exercise[];
  currentExercises: Exercise[];
  onSave: (exercises: Exercise[]) => void;
  onClose: () => void;
}

export function ManagePlanExercisesModal({ 
  availableExercises, 
  currentExercises, 
  onSave, 
  onClose 
}: ManagePlanExercisesModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>(currentExercises);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get exercises that aren't already in the plan
  const getAvailableToAdd = () => {
    return availableExercises.filter(
      ex => !exercises.some(current => current.id === ex.id)
    );
  };

  const filteredAvailableExercises = getAvailableToAdd().filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleSave = () => {
    onSave(exercises);
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
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Exercises</h2>
              <p className="text-sm text-gray-600 mt-1">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} in plan
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Exercises
              </button>
              <button
                onClick={() => setShowRemoveModal(true)}
                disabled={exercises.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                Remove Exercises
              </button>
            </div>
          </div>

          {/* Current Exercises List */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Current Exercises</h3>
            {exercises.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No exercises in this plan yet.</p>
                <p className="text-sm mt-1">Click "Add Exercises" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                      {getCategoryBadge(exercise)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{exercise.sets} sets × {exercise.reps}</span>
                      {exercise.duration && <span>{exercise.duration}</span>}
                      <span className="text-orange-600">{exercise.calories} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Add Exercises Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Exercises</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click on an exercise to add it to your plan
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm('');
                }}
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
              {filteredAvailableExercises.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>{getAvailableToAdd().length === 0 ? 'All exercises are already in this plan!' : 'No exercises found'}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredAvailableExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => {
                        handleAddExercise(exercise);
                        setShowAddModal(false);
                        setSearchTerm('');
                      }}
                      className="p-4 border-2 border-gray-200 rounded-lg text-left transition-all hover:border-indigo-600 hover:bg-indigo-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                        {getCategoryBadge(exercise)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>{exercise.sets} sets × {exercise.reps}</span>
                        {exercise.duration && <span>{exercise.duration}</span>}
                        <span className="text-orange-600">{exercise.calories} cal</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Exercises Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Remove Exercises</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click on an exercise to remove it from your plan
                </p>
              </div>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-6">
              {exercises.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No exercises to remove</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => {
                        handleRemoveExercise(exercise.id);
                        if (exercises.length === 1) {
                          setShowRemoveModal(false);
                        }
                      }}
                      className="p-4 border-2 border-gray-200 rounded-lg text-left transition-all hover:border-red-600 hover:bg-red-50 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-700">
                          {exercise.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(exercise)}
                          <Trash2 className="w-4 h-4 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>{exercise.sets} sets × {exercise.reps}</span>
                        {exercise.duration && <span>{exercise.duration}</span>}
                        <span className="text-orange-600">{exercise.calories} cal</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
