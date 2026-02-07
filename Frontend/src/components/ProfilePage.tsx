import { useState, useEffect } from 'react';
import { Calendar, Flame, TrendingUp, Activity, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Firebase Imports
import { db } from '../firebase'; 
import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

interface WorkoutStreak {
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

interface BMIRecord {
  date: string;
  bmi: number;
  weight: number;
  height: number;
}

interface ProfilePageProps {
  userId: string; // Pass the UID from your auth state
  userName: string;
}

export function ProfilePage({ userId, userName }: ProfilePageProps) {
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutStreak[]>([]);
  const [bmiRecords, setBmiRecords] = useState<BMIRecord[]>([]);
  
  const [showBMIForm, setShowBMIForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('170');

  // --- Firestore Sync Logic ---

  useEffect(() => {
    if (!userId) return;

    // 1. Listen for Workouts
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const unsubWorkouts = onSnapshot(workoutsRef, (snapshot) => {
      const workoutData = snapshot.docs.map(doc => ({
        date: doc.id,
        completed: doc.data().completed
      }));
      setCompletedWorkouts(workoutData);
    });

    // 2. Listen for BMI Records
    const bmiRef = query(
      collection(db, 'users', userId, 'bmiRecords'), 
      orderBy('date', 'asc')
    );
    const unsubBMI = onSnapshot(bmiRef, (snapshot) => {
      const records = snapshot.docs.map(doc => doc.data() as BMIRecord);
      setBmiRecords(records);
    });

    return () => {
      unsubWorkouts();
      unsubBMI();
    };
  }, [userId]);

  // --- Action Handlers ---

  const handleAddBMI = async () => {
  // 1. Check if inputs are empty
  if (!newWeight || !newHeight) return;
  
  // 2. IMPORTANT: Check if userId exists before calling Firestore
  if (!userId) {
    console.error("Error: userId is undefined. Check if it's passed from Dashboard.");
    alert("User session not found. Please try logging in again.");
    return;
  }
  
  try {
    const weight = parseFloat(newWeight);
    const height = parseFloat(newHeight) / 100;
    const bmi = weight / (height * height);
    
    const newRecord = {
      date: new Date().toISOString().split('T')[0],
      bmi: parseFloat(bmi.toFixed(1)),
      weight,
      height: parseFloat(newHeight),
      createdAt: serverTimestamp()
    };
    
    // The error happens here if userId is undefined
    const bmiCollectionRef = collection(db, 'users', userId, 'bmiRecords');
    await addDoc(bmiCollectionRef, newRecord);
    
    setNewWeight('');
    setShowBMIForm(false);
  } catch (error) {
    console.error("Error adding BMI record:", error);
  }
};

  // Optional: Function to log today's workout to Firestore
  const toggleTodayWorkout = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const workoutRef = doc(db, 'users', userId, 'workouts', todayStr);
    
    await setDoc(workoutRef, {
      completed: true,
      timestamp: serverTimestamp()
    }, { merge: true });
  };

  // --- Existing Logic (Unchanged) ---

  const calculateStreak = (): number => {
    const sortedDates = completedWorkouts
      .filter(w => w.completed)
      .map(w => new Date(w.date))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasWorkout = sortedDates.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      if (hasWorkout) streak++; else if (i > 0) break;
    }
    return streak;
  };

  // แก้ไขฟังก์ชัน getCalendarDays ใน ProfilePage.tsx ให้แม่นยำขึ้น
const getCalendarDays = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  const startDay = firstDay.getDay();

  for (let i = 0; i < startDay; i++) {
    days.push({ date: new Date(0), hasWorkout: false, isToday: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    
    // ✅ ใช้สูตรแปลง Local Date เป็น ISO String แบบเดียวกัน
    const offset = date.getTimezoneOffset() * 60000;
    const dateStr = (new Date(date.getTime() - offset)).toISOString().split('T')[0];
    
    const hasWorkout = completedWorkouts.some(w => w.date === dateStr && w.completed);
    const isToday = date.toDateString() === today.toDateString();
    
    days.push({ date, hasWorkout, isToday });
  }
  return days;
};

  const calculateWorkoutFrequency = () => {
    const last30Days = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return workoutDate >= thirtyDaysAgo && w.completed;
    });
    return last30Days.length;
  };

  const currentStreak = calculateStreak();
  const workoutsLast30Days = calculateWorkoutFrequency();
  const calendarDays = getCalendarDays();
  const currentBMI = bmiRecords.length > 0 ? bmiRecords[bmiRecords.length - 1].bmi : 0;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
            <p className="text-gray-600">Keep up the great work!</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md p-6 text-white cursor-pointer hover:opacity-90 transition-opacity" onClick={toggleTodayWorkout}>
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-8 h-8" />
            <span className="text-3xl font-bold">{currentStreak}</span>
          </div>
          <h3 className="text-lg font-semibold">Day Streak</h3>
          <p className="text-sm text-orange-100">Click to log today!</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8" />
            <span className="text-3xl font-bold">{workoutsLast30Days}</span>
          </div>
          <h3 className="text-lg font-semibold">Workouts (30d)</h3>
          <p className="text-sm text-green-100">Last 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" />
            <span className="text-3xl font-bold">{currentBMI}</span>
          </div>
          <h3 className="text-lg font-semibold">Current BMI</h3>
          <p className="text-sm text-blue-100">Body Mass Index</p>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Workout Calendar</h3>
        </div>

        <div className="mb-4">
          <p className="text-center text-lg font-semibold text-gray-700">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                day.date.getTime() === 0
                  ? 'bg-transparent'
                  : day.hasWorkout
                  ? 'bg-green-500 text-white shadow-md'
                  : day.isToday
                  ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day.date.getTime() !== 0 && day.date.getDate()}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Workout completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-600 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>

      {/* BMI Tracking */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">BMI Progress</h3>
          </div>
          <button
            onClick={() => setShowBMIForm(!showBMIForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Record
          </button>
        </div>

        {showBMIForm && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Add New BMI Record</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="70"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  placeholder="170"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddBMI}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowBMIForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {bmiRecords.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bmiRecords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number) => [value.toFixed(1), 'BMI']}
                />
                <Line 
                  type="monotone" 
                  dataKey="bmi" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {bmiRecords.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Records</h4>
            <div className="space-y-2">
              {[...bmiRecords].reverse().slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">BMI: {record.bmi}</p>
                    <p className="text-sm text-gray-600">
                      {record.weight}kg • {record.height}cm
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}