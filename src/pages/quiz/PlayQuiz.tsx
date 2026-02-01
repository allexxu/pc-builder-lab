import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import QuizLayout from "@/components/quiz/QuizLayout";
import QuestionCard from "@/components/quiz/QuestionCard";
import AnswerGrid from "@/components/quiz/AnswerGrid";
import CountdownTimer from "@/components/quiz/CountdownTimer";
import ScorePopup from "@/components/quiz/ScorePopup";
import LeaderboardList from "@/components/quiz/LeaderboardList";
import { supabase } from "@/integrations/supabase/client";
import { calculatePoints } from "@/lib/quiz-utils";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Question {
  id: string;
  question: string;
  order_num: number;
  time_limit: number;
  answers: Answer[];
}

interface Answer {
  id: string;
  answer_text: string;
  order_num: number;
  is_correct: boolean;
}

interface GameSession {
  id: string;
  status: string;
  current_question: number | null;
  quiz_id: string;
}

interface Participant {
  id: string;
  nickname: string;
  total_score: number;
}

const PlayQuiz = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<GameSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [gameStatus, setGameStatus] = useState<string>("waiting");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (!gamePin) {
      navigate("/quiz/join");
      return;
    }

    const storedParticipantId = sessionStorage.getItem(`quiz_participant_${gamePin}`);
    if (!storedParticipantId) {
      navigate("/quiz/join");
      return;
    }

    setParticipantId(storedParticipantId);

    const fetchData = async () => {
      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from("game_sessions")
        .select("id, status, current_question, quiz_id")
        .eq("game_pin", gamePin)
        .maybeSingle();

      if (sessionError || !sessionData) {
        navigate("/quiz/join");
        return;
      }

      if (sessionData.status === "finished") {
        navigate(`/quiz/results/${gamePin}`);
        return;
      }

      setSession(sessionData);
      sessionIdRef.current = sessionData.id;
      setGameStatus(sessionData.status);

      // Fetch questions with answers
      const { data: questionsData } = await supabase
        .from("questions")
        .select(`
          id,
          question,
          order_num,
          time_limit,
          answers (
            id,
            answer_text,
            order_num,
            is_correct
          )
        `)
        .eq("quiz_id", sessionData.quiz_id)
        .order("order_num");

      if (questionsData) {
        setQuestions(questionsData as Question[]);

        // Set current question if game is in progress
        if (sessionData.current_question !== null && sessionData.current_question > 0) {
          const q = questionsData.find(
            (q) => q.order_num === sessionData.current_question
          );
          if (q) {
            setCurrentQuestion(q as Question);
            setTimeRemaining(q.time_limit);
            setQuestionStartTime(Date.now());
          }
        }
      }

      // Fetch participants for leaderboard
      await fetchParticipantsData(sessionData.id, storedParticipantId);

      setLoading(false);
    };

    fetchData();
  }, [gamePin, navigate]);

  // Helper to fetch participants
  const fetchParticipantsData = async (sessionId: string, myParticipantId: string | null) => {
    const { data: participantsData } = await supabase
      .from("participants")
      .select("id, nickname, total_score")
      .eq("session_id", sessionId)
      .eq("is_active", true)
      .order("total_score", { ascending: false });

    if (participantsData) {
      setParticipants(participantsData);
      if (myParticipantId) {
        const me = participantsData.find((p) => p.id === myParticipantId);
        if (me) setTotalScore(me.total_score);
      }
    }
  };

  // Subscribe to session changes
  useEffect(() => {
    if (!gamePin) return;

    console.log("[PlayQuiz] Setting up realtime subscription for game:", gamePin);

    const channel = supabase
      .channel(`play_session_${gamePin}_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `game_pin=eq.${gamePin}`,
        },
        async (payload: RealtimePostgresChangesPayload<GameSession>) => {
          console.log("[PlayQuiz] Realtime update received:", payload.new);
          const newSession = payload.new as GameSession;
          setSession(newSession);
          setGameStatus(newSession.status);

          if (newSession.status === "finished") {
            console.log("[PlayQuiz] Game finished, redirecting to results");
            navigate(`/quiz/results/${gamePin}`);
            return;
          }

          if (newSession.status === "results") {
            console.log("[PlayQuiz] Showing results/leaderboard");
            // Clear timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            
            // Refresh participants for leaderboard
            if (sessionIdRef.current) {
              await fetchParticipantsData(sessionIdRef.current, participantId);
            }
          }

          if (
            newSession.status === "question" &&
            newSession.current_question !== null
          ) {
            console.log("[PlayQuiz] New question:", newSession.current_question);
            // Find the question from our cached questions list
            const q = questions.find(
              (q) => q.order_num === newSession.current_question
            );
            if (q) {
              console.log("[PlayQuiz] Setting up question:", q.question);
              // Reset for new question
              setSelectedAnswer(null);
              setHasAnswered(false);
              setShowScorePopup(false);
              setPointsEarned(0);
              setIsCorrect(false);
              setCurrentQuestion(q);
              setTimeRemaining(q.time_limit);
              setQuestionStartTime(Date.now());
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("[PlayQuiz] Subscription status:", status);
      });

    return () => {
      console.log("[PlayQuiz] Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [gamePin, navigate, questions, participantId]);

  // Countdown timer - synced with question time limit
  useEffect(() => {
    if (!currentQuestion || gameStatus !== "question" || timeRemaining <= 0) {
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - submit empty answer if not already answered
          if (!hasAnswered) {
            handleTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion?.id, gameStatus]);

  const handleTimeUp = useCallback(async () => {
    if (!participantId || !currentQuestion || hasAnswered) return;

    setHasAnswered(true);
    setPointsEarned(0);
    setIsCorrect(false);
    setShowScorePopup(true);

    // Submit empty response
    await supabase.from("responses").insert({
      participant_id: participantId,
      question_id: currentQuestion.id,
      answer_id: null,
      response_time: currentQuestion.time_limit * 1000,
      points_earned: 0,
    });

    setTimeout(() => setShowScorePopup(false), 2000);
  }, [participantId, currentQuestion, hasAnswered]);

  const handleSelectAnswer = async (answerId: string) => {
    if (!participantId || !currentQuestion || hasAnswered) return;

    const responseTime = Date.now() - questionStartTime;
    const answer = currentQuestion.answers.find((a) => a.id === answerId);
    const correct = answer?.is_correct || false;
    const points = calculatePoints(
      correct,
      responseTime,
      currentQuestion.time_limit * 1000
    );

    setSelectedAnswer(answerId);
    setHasAnswered(true);
    setIsCorrect(correct);
    setPointsEarned(points);
    setShowScorePopup(true);

    if (correct) {
      setTotalScore((prev) => prev + points);
    }

    // Submit response
    await supabase.from("responses").insert({
      participant_id: participantId,
      question_id: currentQuestion.id,
      answer_id: answerId,
      response_time: responseTime,
      points_earned: points,
    });

    // Update participant score
    if (correct) {
      await supabase
        .from("participants")
        .update({ total_score: totalScore + points })
        .eq("id", participantId);
    }

    setTimeout(() => setShowScorePopup(false), 2000);
  };

  if (loading) {
    return (
      <QuizLayout showNav={false}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </QuizLayout>
    );
  }

  // Waiting for first question
  if (!currentQuestion || gameStatus === "waiting") {
    return (
      <QuizLayout showNav={false}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in">
          <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
          <p className="text-xl text-muted-foreground">
            Pregătește-te... Jocul începe!
          </p>
        </div>
      </QuizLayout>
    );
  }

  // Show leaderboard between questions (when status is "results")
  if (gameStatus === "results") {
    return (
      <QuizLayout showNav={false}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Clasament</h2>
          <p className="text-muted-foreground mb-6">
            Scorul tău: <span className="text-primary font-bold">{totalScore}</span> puncte
          </p>
          <LeaderboardList
            participants={participants}
            currentParticipantId={participantId || undefined}
            maxItems={5}
          />
          <p className="mt-8 text-muted-foreground animate-pulse">
            Următoarea întrebare vine în curând...
          </p>
        </div>
      </QuizLayout>
    );
  }

  // Answered state - waiting for results
  if (hasAnswered && gameStatus === "question") {
    return (
      <QuizLayout showNav={false}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
          <div className="text-center mb-8">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4 animate-scale-in" />
                <h2 className="text-3xl font-bold text-primary mb-2">Corect!</h2>
                <p className="text-xl text-muted-foreground">
                  +{pointsEarned} puncte
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">❌</span>
                </div>
                <h2 className="text-3xl font-bold text-destructive mb-2">
                  {selectedAnswer ? "Greșit!" : "Timpul a expirat!"}
                </h2>
                <p className="text-xl text-muted-foreground">
                  0 puncte
                </p>
              </>
            )}
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>Așteptăm ceilalți participanți...</span>
            </div>
          </div>

          <div className="mt-6 text-lg font-semibold">
            Scor total: <span className="text-primary">{totalScore}</span>
          </div>
        </div>

        {/* Score Popup */}
        <ScorePopup
          points={pointsEarned}
          isCorrect={isCorrect}
          show={showScorePopup}
        />
      </QuizLayout>
    );
  }

  // Active question state
  return (
    <QuizLayout showNav={false}>
      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-6 animate-fade-in">
        {/* Timer and Score */}
        <div className="flex items-center justify-between w-full max-w-4xl">
          <div className="text-lg font-semibold">
            Scor: <span className="text-primary">{totalScore}</span>
          </div>
          <CountdownTimer
            seconds={timeRemaining}
            totalSeconds={currentQuestion.time_limit}
            size="small"
          />
        </div>

        {/* Question */}
        <QuestionCard
          questionNumber={currentQuestion.order_num}
          totalQuestions={questions.length}
          question={currentQuestion.question}
        />

        {/* Answers */}
        <AnswerGrid
          answers={currentQuestion.answers}
          selectedId={selectedAnswer}
          correctId={undefined}
          showResult={false}
          disabled={hasAnswered || timeRemaining <= 0}
          onSelect={handleSelectAnswer}
        />

        {/* Score Popup */}
        <ScorePopup
          points={pointsEarned}
          isCorrect={isCorrect}
          show={showScorePopup}
        />
      </div>
    </QuizLayout>
  );
};

export default PlayQuiz;