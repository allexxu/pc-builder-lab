import { cn } from "@/lib/utils";
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Participant {
  id: string;
  nickname: string;
  is_active: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  canKick?: boolean;
  onKick?: (participantId: string) => void;
}

const ParticipantsList = ({
  participants,
  canKick = false,
  onKick,
}: ParticipantsListProps) => {
  const activeParticipants = participants.filter((p) => p.is_active);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Participanți</h3>
        <span className="text-sm text-muted-foreground">
          {activeParticipants.length} conectați
        </span>
      </div>

      {activeParticipants.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Așteaptă participanți...</p>
          <p className="text-sm">Elevii pot intra folosind codul de acces</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activeParticipants.map((participant, index) => (
            <div
              key={participant.id}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-primary/10 border border-primary/30",
                "animate-in fade-in slide-in-from-bottom-2",
                "transition-all duration-300"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">{participant.nickname}</span>
              {canKick && onKick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-destructive/20"
                  onClick={() => onKick(participant.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;
