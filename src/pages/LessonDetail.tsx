import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  Clock,
  CircuitBoard,
  Zap,
  Cpu,
  Cable,
  Thermometer,
  Fan,
  XCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MainLayout from "@/components/layout/MainLayout";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Lesson content data
const lessonsData = {
  "placa-de-baza": {
    id: 1,
    title: "Placa de Bază",
    description: "Socket CPU, chipset, sloturi RAM/PCIe, conectori SATA/M.2, BIOS/UEFI, VRM și headers",
    icon: CircuitBoard,
    duration: "25 min",
    sections: [
      {
        title: "Ce este Placa de Bază?",
        content: "Placa de bază (motherboard) este componenta centrală a oricărui calculator. Ea conectează toate celelalte componente hardware: procesorul, memoria RAM, placa video, dispozitivele de stocare și perifericele. Fără placă de bază, componentele nu ar putea comunica între ele."
      },
      {
        title: "Socket-ul CPU",
        content: "Socket-ul este locul unde se montează procesorul. Există diferite tipuri de socket-uri pentru Intel (LGA 1700, LGA 1200) și AMD (AM4, AM5). Este crucial să alegi o placă de bază cu socket compatibil cu procesorul tău."
      },
      {
        title: "Chipset-ul",
        content: "Chipset-ul controlează comunicarea între procesor și celelalte componente. Chipset-uri mai avansate (Z790, X670) oferă mai multe funcții precum overclocking și mai multe linii PCIe."
      },
      {
        title: "Sloturile RAM",
        content: "Plăcile de bază moderne au 2-4 sloturi pentru memorie RAM DDR4 sau DDR5. Sloturile sunt de obicei colorate pentru a indica configurația dual-channel optimă."
      },
      {
        title: "Sloturile PCIe",
        content: "PCIe (Peripheral Component Interconnect Express) sunt sloturi pentru plăci de extensie: plăci video, plăci de sunet, carduri de rețea etc. Slotul principal PCIe x16 este dedicat plăcii video."
      },
      {
        title: "Conectorii de Stocare",
        content: "SATA - pentru HDD-uri și SSD-uri 2.5\". M.2 - pentru SSD-uri NVMe ultra-rapide care se conectează direct pe placă. Plăcile moderne au 1-3 sloturi M.2."
      }
    ],
    quiz: [
      {
        question: "Ce componentă se montează în socket-ul CPU?",
        options: ["RAM", "Procesorul", "SSD-ul", "Placa video"],
        correct: 1
      },
      {
        question: "Ce tipuri de socket folosește AMD pentru procesoarele moderne?",
        options: ["LGA 1700", "AM4/AM5", "LGA 1200", "BGA"],
        correct: 1
      },
      {
        question: "Ce slot este dedicat plăcii video?",
        options: ["M.2", "SATA", "PCIe x16", "DDR5"],
        correct: 2
      }
    ],
    nextLesson: "sursa-alimentare",
    prevLesson: undefined
  },
  "sursa-alimentare": {
    id: 2,
    title: "Sursa de Alimentare (PSU)",
    description: "Conectori 24-pin ATX, EPS, PCIe, SATA power, putere, eficiență 80 PLUS și protecții",
    icon: Zap,
    duration: "20 min",
    sections: [
      {
        title: "Rolul Sursei de Alimentare",
        content: "PSU (Power Supply Unit) transformă curentul alternativ din priză (230V AC) în curent continuu (12V, 5V, 3.3V DC) necesar componentelor calculatorului. Este una dintre cele mai importante componente pentru stabilitate și siguranță."
      },
      {
        title: "Conectorul ATX 24-pin",
        content: "Este conectorul principal care alimentează placa de bază. Furnizează curent pentru chipset, sloturi PCIe, porturi USB și alte componente. Fără el, placa de bază nu pornește."
      },
      {
        title: "Conectorul EPS (4+4 pin)",
        content: "Alimentează direct procesorul prin VRM-ul plăcii de bază. Procesoarele puternice pot necesita două conectori EPS pentru alimentare suplimentară."
      },
      {
        title: "Conectori PCIe (6+2 pin)",
        content: "Alimentează plăcile video dedicate. Plăcile video de gaming pot necesita 1-3 conectori de 8 pini, în funcție de consum."
      },
      {
        title: "Certificarea 80 PLUS",
        content: "Indică eficiența sursei: Bronze (82%), Gold (87%), Platinum (90%), Titanium (92%). O sursă mai eficientă produce mai puțină căldură și consumă mai puțin curent."
      },
      {
        title: "Protecții",
        content: "OVP (supratensiune), UVP (subtensiune), OCP (supracurent), SCP (scurtcircuit), OTP (supratemperatură). Sursele de calitate au toate aceste protecții."
      }
    ],
    quiz: [
      {
        question: "Ce transformă sursa de alimentare?",
        options: ["DC în AC", "AC în DC", "5V în 12V", "Digital în analog"],
        correct: 1
      },
      {
        question: "Care conector alimentează procesorul?",
        options: ["ATX 24-pin", "SATA", "EPS 4+4 pin", "Molex"],
        correct: 2
      },
      {
        question: "Ce indică certificarea 80 PLUS Gold?",
        options: ["Culoarea sursei", "Eficiență de 87%", "Garanție 10 ani", "Putere de 800W"],
        correct: 1
      }
    ],
    prevLesson: "placa-de-baza",
    nextLesson: "procesorul"
  },
  "procesorul": {
    id: 3,
    title: "Procesorul (CPU)",
    description: "Istorie, frecvență, nuclee/threads, cache, TDP, litografie + descifrare model Intel & AMD",
    icon: Cpu,
    duration: "30 min",
    sections: [
      {
        title: "Ce este Procesorul?",
        content: "CPU (Central Processing Unit) este 'creierul' calculatorului. Execută instrucțiunile programelor, face calcule matematice și logice, și coordonează toate operațiile sistemului."
      },
      {
        title: "Frecvența (GHz)",
        content: "Măsoară viteza ceasului intern. Un procesor de 4 GHz execută 4 miliarde de cicluri pe secundă. Frecvența boost este viteza maximă atinsă temporar sub sarcină."
      },
      {
        title: "Nuclee și Thread-uri",
        content: "Nucleele sunt unități de procesare fizice. Thread-urile (Hyper-Threading/SMT) permit unui nucleu să execute 2 sarcini simultan. Un i7 cu 8 nuclee și 16 thread-uri poate gestiona 16 sarcini paralel."
      },
      {
        title: "Memoria Cache",
        content: "L1 - cea mai rapidă, mică (64KB/nucleu). L2 - rapidă, medie (256-512KB/nucleu). L3 - mai lentă dar mare (16-64MB partajată). Cache-ul reduce timpii de acces la date frecvent folosite."
      },
      {
        title: "TDP (Thermal Design Power)",
        content: "Puterea termică în wați pe care sistemul de răcire trebuie să o disipeze. Un CPU cu TDP de 125W necesită un cooler capabil să evacueze 125W de căldură."
      },
      {
        title: "Litografia (nm)",
        content: "Dimensiunea tranzistorilor. 7nm, 5nm, 4nm - cu cât mai mic, cu atât mai eficient energetic și mai puternic. Procesoarele moderne folosesc litografie sub 10nm."
      }
    ],
    quiz: [
      {
        question: "Ce măsoară frecvența în GHz?",
        options: ["Temperatura", "Consumul", "Cicluri pe secundă", "Numărul de nuclee"],
        correct: 2
      },
      {
        question: "Ce tehnologie permite unui nucleu să execute 2 sarcini?",
        options: ["Turbo Boost", "Hyper-Threading", "Cache L3", "Litografie"],
        correct: 1
      },
      {
        question: "Ce indică TDP?",
        options: ["Viteza maximă", "Puterea termică de disipad", "Numărul de tranzistori", "Tipul socket-ului"],
        correct: 1
      }
    ],
    prevLesson: "sursa-alimentare",
    nextLesson: "tipuri-socket"
  },
  "tipuri-socket": {
    id: 4,
    title: "Tipuri de Socket",
    description: "LGA vs PGA: diferențe, avantaje, dezavantaje și exemple concrete",
    icon: Cable,
    duration: "15 min",
    sections: [
      {
        title: "Ce este Socket-ul?",
        content: "Socket-ul este interfața mecanică și electrică dintre procesor și placa de bază. Asigură contactul electric pentru alimentare și transfer de date."
      },
      {
        title: "LGA (Land Grid Array)",
        content: "Folosit de Intel. Pinii sunt pe placa de bază, procesorul are contacte plate. Avantaj: dacă îndoi un pin, poți să-l repari mai ușor. Dezavantaj: placa de bază e mai scumpă de înlocuit."
      },
      {
        title: "PGA (Pin Grid Array)",
        content: "Folosit de AMD (până la AM4). Pinii sunt pe procesor, socket-ul are găuri. Avantaj: placa de bază e mai ieftină. Dezavantaj: pinii de pe CPU se îndoaie mai ușor."
      },
      {
        title: "Socket-uri Intel Actuale",
        content: "LGA 1700 - pentru generațiile 12, 13, 14 Intel Core. LGA 1200 - pentru generațiile 10, 11. Fiecare socket are un număr specific de pini."
      },
      {
        title: "Socket-uri AMD Actuale",
        content: "AM5 - nou, tip LGA, pentru Ryzen 7000+. AM4 - tip PGA, pentru Ryzen 1000-5000. AMD a trecut la LGA pentru mai bună compatibilitate."
      },
      {
        title: "Compatibilitate",
        content: "Un procesor funcționează DOAR cu socket-ul său. Un Intel Core i5-13600K (LGA 1700) nu intră în LGA 1200. Verifică întotdeauna compatibilitatea!"
      }
    ],
    quiz: [
      {
        question: "Unde sunt pinii la un socket LGA?",
        options: ["Pe procesor", "Pe placa de bază", "Pe RAM", "Nu are pini"],
        correct: 1
      },
      {
        question: "Ce socket folosesc procesoarele Ryzen 7000?",
        options: ["AM4", "LGA 1700", "AM5", "LGA 1200"],
        correct: 2
      },
      {
        question: "Ce tip de socket folosea AMD tradițional?",
        options: ["LGA", "PGA", "BGA", "ZIF"],
        correct: 1
      }
    ],
    prevLesson: "procesorul",
    nextLesson: "modul-functionare"
  },
  "modul-functionare": {
    id: 5,
    title: "Modul de Funcționare",
    description: "Fluxul de energie și date: PSU → placă de bază → CPU/RAM → stocare → GPU",
    icon: Thermometer,
    duration: "20 min",
    sections: [
      {
        title: "Ciclul de Pornire",
        content: "Când apeși butonul de pornire: 1) PSU pornește, 2) Placa primește curent standby, 3) Se inițializează BIOS/UEFI, 4) POST verifică componentele, 5) Se încarcă sistemul de operare."
      },
      {
        title: "Fluxul de Energie",
        content: "Priză → PSU (transformare AC-DC) → Placă de bază (distribuție) → CPU, RAM, SSD, ventilatoare → GPU (separat de la PSU). Fiecare componentă primește tensiunea potrivită."
      },
      {
        title: "Fluxul de Date",
        content: "CPU cere date din RAM sau SSD → Datele trec prin chipset sau direct (dacă e pe liniile CPU) → CPU procesează → Rezultatul merge la RAM sau GPU pentru afișare."
      },
      {
        title: "Rolul Chipset-ului",
        content: "Chipset-ul este 'poștașul' care dirijează traficul de date. Conectează CPU cu porturi USB, SATA, sloturi PCIe secundare. Liniile directe la CPU sunt pentru M.2 NVMe și slot-ul video."
      },
      {
        title: "Comunicarea CPU-RAM",
        content: "CPU-ul accesează RAM-ul prin memory controller integrat. Dual-channel dublează banda = mai rapid. DDR5 are bandă mai mare decât DDR4 dar și latență diferită."
      },
      {
        title: "Afișarea pe Ecran",
        content: "1) CPU trimite comenzi la GPU, 2) GPU procesează grafica în VRAM, 3) GPU trimite semnal digital prin HDMI/DisplayPort, 4) Monitorul afișează imaginea. Tot în fracțiuni de secundă!"
      }
    ],
    quiz: [
      {
        question: "Ce verifică POST la pornire?",
        options: ["Parola Windows", "Componentele hardware", "Conexiunea la internet", "Fișierele"],
        correct: 1
      },
      {
        question: "Ce rol are chipset-ul?",
        options: ["Răcire CPU", "Stocare date", "Dirijează traficul de date", "Alimentare GPU"],
        correct: 2
      },
      {
        question: "Ce avantaj oferă Dual-channel RAM?",
        options: ["Capacitate dublă", "Bandă dublă", "Consum redus", "Latență zero"],
        correct: 1
      }
    ],
    prevLesson: "tipuri-socket",
    nextLesson: "sisteme-racire"
  },
  "sisteme-racire": {
    id: 6,
    title: "Sisteme de Răcire",
    description: "Air vs AIO vs custom, termopastă, airflow, presiune pozitivă/negativă, PWM/DC",
    icon: Fan,
    duration: "25 min",
    sections: [
      {
        title: "De Ce Este Nevoie de Răcire?",
        content: "Procesoarele și plăcile video generează căldură intensă (65-350W). Fără răcire, temperaturile ar depăși 100°C în secunde, ducând la throttling sau defectare permanentă."
      },
      {
        title: "Răcire cu Aer (Air Cooling)",
        content: "Heatsink (radiator metalic) + ventilator. Heat pipes transferă căldura de la CPU la aripioare. Simplu, fiabil, ieftin. Exemplu: Noctua NH-D15, be quiet! Dark Rock."
      },
      {
        title: "Răcire Lichidă AIO",
        content: "All-In-One: pompă pe CPU, tuburi, radiator cu ventilatoare. Lichid preumplut, sigilat. Mai eficient pe CPU-uri fierbinți, estetic plăcut. Exemplu: NZXT Kraken, Corsair H150i."
      },
      {
        title: "Custom Loop",
        content: "Sistem personalizat: rezervor, pompă, blocuri separate, tuburi. Performanță maximă, include și GPU. Scump, necesită întreținere, risc de scurgeri."
      },
      {
        title: "Termopasta",
        content: "Umple micro-golurile între CPU și cooler. Pastă de bună calitate (Noctua NT-H1, Thermal Grizzly) poate scădea temperaturile cu 5-10°C față de paste ieftine."
      },
      {
        title: "Airflow în Carcasă",
        content: "Presiune pozitivă (mai multe intake) = mai puțin praf. Presiune negativă (mai multe exhaust) = temperaturi ușor mai bune. Ideal: 2-3 intake față, 1-2 exhaust spate/sus."
      }
    ],
    quiz: [
      {
        question: "Ce se întâmplă fără răcire adecvată?",
        options: ["Nimic", "Throttling/defectare", "Performanță mai bună", "Consum redus"],
        correct: 1
      },
      {
        question: "Ce conține un sistem AIO?",
        options: ["Doar ventilator", "Pompă, tuburi, radiator", "Doar radiator", "Azot lichid"],
        correct: 1
      },
      {
        question: "Ce face presiunea pozitivă în carcasă?",
        options: ["Mărește temperatura", "Reduce praful", "Crește zgomotul", "Scade performanța"],
        correct: 1
      }
    ],
    prevLesson: "modul-functionare",
    nextLesson: undefined
  }
};

const LessonDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markLessonComplete, getLessonProgress, getCompletedCount } = useLessonProgress();
  const { checkLessonAchievements } = useAchievements();
  
  const lesson = slug ? lessonsData[slug as keyof typeof lessonsData] : null;
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get existing progress
  const existingProgress = slug ? getLessonProgress(slug) : undefined;
  
  if (!lesson) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Lecția nu a fost găsită</h1>
          <Button asChild>
            <Link to="/lectii">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Înapoi la Lecții
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const Icon = lesson.icon;
  const correctAnswers = answers.filter((a, i) => a === lesson.quiz[i].correct).length;
  const quizTotal = lesson.quiz.length;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizTotal - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
      handleSaveProgress();
    }
  };

  const handleSaveProgress = async () => {
    if (!user || !slug) return;
    
    setIsSaving(true);
    const finalScore = answers.filter((a, i) => a === lesson.quiz[i].correct).length;
    
    // Check if lesson was already completed before this attempt
    const wasAlreadyCompleted = existingProgress?.completed ?? false;
    
    const { error } = await markLessonComplete(slug, finalScore);
    
    if (error) {
      toast.error("Eroare la salvarea progresului");
    } else {
      toast.success("Progresul a fost salvat!");
      
      // Only check achievements if this is a newly completed lesson
      if (!wasAlreadyCompleted) {
        const newCompletedCount = getCompletedCount() + 1;
        const unlocked = await checkLessonAchievements(newCompletedCount);
        if (unlocked) {
          toast.success("🏆 Ai deblocat achievement-ul 'Primul Pas'!");
        }
      }
    }
    
    setIsSaving(false);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="py-8 bg-card/30 border-b border-border">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/lectii">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Înapoi la Lecții
            </Link>
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Lecția {lesson.id}</Badge>
                {existingProgress?.completed && (
                  <Badge className="bg-accent text-accent-foreground">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completat
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-muted-foreground">{lesson.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {lesson.sections.length} secțiuni
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {lesson.sections.map((section, index) => (
              <Card key={index} className="tech-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary">
                      {index + 1}
                    </span>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="tech-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Test de Verificare
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!quizStarted && !showResult ? (
                  <>
                    <p className="text-muted-foreground mb-4">
                      Această lecție include {quizTotal} întrebări pentru a-ți verifica cunoștințele.
                    </p>
                    {existingProgress?.completed && existingProgress.quiz_score !== null && (
                      <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm text-muted-foreground">Scor anterior:</p>
                        <p className="text-lg font-bold text-accent">
                          {existingProgress.quiz_score}/{existingProgress.quiz_total} răspunsuri corecte
                        </p>
                      </div>
                    )}
                    <Progress value={0} className="h-2 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">0 / {quizTotal} răspunsuri</p>
                    <Button className="neon-glow" onClick={() => setQuizStarted(true)}>
                      {existingProgress?.completed ? "Reia Quiz-ul" : "Începe Quiz-ul"}
                    </Button>
                  </>
                ) : showResult ? (
                  <div className="text-center py-4">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      correctAnswers === quizTotal ? "bg-accent/20" : "bg-primary/20"
                    }`}>
                      {correctAnswers === quizTotal ? (
                        <CheckCircle2 className="h-10 w-10 text-accent" />
                      ) : (
                        <span className="text-3xl font-bold text-primary">{correctAnswers}/{quizTotal}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {correctAnswers === quizTotal ? "Perfect!" : "Quiz Finalizat!"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Ai răspuns corect la {correctAnswers} din {quizTotal} întrebări.
                    </p>
                    {isSaving && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Se salvează progresul...
                      </div>
                    )}
                    {!user && (
                      <p className="text-sm text-muted-foreground mb-4">
                        <Link to="/auth" className="text-primary hover:underline">Conectează-te</Link> pentru a-ți salva progresul!
                      </p>
                    )}
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={resetQuiz}>
                        Reia Quiz-ul
                      </Button>
                      {lesson.nextLesson ? (
                        <Button asChild className="neon-glow">
                          <Link to={`/lectii/${lesson.nextLesson}`}>
                            Lecția Următoare
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild className="neon-glow-green bg-accent hover:bg-accent/90">
                          <Link to="/joc">
                            Joacă Acum
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Progress value={((currentQuestion + 1) / quizTotal) * 100} className="h-2 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Întrebarea {currentQuestion + 1} din {quizTotal}
                    </p>
                    
                    <h3 className="text-lg font-medium mb-4">
                      {lesson.quiz[currentQuestion].question}
                    </h3>
                    
                    <div className="space-y-2 mb-6">
                      {lesson.quiz[currentQuestion].options.map((option, index) => {
                        const isSelected = answers[currentQuestion] === index;
                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          >
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-sm ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    
                    <Button 
                      className="w-full neon-glow" 
                      onClick={handleNextQuestion}
                      disabled={answers[currentQuestion] === undefined}
                    >
                      {currentQuestion < quizTotal - 1 ? "Următoarea Întrebare" : "Finalizează Quiz-ul"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex justify-between">
            {lesson.prevLesson ? (
              <Button asChild variant="outline">
                <Link to={`/lectii/${lesson.prevLesson}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Lecția Anterioară
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {lesson.nextLesson ? (
              <Button asChild className="neon-glow">
                <Link to={`/lectii/${lesson.nextLesson}`}>
                  Lecția Următoare
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="neon-glow-green bg-accent hover:bg-accent/90">
                <Link to="/joc">
                  Finalizat! Joacă Acum
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LessonDetail;
