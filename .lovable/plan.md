

# PC Builder Academy - Platformă Educațională Interactivă

## 🎯 Viziune
O platformă de învățare în limba română care transformă studiul componentelor hardware într-o experiență captivantă, cu accent pe un **joc interactiv de asamblare PC** - perfect pentru mediul școlar.

---

## 📐 Structura Aplicației

### 1. Pagina Principală (Home)
- Hero section cu titlu atractiv și 2 butoane CTA mari: **„Începe Lecția"** și **„Joacă Asamblează PC-ul"**
- Bară de progres vizuală pentru lecțiile completate
- Card cu „Best Score" personal și scurtă statistică
- Design dark cu accente neon subtile (verde/cyan tehnic)

### 2. Hub de Învățare (Lecții)
**6 Capitole Complete:**

1. **Placa de Bază** - Socket CPU, chipset, sloturi RAM/PCIe, conectori SATA/M.2, BIOS/UEFI, VRM, headers
2. **Sursa de Alimentare (PSU)** - Conectori (24-pin ATX, EPS, PCIe), putere, eficiență 80 PLUS, protecții, modularitate
3. **Procesorul (CPU)** - Istorie, frecvență, nuclee/threads, cache, TDP, litografie + **descifrare model Intel & AMD**
4. **Tipuri de Socket** - LGA vs PGA, diferențe, avantaje/dezavantaje
5. **Modul de Funcționare** - Fluxul de energie și date în PC
6. **Sisteme de Răcire** - Air vs AIO, termopastă, airflow, PWM/DC

**Pentru fiecare capitol:**
- Definiție și rol clar
- Componente și structură (cu mini-diagrame SVG)
- Secțiune „De Reținut" cu puncte cheie
- „Greșeli Frecvente" - ce să evite elevii
- Mini-quiz (5 întrebări) la final

### 3. Jocul „Asamblează PC-ul" ⭐ (Feature Principal)

**Reprezentare Vizuală:**
- Placă de bază schematică, curată, cu zone colorate și etichetate clar
- Componente ca ilustrații simple, recognoscibile, stil educativ
- Zonele de plasare evidențiate la hover cu tooltip explicativ

**Componente de Asamblat:**
- CPU (cu indicator orientare)
- Cooler CPU (variante air/AIO)
- 2x Module RAM DDR4/DDR5
- GPU (slot PCIe x16)
- SSD M.2
- Cablu ATX 24-pin
- Cablu EPS 8-pin
- 2x Ventilatoare carcasă

**Mecanici de Joc:**
- Drag & drop intuitiv (sau click pe piesă → click pe zonă)
- Validare ordine realistă (CPU → Cooler → RAM → etc.)
- Feedback vizual: ✅ snap + sunet la plasare corectă / ❌ shake + hint la greșeală
- Tooltip-uri educative la hover pe fiecare zonă

**3 Moduri de Joc:**
| Mod | Descriere |
|-----|-----------|
| **Training** | Fără timp, hint-uri nelimitate, explicații pas cu pas |
| **Challenge** | Timer activ, 3 vieți, penalizări |
| **Ranked** | Competitiv, contribuie la leaderboard |

**Sistem de Scor:**
- +100 puncte plasare corectă
- -30 puncte greșeală
- Bonus timp rămas
- Bonus „Fără Greșeli" și „Fără Hint-uri"

**Achievements:**
- 🏆 RAM Whisperer
- 🔌 Cable Master
- ⚡ Perfect Run
- 🎯 Speed Demon

### 4. Leaderboard
- Clasament Global + Săptămânal
- Filtre: mod de joc (Challenge/Ranked), perioadă
- Afișare Top 20 + poziția curentă a elevului
- Opțional: clasament pe clasă/școală (pentru profesori)

### 5. Profil Utilizator
- Autentificare (email/parolă sau Google)
- Statistici: best time, best score, acuratețe, număr jocuri
- Progres la lecții (vizual, cu checkmarks)
- Colecție de badge-uri câștigate
- Istoric rezultate quiz-uri

### 6. Test Final (Opțional - Bonus)
- 20 de întrebări din toate capitolele
- Scor final și posibilitate de a genera „Diplomă/Certificat"
- Vizualizare PDF sau share pe ecran

---

## 🎨 Design UI/UX

**Temă Vizuală:**
- Dark mode principal (#0a0f1a) cu accente neon cyan (#00d4ff) și verde (#10b981)
- Carduri cu border subtle și shadow-uri soft
- Tipografie clară, font monospace pentru coduri/modele

**Animații:**
- Hover scale pe carduri și butoane
- Bounce ușor la plasare corectă în joc
- Confetti la record personal
- Fade-in pentru secțiuni

**Responsive:**
- Desktop: layout complet cu placă de bază mare
- Tablet: layout adaptat cu zone de drop ajustate
- Mobil: funcțional, dar cu notificare că experiența e optimă pe desktop

---

## 🗄️ Backend (Supabase/Lovable Cloud)

**Tabele Principale:**
- `users` - profiluri, progres general
- `game_runs` - scor, timp, greșeli, mod, timestamp
- `lesson_progress` - capitol completat, scor quiz
- `quiz_results` - răspunsuri detaliate
- `achievements` - badge-uri deblocate per user
- `user_roles` - rol (elev/profesor) pentru acces diferențiat

**Funcționalități:**
- Leaderboard calculat din game_runs (agregare pe mod/perioadă)
- RLS: fiecare user vede doar datele proprii (excepție leaderboard public)
- Local storage fallback pentru experiența offline

---

## 📚 Conținut Educațional

- Texte complete în română, structurate pe niveluri
- Exemple concrete: descifrare Intel i5-12600KF și AMD Ryzen 5 7600X
- Mini-diagrame SVG pentru: layout placă de bază, flux energie, tipuri socket
- Secțiuni „De Reținut" evidențiate vizual
- Greșeli frecvente cu explicații clare

---

## 🚀 Ordinea de Implementare

**Faza 1: Fundația**
- Setup proiect, design system, navigare
- Pagina Home cu CTA-uri
- Structura lecțiilor (layout + conținut)

**Faza 2: Jocul (Prioritar)**
- Canvas/board cu placa de bază
- Componente draggable
- Logica de validare și ordine
- Modul Training funcțional
- Scorare și feedback

**Faza 3: Autentificare & Persistare**
- Login/Signup cu Supabase
- Salvare progres și scoruri
- Profil utilizator

**Faza 4: Competiție**
- Modurile Challenge și Ranked
- Leaderboard
- Achievements și badge-uri

**Faza 5: Conținut Complet**
- Toate cele 6 capitole cu quiz-uri
- Test final cu certificat
- Polish final (animații, sunete, confetti)

