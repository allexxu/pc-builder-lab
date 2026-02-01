import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LessonProgress {
  lesson_slug: string;
  completed: boolean;
  quiz_score: number | null;
  quiz_total: number;
  completed_at: string | null;
}

export function useLessonProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_slug, completed, quiz_score, quiz_total, completed_at")
        .eq("user_id", user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (err) {
      console.error("Error fetching lesson progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markLessonComplete = async (lessonSlug: string, quizScore?: number) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_slug: lessonSlug,
          completed: true,
          quiz_score: quizScore ?? null,
          quiz_total: 5,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_slug"
        });

      if (error) throw error;
      
      // Update user stats
      await updateLessonsCount();
      
      await fetchProgress();
      return { error: null };
    } catch (err) {
      console.error("Error marking lesson complete:", err);
      return { error: err as Error };
    }
  };

  const updateLessonsCount = async () => {
    if (!user) return;

    try {
      // Count completed lessons
      const { count } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);

      // Update user stats
      await supabase
        .from("user_stats")
        .upsert({
          user_id: user.id,
          lessons_completed: count || 0,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });
    } catch (err) {
      console.error("Error updating lessons count:", err);
    }
  };

  const getLessonProgress = (lessonSlug: string): LessonProgress | undefined => {
    return progress.find(p => p.lesson_slug === lessonSlug);
  };

  const getCompletedCount = () => {
    return progress.filter(p => p.completed).length;
  };

  return {
    progress,
    loading,
    markLessonComplete,
    getLessonProgress,
    getCompletedCount,
    refetch: fetchProgress,
  };
}
