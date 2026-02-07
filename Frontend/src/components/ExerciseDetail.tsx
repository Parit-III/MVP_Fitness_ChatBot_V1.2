import { useState, useEffect } from 'react';
import { ArrowLeft, Flame, Repeat, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Exercise } from './ExercisePlans';
import { db } from '../firebase'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ExerciseDetailProps {
  exercise: Exercise;
  planName: string;
  onBack: () => void;
  onComplete?: () => void;
  userId: string; // ✅ เพิ่ม userId เข้ามาใน Props
}

export function ExerciseDetail({ exercise, planName, onBack, onComplete, userId }: ExerciseDetailProps) {
  // ✅ ใส่ตรงนี้เลย
  if (!exercise) {
    return <div className="p-8">Exercise not found</div>;
  }

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Calculate total workout time based on exercise type
  const totalSets = exercise.sets;
  const hasTimedSets = exercise.duration !== undefined;

  // Parse duration if it exists (e.g., "45 sec" -> 45)
  const parseDuration = (duration: string | undefined): number => {
    if (!duration) return 0;
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Estimate time for rep-based exercises (e.g., "12-15" -> ~40 seconds at 3 sec per rep)
  const estimateRepTime = (reps: string): number => {
    const match = reps.match(/(\d+)/);
    if (!match) return 60; // default 60 seconds
    const repCount = parseInt(match[1]);
    return Math.max(repCount * 0, 0); // 3 seconds per rep, minimum 30 seconds 3, 30
  };

  const setDurationSeconds = hasTimedSets 
    ? parseDuration(exercise.duration)
    : estimateRepTime(exercise.reps);

  const [timeRemaining, setTimeRemaining] = useState(setDurationSeconds);

  useEffect(() => {
  // Use ReturnType to automatically get the correct type for your environment
  let interval: ReturnType<typeof setInterval> | null = null;

  if (isTimerRunning && !isCompleted && timeRemaining > 0) {
    interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isTimerRunning, isCompleted, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleReset = () => {
    setIsTimerRunning(false);
    setTimeRemaining(setDurationSeconds);
    setCurrentSet(1);
    setIsCompleted(false);
  };

  const handleNextSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1);
      setTimeRemaining(setDurationSeconds);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(false);
      setIsCompleted(true);
    }
  };

// ในไฟล์ ExerciseDetail.tsx
const handleMarkComplete = async () => {
    if (!userId || !exercise?.name) {
      console.error("Missing Data:", { userId, exerciseName: exercise?.name });
      alert("ไม่สามารถบันทึกได้เนื่องจากข้อมูลไม่สมบูรณ์");
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // ✅ เปลี่ยน Path ให้ตรงกับ Rules: /workouts/{userId}/records/{todayStr}
      const workoutRef = doc(db, 'workouts', userId, 'records', todayStr);
      
      await setDoc(workoutRef, {
        completed: true,
        timestamp: serverTimestamp(),
        exerciseName: exercise.name, // ใช้ชื่อ Field ให้ตรงกับความหมาย
        planName: planName
      }, { merge: true });
      
      console.log("Workout saved to /workouts sub-collection!");

      if (onComplete) onComplete();
      onBack();
      
    } catch (error: any) {
      console.error("Firestore Error:", error);
      alert(`ไม่สามารถบันทึกได้: ${error.message}`);
    }
};

  // Check if current set is complete
  const isSetComplete = timeRemaining === 0;

  // Calculate progress percentage
  const progressPercentage = ((setDurationSeconds - timeRemaining) / setDurationSeconds) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Plans
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <p className="text-indigo-100 mb-2">{planName}</p>
          <h1 className="text-4xl font-bold mb-4">{exercise.name}</h1>
          
          <div className="flex items-center gap-6 text-indigo-100">
            <div className="flex items-center gap-2">
              <Repeat className="w-5 h-5" />
              <span>{exercise.sets} sets × {exercise.reps}</span>
            </div>
            {exercise.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{exercise.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              <span>{exercise.calories} calories</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Timer Section */}
          {!isCompleted && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Set {currentSet} of {totalSets}
                </h3>
                {hasTimedSets ? (
                  <>
                    <div className={`text-6xl font-bold mb-2 transition-colors ${
                      timeRemaining <= 5 && timeRemaining > 0 ? 'text-red-600' : 'text-indigo-600'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Hold for {exercise.duration}
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`text-6xl font-bold mb-2 transition-colors ${
                      timeRemaining <= 5 && timeRemaining > 0 ? 'text-red-600' : 'text-indigo-600'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Complete {exercise.reps} reps
                    </p>
                  </>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleStartPause}
                  disabled={isSetComplete}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      {timeRemaining === setDurationSeconds ? 'Start' : 'Resume'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>

                {isSetComplete && (
                  <button
                    onClick={handleNextSet}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium animate-pulse"
                  >
                    {currentSet < totalSets ? 'Next Set ✓' : 'Finish ✓'}
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      timeRemaining <= 5 && timeRemaining > 0 ? 'bg-red-600' : 'bg-indigo-600'
                    }`}
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  {Math.round(progressPercentage)}% complete
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
            <ol className="space-y-3">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips</h2>
            <div className="bg-indigo-50 rounded-lg p-6 space-y-3">
              {exercise.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mark as Complete - Only shown when workout is finished */}
          {isCompleted && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Great Job!</h3>
              <p className="text-gray-600 mb-6">You completed all {totalSets} sets!</p>
              <button 
                onClick={handleMarkComplete}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
              >
                Mark as Complete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}