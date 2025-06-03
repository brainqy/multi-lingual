
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Handshake } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Target, CheckCircle, XCircle, Users, BarChart3, DollarSign, Search, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate, AffiliateStatus } from "@/types";
import { sampleAffiliates, sampleAffiliateClicks, sampleAffiliateSignups, sampleUserProfile } from "@/lib/sample-data";
import { format } from "date-fns";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

export default function AffiliateManagementPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(sampleAffiliates);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  // Update local state if global sampleAffiliates changes (for demo persistence)
  useEffect(() => {
    setAffiliates(sampleAffiliates);
  }, []);


  const handleAffiliateStatusChange = (affiliateId: string, newStatus: AffiliateStatus) => {
    setAffiliates(prev =>
      prev.map(aff =>
        aff.id === affiliateId ? { ...aff, status: newStatus } : aff
      )
    );
    const globalIndex = sampleAffiliates.findIndex(a => a.id === affiliateId);
    if(globalIndex !== -1) sampleAffiliates[globalIndex].status = newStatus;
    
    const affiliate = affiliates.find(a => a.id === affiliateId);
    toast({
      title: `Affiliate ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      description: `Affiliate ${affiliate?.name || affiliateId} has been ${newStatus}.`,
    });
  };

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter(affiliate =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [affiliates, searchTerm]);

  const affiliateStats = useMemo(() => {
    const totalAffiliates = affiliates.length;
    const totalClicks = sampleAffiliateClicks.length;
    const totalSignups = sampleAffiliateSignups.length;
    const totalCommissionsPaid = sampleAffiliateSignups.reduce((sum, signup) => sum + (signup.commissionEarned || 0), 0);
    return { totalAffiliates, totalClicks, totalSignups, totalCommissionsPaid };
  }, [affiliates]);

  const getAffiliateSignupsCount = (affiliateId: string) => {
    return sampleAffiliateSignups.filter(s => s.affiliateId === affiliateId).length;
  };

  const getAffiliateEarnedAmount = (affiliateId: string) => {
    return sampleAffiliateSignups
      .filter(s => s.affiliateId === affiliateId)
      .reduce((sum, signup) => sum + (signup.commissionEarned || 0), 0);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Target className="h-8 w-8" /> Affiliate Management
      </h1>
      <CardDescription>Oversee and manage affiliate partners, their performance, and applications.</CardDescription>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateStats.totalAffiliates}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks (Platform)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateStats.totalClicks}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups (Affiliated)</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateStats.totalSignups}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateStats.totalCommissionsPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Affiliate List</CardTitle>
          <div className="mt-2">
            <Input
              placeholder="Search affiliates (name, email, code)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAffiliates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No affiliates found matching your criteria.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Signups</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">{affiliate.name}</TableCell>
                    <TableCell>{affiliate.email}</TableCell>
                    <TableCell className="font-mono text-xs">{affiliate.affiliateCode}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        affiliate.status === 'approved' ? 'bg-green-100 text-green-700' :
                        affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {affiliate.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{getAffiliateSignupsCount(affiliate.id)}</TableCell>
                    <TableCell className="text-right">${getAffiliateEarnedAmount(affiliate.id).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(affiliate.commissionRate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-right space-x-1">
                      {affiliate.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleAffiliateStatusChange(affiliate.id, 'approved')} className="text-green-600 border-green-600 hover:bg-green-50">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleAffiliateStatusChange(affiliate.id, 'rejected')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {affiliate.status === 'approved' && (
                         <Button variant="outline" size="sm" disabled>Approved</Button>
                      )}
                       {affiliate.status === 'rejected' && (
                         <Button variant="outline" size="sm" disabled>Rejected</Button>
                      )}
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
