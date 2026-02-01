

# Plan: Simulator Real de Asamblare PC cu Drag & Drop

## Problema Actuală

Implementarea curentă folosește un sistem **click-to-select → click-to-place**:
1. Click pe componentă din listă → devine selectată
2. Click pe zona de pe placă → componenta "apare" acolo

Acest sistem **nu oferă senzația de asamblare reală**.

---

## Soluția: Drag & Drop Nativ cu Urmărire Cursor

Vom implementa un sistem în care **componenta urmărește cursorul** în timp ce este trasă, și se "lipește" (snap) în slot când este plasată corect.

---

## Ce Vom Construi

### 1. Componenta Draggable Reală

**Comportament:**
- La apăsare mouse (mousedown) → componenta "se ridică" (scale up, shadow mare)
- În timp ce tragi → un "ghost" al componentei urmărește cursorul pe tot ecranul
- La eliberare pe zonă corectă → animație snap-in, componentă rămâne acolo
- La eliberare în loc greșit → componentă se întoarce la poziția inițială (animație bounce-back)

### 2. Placă de Bază Interactivă

**Zonele de drop vor avea:**
- **Stare normală**: contur dashed, culoare subtilă
- **La hover cu componentă trasă**: glow puternic, puls, mesaj "Plasează aici"
- **Zonă corectă vs greșită**: verde/roșu instant la hover
- **După plasare**: componenta apare vizual în slot, animație "snap"

### 3. Feedback Vizual Bogat

| Acțiune | Feedback Vizual |
|---------|-----------------|
| Începe drag | Componentă se "ridică", shadow mare, cursor: grabbing |
| Tragi peste zonă corectă | Zona pulsează verde, glow neon |
| Tragi peste zonă greșită | Zona tremură ușor roșu |
| Drop corect | Animație snap-in, confetti micro, +100 floating |
| Drop greșit | Shake pe placă, componentă revine, -30 floating |
| Drop în gol | Componentă revine lin la poziție |

### 4. Ghost Component (Urmărire Cursor)

Un element care:
- Apare când începe drag-ul
- Este poziționat absolut, urmărește coordonatele mouse-ului
- Afișează imaginea componentei cu transparență
- Dispare la drop

---

## Detalii Tehnice

### Fișiere Modificate

1. **`src/components/game/DraggableComponent.tsx`** (NOU)
   - Componentă care se poate trage fizic
   - Folosește HTML5 Drag API + mouse events pentru smooth tracking
   - State: isDragging, startPosition, currentPosition

2. **`src/components/game/DropZoneOverlay.tsx`** (NOU)
   - Layer transparent peste placa de bază
   - Detectează când o componentă este trasă peste o zonă
   - Oferă feedback vizual în timp real

3. **`src/components/game/GameBoard.tsx`** (MODIFICAT)
   - Adaugă state pentru dragging: draggedComponent, dragPosition
   - Render ghost component când isDragging
   - Gestionează drop events

4. **`src/components/game/MotherboardSVG.tsx`** (MODIFICAT)
   - Zonele devin drop targets reale
   - Highlight dinamic bazat pe componenta trasă
   - Animații la hover/drop

5. **`src/hooks/useDragAndDrop.ts`** (NOU)
   - Hook custom pentru logica de drag & drop
   - Trackează poziția mouse-ului
   - Detectează coliziuni cu zonele

### Logica de Drag & Drop

```text
1. MOUSE DOWN pe componentă:
   → setDraggedComponent(componentId)
   → setIsDragging(true)
   → Salvează offset de la cursor la centrul componentei

2. MOUSE MOVE (când isDragging):
   → Actualizează ghostPosition = { x: mouseX - offsetX, y: mouseY - offsetY }
   → Verifică dacă ghost overlaps cu vreo zonă
   → Dacă da → highlight zona respectivă

3. MOUSE UP:
   → Verifică zona curentă
   → Dacă zonă validă și componentă corectă:
      → placeComponent(componentId, zoneId)
      → Animație snap-in
   → Dacă zonă invalidă sau loc gol:
      → Animație return-to-origin
   → setIsDragging(false)
```

### Calculul Coliziunii

Pentru a detecta dacă componenta trasă este "peste" o zonă:

```text
function isOverZone(ghostRect, zoneRect):
   centerX = ghostRect.x + ghostRect.width / 2
   centerY = ghostRect.y + ghostRect.height / 2
   
   return (
     centerX >= zoneRect.x &&
     centerX <= zoneRect.x + zoneRect.width &&
     centerY >= zoneRect.y &&
     centerY <= zoneRect.y + zoneRect.height
   )
```

---

## Experiența Utilizatorului

1. **Componente în stânga** - Elevul vede lista cu imagini ale componentelor
2. **Apucă o componentă** - Click lung sau drag start, componenta "se ridică"
3. **Trage fizic** - Un ghost al componentei urmărește cursorul
4. **Vede feedback** - Zonele se aprind când componenta este trasă peste ele
5. **Plasează** - Eliberează mouse-ul, componenta se "lipește" cu animație
6. **Simte progresul** - Vede PC-ul asamblându-se pas cu pas

---

## Animații CSS Noi

```text
@keyframes snap-in:
  0% → scale(1.2), opacity(0.8)
  50% → scale(0.95)
  100% → scale(1), opacity(1)

@keyframes shake-error:
  0%, 100% → translateX(0)
  20%, 60% → translateX(-5px)
  40%, 80% → translateX(5px)

@keyframes bounce-back:
  0% → position curentă
  50% → overshoot ușor
  100% → poziție originală

@keyframes glow-valid:
  0%, 100% → box-shadow normal
  50% → box-shadow puternic verde
```

---

## Suport Touch (Mobil)

Aceleași mecanici, dar folosind:
- `touchstart` în loc de `mousedown`
- `touchmove` în loc de `mousemove`  
- `touchend` în loc de `mouseup`
- `touch.clientX/Y` pentru coordonate

---

## Pași de Implementare

1. Creez hook-ul `useDragAndDrop.ts` cu logica de tracking mouse
2. Construiesc `DraggableComponent.tsx` cu support pentru drag fizic
3. Adaug `DropZoneOverlay.tsx` pentru detectarea drop-ului
4. Modific `GameBoard.tsx` pentru a randa ghost-ul și a gestiona drop
5. Actualizez `MotherboardSVG.tsx` pentru highlight dinamic
6. Adaug animațiile CSS (snap-in, shake, glow)
7. Implementez feedback vizual (+100/-30 floating)
8. Adaug suport pentru touch events
9. Testez pe desktop și mobil

---

## Rezultat Final

Un **simulator de asamblare PC** în care elevii:
- Trag fizic componentele cu mouse-ul
- Văd zonele iluminându-se când sunt aproape
- Simt satisfacția plasării corecte (snap + sunet + animație)
- Înțeleg vizual cum se construiește un PC

