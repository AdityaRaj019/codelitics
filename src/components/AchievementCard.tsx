import { AchievementCardProps } from "@/types/global";

export default function AchievementCard({
  title,
  date,
  icon = "🏆",
}: AchievementCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group">
      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
      </div>
    </div>
  );
}
