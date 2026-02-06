import { useState } from "react";

interface PlanFormProps {
  onGenerate?: (data: {
    age: string;
    weight: string;
    height: string;
    goal: string;
  }) => void;
}

export default function PlanForm({ onGenerate }: PlanFormProps) {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");

  return (
    <div className="space-y-3">
      <input
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="อายุ"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <input
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="น้ำหนัก (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <input
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="ส่วนสูง (cm)"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
      />

      <input
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="เป้าหมาย (เช่น ลดไขมัน)"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <button
        className="w-full py-3 bg-indigo-600 text-white rounded-lg"
        onClick={() =>
          onGenerate?.({
            age,
            weight,
            height,
            goal,
          })
        }
      >
        สร้างแผนออกกำลังกาย
      </button>
    </div>
  );
}
