import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import QuizLayout from "@/components/quiz/QuizLayout";
import GamePin from "@/components/quiz/GamePin";
import ParticipantsList from "@/components/quiz/ParticipantsList";
import GameControls from "@/components/quiz/GameControls";
import LeaderboardList from "@/components/quiz/LeaderboardList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface GameSession {
  id: string;
  quiz_id: string;
  status: "waiting" | "active" | "question" | "results" | "finished";
  current_question: number | null;
  game_pin: string;
}

interface Participant {
  id: string;
  nickname: string;
  is_active: boolean;
  total_score: number;
}

interface Question {
  id: string;
  question: string;
  order_num: number;
  time_limit: number;
}

const GameControl = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("teacher_authenticated") === "true";
    if (!isAuthenticated) {
      navigate("/quiz/admin/login");
      return;
    }

    if (!gamePin) return;

    const fetchData = async () => {
      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from("game_sessions")
        .select("id, quiz_id, status, current_question, game_pin")
        .eq("game_pin", gamePin)
        .maybeSingle();

      if (sessionError || !sessionData) {
        toast({
          title: "Eroare",
          description: "Sesiunea nu a fost găsită.",
          variant: "destructive",
        });
        navigate("/quiz/admin");
        return;
      }

      setSession(sessionData as GameSession);

      // Fetch questions
      const { data: questionsData } = await supabase
        .from("questions")
        .select("id, question, order_num, time_limit")
        .eq("quiz_id", sessionData.quiz_id)
        .order("order_num");

      if (questionsData) {
        setQuestions(questionsData);

        if (sessionData.current_question) {
          const q = questionsData.find(
            (q) => q.order_num === sessionData.current_question
          );
          if (q) setCurrentQuestion(q);
        }
      }

      // Fetch participants
      const { data: participantsData } = await supabase
        .from("participants")
        .select("id, nickname, is_active, total_score")
        .eq("session_id", sessionData.id);

      if (participantsData) {
        setParticipants(participantsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [gamePin, navigate, toast]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!session) return;

    // Participants channel
    const participantsChannel = supabase
      .channel(`control_participants_${gamePin}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `session_id=eq.${session.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Participant>) => {
          if (payload.eventType === "INSERT") {
            setParticipants((prev) => [...prev, payload.new as Participant]);
          } else if (payload.eventType === "UPDATE") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === (payload.new as Participant).id ? (payload.new as Participant) : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            const oldParticipant = payload.old as { id: string };
            setParticipants((prev) =>
              prev.filter((p) => p.id !== oldParticipant.id)
            );
          }
        }
      )
      .subscribe();

    // Responses channel (to count answered)
    const responsesChannel = supabase
      .channel(`control_responses_${gamePin}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
        },
        () => {
          setAnsweredCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [session, gamePin]);

  const handleStart = async () => {
    if (!session || questions.length === 0) return;

    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          status: "question",
          current_question: 1,
          started_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (error) throw error;

      setSession((prev) =>
        prev ? { ...prev, status: "question", current_question: 1 } : null
      );
      setCurrentQuestion(questions[0]);
      setAnsweredCount(0);
    } catch (error) {
      console.error("Error starting game:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut porni jocul.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleNext = async () => {
    if (!session || !currentQuestion) return;

    setActionLoading(true);

    try {
      const nextQuestionNum = (session.current_question || 0) + 1;

      // First show results
      if (session.status === "question") {
        const { error } = await supabase
          .from("game_sessions")
          .update({ status: "results" })
          .eq("id", session.id);

        if (error) throw error;

        setSession((prev) => (prev ? { ...prev, status: "results" } : null));

        // Refresh participant scores
        const { data: updatedParticipants } = await supabase
          .from("participants")
          .select("id, nickname, is_active, total_score")
          .eq("session_id", session.id);

        if (updatedParticipants) {
          setParticipants(updatedParticipants);
        }
      } else {
        // Move to next question
        const { error } = await supabase
          .from("game_sessions")
          .update({
            status: "question",
            current_question: nextQuestionNum,
          })
          .eq("id", session.id);

        if (error) throw error;

        const nextQ = questions.find((q) => q.order_num === nextQuestionNum);
        setSession((prev) =>
          prev
            ? { ...prev, status: "question", current_question: nextQuestionNum }
            : null
        );
        setCurrentQuestion(nextQ || null);
        setAnsweredCount(0);
      }
    } catch (error) {
      console.error("Error advancing game:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut avansa jocul.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!session) return;

    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          status: "finished",
          ended_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (error) throw error;

      setSession((prev) => (prev ? { ...prev, status: "finished" } : null));
    } catch (error) {
      console.error("Error ending game:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut termina jocul.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleKick = async (participantId: string) => {
    try {
      await supabase
        .from("participants")
        .update({ is_active: false })
        .eq("id", participantId);

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, is_active: false } : p
        )
      );
    } catch (error) {
      console.error("Error kicking participant:", error);
    }
  };

  if (loading) {
    return (
      <QuizLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </QuizLayout>
    );
  }

  if (!session) {
    return (
      <QuizLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Sesiunea nu a fost găsită.</p>
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout>
      <div className="container py-8 max-w-4xl">
        {/* Game PIN Display */}
        <div className="text-center mb-8">
          <GamePin pin={session.game_pin} />
          <p className="text-muted-foreground mt-4">
            Elevii pot accesa quiz-ul la{" "}
            <span className="text-primary font-mono">/quiz/join</span>
          </p>
        </div>

        {/* Game Status */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            Status:{" "}
            <span className="font-semibold">
              {session.status === "waiting" && "Așteaptă participanți"}
              {session.status === "question" && `Întrebarea ${session.current_question}`}
              {session.status === "results" && "Afișare rezultate"}
              {session.status === "finished" && "Terminat"}
            </span>
          </div>
          {session.status === "question" && (
            <div className="px-4 py-2 rounded-full bg-muted">
              Răspunsuri: {answeredCount}/{participants.filter((p) => p.is_active).length}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center mb-8">
          <GameControls
            status={session.status}
            currentQuestion={session.current_question}
            totalQuestions={questions.length}
            onStart={handleStart}
            onNext={handleNext}
            onEnd={handleEnd}
            loading={actionLoading}
          />
        </div>

        {/* Current Question Preview */}
        {currentQuestion && session.status !== "waiting" && (
          <div className="mb-8 p-6 bg-card/50 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              Întrebarea curentă:
            </p>
            <p className="text-xl font-semibold">{currentQuestion.question}</p>
          </div>
        )}

        {/* Participants / Leaderboard */}
        {session.status === "waiting" ? (
          <ParticipantsList
            participants={participants}
            canKick
            onKick={handleKick}
          />
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">
              Clasament Live
            </h3>
            <LeaderboardList participants={participants} maxItems={10} />
          </div>
        )}
      </div>
    </QuizLayout>
  );
};

export default GameControl;
