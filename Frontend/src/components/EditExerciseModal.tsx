import { useState } from 'react';
import { X } from 'lucide-react';
import { Exercise } from './ExercisePlans';

interface EditExerciseModalProps {
  exercise: Exercise;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

export function EditExerciseModal({ exercise, onSave, onClose }: EditExerciseModalProps) {
  const [name, setName] = useState(exercise.name);
  const [sets, setSets] = useState(exercise.sets.toString());
  const [reps, setReps] = useState(exercise.reps);
  const [duration, setDuration] = useState(exercise.duration || '');
  const [calories, setCalories] = useState(exercise.calories.toString());
  const [description, setDescription] = useState(exercise.description);
  const [instructions, setInstructions] = useState(exercise.instructions.join('\n'));
  const [tips, setTips] = useState(exercise.tips.join('\n'));

  const handleSave = () => {
    if (!name || !sets || !reps || !calories) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedExercise: Exercise = {
      ...exercise,
      name,
      sets: parseInt(sets),
      reps,
      duration: duration || undefined,
      calories: parseInt(calories),
      description,
      instructions: instructions.split('\n').filter(i => i.trim()),
      tips: tips.split('\n').filter(t => t.trim()),
    };

    onSave(updatedExercise);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Exercise</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Exercise Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercise Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Push-ups"
            />
          </div>

          {/* Sets and Reps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sets *
              </label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="3"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reps *
              </label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 12-15 or 30 sec"
              />
            </div>
          </div>

          {/* Duration and Calories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (optional)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 45 sec"
              />
              <p className="text-xs text-gray-500 mt-1">
                For timed exercises
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories Burned *
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="50"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Brief description of the exercise..."
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="One instruction per line..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter each instruction on a new line
            </p>
          </div>

          {/* Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tips
            </label>
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="One tip per line..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter each tip on a new line
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
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
  );
}
