

# Plan: Sistem Quiz Live tip Kahoot

## Viziune Generala

Vom crea o platforma completa de quiz live cu doua roluri distincte: **Admin (Profesor)** care creaza si controleaza jocurile, si **Elev** care participa in timp real folosind un PIN de joc.

Sistemul va fi integrat in aplicatia existenta, mentinand stilul vizual "tech lab" cu tema dark si accente neon.

---

## Arhitectura Aplicatiei

```text
                      FRONTEND (React)
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │   ┌─────────────┐       ┌─────────────────────┐    │
    │   │   ELEV      │       │      ADMIN          │    │
    │   │ Join Game   │       │ Dashboard + Control │    │
    │   │ Answer Q's  │       │ Create Quiz         │    │
    │   │ View Score  │       │ Manage Sessions     │    │
    │   └──────┬──────┘       └──────────┬──────────┘    │
    │          │                          │               │
    │          └──────────┬───────────────┘               │
    │                     ▼                               │
    │            ┌────────────────┐                       │
    │            │ Real-time Sync │                       │
    │            │  (Supabase)    │                       │
    │            └────────┬───────┘                       │
    └─────────────────────┼───────────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   SUPABASE   │
                   │  - Auth      │
                   │  - Database  │
                   │  - Realtime  │
                   └──────────────┘
```

---

## Pagini Noi

| Pagina | Ruta | Descriere |
|--------|------|-----------|
| Home Quiz | `/quiz` | Pagina principala cu optiuni "Creaza Joc" si "Intra in Joc" |
| Join Game | `/quiz/join` | Elevii introduc PIN + nickname |
| Lobby | `/quiz/lobby/:gamePin` | Sala de asteptare inainte de start |
| Quiz Live | `/quiz/play/:gamePin` | Afisare intrebari si raspunsuri |
| Leaderboard Final | `/quiz/results/:gamePin` | Clasament cu top 3 evidentiati |
| Admin Login | `/quiz/admin/login` | Autentificare profesor |
| Admin Dashboard | `/quiz/admin` | Lista quiz-uri, creare, editare |
| Quiz Editor | `/quiz/admin/edit/:quizId` | Editor intrebari cu preview |
| Game Control | `/quiz/admin/control/:gamePin` | Control joc live (next, end) |

---

## Structura Bazei de Date

### Tabel: `profiles` (admini/profesori)
```text
id            UUID (FK auth.users)
display_name  TEXT
avatar_url    TEXT
created_at    TIMESTAMP
```

### Tabel: `user_roles`
```text
id         UUID
user_id    UUID (FK auth.users)
role       ENUM ('admin', 'teacher', 'user')
```

### Tabel: `quizzes`
```text
id           UUID
created_by   UUID (FK profiles.id)
title        TEXT
description  TEXT
is_published BOOLEAN
created_at   TIMESTAMP
updated_at   TIMESTAMP
```

### Tabel: `questions`
```text
id           UUID
quiz_id      UUID (FK quizzes.id)
question     TEXT
order_num    INTEGER
time_limit   INTEGER (secunde, 10-30)
max_points   INTEGER (default 100)
created_at   TIMESTAMP
```

### Tabel: `answers`
```text
id           UUID
question_id  UUID (FK questions.id)
answer_text  TEXT
is_correct   BOOLEAN
order_num    INTEGER (1-4)
```

### Tabel: `game_sessions`
```text
id              UUID
quiz_id         UUID (FK quizzes.id)
game_pin        TEXT (6 caractere, unic)
status          ENUM ('waiting', 'active', 'question', 'results', 'finished')
current_question INTEGER (null = lobby)
started_at      TIMESTAMP
ended_at        TIMESTAMP
created_by      UUID (FK profiles.id)
```

### Tabel: `participants`
```text
id           UUID
session_id   UUID (FK game_sessions.id)
nickname     TEXT
joined_at    TIMESTAMP
is_active    BOOLEAN
total_score  INTEGER
```

### Tabel: `responses`
```text
id              UUID
participant_id  UUID (FK participants.id)
question_id     UUID (FK questions.id)
answer_id       UUID (FK answers.id, nullable)
response_time   INTEGER (milisecunde)
points_earned   INTEGER
answered_at     TIMESTAMP
```

---

## Flow Principal

```text
PROFESOR:
  1. Login → Dashboard
  2. Creaza Quiz (titlu, descriere, intrebari)
  3. Start Joc → Genereaza PIN (ex: 847291)
  4. Asteapta in Lobby sa se conecteze elevii
  5. Click "Start" → Afiseaza intrebari pe rand
  6. La final → Afiseaza Leaderboard

ELEV:
  1. Acceseaza /quiz/join
  2. Introduce PIN + Nickname
  3. Asteapta in Lobby
  4. Raspunde la intrebari (butoane colorate)
  5. Vede scor dupa fiecare intrebare
  6. Vede clasament final
```

---

## Componente Noi

### Generale
- `QuizLayout.tsx` - Layout pentru paginile de quiz
- `GamePin.tsx` - Afisare PIN mare cu optiune copy
- `CountdownTimer.tsx` - Timer circular cu animatie
- `QuestionCard.tsx` - Card intrebare cu 2-4 raspunsuri
- `AnswerButton.tsx` - Buton raspuns colorat (rosu, albastru, verde, galben)
- `ScorePopup.tsx` - Popup "+100 puncte!" animat
- `LeaderboardList.tsx` - Lista clasament cu animatii
- `TopThreePodium.tsx` - Podium pentru top 3 cu confetti

### Admin
- `QuizCard.tsx` - Card quiz pentru dashboard
- `QuestionEditor.tsx` - Formular editare intrebare
- `AnswerEditor.tsx` - Editor raspunsuri cu checkbox corect
- `GameControls.tsx` - Butoane Next/End pentru control
- `ParticipantsList.tsx` - Lista participanti in lobby

### Elev
- `JoinForm.tsx` - Formular PIN + nickname
- `WaitingRoom.tsx` - Ecran asteptare cu animatie
- `AnswerGrid.tsx` - Grid 2x2 cu raspunsuri
- `PersonalScore.tsx` - Scor personal live

---

## Real-time cu Supabase

### Canale Realtime:
```text
game:{gamePin}
  - game_status  (waiting → active → finished)
  - current_question (numar intrebare curenta)
  - participant_joined (nou participant)
  - participant_answered (cineva a raspuns)
  
leaderboard:{gamePin}
  - scores_updated (clasament actualizat)
```

### Subscriptii:
- **Elev** asculta: `game:{pin}` pentru schimbari stare
- **Admin** asculta: `game:{pin}` pentru raspunsuri primite
- **Toti** asculta: `leaderboard:{pin}` dupa fiecare intrebare

---

## Sistem de Punctaj

```text
Raspuns corect:     +100 puncte (baza)
Bonus viteza:       +0 la +100 puncte
                    Formula: 100 × (1 - timp_raspuns/timp_limita)
                    
Raspuns gresit:     0 puncte
Fara raspuns:       0 puncte

Exemplu:
  Timp limita: 20 secunde
  Raspuns la 5 secunde → 100 + 100×(1-5/20) = 100 + 75 = 175 puncte
  Raspuns la 18 secunde → 100 + 100×(1-18/20) = 100 + 10 = 110 puncte
```

---

## Interfata Vizuala

### Stil Kahoot adaptat la tema existenta:
- **Background**: Tema dark existenta (`--background`)
- **Culori raspunsuri**: Rosu (#E74C3C), Albastru (#3498DB), Verde (#2ECC71), Galben (#F1C40F)
- **Efecte neon**: Glow pe raspunsuri si butoane active
- **Animatii**: Countdown circular, confetti pentru top 3, slide-in pentru intrebari
- **Fonturi**: Bold, mare pentru intrebari, lizibil pe orice ecran

### Responsive:
- Mobile-first pentru elevi (butoane mari)
- Desktop optimizat pentru profesori (dashboard, control)

---

## Secventa de Implementare

### Faza 1: Infrastructura (Supabase)
1. Configurare Supabase Cloud in proiect
2. Creare tabele cu RLS policies
3. Functie generare PIN unic (6 cifre)
4. Setup Realtime channels

### Faza 2: Autentificare Admin
1. Pagina login pentru profesori
2. AuthProvider cu context
3. Protected routes pentru `/quiz/admin/*`
4. Profil admin cu rol verificat

### Faza 3: Dashboard Admin
1. Lista quiz-uri proprii
2. Buton creare quiz nou
3. Editare/stergere quiz

### Faza 4: Editor Quiz
1. Formular titlu + descriere
2. Adaugare intrebari (min 1, max 50)
3. 2-4 raspunsuri per intrebare
4. Setare timp limita per intrebare
5. Preview intrebare

### Faza 5: Join Game (Elev)
1. Pagina cu input PIN (6 cifre)
2. Input nickname (2-20 caractere)
3. Validare PIN existent si joc activ
4. Redirect la lobby dupa join

### Faza 6: Lobby si Start Joc
1. Admin vede lista participanti
2. Admin poate da kick participanti
3. Admin apasa "Start Game"
4. Elevi vad mesaj "Jocul incepe..."

### Faza 7: Quiz Live
1. Admin controleaza flow-ul (next question)
2. Elevi vad intrebarea si timer
3. Elevi apasa pe raspuns
4. Feedback instant (corect/gresit)
5. Scor actualizat in timp real

### Faza 8: Leaderboard
1. Mini-leaderboard dupa fiecare intrebare
2. Leaderboard final cu animatie
3. Podium pentru top 3 cu confetti
4. Buton "Joaca iar" pentru admin

### Faza 9: Polish si Extra
1. Sunete (countdown, corect, gresit)
2. Animatii fluide
3. Export rezultate CSV
4. Mod Practice (fara timp)

---

## Fisiere si Structura

```text
src/
├── pages/
│   └── quiz/
│       ├── QuizHome.tsx           # Pagina principala quiz
│       ├── JoinGame.tsx           # Elev introduce PIN
│       ├── Lobby.tsx              # Sala de asteptare
│       ├── PlayQuiz.tsx           # Joc live elev
│       ├── Results.tsx            # Leaderboard final
│       └── admin/
│           ├── AdminLogin.tsx     # Login profesor
│           ├── Dashboard.tsx      # Lista quiz-uri
│           ├── QuizEditor.tsx     # Editor quiz complet
│           └── GameControl.tsx    # Control joc live
├── components/
│   └── quiz/
│       ├── GamePin.tsx
│       ├── CountdownTimer.tsx
│       ├── QuestionCard.tsx
│       ├── AnswerButton.tsx
│       ├── AnswerGrid.tsx
│       ├── ScorePopup.tsx
│       ├── LeaderboardList.tsx
│       ├── TopThreePodium.tsx
│       ├── ParticipantsList.tsx
│       ├── QuizCard.tsx
│       ├── QuestionEditor.tsx
│       ├── AnswerEditor.tsx
│       └── GameControls.tsx
├── hooks/
│   └── quiz/
│       ├── useQuizSession.ts      # State joc live
│       ├── useQuizRealtime.ts     # Subscriptii realtime
│       └── useQuizAdmin.ts        # CRUD quiz-uri
├── lib/
│   ├── supabase.ts                # Client Supabase
│   └── quiz-utils.ts              # Helpers (PIN gen, punctaj)
└── integrations/
    └── supabase/
        └── types.ts               # Tipuri generate
```

---

## Sectiune Tehnica Detaliata

### RLS Policies:

```sql
-- Quizzes: doar creatorul poate edita
CREATE POLICY "Users can view published quizzes"
  ON quizzes FOR SELECT
  USING (is_published = true);

CREATE POLICY "Creators can manage own quizzes"
  ON quizzes FOR ALL
  USING (auth.uid() = created_by);

-- Participants: oricine poate participa
CREATE POLICY "Anyone can join game"
  ON participants FOR INSERT
  WITH CHECK (true);

-- Responses: doar participantul propriu
CREATE POLICY "Participants can submit answers"
  ON responses FOR INSERT
  WITH CHECK (
    participant_id IN (
      SELECT id FROM participants WHERE id = participant_id
    )
  );
```

### Generare PIN Unic:
```typescript
function generateGamePin(): string {
  // 6 cifre, evita 0 la inceput
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Verificare unicitate in DB inainte de salvare
```

### Calcul Punctaj (Edge Function):
```typescript
function calculatePoints(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitMs: number
): number {
  if (!isCorrect) return 0;
  
  const basePoints = 100;
  const speedRatio = 1 - (responseTimeMs / timeLimitMs);
  const speedBonus = Math.floor(100 * Math.max(0, speedRatio));
  
  return basePoints + speedBonus;
}
```

---

## Rezultat Asteptat

O aplicatie completa tip Kahoot unde:
- Profesorii pot crea quiz-uri interactive
- Elevii participa live cu PIN unic
- Competitie reala cu punctaj bazat pe viteza
- Leaderboard in timp real
- Design modern integrat cu tema existenta
- Invatarea devine distractiva si interactiva

