import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
      const { data: participantsData } = await supabase
        .from("participants")
        .select("id, nickname, total_score")
        .eq("session_id", sessionData.id)
        .eq("is_active", true);

      if (participantsData) {
        setParticipants(participantsData);
        const me = participantsData.find((p) => p.id === storedParticipantId);
        if (me) setTotalScore(me.total_score);
      }

      setLoading(false);
    };

    fetchData();
  }, [gamePin, navigate]);

  // Subscribe to session changes
  useEffect(() => {
    if (!gamePin || !session) return;

    const channel = supabase
      .channel(`play_session_${gamePin}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `game_pin=eq.${gamePin}`,
        },
        (payload: RealtimePostgresChangesPayload<GameSession>) => {
          const newSession = payload.new as GameSession;
          setSession(newSession);

          if (newSession.status === "finished") {
            navigate(`/quiz/results/${gamePin}`);
            return;
          }

          if (newSession.status === "results") {
            setShowLeaderboard(true);
            setShowResult(true);
          }

          if (
            newSession.status === "question" &&
            newSession.current_question !== null
          ) {
            const q = questions.find(
              (q) => q.order_num === newSession.current_question
            );
            if (q) {
              // Reset for new question
              setSelectedAnswer(null);
              setShowResult(false);
              setShowLeaderboard(false);
              setShowScorePopup(false);
              setCurrentQuestion(q);
              setTimeRemaining(q.time_limit);
              setQuestionStartTime(Date.now());
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gamePin, session, questions, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!currentQuestion || showResult || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Time's up - submit empty answer if not already answered
          if (!selectedAnswer) {
            handleTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, showResult, selectedAnswer]);

  const handleTimeUp = useCallback(async () => {
    if (!participantId || !currentQuestion || selectedAnswer) return;

    setShowResult(true);
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
  }, [participantId, currentQuestion, selectedAnswer]);

  const handleSelectAnswer = async (answerId: string) => {
    if (!participantId || !currentQuestion || selectedAnswer) return;

    const responseTime = Date.now() - questionStartTime;
    const answer = currentQuestion.answers.find((a) => a.id === answerId);
    const correct = answer?.is_correct || false;
    const points = calculatePoints(
      correct,
      responseTime,
      currentQuestion.time_limit * 1000
    );

    setSelectedAnswer(answerId);
    setIsCorrect(correct);
    setPointsEarned(points);
    setShowResult(true);
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
  if (!currentQuestion) {
    return (
      <QuizLayout showNav={false}>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
          <p className="text-xl text-muted-foreground">
            Pregătește-te... Jocul începe!
          </p>
        </div>
      </QuizLayout>
    );
  }

  // Show mini-leaderboard between questions
  if (showLeaderboard && showResult) {
    return (
      <QuizLayout showNav={false}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
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

  return (
    <QuizLayout showNav={false}>
      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-6">
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
          correctId={
            showResult
              ? currentQuestion.answers.find((a) => a.is_correct)?.id
              : undefined
          }
          showResult={showResult}
          disabled={!!selectedAnswer || timeRemaining <= 0}
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
