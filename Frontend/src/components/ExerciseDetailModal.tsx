import { X, Repeat, Flame, Clock } from 'lucide-react';
import { Exercise } from './ExercisePlans';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{exercise.Title}</h2>
              <div className="flex items-center gap-4 text-indigo-100">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm">{exercise.sets} sets × {exercise.reps}</span>
                </div>
                {exercise.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{exercise.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">{exercise.calories} calories</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{exercise.Desc}</p>
          </div>

          {/* Video placeholder */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Video Tutorial</h3>
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-gray-600">Video tutorial coming soon</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
            <ol className="space-y-3">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 pt-0.5">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pro Tips</h3>
            <div className="bg-indigo-50 rounded-lg p-5 space-y-3">
              {exercise.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
