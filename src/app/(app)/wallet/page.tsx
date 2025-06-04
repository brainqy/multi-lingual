"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WalletCards, Coins, PlusCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { sampleWalletBalance } from "@/lib/sample-data";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { coins, transactions } = sampleWalletBalance;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <WalletCards className="h-8 w-8" /> {t("wallet.title", "Digital Wallet")}
        </h1>
        <Button
          onClick={() =>
            toast({
              title: t("wallet.addFundsToastTitle", "Add Funds (Mock)"),
              description: t("wallet.addFundsToastDesc", "This feature is for demonstration."),
            })
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> {t("wallet.addCoins", "Add Coins")}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            {t("wallet.currentBalance", "Current Balance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-primary">
            {coins} <span className="text-2xl text-muted-foreground">{t("wallet.coins", "Coins")}</span>
          </p>
          <CardDescription className="mt-1">
            {t("wallet.usageHint", "Use coins for premium features and services.")}
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("wallet.transactionHistory", "Transaction History")}</CardTitle>
          <CardDescription>{t("wallet.recentActivity", "Recent activity in your wallet.")}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t("wallet.noTransactions", "No transactions yet.")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("wallet.date", "Date")}</TableHead>
                  <TableHead>{t("wallet.description", "Description")}</TableHead>
                  <TableHead className="text-right">{t("wallet.amount", "Amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
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
                        {txn.amount > 0 ? `+${txn.amount}` : txn.amount} {t("wallet.coins", "Coins")}
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
