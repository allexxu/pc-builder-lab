import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Users, Zap } from "lucide-react";
import QuizLayout from "@/components/quiz/QuizLayout";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface GameSession {
  id: string;
  status: string;
  current_question: number | null;
}

const Lobby = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(0);
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gamePin) {
      navigate("/quiz/join");
      return;
    }

    // Get participant info from session storage
    const storedNickname = sessionStorage.getItem(`quiz_nickname_${gamePin}`);
    const participantId = sessionStorage.getItem(`quiz_participant_${gamePin}`);

    if (!storedNickname || !participantId) {
      navigate("/quiz/join");
      return;
    }

    setNickname(storedNickname);

    // Fetch initial session data
    const fetchSession = async () => {
      const { data: session } = await supabase
        .from("game_sessions")
        .select("id, status, current_question")
        .eq("game_pin", gamePin)
        .maybeSingle();

      if (!session) {
        navigate("/quiz/join");
        return;
      }

      // If game already started, redirect to play
      if (session.status !== "waiting") {
        navigate(`/quiz/play/${gamePin}`);
        return;
      }

      // Fetch participant count
      const { count } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id)
        .eq("is_active", true);

      setParticipantCount(count || 0);
      setLoading(false);
    };

    fetchSession();

    // Subscribe to game session changes
    const sessionChannel = supabase
      .channel(`game_session_${gamePin}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `game_pin=eq.${gamePin}`,
        },
        (payload: RealtimePostgresChangesPayload<GameSession>) => {
          const newRecord = payload.new as GameSession;
          if (newRecord.status !== "waiting") {
            navigate(`/quiz/play/${gamePin}`);
          }
        }
      )
      .subscribe();

    // Subscribe to participants joining
    const participantsChannel = supabase
      .channel(`participants_${gamePin}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "participants",
        },
        () => {
          setParticipantCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [gamePin, navigate]);

  if (loading) {
    return (
      <QuizLayout showNav={false}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout showNav={false}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Bun venit, <span className="text-primary">{nickname}</span>!
          </h1>
          <p className="text-xl text-muted-foreground">
            Așteptăm ca profesorul să înceapă jocul...
          </p>
        </div>

        {/* Animated Waiting Indicator */}
        <div className="relative mb-12">
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-t-primary border-r-primary/50 border-b-primary/20 border-l-primary/50 animate-spin" />
          </div>
          <Zap className="w-12 h-12 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Participant Count */}
        <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-4 rounded-full border border-border/50">
          <Users className="w-6 h-6 text-primary" />
          <span className="text-xl font-semibold">
            {participantCount} participanți conectați
          </span>
        </div>

        {/* Tips */}
        <div className="mt-12 text-center text-muted-foreground max-w-md">
          <p className="text-sm">
            💡 Sfat: Răspunsurile rapide și corecte îți aduc mai multe puncte!
          </p>
        </div>
      </div>
    </QuizLayout>
  );
};

export default Lobby;
