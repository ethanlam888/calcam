interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
}

interface AnalysisResult {
  totalCalories: number;
  confidence: "high" | "medium" | "low";
  items: FoodItem[];
  notes?: string;
}

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const confidenceColors = {
  high: "bg-emerald-900/60 text-emerald-300 ring-emerald-700",
  medium: "bg-amber-900/60 text-amber-300 ring-amber-700",
  low: "bg-red-900/60 text-red-300 ring-red-700",
};

function calorieColor(cal: number) {
  if (cal < 500) return "text-emerald-400";
  if (cal < 800) return "text-amber-400";
  return "text-red-400";
}

export default function ResultCard({ result, onReset }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end gap-4">
        <div>
          <p className="text-zinc-400 text-sm uppercase tracking-widest mb-1">Total Calories</p>
          <p className={`text-7xl font-black tabular-nums ${calorieColor(result.totalCalories)}`}>
            {result.totalCalories}
          </p>
          <p className="text-zinc-500 text-sm mt-1">kcal</p>
        </div>
        <div className="mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${confidenceColors[result.confidence]}`}>
            {result.confidence} confidence
          </span>
        </div>
      </div>

      {result.items.length > 0 && (
        <div className="rounded-xl overflow-hidden ring-1 ring-white/10">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/60">
              <tr>
                <th className="text-left px-4 py-2.5 text-zinc-400 font-medium">Item</th>
                <th className="text-right px-4 py-2.5 text-zinc-400 font-medium">Qty</th>
                <th className="text-right px-4 py-2.5 text-zinc-400 font-medium">kcal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {result.items.map((item, i) => (
                <tr key={i} className="bg-zinc-900/40">
                  <td className="px-4 py-3 text-zinc-200">{item.name}</td>
                  <td className="px-4 py-3 text-zinc-400 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-zinc-200 text-right font-medium tabular-nums">{item.calories}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.notes && (
        <p className="text-zinc-500 text-sm leading-relaxed">{result.notes}</p>
      )}

      <button
        onClick={onReset}
        className="mt-2 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
      >
        Analyze another meal
      </button>
    </div>
  );
}
