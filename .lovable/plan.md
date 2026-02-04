
# Plan: Remediere Vulnerabilități și Îmbunătățiri Rămase

## Rezumat

După o analiză completă a proiectului, am identificat **2 probleme critice** și **5 probleme medii** care necesită remediere.

---

## Probleme Identificate

### CRITICE (Blocker - trebuie remediate imediat)

#### 1. Autentificare localStorage în QuizEditor și GameControl
**Fișiere afectate:** 
- `src/pages/quiz/admin/QuizEditor.tsx` (linia 63)
- `src/pages/quiz/admin/GameControl.tsx` (linia 57)

**Problema:** Aceste două fișiere încă folosesc verificarea nesigură:
```javascript
const isAuthenticated = localStorage.getItem("teacher_authenticated") === "true";
```
Deși `AdminLogin.tsx` și `Dashboard.tsx` au fost refactorizate să folosească Supabase Auth, QuizEditor și GameControl au rămas cu verificarea veche prin localStorage.

**Soluție:** Înlocuire cu verificare prin hook-ul `useAuth()`:
- Import `useAuth` din context
- Verificare `isTeacher` în loc de localStorage
- Redirect la login dacă nu e autentificat sau nu e profesor

#### 2. Placeholder UUID în QuizEditor
**Fișier:** `src/pages/quiz/admin/QuizEditor.tsx` (linia 249)

**Problema:** La crearea unui quiz nou:
```javascript
created_by: "00000000-0000-0000-0000-000000000000", // Teacher placeholder
```
Se folosește un UUID fals în loc de ID-ul real al utilizatorului autentificat.

**Soluție:** Folosire `user.id` din contextul de autentificare.

---

### MEDII (Securitate - recomandat pentru producție)

#### 3. RLS Policy prea permisivă pe `responses`
**Problema:** Politica `Allow viewing responses` cu `USING (true)` permite oricui să vadă toate răspunsurile participanților.

**Soluție:** Ștergere politică permisivă sau restricționare la creatorii sesiunii.

#### 4. Date publice expuse (Leaderboard)
**Tabele:** `user_stats`, `profiles`, `game_history`

**Problema:** Scanarea de securitate a identificat că datele utilizatorilor sunt accesibile public pentru funcționalitatea de clasament.

**Notă:** Aceasta este o decizie de design. Pentru un clasament public, datele trebuie să fie vizibile. Totuși, putem:
- Limita câmpurile expuse (doar numele și scorul, nu email-ul)
- Verifica că email-urile nu sunt expuse în `profiles`

**Status:** Verificat - `profiles` nu conține email, doar `display_name` și `avatar_url`. OK pentru uz educațional.

#### 5. Leaked Password Protection Disabled
**Problema:** Protecția împotriva parolelor compromise este dezactivată în Supabase Auth.

**Soluție:** Activare manuală din Supabase Dashboard (nu se poate automatiza prin cod).

---

## Plan de Implementare

### Faza 1: Fix Autentificare QuizEditor + GameControl

**Modificări în `src/pages/quiz/admin/QuizEditor.tsx`:**
1. Import `useAuth` hook
2. Înlocuire verificare localStorage cu verificare `user` și `isTeacher`
3. Folosire `user.id` la crearea quiz-ului

**Modificări în `src/pages/quiz/admin/GameControl.tsx`:**
1. Import `useAuth` hook
2. Înlocuire verificare localStorage cu verificare `user` și `isTeacher`
3. Adăugare loading state pentru auth

### Faza 2: Fix RLS Policy `responses`

**Migrație SQL:**
```sql
DROP POLICY IF EXISTS "Allow viewing responses" ON responses;
```

### Faza 3: Avertisment pentru Leaked Password (documentare)

Adăugare notă în plan că acest lucru trebuie activat manual.

---

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/pages/quiz/admin/QuizEditor.tsx` | Refactor autentificare |
| `src/pages/quiz/admin/GameControl.tsx` | Refactor autentificare |
| `supabase/migrations/xxx.sql` | Ștergere RLS policy permisivă |

---

## Cod Propus

### QuizEditor.tsx - Secțiunea de modificat

```typescript
// La începutul fișierului, adaugă:
import { useAuth } from "@/contexts/AuthContext";

// În componentă:
const { user, isTeacher, loading: authLoading } = useAuth();

// Înlocuiește useEffect existent (liniile 62-72) cu:
useEffect(() => {
  if (authLoading) return;
  
  if (!user || !isTeacher) {
    navigate("/quiz/admin/login");
    return;
  }

  if (!isNew) {
    fetchQuiz();
  }
}, [authLoading, user, isTeacher, isNew, quizId, navigate]);

// La handleSave, înlocuiește created_by (linia 249):
created_by: user.id,
```

### GameControl.tsx - Secțiunea de modificat

```typescript
// La începutul fișierului, adaugă:
import { useAuth } from "@/contexts/AuthContext";

// În componentă:
const { user, isTeacher, loading: authLoading } = useAuth();

// Înlocuiește verificarea localStorage (liniile 56-61) cu:
useEffect(() => {
  if (authLoading) return;
  
  if (!user || !isTeacher) {
    navigate("/quiz/admin/login");
    return;
  }
  // ... restul fetch-ului
}, [authLoading, user, isTeacher, gamePin, navigate, toast]);
```

### Migrație SQL

```sql
-- Ștergere politică prea permisivă pe responses
DROP POLICY IF EXISTS "Allow viewing responses" ON responses;
```

---

## Rezultat Final

După implementare:
- Toate paginile admin folosesc **Supabase Auth real**
- Nu mai există verificări prin **localStorage** nesigure  
- Quiz-urile noi sunt asociate cu **utilizatorul real**
- Politicile RLS sunt **restrictive** corespunzător
- Proiectul este pregătit pentru **producție** (cu excepția Leaked Password care necesită activare manuală)

---

## Pași Manuali Rămași

Pentru a completa securizarea:
1. Accesează Supabase Dashboard → Authentication → Security
2. Activează "Leaked password protection"
