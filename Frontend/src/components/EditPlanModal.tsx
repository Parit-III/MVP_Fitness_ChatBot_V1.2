import { useState } from 'react';
import { X } from 'lucide-react';
import { ExercisePlan } from './ExercisePlans';

interface EditPlanModalProps {
  plan: ExercisePlan;
  onSave: (plan: ExercisePlan) => void;
  onClose: () => void;
}

export function EditPlanModal({ plan, onSave, onClose }: EditPlanModalProps) {
  const [name, setName] = useState(plan.name);
  const [duration, setDuration] = useState(plan.duration);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(plan.difficulty);

  const handleSave = () => {
    const updatedPlan: ExercisePlan = {
      ...plan,
      name,
      duration,
      difficulty,
    };
    onSave(updatedPlan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Plan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter plan name"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 30 min"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    difficulty === level
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises List (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercises
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {plan.exercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-gray-700">{index + 1}.</span>
                  <span className="text-gray-900">{exercise.name}</span>
                  <span className="text-gray-500">
                    ({exercise.sets} sets × {exercise.reps})
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Exercise modifications coming soon. Use chat to create a new plan with different exercises.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
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
