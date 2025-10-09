interface AchievementCardProps {
  title: string;
  date: string;
  icon?: string;
}

export default function AchievementCard({
  title,
  date,
  icon = "🏆",
}: AchievementCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:border-indigo-300">
      <div className="flex items-start space-x-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">Unlocked on {date}</p>
        </div>
      </div>
    </div>
  );
}