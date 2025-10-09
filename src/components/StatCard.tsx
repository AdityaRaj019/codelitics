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
    indigo: "from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200",
    purple: "from-purple-50 to-purple-100 text-purple-600 border-purple-200",
    orange: "from-orange-50 to-orange-100 text-orange-600 border-orange-200",
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;

  return (
    <div
      className={`bg-gradient-to-br ${bgClass} rounded-xl p-6 border shadow-sm hover:shadow-md transition-all hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}