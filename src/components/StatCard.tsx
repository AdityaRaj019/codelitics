interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  color?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  color = "indigo",
}: StatCardProps) {
  const colorClasses = {
    indigo: "from-indigo-950 to-indigo-900 text-indigo-400 border-indigo-800",
    emerald: "from-emerald-950 to-emerald-900 text-emerald-400 border-emerald-800",
    purple: "from-purple-950 to-purple-900 text-purple-400 border-purple-800",
    orange: "from-orange-950 to-orange-900 text-orange-400 border-orange-800",
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;

  return (
    <div
      className={`bg-gradient-to-br ${bgClass} rounded-xl p-6 border shadow-sm hover:shadow-md transition-all hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}