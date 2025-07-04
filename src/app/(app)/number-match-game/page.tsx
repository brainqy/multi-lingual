
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleWalletBalance } from "@/lib/sample-data";
import { Coins, Dices, Gift, Repeat, Trophy, Loader2, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";
import Link from "next/link";


const GAME_COST = 100;
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
  const [isRolling, setIsRolling] = useState(false);
  const [totalConsolationPrize, setTotalConsolationPrize] = useState(0);
  const [lastPrize, setLastPrize] = useState(0);
  const [showPrize, setShowPrize] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePlay = () => {
    if (isRolling || !isGameActive) {
      if (!isGameActive) {
        toast({ title: "Game Over", description: "Please reset to play again.", variant: "destructive" });
      }
      return;
    }

    if (sampleWalletBalance.coins < GAME_COST) {
      toast({ title: "Insufficient Coins", description: `You need ${GAME_COST} coins to play.`, variant: "destructive" });
      return;
    }

    // Debit cost and add transaction ONCE per play session.
    // This logic assumes a "play" click is one attempt.
    sampleWalletBalance.coins -= GAME_COST;
    sampleWalletBalance.transactions.unshift({
      id: `txn-gamecost-${Date.now()}`,
      tenantId: sampleUserProfile.tenantId,
      userId: sampleUserProfile.id,
      date: new Date().toISOString(),
      description: "Number Match Game Fee",
      amount: -GAME_COST,
      type: 'debit',
    });

    setIsRolling(true);
    setMessage("Rolling...");
    setShowPrize(false);

    let rollCount = 0;
    const maxRolls = 15;
    const rollInterval = setInterval(() => {
      setGeneratedNumber(String(Math.floor(100 + Math.random() * 900)));
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        finishRoll();
      }
    }, 50);

    const finishRoll = () => {
      const newNumber = Math.floor(100 + Math.random() * 900);
      setGeneratedNumber(String(newNumber));
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);
      setIsRolling(false);

      if (newNumber === WINNING_NUMBER) {
        setMessage(`It's 777! You won ${WIN_REWARD} coins!`);
        setIsWinner(true);
        setIsGameActive(false);
        sampleWalletBalance.coins += WIN_REWARD;
        sampleWalletBalance.transactions.unshift({
            id: `txn-gamewin-${Date.now()}`,
            tenantId: sampleUserProfile.tenantId,
            userId: sampleUserProfile.id,
            date: new Date().toISOString(),
            description: "Number Match Game Jackpot!",
            amount: WIN_REWARD,
            type: 'credit',
        });
        toast({ title: "Congratulations!", description: `You won ${WIN_REWARD} coins! They have been added to your wallet.` });
      } else {
        const prize = Math.floor(Math.random() * (GAME_COST * 0.05)); // Random prize up to 5% of cost
        const updatedTotalConsolation = totalConsolationPrize + prize;
        setTotalConsolationPrize(updatedTotalConsolation);
        
        setLastPrize(prize);
        if (prize > 0) {
            setShowPrize(true);
            setTimeout(() => setShowPrize(false), 1500);
        }

        if (newAttemptsLeft <= 0) {
          setMessage(`Game Over! You won a total of ${updatedTotalConsolation} coins.`);
          setIsGameActive(false);
          // Add final consolation prize to wallet and create a single transaction
          if (updatedTotalConsolation > 0) {
            sampleWalletBalance.coins += updatedTotalConsolation;
            sampleWalletBalance.transactions.unshift({
              id: `txn-gameprize-total-${Date.now()}`,
              tenantId: sampleUserProfile.tenantId,
              userId: sampleUserProfile.id,
              date: new Date().toISOString(),
              description: "Number Match Game Consolation Prize (Total)",
              amount: updatedTotalConsolation,
              type: 'credit',
            });
          }
        } else {
          setMessage("Not a match. Better luck next time!");
        }
      }
    };
  };

  const handleReset = () => {
    setAttemptsLeft(MAX_ATTEMPTS);
    setGeneratedNumber("___");
    setMessage("Click 'Play' to start a new game!");
    setIsGameActive(true);
    setIsWinner(false);
    setIsRolling(false);
    setTotalConsolationPrize(0);
    setShowPrize(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {isClient && isWinner && <Confetti recycle={false} />}
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
        <CardContent>
          {(!isGameActive && !isWinner) ? (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold">Game Over!</h2>
              <p className="text-muted-foreground mt-2">You won a total consolation prize of:</p>
              <p className="text-5xl font-bold text-primary my-2">{totalConsolationPrize} Coins</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative p-8 bg-muted rounded-lg shadow-inner bg-gradient-to-br from-secondary to-muted">
                {showPrize && (
                  <div
                    key={attemptsLeft}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-50 slide-in-from-bottom-10 duration-700"
                  >
                    <span className="text-2xl font-bold text-green-500 drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_20%)]">
                      +{lastPrize} <span className="text-xl">Coins!</span>
                    </span>
                  </div>
                )}
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
              <div className="text-lg font-medium text-muted-foreground h-6">
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
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handlePlay} disabled={!isGameActive || isRolling} size="lg" className="w-full bg-primary hover:bg-primary/90">
            {isRolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Dices className="mr-2 h-5 w-5" />}
            {isRolling ? "Rolling..." : "Play Now"}
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full">
            Reset Game
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="w-full max-w-md mt-6">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Puzzle className="h-5 w-5" /> Other Games</CardTitle>
        </CardHeader>
        <CardContent>
            <Button asChild className="w-full">
                <Link href="/kbc-game">Play KBC Quiz Game</Link>
            </Button>
        </CardContent>
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
