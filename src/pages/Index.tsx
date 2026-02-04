import { Link } from "react-router-dom";
import { 
  Cpu, 
  Gamepad2, 
  BookOpen, 
  Trophy, 
  ArrowRight, 
  Zap, 
  Monitor,
  HardDrive,
  Fan,
  Cable,
  CircuitBoard,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { motion } from "framer-motion";

const TOTAL_LESSONS = 6;

const Index = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading, getAverageAccuracy } = useUserStats();
  const { getCompletedCount, loading: progressLoading } = useLessonProgress();

  const isLoading = statsLoading || progressLoading;

  const userProgress = {
    lessonsCompleted: user ? getCompletedCount() : 0,
    totalLessons: TOTAL_LESSONS,
    bestScore: user ? stats.best_score : 0,
    gamesPlayed: user ? stats.total_games : 0,
    accuracy: user ? getAverageAccuracy() : 0,
  };

  const pillars = [
    {
      number: "0.1",
      label: "Misiune",
      title: "Învață prin practică",
    },
    {
      number: "0.2",
      label: "Viziune",
      title: "Înțelege tehnologia de azi",
    },
    {
      number: "0.3",
      label: "Ambiție",
      title: "Construiește viitorul",
    },
  ];

  const products = [
    {
      icon: BookOpen,
      name: "Lecții Interactive",
      description: "6 module complete despre hardware",
      link: "/lectii",
      color: "primary",
    },
    {
      icon: Gamepad2,
      name: "Joc de Asamblare",
      description: "Drag & drop pentru a construi un PC",
      link: "/joc",
      color: "accent",
    },
    {
      icon: Trophy,
      name: "Clasament Live",
      description: "Competiție și achievements",
      link: "/clasament",
      color: "primary",
    },
    {
      icon: Zap,
      name: "TechQuiz",
      description: "Quiz-uri live cu colegii",
      link: "/quiz",
      color: "accent",
    },
  ];

  const components = [
    { icon: Cpu, label: "CPU", desc: "Procesor" },
    { icon: CircuitBoard, label: "Placă de Bază", desc: "Motherboard" },
    { icon: HardDrive, label: "SSD", desc: "Stocare" },
    { icon: Monitor, label: "GPU", desc: "Grafică" },
    { icon: Fan, label: "Cooler", desc: "Răcire" },
    { icon: Cable, label: "PSU", desc: "Alimentare" },
  ];

  const stats_display = [
    { label: "Lecții", value: "6", suffix: "module" },
    { label: "Componente", value: "8", suffix: "de învățat" },
    { label: "Elevi", value: "100+", suffix: "activi" },
  ];

  return (
    <MainLayout>
      {/* Hero Section - Full Screen */}
      <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden bg-background">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
          {/* Top announcement */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link 
              to="/lectii" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <span>Descoperă viitorul în fiecare lecție</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Main title */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-4 text-primary"
            >
              <Cpu className="h-8 w-8 md:h-10 md:w-10" />
              <span className="text-lg md:text-xl font-light tracking-wider uppercase">
                PC Builder Academy
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-none"
            >
              <span className="block text-foreground">Învață.</span>
              <span className="block text-foreground">Construiește.</span>
              <span className="block gradient-text">Excelează.</span>
            </motion.h1>
          </div>

          {/* Categories / Products Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center gap-3"
          >
            <span className="text-sm text-muted-foreground mr-2">Explorează</span>
            {products.slice(0, 3).map((product) => (
              <Link
                key={product.name}
                to={product.link}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 group
                  ${product.color === 'primary' 
                    ? 'border-primary/30 hover:bg-primary hover:text-primary-foreground' 
                    : 'border-accent/30 hover:bg-accent hover:text-accent-foreground'
                  }`}
              >
                <product.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{product.name}</span>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Hero image placeholder - floating components */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-2/3 hidden lg:block pointer-events-none">
          <div className="relative w-full h-full">
            {components.slice(0, 4).map((comp, i) => (
              <motion.div
                key={comp.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                className="absolute text-primary"
                style={{
                  left: `${20 + (i % 2) * 40}%`,
                  top: `${15 + Math.floor(i / 2) * 35}%`,
                }}
              >
                <comp.icon className="h-20 w-20 md:h-28 md:w-28" strokeWidth={1} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Details Section - Dark */}
      <section className="py-24 md:py-32 bg-card relative">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight">
              <span className="text-muted-foreground">La PC Builder Academy</span>
              <br />
              <span className="text-foreground">Formăm viitorii experți IT</span>
            </h2>
          </motion.div>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="text-primary font-mono">{pillar.number}</span>
                  <span>{pillar.label}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <div className="mt-4 h-px bg-gradient-to-r from-border via-border to-transparent" />
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 pt-12 border-t border-border"
          >
            <div className="grid grid-cols-3 gap-8">
              {stats_display.map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-2xl md:text-3xl font-light text-foreground">
                    {stat.value} <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section - Light feel */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 circuit-pattern opacity-5" />
        
        <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              Ce Oferim
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-light mb-16"
          >
            Abordare Interactivă
          </motion.h2>

          {/* Products grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={product.link}
                  className="group block p-8 md:p-10 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className={`p-3 rounded-xl ${
                      product.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                    }`}>
                      <product.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Components Showcase */}
      <section className="py-24 md:py-32 bg-card">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
              Ce vei <span className="gradient-text">învăța</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Componentele esențiale ale unui calculator personal
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {components.map((comp, index) => (
              <motion.div
                key={comp.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group p-6 rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-center"
              >
                <comp.icon className="h-10 w-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-medium text-foreground">{comp.label}</span>
                <span className="block text-xs text-muted-foreground mt-1">{comp.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Progress / CTA Section */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Progress info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Trophy className="h-5 w-5" />
                </div>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  {user ? "Progresul Tău" : "Statistici"}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-light mb-8">
                {user 
                  ? "Continuă unde ai rămas" 
                  : "Începe călătoria în lumea hardware"
                }
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Lecții completate</span>
                  </div>
                  <span className="text-xl font-medium text-foreground">
                    {isLoading ? "..." : `${userProgress.lessonsCompleted}/${userProgress.totalLessons}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-accent" />
                    <span className="text-foreground">Cel mai bun scor</span>
                  </div>
                  <span className="text-xl font-medium gradient-text">
                    {isLoading ? "..." : userProgress.bestScore.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Jocuri finalizate</span>
                  </div>
                  <span className="text-xl font-medium text-foreground">
                    {isLoading ? "..." : userProgress.gamesPlayed}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right - CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="p-8 md:p-12 rounded-2xl border border-border bg-card relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-light mb-4">
                    Gata să <span className="gradient-text">începi</span>?
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Alege modul care ți se potrivește: învățare pas cu pas sau direct la acțiune!
                  </p>

                  <div className="space-y-3">
                    <Button asChild size="lg" className="w-full justify-between group">
                      <Link to="/lectii">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Vreau să Învăț
                        </span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>

                    <Button asChild size="lg" variant="outline" className="w-full justify-between border-accent text-accent hover:bg-accent hover:text-accent-foreground group">
                      <Link to="/joc">
                        <span className="flex items-center gap-2">
                          <Play className="h-5 w-5" />
                          Vreau să Joc
                        </span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
