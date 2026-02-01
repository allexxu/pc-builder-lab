import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface Participant {
  id: string;
  nickname: string;
  total_score: number;
}

interface LeaderboardListProps {
  participants: Participant[];
  currentParticipantId?: string;
  showAll?: boolean;
  maxItems?: number;
}

const LeaderboardList = ({
  participants,
  currentParticipantId,
  showAll = false,
  maxItems = 10,
}: LeaderboardListProps) => {
  const sorted = [...participants].sort((a, b) => b.total_score - a.total_score);
  const displayed = showAll ? sorted : sorted.slice(0, maxItems);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/50";
      default:
        return "bg-card/50 border-border/50";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {displayed.map((participant, index) => {
        const rank = index + 1;
        const isCurrentUser = participant.id === currentParticipantId;

        return (
          <div
            key={participant.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all",
              getRankStyle(rank),
              isCurrentUser && "ring-2 ring-primary"
            )}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(rank)}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-semibold truncate",
                  isCurrentUser && "text-primary"
                )}
              >
                {participant.nickname}
                {isCurrentUser && " (Tu)"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold tabular-nums">
                {participant.total_score.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">puncte</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaderboardList;
