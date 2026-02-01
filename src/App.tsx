import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Quiz pages
import QuizHome from "./pages/quiz/QuizHome";
import JoinGame from "./pages/quiz/JoinGame";
import Lobby from "./pages/quiz/Lobby";
import PlayQuiz from "./pages/quiz/PlayQuiz";
import Results from "./pages/quiz/Results";
import AdminLogin from "./pages/quiz/admin/AdminLogin";
import Dashboard from "./pages/quiz/admin/Dashboard";
import QuizEditor from "./pages/quiz/admin/QuizEditor";
import GameControl from "./pages/quiz/admin/GameControl";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lectii" element={<Lessons />} />
            <Route path="/lectii/:slug" element={<LessonDetail />} />
            <Route path="/joc" element={<Game />} />
            <Route path="/clasament" element={<Leaderboard />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Quiz Routes */}
            <Route path="/quiz" element={<QuizHome />} />
            <Route path="/quiz/join" element={<JoinGame />} />
            <Route path="/quiz/lobby/:gamePin" element={<Lobby />} />
            <Route path="/quiz/play/:gamePin" element={<PlayQuiz />} />
            <Route path="/quiz/results/:gamePin" element={<Results />} />
            
            {/* Quiz Admin Routes */}
            <Route path="/quiz/admin/login" element={<AdminLogin />} />
            <Route path="/quiz/admin" element={<Dashboard />} />
            <Route path="/quiz/admin/edit/:quizId" element={<QuizEditor />} />
            <Route path="/quiz/admin/control/:gamePin" element={<GameControl />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
