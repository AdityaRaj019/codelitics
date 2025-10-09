interface UserCardProps {
  name: string;
  rating: number;
  totalSolved: number;
}

export default function UserCard({ name, rating, totalSolved }: UserCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold">
            {name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-indigo-100">Full Stack Developer</p>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-indigo-100 text-sm">Rating</p>
          <p className="text-2xl font-bold">{rating}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-indigo-100 text-sm">Problems Solved</p>
          <p className="text-2xl font-bold">{totalSolved}</p>
        </div>
      </div>
    </div>
  );
}