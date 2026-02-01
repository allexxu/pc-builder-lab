

# Plan: Joc Interactiv de Asamblare PC

## Rezumat
Vom implementa un joc educativ de tip drag & drop unde elevii vor plasa componente hardware pe o placă de bază schematică. Jocul va include 3 moduri (Training, Challenge, Ranked), validare a ordinii de asamblare, feedback vizual și sistem de punctaj.

---

## Ce vom construi

### 1. Arhitectura Jocului

```text
Game.tsx (selectie mod)
    └── GameBoard.tsx (jocul propriu-zis)
            ├── MotherboardSVG.tsx (placa de baza cu zone de drop)
            ├── ComponentCard.tsx (piesa draggable)
            ├── GameHUD.tsx (scor, timer, vieti, hints)
            └── GameEndScreen.tsx (rezultat final)
```

### 2. Componentele Hardware de Asamblat

| Componenta | Zona pe Placa | Ordine | Dependenta |
|------------|---------------|--------|------------|
| CPU | Socket central | 1 | - |
| Cooler CPU | Pe CPU | 2 | CPU |
| RAM x2 | Sloturi RAM | 3-4 | - |
| SSD M.2 | Slot M.2 | 5 | - |
| GPU | PCIe x16 | 6 | - |
| Cablu ATX 24-pin | Conector ATX | 7 | - |
| Cablu EPS 8-pin | Conector EPS | 8 | - |
| Ventilatoare x2 | Fan headers | 9-10 | - |

### 3. Mecanici de Joc

**Drag & Drop:**
- Click pe componenta → componenta devine selectata
- Drag spre zona corecta → snap-in cu animatie bounce
- Click alternativ: click piesa, apoi click zona

**Validari:**
- Verificare zona corecta (CPU in socket, RAM in slot RAM)
- Verificare ordine (cooler doar dupa CPU)
- Feedback imediat: verde = corect, rosu = gresit

**Moduri:**
- **Training:** fara timer, hint-uri nelimitate, explicatii
- **Challenge:** timer 5 min, 3 vieti, -30 puncte/gresit
- **Ranked:** timer 4 min, fara hints, scor pentru clasament

---

## Detalii Tehnice

### Fisiere Noi

1. **`src/components/game/GameBoard.tsx`** - Componenta principala a jocului
2. **`src/components/game/MotherboardSVG.tsx`** - Placa de baza SVG cu zone interactive
3. **`src/components/game/ComponentCard.tsx`** - Componenta draggable pentru fiecare piesa
4. **`src/components/game/DropZone.tsx`** - Zona de plasare pe placa
5. **`src/components/game/GameHUD.tsx`** - Interfata cu scor, timer, vieti
6. **`src/components/game/GameEndScreen.tsx`** - Ecran final cu rezultate
7. **`src/hooks/useGameState.ts`** - Hook pentru state management joc
8. **`src/data/gameComponents.ts`** - Definitii componente si zone

### Placa de Baza (SVG Schematic)

Design simplificat cu zone colorate:
- Socket CPU: patrat central, culoare cyan
- Sloturi RAM: 4 dreptunghiuri verticale, culoare verde
- PCIe x16: dreptunghi lung orizontal, culoare violet
- M.2: dreptunghi mic, culoare portocaliu
- Conectori ATX/EPS: zone in dreapta, culoare galben
- Fan headers: cercuri mici in colturi

### State Management (useGameState hook)

```text
GameState:
  - mode: "training" | "challenge" | "ranked"
  - phase: "playing" | "paused" | "completed"
  - score: number
  - timeRemaining: number (pentru Challenge/Ranked)
  - lives: number (pentru Challenge)
  - hintsUsed: number
  - placedComponents: string[]
  - currentStep: number
  - mistakes: number
```

### Sistem de Punctaj

- +100 puncte: plasare corecta
- -30 puncte: gresit (doar Challenge/Ranked)
- Bonus timp: `(timeRemaining / totalTime) * 200`
- Bonus perfect: x2 daca 0 greseli
- Bonus no-hints: +150 daca 0 hints folosite

---

## Experienta Utilizator

1. **Selectie mod** (pagina existenta Game.tsx) → click "Incepe Jocul"
2. **Ecran de joc** cu:
   - Stanga: lista componentelor disponibile
   - Centru: placa de baza interactiva
   - Sus: HUD cu scor/timer/vieti
3. **Interactiune:**
   - Hover pe zona → glow + tooltip educativ
   - Drag componenta → shadow urmareste cursorul
   - Drop pe zona corecta → animatie bounce + sunet + "+100"
   - Drop gresit → shake + mesaj de eroare
4. **La finalizare:** ecran cu scor total, breakdown, butoane "Joaca din nou" / "Leaderboard"

---

## Pasi de Implementare

1. Creez structura de date pentru componente si zone (`gameComponents.ts`)
2. Construiesc placa de baza SVG cu zone interactive (`MotherboardSVG.tsx`)
3. Implementez componentele draggable (`ComponentCard.tsx`, `DropZone.tsx`)
4. Creez hook-ul pentru game state (`useGameState.ts`)
5. Asamblam totul in `GameBoard.tsx` cu logica de drag & drop
6. Adaug HUD-ul cu timer/scor/vieti (`GameHUD.tsx`)
7. Creez ecranul de final (`GameEndScreen.tsx`)
8. Integrez in pagina Game.tsx existenta
9. Adaug animatii si feedback vizual
10. Testez toate cele 3 moduri de joc

