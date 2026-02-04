

# Plan: Analiză și Perfecționare Completă a Proiectului

## Rezumat Executiv

După analiza completă a proiectului, am identificat **12 probleme majore** grupate în 4 categorii: Securitate (CRITICĂ), Funcționalitate, UX/UI și Performanță.

---

## 1. Probleme de SECURITATE (Critice)

### 1.1 Autentificare Admin Quiz prin localStorage (FOARTE CRITICĂ)
**Fișier:** `src/pages/quiz/admin/AdminLogin.tsx`, `Dashboard.tsx`

**Problema:** Autentificarea profesorilor se face prin localStorage:
```javascript
localStorage.setItem("teacher_authenticated", "true");
```
Oricine poate deschide Console → Application → localStorage și seta manual această valoare pentru a obține acces admin.

**Soluție:** Înlocuire cu autentificare reală folosind Supabase Auth + tabelul `user_roles` existent:
- Profesorii se vor autentifica cu email/parolă reale
- Verificarea rolului se face server-side prin funcția `has_role()`
- Eliminare completă a edge function-ului `teacher-login`

### 1.2 RLS Policies cu `true` (CRITICĂ)
**Tabele afectate:** `game_sessions`, `participants`

**Problema:** Politici RLS care permit orice operație:
- `game_sessions`: `Allow all session operations` cu `USING (true)`
- `participants`: `Allow participant updates` cu `USING (true)`

**Soluție:** Rescriere politici pentru a permite:
- Doar creatorii sesiunilor să le modifice
- Doar participanții valizi să fie actualizați

### 1.3 Leaked Password Protection Disabled
**Problema:** Protecția împotriva parolelor compromise este dezactivată.

**Soluție:** Activare prin configurare Supabase Auth.

---

## 2. Probleme de FUNCȚIONALITATE

### 2.1 Leaderboard cu Date Mock
**Fișier:** `src/pages/Leaderboard.tsx`

**Problema:** Clasamentul afișează date statice hardcodate, nu date reale din `game_history` sau `user_stats`.

**Soluție:** 
- Query la `user_stats` JOIN `profiles` pentru top utilizatori
- Afișare scor real, timp, acuratețe
- Poziția utilizatorului curent calculată real

### 2.2 Index.tsx cu Date Mock
**Fișier:** `src/pages/Index.tsx`

**Problema:** Pagina principală afișează progres fals (2/6 lecții, 8750 puncte).

**Soluție:**
- Folosire hooks `useUserStats` și `useLessonProgress`
- Afișare date reale pentru utilizatorul logat
- Afișare date generice pentru vizitatori nelogați

### 2.3 Unique Constraint Lipsă în lesson_progress
**Problema:** Hook-ul folosește `onConflict: "user_id,lesson_slug"` dar nu există constraint unic definit.

**Soluție:** Migrație pentru adăugare UNIQUE constraint pe `(user_id, lesson_slug)`.

### 2.4 Quiz-uri Lecții cu Doar 3 Întrebări
**Fișier:** `src/pages/LessonDetail.tsx`

**Problema:** Fiecare lecție are doar 3 întrebări de quiz, dar `quiz_total` este setat la 5.

**Soluție:** 
- Adăugare încă 2 întrebări per lecție (total 30 întrebări noi)
- Sau modificare `quiz_total` la valoarea corectă (3)

---

## 3. Probleme de UX/UI

### 3.1 Lipsa Feedback după Signup
**Problema:** După signup, utilizatorul este auto-logat dar nu primește indicații clare.

**Soluție:** Toast de bun venit cu instrucțiuni + redirect la profil.

### 3.2 Profil Incomplet - Lipsă Editare
**Fișier:** `src/pages/Profile.tsx`

**Problema:** Butonul "Setări" afișează doar un toast "în curând" - nu există funcționalitate de editare profil.

**Soluție:** Dialog modal pentru editare:
- Schimbare nickname (display_name)
- Selectare avatar din preset-uri

### 3.3 Lecții Blocate Incorect
**Fișier:** `src/pages/Lessons.tsx`

**Problema:** Logica de blocare lecții se aplică doar utilizatorilor logați. Nelogații văd toate lecțiile ca "disponibile" dar nu pot salva progresul.

**Soluție:** 
- Toate lecțiile disponibile pentru toți (preview)
- Notificare la finalizare quiz că trebuie să se logheze pentru salvare

---

## 4. Probleme de PERFORMANȚĂ

### 4.1 Re-render-uri Multiple în GameEndScreen
**Problema:** `useEffect` fără dependențe complete poate cauza salvări multiple.

**Soluție:** Adăugare `mode`, `finalScore`, `accuracy`, etc. în dependențe sau folosire `useRef` pentru tracking.

### 4.2 Queries fără Optimizare
**Problema:** Hook-urile nu folosesc React Query pentru caching.

**Soluție:** Refactor hooks pentru a beneficia de cache-ul TanStack Query deja instalat.

---

## Plan de Implementare (Ordine de Prioritate)

### Faza 1: Securitate (CRITICĂ)
1. **Migrație DB** - Ștergere politici RLS cu `true`, adăugare politici corecte
2. **Refactor AdminLogin** - Folosire Supabase Auth + verificare rol `teacher`
3. **Actualizare Dashboard** - Verificare rol prin `useAuth().isTeacher`
4. **Ștergere edge function** - Eliminare `teacher-login` (redundant)
5. **Activare Leaked Password Protection**

### Faza 2: Funcționalitate Core
1. **Leaderboard Real** - Query date din `user_stats` + `profiles`
2. **Index cu Date Reale** - Integrare hooks pentru utilizatorul logat
3. **Fix Unique Constraint** - Migrație pentru `lesson_progress`
4. **Fix Quiz Total** - Setare corectă a numărului de întrebări

### Faza 3: UX/UI
1. **Modal Editare Profil** - Dialog pentru schimbare nume/avatar
2. **Improve Onboarding** - Mesaje mai clare la signup/login
3. **Fix Lecții pentru Nelogați** - UX consistent

### Faza 4: Optimizări
1. **React Query Integration** - Caching pentru queries
2. **Fix useEffect** - Dependențe corecte

---

## Fișiere de Modificat

| Fișier | Tip Modificare |
|--------|----------------|
| `supabase/migrations/xxx.sql` | Nou - RLS policies + constraints |
| `src/pages/quiz/admin/AdminLogin.tsx` | Refactor complet |
| `src/pages/quiz/admin/Dashboard.tsx` | Refactor autentificare |
| `src/pages/Leaderboard.tsx` | Date reale |
| `src/pages/Index.tsx` | Integrare hooks |
| `src/pages/Profile.tsx` | Adăugare editare |
| `src/pages/LessonDetail.tsx` | Fix quiz_total |
| `src/contexts/AuthContext.tsx` | Verificare rol teacher |
| `supabase/functions/teacher-login/` | Ștergere |

---

## Rezultat Final

După implementare:
- Sistem de autentificare profesori **securizat** prin Supabase Auth
- Politici RLS **restrictive** care protejează datele
- Leaderboard **funcțional** cu date reale
- Pagină principală **personalizată** per utilizator
- Profil **editabil** 
- Cod **optimizat** pentru performanță

---

## Detalii Tehnice

### Migrație SQL pentru Securitate

```text
-- Ștergere politici periculoase
DROP POLICY IF EXISTS "Allow all session operations" ON game_sessions;
DROP POLICY IF EXISTS "Allow participant updates" ON participants;
DROP POLICY IF EXISTS "Allow viewing participants" ON participants;

-- Politici noi restrictive pentru game_sessions
CREATE POLICY "Teachers can manage sessions" ON game_sessions
  FOR ALL USING (
    has_role(auth.uid(), 'teacher') OR 
    has_role(auth.uid(), 'admin') OR
    created_by = auth.uid()
  );

-- Politici pentru participants  
CREATE POLICY "Teachers can update participants" ON participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = session_id 
      AND (gs.created_by = auth.uid() OR has_role(auth.uid(), 'teacher'))
    )
  );

-- Unique constraint pentru lesson_progress
ALTER TABLE lesson_progress 
  ADD CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_slug);
```

### Structura Noului AdminLogin

```text
1. Form cu email + parolă
2. supabase.auth.signInWithPassword()
3. După login, verificare has_role(user.id, 'teacher')
4. Dacă nu e teacher → redirect cu eroare
5. Dacă e teacher → redirect la Dashboard
```

### Query pentru Leaderboard Real

```text
SELECT 
  p.display_name,
  us.best_score,
  us.best_time_seconds,
  us.total_games,
  us.total_accuracy / NULLIF(us.total_games, 0) as avg_accuracy
FROM user_stats us
JOIN profiles p ON p.id = us.user_id
WHERE us.best_score > 0
ORDER BY us.best_score DESC
LIMIT 20
```

