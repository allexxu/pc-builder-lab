
# Plan: Sincronizare Utilizatori Autentificați cu Quiz și Istoric în Profil

## Rezumat
Voi implementa sincronizarea automată a utilizatorilor autentificați cu sistemul de quiz, astfel încât nickname-ul să fie pre-populat automat, și voi adăuga un tab în profil pentru afișarea istoricului jocurilor de quiz.

## Modificări Necesare

### 1. Actualizare Schema Baze de Date

**Tabelul `participants`** - Adaugă coloana `user_id`:
- Adaugă `user_id uuid REFERENCES auth.users(id)` (opțional, pentru a permite și jucători neautentificați)
- Adaugă index pe `user_id` pentru interogări rapide

```text
participants
├── id (uuid, PK)
├── session_id (uuid, FK)
├── user_id (uuid, FK → auth.users) ← NOU
├── nickname (text)
├── total_score (integer)
├── joined_at (timestamp)
└── is_active (boolean)
```

### 2. Modificare JoinGame.tsx

**Pre-populare automată a nickname-ului:**
- Import `useAuth` pentru a verifica dacă utilizatorul este autentificat
- Dacă este autentificat, setează automat nickname-ul din `user.user_metadata.display_name`
- Afișează un mesaj de bun venit și ascunde input-ul de nickname (sau îl face read-only)
- La submit, include `user_id` în inserția participantului

```text
Flow pentru utilizator autentificat:
┌─────────────────────────────────────┐
│  Cod de acces: [______]             │
│                                     │
│  ✓ Autentificat ca: NumeTău 🎮      │
│    (nickname-ul tău din profil)     │
│                                     │
│  [Intră în Joc]                     │
└─────────────────────────────────────┘

Flow pentru utilizator neautentificat:
┌─────────────────────────────────────┐
│  Cod de acces: [______]             │
│                                     │
│  Nickname: [__________]             │
│  0/20 caractere                     │
│                                     │
│  [Intră în Joc]                     │
└─────────────────────────────────────┘
```

### 3. Hook Nou: useQuizHistory.ts

Creează un hook pentru a prelua istoricul jocurilor de quiz:

```typescript
interface QuizGameRecord {
  id: string;
  session_id: string;
  quiz_title: string;
  nickname: string;
  total_score: number;
  rank: number;
  total_participants: number;
  questions_answered: number;
  correct_answers: number;
  played_at: string;
}
```

**Logica de interogare:**
- Join `participants` cu `game_sessions` și `quizzes` pentru titlul quiz-ului
- Calculează rank-ul pe baza scorului în sesiune
- Calculează răspunsuri corecte din `responses`

### 4. Actualizare Profile.tsx

**Adaugă tab nou "Istoric Quiz":**
- Adaugă un tab nou `quiz-history` în componenta Tabs
- Afișează lista de jocuri de quiz cu:
  - Titlul quiz-ului
  - Scorul obținut
  - Rank-ul în acea sesiune (ex: #2 din 15)
  - Răspunsuri corecte
  - Data jocului
- Link pentru a juca din nou

### 5. Actualizare RLS Policies

Adaugă politici pentru a permite utilizatorilor să-și vadă propriile participări:

```sql
CREATE POLICY "Users can view own quiz participation"
ON public.participants FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

---

## Detalii Tehnice

### Migrare SQL

```sql
-- 1. Adaugă coloana user_id
ALTER TABLE public.participants 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index pentru performanță
CREATE INDEX idx_participants_user_id ON public.participants(user_id);

-- 3. RLS pentru istoricul propriu
CREATE POLICY "Users can view own quiz participation"
ON public.participants FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Fișiere Modificate

| Fișier | Modificare |
|--------|------------|
| `supabase/migrations/xxx.sql` | Adaugă `user_id` și politici RLS |
| `src/pages/quiz/JoinGame.tsx` | Pre-populare nickname, include `user_id` |
| `src/hooks/useQuizHistory.ts` | Hook nou pentru istoricul quiz-urilor |
| `src/pages/Profile.tsx` | Tab nou "Istoric Quiz" |
| `src/integrations/supabase/types.ts` | Se regenerează automat |

### Compatibilitate

- Jucătorii neautentificați pot juca în continuare (user_id rămâne NULL)
- Jucătorii autentificați primesc nickname-ul automat, dar îl pot schimba dacă doresc
- Istoricul apare doar pentru jocurile jucate după implementare (sau pentru toate dacă user_id a fost setat)

---

## Estimare

- **Schema DB**: 1 migrare SQL
- **Componente React**: 2 fișiere modificate + 1 hook nou
- **Timp estimat**: ~15 minute
