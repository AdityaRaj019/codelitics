import { StatCardProps } from "@/types/global";

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
            color || "from-indigo-500 to-purple-500"
          } flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
