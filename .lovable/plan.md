
# Plan: Rezolvare Problema Autentificare Profesor

## Problema Identificată

Autentificarea profesorului eșuează din două motive:

1. **Tabelul `user_roles` este GOL** - niciun utilizator nu are rolul "teacher" atribuit
2. **Nu există un flux de creare automată** pentru contul de profesor cu rol

### Starea actuală a bazei de date:
- Utilizatorul `ioana@ceiti.md` există dar **fără rol de teacher**
- Secretele `TEACHER_EMAIL` și `TEACHER_PASSWORD` sunt configurate dar nefolosite

## Soluție Propusă

### Opțiunea 1: Atribuire Manuală Rol (Rapidă)

Atribuie manual rolul de "teacher" utilizatorului existent:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'teacher'::app_role 
FROM auth.users 
WHERE email = 'ioana@ceiti.md';
```

### Opțiunea 2: Creare Cont Profesor Nou

Dacă dorești un cont nou dedicat profesorilor, voi crea o migrare care:

1. Verifică dacă există deja un utilizator cu email-ul din secretul `TEACHER_EMAIL`
2. Creează contul dacă nu există
3. Atribuie automat rolul "teacher"

## Detalii Tehnice

### Ce se va face:
1. **Migrare SQL** - Inserează rolul "teacher" pentru utilizatorul specificat
2. **Verificare** - Confirmare că rolul a fost atribuit corect

### Fișiere afectate:
| Fișier | Modificare |
|--------|------------|
| `supabase/migrations/xxx.sql` | Inserare rol teacher |

### După implementare:
- Profesorul se va putea autentifica cu email-ul `ioana@ceiti.md` și parola asociată
- Va avea acces la `/quiz/admin` pentru gestionarea quiz-urilor

## Întrebare

Dorești să atribui rolul de "teacher" utilizatorului `ioana@ceiti.md` sau preferi să creezi un cont nou de profesor? Te rog specifică email-ul și parola pentru contul de profesor pe care dorești să-l folosești.
