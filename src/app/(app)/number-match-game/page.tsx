
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleWalletBalance } from "@/lib/sample-data";
import { Coins, Dices, Gift, Repeat, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";

const GAME_COST = 10;
const MAX_ATTEMPTS = 10;
const WINNING_NUMBER = 777;
const WIN_REWARD = 500;

export default function NumberMatchGamePage() {
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [generatedNumber, setGeneratedNumber] = useState<string>("___");
  const [message, setMessage] = useState("Click 'Play' to start the game!");
  const [isGameActive, setIsGameActive] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePlay = () => {
    if (!isGameActive) {
      toast({ title: "Game Over", description: "Please reset to play again.", variant: "destructive" });
      return;
    }

    if (sampleWalletBalance.coins < GAME_COST) {
      toast({ title: "Insufficient Coins", description: `You need ${GAME_COST} coins to play.`, variant: "destructive" });
      return;
    }

    // Deduct coins (mock)
    sampleWalletBalance.coins -= GAME_COST;

    const newNumber = Math.floor(100 + Math.random() * 900);
    setGeneratedNumber(String(newNumber));
    setAttemptsLeft(prev => prev - 1);

    if (newNumber === WINNING_NUMBER) {
      setMessage(`It's 777! You won ${WIN_REWARD} coins!`);
      setIsWinner(true);
      setIsGameActive(false);
      // Award prize (mock)
      sampleWalletBalance.coins += WIN_REWARD;
      toast({ title: "Congratulations!", description: `You won ${WIN_REWARD} coins! They have been added to your wallet.` });
    } else {
      if (attemptsLeft - 1 <= 0) {
        setMessage("Game Over! Better luck next time.");
        setIsGameActive(false);
      } else {
        setMessage("Not a match. Try again!");
      }
    }
  };

  const handleReset = () => {
    setAttemptsLeft(MAX_ATTEMPTS);
    setGeneratedNumber("___");
    setMessage("Click 'Play' to start a new game!");
    setIsGameActive(true);
    setIsWinner(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {isClient && isWinner && <Confetti />}
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8" />
            Number Match Game
          </CardTitle>
          <CardDescription>
            Match the number 777 to win a big prize!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-8 bg-muted rounded-lg shadow-inner">
            <p
              className={cn(
                "text-6xl font-mono font-bold tracking-widest transition-colors duration-300",
                isWinner ? "text-green-500" : "text-foreground",
                !isGameActive && !isWinner ? "text-destructive" : ""
              )}
            >
              {generatedNumber}
            </p>
          </div>
          <div className="text-lg font-medium text-muted-foreground">
            {message}
          </div>
          <div className="flex justify-around items-center text-sm">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span>Cost: {GAME_COST} Coins</span>
            </div>
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-blue-500" />
              <span>Attempts Left: {attemptsLeft}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handlePlay} disabled={!isGameActive} size="lg" className="w-full bg-primary hover:bg-primary/90">
            <Dices className="mr-2 h-5 w-5" /> Play Now
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full">
            Reset Game
          </Button>
        </CardFooter>
      </Card>
      <Card className="w-full max-w-md mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Gift className="h-5 w-5" /> Prize</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-2xl font-bold text-green-600">
            {WIN_REWARD} Coins!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
