
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WalletCards, Coins, PlusCircle, ArrowDownCircle, ArrowUpCircle, Gift, Info, History } from "lucide-react";
import { sampleWalletBalance, samplePromoCodes } from "@/lib/sample-data";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isPast, parseISO, formatDistanceToNowStrict } from "date-fns";
import type { Wallet } from "@/types";

export default function WalletPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet>(sampleWalletBalance);
  const [promoCodeInput, setPromoCodeInput] = useState('');

  // Augment wallet with flash coins on component mount for demo purposes
  useEffect(() => {
    // This ensures we only add flash coins once and don't modify the original sample data import
    if (!wallet.flashCoins) {
      setWallet(currentWallet => ({
        ...currentWallet,
        flashCoins: [
          { id: 'fc1', amount: 20, expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(), source: 'Daily Login Bonus' },
          { id: 'fc2', amount: 50, expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), source: 'Special Promotion' },
          { id: 'fc3', amount: 10, expiresAt: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'Expired Offer' },
        ]
      }));
    }
  }, [wallet.flashCoins]);

  const totalFlashCoins = useMemo(() => {
    return wallet.flashCoins?.filter(fc => !isPast(parseISO(fc.expiresAt))).reduce((sum, fc) => sum + fc.amount, 0) || 0;
  }, [wallet.flashCoins]);

  const handleRedeemCode = () => {
    if (!promoCodeInput.trim()) {
        toast({ title: "No Code Entered", description: "Please enter a promo code to redeem.", variant: "destructive" });
        return;
    }
    const codeToRedeem = samplePromoCodes.find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase());

    if (!codeToRedeem) {
        toast({ title: "Invalid Code", description: "The promo code you entered is not valid.", variant: "destructive" });
        return;
    }
    if (!codeToRedeem.isActive) {
        toast({ title: "Code Inactive", description: "This promo code is currently inactive.", variant: "destructive" });
        return;
    }
    if (codeToRedeem.expiresAt && isPast(parseISO(codeToRedeem.expiresAt))) {
        toast({ title: "Code Expired", description: "This promo code has expired.", variant: "destructive" });
        return;
    }
    if (codeToRedeem.usageLimit > 0 && (codeToRedeem.timesUsed || 0) >= codeToRedeem.usageLimit) {
        toast({ title: "Usage Limit Reached", description: "This promo code has reached its usage limit.", variant: "destructive" });
        return;
    }
    
    // Simulate reward
    let newBalance = wallet.coins;
    let newTransactions = [...wallet.transactions];
    if (codeToRedeem.rewardType === 'coins') {
        newBalance += codeToRedeem.rewardValue;
        newTransactions.unshift({
            id: `txn-promo-${Date.now()}`,
            tenantId: wallet.tenantId,
            userId: wallet.userId,
            date: new Date().toISOString(),
            description: `Promo Code Redeemed: ${codeToRedeem.code}`,
            amount: codeToRedeem.rewardValue,
            type: 'credit',
        });
        setWallet({
            ...wallet, // Preserve other properties like flashCoins
            coins: newBalance,
            transactions: newTransactions,
        });
        toast({ title: "Success!", description: `You've received ${codeToRedeem.rewardValue} coins!` });

        // Update sample data (for demo persistence)
        sampleWalletBalance.coins = newBalance;
        sampleWalletBalance.transactions = newTransactions;
        codeToRedeem.timesUsed = (codeToRedeem.timesUsed || 0) + 1;
    } else {
        toast({ title: "Reward Type Not Supported", description: `This app currently only supports 'coins' rewards. Reward type was '${codeToRedeem.rewardType}'.` });
    }

    setPromoCodeInput('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <WalletCards className="h-8 w-8" /> {t("wallet.title")}
        </h1>
        <Button
          onClick={() =>
            toast({
              title: t("wallet.addFundsToastTitle"),
              description: t("wallet.addFundsToastDesc"),
            })
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> {t("wallet.addCoins")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-6 w-6 text-primary" />
                        Main Wallet Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold text-primary">
                        {wallet.coins} <span className="text-2xl text-muted-foreground">{t("wallet.coins")}</span>
                    </p>
                    <CardDescription className="mt-1">
                        {t("wallet.usageHint")}
                    </CardDescription>
                </CardContent>
            </Card>

            <Card className="shadow-lg bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Flash Coins
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold text-primary">
                        {totalFlashCoins} <span className="text-2xl text-muted-foreground">Flash</span>
                    </p>
                    <CardDescription className="mt-1">
                        Limited-time promotional coins. Used automatically before regular coins.
                    </CardDescription>
                </CardContent>
                <CardFooter>
                    <ul className="space-y-1 text-xs text-muted-foreground w-full">
                        {wallet.flashCoins?.map(fc => (
                            <li key={fc.id} className={`flex justify-between items-center ${isPast(parseISO(fc.expiresAt)) ? 'line-through opacity-50' : ''}`}>
                                <span>+ {fc.amount} coins from {fc.source}</span>
                                <span>
                                    {isPast(parseISO(fc.expiresAt)) 
                                        ? 'Expired' 
                                        : `Expires in ${formatDistanceToNowStrict(parseISO(fc.expiresAt))}`
                                    }
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardFooter>
            </Card>
        </div>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary"/>Redeem a Promo Code</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-end gap-2">
                <div className="flex-grow w-full">
                    <Label htmlFor="promo-code-input">Enter Code</Label>
                    <Input id="promo-code-input" placeholder="e.g., WELCOME50" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} />
                </div>
                <Button onClick={handleRedeemCode} className="w-full sm:w-auto">Redeem</Button>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />{t("wallet.transactionHistory")}</CardTitle>
          <CardDescription>{t("wallet.recentActivity")}</CardDescription>
        </CardHeader>
        <CardContent>
          {wallet.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t("wallet.noTransactions")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("wallet.date")}</TableHead>
                  <TableHead>{t("wallet.description")}</TableHead>
                  <TableHead className="text-right">{t("wallet.amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallet.transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        txn.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {txn.type === "credit" ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                        {txn.amount > 0 ? `+${txn.amount}` : txn.amount} {t("wallet.coins")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
