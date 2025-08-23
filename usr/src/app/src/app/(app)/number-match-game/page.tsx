
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
import { useI18n } from "@/hooks/use-i18n";


const GAME_COST = 100;
const MAX_ATTEMPTS = 10;
const WINNING_NUMBER = 777;
const WIN_REWARD = 500;

export default function NumberMatchGamePage() {
  const { t } = useI18n();
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [generatedNumber, setGeneratedNumber] = useState<string>("___");
  const [message, setMessage] = useState(t("numberMatchGame.initialMessage"));
  const [isGameActive, setIsGameActive] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [isRolling, setIsRolling] = useState(false);
  const [totalConsolationPrize, setTotalConsolationPrize] = useState(0);
  const [lastPrize, setLastPrize] = useState(0);
  const [showPrize, setShowPrize] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePlay = () => {
    if (isRolling || !isGameActive) {
      if (!isGameActive) {
        toast({ title: t("numberMatchGame.toast.gameOver.title"), description: t("numberMatchGame.toast.gameOver.description"), variant: "destructive" });
      }
      return;
    }
    
    // Check for fee only on the first play of a session
    if (!gameStarted) {
      if (sampleWalletBalance.coins < GAME_COST) {
        toast({ title: t("numberMatchGame.toast.insufficientCoins.title"), description: t("numberMatchGame.toast.insufficientCoins.description", { cost: GAME_COST }), variant: "destructive" });
        return;
      }

      // Deduct cost and add transaction ONCE per game session.
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
      setGameStarted(true); // Mark the game as started, so the fee isn't charged again
      toast({ title: t("numberMatchGame.toast.gameStart.title", { cost: GAME_COST }), description: t("numberMatchGame.toast.gameStart.description") });
    }

    // Proceed with rolling logic for every attempt
    setIsRolling(true);
    setMessage(t("numberMatchGame.rollingMessage"));
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
        setMessage(t("numberMatchGame.winMessage", { reward: WIN_REWARD }));
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
        toast({ title: t("numberMatchGame.toast.win.title"), description: t("numberMatchGame.toast.win.description", { reward: WIN_REWARD }) });
      } else {
        const prize = Math.floor(Math.random() * (GAME_COST * 0.05)); 
        const updatedTotalConsolation = totalConsolationPrize + prize;
        setTotalConsolationPrize(updatedTotalConsolation);
        
        setLastPrize(prize);
        if (prize > 0) {
            setShowPrize(true);
            setTimeout(() => setShowPrize(false), 1500);
        }

        if (newAttemptsLeft <= 0) {
          setMessage(t("numberMatchGame.gameOverMessage", { total: updatedTotalConsolation }));
          setIsGameActive(false);
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
          setMessage(t("numberMatchGame.notAMatchMessage"));
        }
      }
    };
  };

  const handleReset = () => {
    setAttemptsLeft(MAX_ATTEMPTS);
    setGeneratedNumber("___");
    setMessage(t("numberMatchGame.resetMessage"));
    setIsGameActive(true);
    setIsWinner(false);
    setIsRolling(false);
    setTotalConsolationPrize(0);
    setShowPrize(false);
    setGameStarted(false); // Reset the game started flag for the next session
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {isClient && isWinner && <Confetti recycle={false} />}
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8" />
            {t("numberMatchGame.title")}
          </CardTitle>
          <CardDescription>
            {t("numberMatchGame.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!isGameActive && !isWinner) ? (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold">{t("numberMatchGame.gameOverTitle")}</h2>
              <p className="text-muted-foreground mt-2">{t("numberMatchGame.consolationPrizeMessage")}</p>
              <p className="text-5xl font-bold text-primary my-2">{totalConsolationPrize} {t("numberMatchGame.coins")}</p>
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
                      +{lastPrize} <span className="text-xl">{t("numberMatchGame.coins")}!</span>
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
                  <span>{t("numberMatchGame.cost")}: {GAME_COST} {t("numberMatchGame.coins")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-blue-500" />
                  <span>{t("numberMatchGame.attemptsLeft")}: {attemptsLeft}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handlePlay} disabled={!isGameActive || isRolling} size="lg" className="w-full bg-primary hover:bg-primary/90">
            {isRolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Dices className="mr-2 h-5 w-5" />}
            {isRolling ? t("numberMatchGame.rollingButton") : t("numberMatchGame.playButton")}
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full">
            {t("numberMatchGame.resetButton")}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="w-full max-w-md mt-6">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Puzzle className="h-5 w-5" /> {t("numberMatchGame.otherGames")}</CardTitle>
        </CardHeader>
        <CardContent>
            <Button asChild className="w-full">
                <Link href="/kbc-game">{t("numberMatchGame.playKBC")}</Link>
            </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Gift className="h-5 w-5" /> {t("numberMatchGame.prizeTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-2xl font-bold text-green-600">
            {WIN_REWARD} {t("numberMatchGame.coins")}!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
