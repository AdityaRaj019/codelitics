import { UserCardProps } from "@/types/global";

export default function UserCard({ name, rating, totalSolved }: UserCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const getRatingLevel = (rating: number) => {
    if (rating >= 2000) return { level: "Expert", color: "text-purple-500" };
    if (rating >= 1800) return { level: "Advanced", color: "text-blue-500" };
    if (rating >= 1500)
      return { level: "Intermediate", color: "text-green-500" };
    return { level: "Beginner", color: "text-gray-500" };
  };

  const { level, color } = getRatingLevel(rating);

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 rounded-2xl">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 transition-colors duration-300">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {name}
            </h3>
            <p className={`text-sm font-medium ${color}`}>{level}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {totalSolved}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Solved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {rating}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
