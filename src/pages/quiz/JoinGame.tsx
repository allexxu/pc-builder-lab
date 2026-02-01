import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import QuizLayout from "@/components/quiz/QuizLayout";
import { supabase } from "@/integrations/supabase/client";
import { isValidPin, isValidNickname } from "@/lib/quiz-utils";

const JoinGame = () => {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePinChange = (value: string) => {
    // Only allow digits, max 6
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setPin(digitsOnly);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPin(pin)) {
      toast({
        title: "Cod invalid",
        description: "Codul trebuie să aibă exact 6 cifre.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidNickname(nickname)) {
      toast({
        title: "Nickname invalid",
        description: "Nickname-ul trebuie să aibă între 2 și 20 de caractere.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if game session exists and is in waiting state
      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .select("id, status")
        .eq("game_pin", pin)
        .maybeSingle();

      if (sessionError) throw sessionError;

      if (!session) {
        toast({
          title: "Joc negăsit",
          description: "Nu există niciun joc cu acest cod. Verifică și încearcă din nou.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (session.status !== "waiting") {
        toast({
          title: "Joc indisponibil",
          description: "Acest joc a început deja sau s-a terminat.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Add participant
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          session_id: session.id,
          nickname: nickname.trim(),
        })
        .select("id")
        .single();

      if (participantError) throw participantError;

      // Store participant ID in session storage for this game
      sessionStorage.setItem(`quiz_participant_${pin}`, participant.id);
      sessionStorage.setItem(`quiz_nickname_${pin}`, nickname.trim());

      // Navigate to lobby
      navigate(`/quiz/lobby/${pin}`);
    } catch (error) {
      console.error("Error joining game:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut alătura jocului. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuizLayout>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Intră în Joc</CardTitle>
            <CardDescription>
              Introdu codul primit de la profesor și alege un nickname
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pin">Cod de acces</Label>
                <Input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="text-center text-2xl tracking-[0.3em] font-mono h-14"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Numele tău în joc"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  {nickname.length}/20 caractere
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || pin.length !== 6 || nickname.trim().length < 2}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Intră în Joc
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </QuizLayout>
  );
};

export default JoinGame;
