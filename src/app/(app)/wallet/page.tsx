"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WalletCards, Coins, PlusCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { sampleWalletBalance } from "@/lib/sample-data";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { toast } = useToast();
  const { coins, transactions } = sampleWalletBalance;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <WalletCards className="h-8 w-8" /> Digital Wallet
        </h1>
        <Button onClick={() => toast({ title: "Add Funds (Mock)", description: "This feature is for demonstration."})} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Coins
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Coins className="h-6 w-6 text-primary"/>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-primary">{coins} <span className="text-2xl text-muted-foreground">Coins</span></p>
          <CardDescription className="mt-1">Use coins for premium features and services.</CardDescription>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity in your wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No transactions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell className={`text-right font-medium ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="inline-flex items-center gap-1">
                        {txn.type === 'credit' ? <ArrowUpCircle className="h-4 w-4"/> : <ArrowDownCircle className="h-4 w-4"/>}
                        {txn.amount > 0 ? `+${txn.amount}` : txn.amount} Coins
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
