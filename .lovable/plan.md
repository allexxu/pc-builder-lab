
# Plan de Remediere a Sistemului Quiz Live

## Rezumat al Problemelor Identificate

Am identificat următoarele probleme critice în sistemul de quiz:

### Probleme Critice

1. **Punctaj 0 pentru răspunsuri corecte** - Cauza principală: politicile RLS (Row Level Security) blochează inserarea răspunsurilor pentru participanți neautentificați
2. **Scorul total nu se actualizează** - Actualizarea scorului în tabela `participants` eșuează din cauza politicilor RLS
3. **Stilizare depășită pentru quiz-urile lungi** - Indicatorii de progres din `QuestionCard` depășesc layout-ul pentru 20+ întrebări

### Probleme Secundare

4. **Race conditions în timer** - Sincronizare defectuoasă între cronometrul din frontend și starea bazei de date
5. **Lipsă gestionare erori** - Erorile la trimiterea răspunsurilor nu sunt afișate utilizatorului

---

## Soluții Propuse

### 1. Corectare Politici RLS pentru Responses și Participants

**Problema**: După migrațiile de securitate, politicile permit doar utilizatori autentificați (`TO authenticated`), dar elevii participă fără cont.

**Soluția**: Crearea unei politici care permite inserarea răspunsurilor bazat pe `participant_id` valid, nu pe autentificare.

```sql
-- Permite oricui să trimită răspunsuri dacă participantul există în sesiune activă
DROP POLICY IF EXISTS "Anyone can submit responses in active games" ON responses;

CREATE POLICY "Anyone can submit responses in active games"
ON public.responses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM participants p
    JOIN game_sessions gs ON gs.id = p.session_id
    WHERE p.id = responses.participant_id 
    AND gs.status IN ('question', 'active')
  )
);

-- Permite actualizarea scorului participanților în sesiuni active
CREATE POLICY "Anyone can update participant score in active games"
ON public.participants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = participants.session_id 
    AND gs.status != 'finished'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = participants.session_id 
    AND gs.status != 'finished'
  )
);
```

### 2. Corectare Logică de Actualizare Scor în PlayQuiz.tsx

**Problema**: Scorul se actualizează local dar nu persistent în baza de date.

**Soluția**:
- Adăugare gestionare erori pentru operațiile de bază de date
- Folosirea `points` calculat în loc de `totalScore + points` (care poate fi desincronizat)
- Adăugare retry logic pentru operațiile critice

```typescript
// În handleSelectAnswer - Corectare actualizare scor
const handleSelectAnswer = async (answerId: string) => {
  // ... calculare puncte ...
  
  try {
    // 1. Inserare răspuns
    const { error: responseError } = await supabase.from("responses").insert({
      participant_id: participantId,
      question_id: currentQuestion.id,
      answer_id: answerId,
      response_time: responseTime,
      points_earned: points,
    });

    if (responseError) {
      console.error("Error submitting response:", responseError);
      // Afișare toast cu eroare
    }

    // 2. Actualizare scor participant (folosind increment SQL)
    if (correct && points > 0) {
      const { error: scoreError } = await supabase.rpc('increment_participant_score', {
        p_participant_id: participantId,
        p_points: points
      });
      
      if (scoreError) {
        console.error("Error updating score:", scoreError);
      }
    }
  } catch (err) {
    console.error("Error in answer submission:", err);
  }
};
```

### 3. Creare Funcție SQL pentru Incrementare Scor Atomică

Pentru a evita race conditions la actualizarea scorului:

```sql
CREATE OR REPLACE FUNCTION public.increment_participant_score(
  p_participant_id uuid,
  p_points integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE participants 
  SET total_score = total_score + p_points
  WHERE id = p_participant_id;
END;
$$;
```

### 4. Corectare Componenta QuestionCard pentru Quiz-uri Lungi

**Problema**: Indicatorii de progres (punctele) depășesc layout-ul pentru 20 întrebări.

**Soluția**: Afișare condiționată - pentru quiz-uri scurte (≤10 întrebări) păstrăm punctele, pentru cele lungi folosim o bară de progres.

```typescript
// În QuestionCard.tsx
const showProgressDots = totalQuestions <= 10;

return (
  <div className={cn("w-full max-w-4xl mx-auto p-6 md:p-8", ...)}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm md:text-base text-muted-foreground font-medium">
        Întrebarea {questionNumber} din {totalQuestions}
      </span>
      
      {showProgressDots ? (
        // Puncte pentru quiz-uri scurte
        <div className="flex gap-1 flex-wrap max-w-[200px] justify-end">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < questionNumber ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      ) : (
        // Bară de progres pentru quiz-uri lungi
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
      )}
    </div>
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-tight">
      {question}
    </h2>
  </div>
);
```

### 5. Îmbunătățiri Timer și Sincronizare

**Problema**: Race condition între timer-ul local și starea din baza de date.

**Soluția**:
- Sincronizare timer cu `questionStartTime` din sesiune
- Adăugare debounce pentru actualizări realtime
- Curățare corectă a timer-ului la schimbarea întrebării

```typescript
// În PlayQuiz.tsx - Îmbunătățire timer
useEffect(() => {
  if (!currentQuestion || gameStatus !== "question") return;
  
  // Clear previous timer
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const startTime = questionStartTime || Date.now();
  const endTime = startTime + (currentQuestion.time_limit * 1000);

  const updateTimer = () => {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    setTimeRemaining(remaining);

    if (remaining <= 0 && !hasAnswered) {
      handleTimeUp();
    }
  };

  updateTimer(); // Initial update
  timerRef.current = setInterval(updateTimer, 100); // More frequent updates

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, [currentQuestion?.id, gameStatus, questionStartTime, hasAnswered]);
```

### 6. Gestionare Erori și Feedback Utilizator

Adăugare toast notifications pentru erori:

```typescript
// În PlayQuiz.tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// La erori de submitere
if (responseError) {
  toast({
    title: "Eroare la trimitere",
    description: "Răspunsul nu a putut fi salvat. Încearcă din nou.",
    variant: "destructive",
  });
}
```

---

## Plan de Implementare

### Faza 1: Baza de Date (Migrație SQL)
1. Adăugare politică RLS permisivă pentru `responses` INSERT
2. Adăugare politică RLS pentru `participants` UPDATE (scor)
3. Creare funcție `increment_participant_score`

### Faza 2: Frontend - Logica de Scor
1. Refactorizare `handleSelectAnswer` în PlayQuiz.tsx
2. Adăugare gestionare erori cu toast
3. Folosire funcție RPC pentru incrementare atomică

### Faza 3: Frontend - UI/UX
1. Fix QuestionCard pentru quiz-uri lungi
2. Îmbunătățire timer cu sincronizare precisă
3. Adăugare feedback vizual pentru erori

### Faza 4: Testare
1. Test quiz cu utilizator neautentificat
2. Test quiz cu 20 întrebări
3. Verificare persistență scor

---

## Detalii Tehnice

### Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `supabase/migrations/[new].sql` | Politici RLS + funcție RPC |
| `src/pages/quiz/PlayQuiz.tsx` | Logică scor, timer, erori |
| `src/components/quiz/QuestionCard.tsx` | Progress bar pentru quiz-uri lungi |

### Estimare Complexitate
- Migrație SQL: Medie
- PlayQuiz.tsx: Mare (refactorizare semnificativă)
- QuestionCard.tsx: Mică (adăugare condiție)

