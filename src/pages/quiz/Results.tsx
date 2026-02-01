import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trophy, Home, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizLayout from "@/components/quiz/QuizLayout";
import TopThreePodium from "@/components/quiz/TopThreePodium";
import LeaderboardList from "@/components/quiz/LeaderboardList";
import { supabase } from "@/integrations/supabase/client";

interface Participant {
  id: string;
  nickname: string;
  total_score: number;
}

const Results = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);

  useEffect(() => {
    if (!gamePin) {
      navigate("/quiz");
      return;
    }

    const storedParticipantId = sessionStorage.getItem(`quiz_participant_${gamePin}`);
    setParticipantId(storedParticipantId);

    const fetchResults = async () => {
      // Fetch session
      const { data: session } = await supabase
        .from("game_sessions")
        .select("id")
        .eq("game_pin", gamePin)
        .maybeSingle();

      if (!session) {
        navigate("/quiz");
        return;
      }

      // Fetch all participants with scores
      const { data: participantsData } = await supabase
        .from("participants")
        .select("id, nickname, total_score")
        .eq("session_id", session.id)
        .eq("is_active", true)
        .order("total_score", { ascending: false });

      if (participantsData) {
        setParticipants(participantsData);

        // Find my rank
        if (storedParticipantId) {
          const myIndex = participantsData.findIndex(
            (p) => p.id === storedParticipantId
          );
          if (myIndex !== -1) {
            setMyRank(myIndex + 1);
            setMyScore(participantsData[myIndex].total_score);
          }
        }
      }

      setLoading(false);
    };

    fetchResults();
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
      <div className="flex-1 flex flex-col items-center px-4 py-8 overflow-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Clasament Final
          </h1>
          {myRank && (
            <p className="text-xl text-muted-foreground">
              Ai terminat pe locul{" "}
              <span className="text-primary font-bold">#{myRank}</span> cu{" "}
              <span className="text-primary font-bold">{myScore}</span> puncte!
            </p>
          )}
        </div>

        {/* Podium for Top 3 */}
        {participants.length >= 3 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <TopThreePodium participants={participants} />
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Toți Participanții
          </h2>
          <LeaderboardList
            participants={participants}
            currentParticipantId={participantId || undefined}
            showAll
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/quiz">
              <Home className="w-5 h-5 mr-2" />
              Pagina Principală
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/quiz/join">
              <RotateCcw className="w-5 h-5 mr-2" />
              Joacă Din Nou
            </Link>
          </Button>
        </div>
      </div>
    </QuizLayout>
  );
};

export default Results;
