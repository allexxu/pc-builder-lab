import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface Participant {
  id: string;
  nickname: string;
  total_score: number;
}

interface TopThreePodiumProps {
  participants: Participant[];
}

const TopThreePodium = ({ participants }: TopThreePodiumProps) => {
  const sorted = [...participants].sort((a, b) => b.total_score - a.total_score);
  const [first, second, third] = sorted;

  const PodiumPlace = ({
    participant,
    place,
  }: {
    participant?: Participant;
    place: 1 | 2 | 3;
  }) => {
    if (!participant) return null;

    const heights = {
      1: "h-40",
      2: "h-28",
      3: "h-20",
    };

    const colors = {
      1: "bg-gradient-to-t from-yellow-600 to-yellow-400 border-yellow-300",
      2: "bg-gradient-to-t from-gray-500 to-gray-300 border-gray-200",
      3: "bg-gradient-to-t from-amber-700 to-amber-500 border-amber-400",
    };

    const icons = {
      1: <Trophy className="w-10 h-10 text-yellow-300" />,
      2: <Medal className="w-8 h-8 text-gray-200" />,
      3: <Award className="w-8 h-8 text-amber-300" />,
    };

    return (
      <div className="flex flex-col items-center gap-2">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-card border-2 border-border shadow-lg"
            )}
          >
            {icons[place]}
          </div>
          <p className="font-bold text-center max-w-[100px] truncate">
            {participant.nickname}
          </p>
          <p className="text-xl font-bold text-primary tabular-nums">
            {participant.total_score.toLocaleString()}
          </p>
        </div>

        {/* Podium */}
        <div
          className={cn(
            "w-24 md:w-32 rounded-t-lg border-t-4 flex items-end justify-center pb-2",
            heights[place],
            colors[place]
          )}
        >
          <span className="text-3xl font-bold text-white drop-shadow-lg">
            {place}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {/* Second Place */}
      <PodiumPlace participant={second} place={2} />
      
      {/* First Place */}
      <PodiumPlace participant={first} place={1} />
      
      {/* Third Place */}
      <PodiumPlace participant={third} place={3} />
    </div>
  );
};

export default TopThreePodium;
