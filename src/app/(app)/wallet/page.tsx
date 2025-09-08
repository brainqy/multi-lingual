
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WalletCards, Coins, PlusCircle, ArrowDownCircle, ArrowUpCircle, Gift, Info, History, Loader2, Star, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isPast, parseISO, formatDistanceToNowStrict } from "date-fns";
import type { Wallet, WalletTransaction } from "@/types";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { redeemPromoCode } from "@/lib/actions/promo-codes";
import { purchaseStreakFreeze } from "@/lib/actions/wallet";
import { useSettings } from "@/contexts/settings-provider";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

export default function WalletPage() {
  const { t } = useI18n();
  const { user, wallet, isLoading: isAuthLoading, refreshWallet } = useAuth();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const totalFlashCoins = useMemo(() => {
    if (!wallet || !wallet.flashCoins) return 0;
    return wallet.flashCoins.filter(fc => !isPast(new Date(fc.expiresAt))).reduce((sum, fc) => sum + fc.amount, 0);
  }, [wallet]);

  const coinTransactions = useMemo(() => {
    if (!wallet) return [];
    return wallet.transactions.filter(txn => txn.currency === 'coins');
  }, [wallet]);

  const xpTransactions = useMemo(() => {
    if (!wallet) return [];
    return wallet.transactions.filter(txn => txn.currency === 'xp');
  }, [wallet]);

  const handleRedeemCode = async () => {
    if (!promoCodeInput.trim() || !user) return;
    setIsRedeeming(true);
    const result = await redeemPromoCode(promoCodeInput, user.id);

    if (result.success) {
      toast({ title: "Success!", description: result.message });
      await refreshWallet(); // Re-fetch wallet from the auth context
    } else {
      toast({ title: "Redemption Failed", description: result.message, variant: "destructive" });
    }
    setPromoCodeInput('');
    setIsRedeeming(false);
  };
  
  const handleBuyStreakFreeze = async () => {
    if (!user) return;
    setIsBuying(true);
    const result = await purchaseStreakFreeze(user.id);
    if (result.success) {
        toast({ title: "Purchase Successful!", description: result.message });
        await refreshWallet();
    } else {
        toast({ title: "Purchase Failed", description: result.message, variant: "destructive"});
    }
    setIsBuying(false);
  };

  if (!settings?.walletEnabled) {
    return <AccessDeniedMessage title="Feature Disabled" message="The Digital Wallet feature is currently disabled by the platform administrator." />;
  }

  if (isAuthLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }
  
  if (!wallet || !user) {
      return <p>Could not load wallet information.</p>;
  }

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-6 w-6 text-primary" />
                        {t("wallet.mainBalanceTitle")}
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
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-6 w-6 text-yellow-500" />
                        {t("wallet.xpBalanceTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold text-yellow-500">
                        {user.xpPoints || 0} <span className="text-2xl text-muted-foreground">XP</span>
                    </p>
                    <CardDescription className="mt-1">
                        {t("wallet.xpUsageHint")}
                    </CardDescription>
                </CardContent>
            </Card>

            <Card className="shadow-lg bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        {t("wallet.flashCoinsTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold text-primary">
                        {totalFlashCoins} <span className="text-2xl text-muted-foreground">{t("wallet.flash")}</span>
                    </p>
                    <CardDescription className="mt-1">
                        {t("wallet.flashCoinsHint")}
                    </CardDescription>
                </CardContent>
            </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary"/>{t("wallet.redeemTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col sm:flex-row items-end gap-2">
                  <div className="flex-grow w-full">
                      <Label htmlFor="promo-code-input">{t("wallet.enterCode")}</Label>
                      <Input id="promo-code-input" placeholder={t("wallet.codePlaceholder")} value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} />
                  </div>
                  <Button onClick={handleRedeemCode} disabled={isRedeeming} className="w-full sm:w-auto">
                      {isRedeeming && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                      {t("wallet.redeemButton")}
                  </Button>
              </div>
          </CardContent>
        </Card>

        {settings.gamificationEnabled && (
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>{t("wallet.streakFreezeTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="text-center sm:text-left">
                        <p className="font-medium">{t("wallet.youHave")} <span className="text-2xl font-bold text-primary">{user.streakFreezes || 0}</span> {t("wallet.streakFreezes")}</p>
                        <p className="text-xs text-muted-foreground">{t("wallet.streakFreezeDescription")}</p>
                    </div>
                    <Button onClick={handleBuyStreakFreeze} disabled={isBuying || (wallet?.coins ?? 0) < 500} className="w-full sm:w-auto mt-2 sm:mt-0">
                        {isBuying && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {t("wallet.buyButton", { cost: 500 })} <Coins className="ml-1 h-4 w-4"/>
                    </Button>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Tabs defaultValue="coin_transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coin_transactions">{t("wallet.coinTransactions")}</TabsTrigger>
          <TabsTrigger value="xp_history">{t("wallet.xpHistory")}</TabsTrigger>
          <TabsTrigger value="flash_coins">{t("wallet.flashCoinHistory")}</TabsTrigger>
        </TabsList>
        <TabsContent value="coin_transactions">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />{t("wallet.coinTransactionHistory")}</CardTitle>
              <CardDescription>{t("wallet.recentActivity")}</CardDescription>
            </CardHeader>
            <CardContent>
              {coinTransactions.length === 0 ? (
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
                    {coinTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell
                          className={cn("text-right font-medium",
                            txn.type === "credit" ? "text-green-600" : "text-red-600"
                          )}
                        >
                          <span className="inline-flex items-center gap-1">
                            {txn.type === "credit" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                            {txn.amount > 0 ? `+${txn.amount}` : txn.amount} {t(`wallet.coins`)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="xp_history">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />{t("wallet.xpHistory")}</CardTitle>
              <CardDescription>{t("wallet.recentXPEarnings")}</CardDescription>
            </CardHeader>
            <CardContent>
              {xpTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {t("wallet.noXPTransactions")}
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
                    {xpTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell className="text-right font-medium text-yellow-500">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {txn.amount > 0 ? `+${txn.amount}` : txn.amount} XP
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="flash_coins">
           {wallet.flashCoins && wallet.flashCoins.length > 0 ? (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t("wallet.flashCoinDetails")}
                    </CardTitle>
                    <CardDescription>
                        {t("wallet.flashCoinDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground w-full">
                        {wallet.flashCoins.map(fc => (
                            <li key={fc.id} className={cn(
                                "flex justify-between items-center p-2 rounded-md",
                                isPast(new Date(fc.expiresAt)) ? 'bg-secondary/50 opacity-60' : 'bg-secondary'
                            )}>
                                <div>
                                    <span className="font-medium text-foreground">+ {fc.amount} {t("wallet.coins")}</span>
                                    <span className="text-xs italic ml-2">{t("wallet.fromSource", { source: fc.source })}</span>
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold",
                                    isPast(new Date(fc.expiresAt)) ? 'text-red-500' : 'text-foreground'
                                )}>
                                    {isPast(new Date(fc.expiresAt)) 
                                        ? t("wallet.expired") 
                                        : t("wallet.expiresIn", { duration: formatDistanceToNowStrict(new Date(fc.expiresAt)) })
                                    }
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
           ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />{t("wallet.flashCoinHistory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-4">{t("wallet.noFlashCoinHistory")}</p>
              </CardContent>
            </Card>
           )}
        </TabsContent>
      </Tabs>

    </div>
  );
}
