import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface QuizGameRecord {
  id: string;
  session_id: string;
  quiz_title: string;
  nickname: string;
  total_score: number;
  rank: number;
  total_participants: number;
  correct_answers: number;
  total_questions: number;
  played_at: string;
}

export function useQuizHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizGameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // First get user's participations with session and quiz info
        const { data: participations, error: partError } = await supabase
          .from("participants")
          .select(`
            id,
            session_id,
            nickname,
            total_score,
            joined_at,
            game_sessions!inner (
              id,
              status,
              quiz_id,
              quizzes!inner (
                title
              )
            )
          `)
          .eq("user_id", user.id)
          .order("joined_at", { ascending: false });

        if (partError) {
          console.error("Error fetching quiz history:", partError);
          setHistory([]);
          setLoading(false);
          return;
        }

        if (!participations || participations.length === 0) {
          setHistory([]);
          setLoading(false);
          return;
        }

        // For each participation, calculate rank and stats
        const historyPromises = participations.map(async (p) => {
          const session = p.game_sessions as unknown as {
            id: string;
            status: string;
            quiz_id: string;
            quizzes: { title: string };
          };

          // Get all participants in this session for ranking
          const { data: allParticipants } = await supabase
            .from("participants")
            .select("id, total_score")
            .eq("session_id", session.id)
            .order("total_score", { ascending: false });

          const totalParticipants = allParticipants?.length || 1;
          const rank = allParticipants
            ? allParticipants.findIndex((part) => part.id === p.id) + 1
            : 1;

          // Get responses for this participant
          const { data: responses } = await supabase
            .from("responses")
            .select(`
              id,
              points_earned,
              answer_id,
              answers!inner (
                is_correct
              )
            `)
            .eq("participant_id", p.id);

          const totalQuestions = responses?.length || 0;
          const correctAnswers = responses?.filter(
            (r) => (r.answers as unknown as { is_correct: boolean })?.is_correct
          ).length || 0;

          return {
            id: p.id,
            session_id: session.id,
            quiz_title: session.quizzes.title,
            nickname: p.nickname,
            total_score: p.total_score,
            rank,
            total_participants: totalParticipants,
            correct_answers: correctAnswers,
            total_questions: totalQuestions,
            played_at: p.joined_at,
          } as QuizGameRecord;
        });

        const historyData = await Promise.all(historyPromises);
        setHistory(historyData);
      } catch (err) {
        console.error("Error in useQuizHistory:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const getRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Astăzi";
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `Acum ${diffDays} zile`;
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return {
    history,
    loading,
    getRelativeDate,
  };
}
