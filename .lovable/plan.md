

# Plan: Profil Funcțional Complet cu Autentificare și Date Reale

## Rezumat
Voi transforma pagina de profil dintr-o pagină cu date statice (mock) într-un sistem complet funcțional cu:
- Autentificare reală (login/signup cu email și parolă)
- Date de profil salvate în baza de date
- Progres lecții urmărit și salvat
- Istoric jocuri cu scoruri reale
- Sistem de achievements real bazat pe acțiuni

---

## Ce voi implementa

### 1. Pagină de Autentificare Nouă
Voi crea o pagină dedicată `/auth` cu:
- Formular de **Login** (email + parolă)
- Formular de **Signup** (email + parolă + nume afișat)
- Redirectare automată după autentificare
- Mesaje de eroare clare în română

### 2. Tabele Noi în Baza de Date
Voi adăuga 4 tabele pentru a stoca toate datele utilizatorului:

**a) `lesson_progress`** - Progresul la lecții
- Ce lecții a completat utilizatorul
- Scorul la quiz pentru fiecare lecție
- Data completării

**b) `game_history`** - Istoricul jocurilor
- Scorul final
- Modul de joc (training/challenge/ranked)
- Timpul de joc și acuratețea
- Data jocului

**c) `user_achievements`** - Achievement-uri deblocate
- Ce badge-uri are utilizatorul
- Când le-a deblocat

**d) `user_stats`** - Statistici agregate
- Cel mai bun scor
- Total jocuri
- Acuratețe medie
- Cel mai bun timp

### 3. Logică de Tracking
- La finalizarea unei lecții cu quiz, se salvează progresul
- La finalizarea unui joc, se salvează scorul în istoric
- Achievement-urile se verifică și deblochează automat
- Statisticile se actualizează în timp real

### 4. Actualizarea Paginii de Profil
- Afișare date reale din baza de date
- Loading state când se încarcă datele
- Redirectare la `/auth` dacă nu e logat
- Posibilitate de editare nume și avatar

### 5. Sistem de Achievements Complet
6 achievement-uri cu condiții reale:
1. **Primul Pas** - Completează prima lecție
2. **RAM Whisperer** - Plasează RAM corect de 10 ori
3. **Cable Master** - Finalizează un joc fără greșeli la cabluri
4. **Speed Demon** - Finalizează jocul în sub 3 minute
5. **Perfect Run** - 0 greșeli în modul Challenge
6. **Top 10** - Ajunge în Top 10 pe leaderboard

---

## Detalii Tehnice

### Schema Bazei de Date

```text
lesson_progress
├── id (uuid, PK)
├── user_id (uuid, FK -> auth.users)
├── lesson_slug (text) - ex: "placa-de-baza"
├── completed (boolean)
├── quiz_score (integer, nullable)
├── quiz_total (integer, default 5)
├── completed_at (timestamp)

game_history
├── id (uuid, PK)
├── user_id (uuid, FK -> auth.users)
├── mode (text) - training/challenge/ranked
├── score (integer)
├── time_seconds (integer)
├── accuracy (integer) - procentaj
├── mistakes (integer)
├── completed (boolean)
├── played_at (timestamp)

user_achievements
├── id (uuid, PK)
├── user_id (uuid, FK -> auth.users)
├── achievement_id (text) - ex: "first_step"
├── unlocked_at (timestamp)
├── UNIQUE(user_id, achievement_id)

user_stats
├── user_id (uuid, PK, FK -> auth.users)
├── best_score (integer, default 0)
├── best_time_seconds (integer, nullable)
├── total_games (integer, default 0)
├── total_accuracy (integer, default 0) - suma acurateților
├── lessons_completed (integer, default 0)
├── rank (integer, nullable)
├── updated_at (timestamp)
```

### Politici RLS (Row Level Security)
- Utilizatorii pot citi/scrie doar propriile date
- Leaderboard-ul permite citirea scorurilor publice
- Statisticile sunt private per utilizator

### Fișiere de Modificat/Creat

**Fișiere Noi:**
- `src/pages/Auth.tsx` - Pagină de login/signup
- `src/hooks/useLessonProgress.ts` - Hook pentru progres lecții
- `src/hooks/useGameHistory.ts` - Hook pentru istoric jocuri
- `src/hooks/useAchievements.ts` - Hook pentru achievements

**Fișiere de Modificat:**
- `src/App.tsx` - Adăugare rută `/auth`
- `src/pages/Profile.tsx` - Înlocuire date mock cu date reale
- `src/pages/Lessons.tsx` - Conectare la progres real
- `src/pages/LessonDetail.tsx` - Salvare progres la completare quiz
- `src/components/game/GameBoard.tsx` - Salvare scor la finalizare
- `src/hooks/useGameState.ts` - Integrare salvare
- `src/components/layout/Navbar.tsx` - Link corect la Auth/Profil

### Fluxul Utilizatorului

```text
1. Utilizator nelogat → Navbar arată "Conectare" → Click → /auth
2. Signup → Verificare email → Login → Redirectare /profil
3. Parcurge lecții → Completează quiz → Progres salvat
4. Joacă joc → Finalizează → Scor salvat + Achievement verificat
5. Profil → Vezi toate datele reale + Achievements
```

---

## Ordine de Implementare

1. **Migrare DB** - Creez tabelele și politicile RLS
2. **Pagină Auth** - Formular login/signup funcțional
3. **Hooks de date** - useLessonProgress, useGameHistory, useAchievements
4. **Actualizare Profil** - Conectare la hooks și afișare date reale
5. **Integrare Lecții** - Salvare automată progres quiz
6. **Integrare Joc** - Salvare automată scor și verificare achievements
7. **Navbar** - Logică dinamică pentru utilizator logat/nelogat

---

## Rezultat Final

După implementare, utilizatorul va avea:
- Cont propriu cu email și parolă
- Progres salvat permanent între sesiuni
- Istoric complet al jocurilor
- Badge-uri care se deblochează automat
- Statistici calculate din date reale
- Experiență personalizată pe toată platforma

