
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Affiliate, AffiliateStatus } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface AffiliateTableProps {
  affiliates: Affiliate[];
  handleAffiliateStatusChange: (affiliateId: string, newStatus: AffiliateStatus) => void;
  getAffiliateClicksCount: (affiliateId: string) => number;
  getAffiliateSignupsCount: (affiliateId: string) => number;
  getAffiliateEarnedAmount: (affiliateId: string) => number;
}

export default function AffiliateTable({ 
  affiliates, 
  handleAffiliateStatusChange, 
  getAffiliateClicksCount,
  getAffiliateSignupsCount, 
  getAffiliateEarnedAmount 
}: AffiliateTableProps) {
  const { t } = useI18n();
  
  if (affiliates.length === 0) {
    return <p className="text-center text-muted-foreground py-8">{t("affiliateManagement.table.noResults")}</p>;
  }
  
  const calculateConversionRate = (clicks: number, signups: number) => {
    if (clicks === 0) return "0.00%";
    return `${((signups / clicks) * 100).toFixed(2)}%`;
  };

  const AffiliateCard = ({ affiliate }: { affiliate: Affiliate }) => {
    const clicks = getAffiliateClicksCount(affiliate.id);
    const signups = getAffiliateSignupsCount(affiliate.id);

    return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold">{affiliate.name}</p>
            <p className="text-sm text-muted-foreground">{affiliate.email}</p>
            <p className="font-mono text-xs mt-1">{affiliate.affiliateCode}</p>
          </div>
          <span className={`px-2 py-0.5 text-xs rounded-full capitalize shrink-0 ${
            affiliate.status === 'approved' ? 'bg-green-100 text-green-700' :
            affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {affiliate.status}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-sm border-t pt-3">
          <div>
            <p className="font-semibold">{clicks}</p>
            <p className="text-xs text-muted-foreground">{t("affiliateManagement.table.clicks")}</p>
          </div>
          <div>
            <p className="font-semibold">{signups}</p>
            <p className="text-xs text-muted-foreground">{t("affiliateManagement.table.signups")}</p>
          </div>
          <div>
            <p className="font-semibold">{calculateConversionRate(clicks, signups)}</p>
            <p className="text-xs text-muted-foreground">{t("affiliateManagement.table.conversion")}</p>
          </div>
          <div>
            <p className="font-semibold">${getAffiliateEarnedAmount(affiliate.id).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{t("affiliateManagement.table.earned")}</p>
          </div>
        </div>
        {affiliate.status === 'pending' && (
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => handleAffiliateStatusChange(affiliate.id, 'approved')} className="text-green-600 border-green-600 hover:bg-green-50">
              <CheckCircle className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleAffiliateStatusChange(affiliate.id, 'rejected')}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {affiliates.map((affiliate) => <AffiliateCard key={affiliate.id} affiliate={affiliate} />)}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("affiliateManagement.table.name")}</TableHead>
              <TableHead>{t("affiliateManagement.table.status")}</TableHead>
              <TableHead className="text-center">{t("affiliateManagement.table.clicks")}</TableHead>
              <TableHead className="text-center">{t("affiliateManagement.table.signups")}</TableHead>
              <TableHead className="text-center">{t("affiliateManagement.table.conversion")}</TableHead>
              <TableHead className="text-right">{t("affiliateManagement.table.earned")}</TableHead>
              <TableHead className="text-right">{t("affiliateManagement.table.rate")}</TableHead>
              <TableHead className="text-right">{t("affiliateManagement.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => {
              const clicks = getAffiliateClicksCount(affiliate.id);
              const signups = getAffiliateSignupsCount(affiliate.id);
              return (
              <TableRow key={affiliate.id}>
                <TableCell>
                  <div className="font-medium">{affiliate.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{affiliate.affiliateCode}</div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                    affiliate.status === 'approved' ? 'bg-green-100 text-green-700' :
                    affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {affiliate.status}
                  </span>
                </TableCell>
                <TableCell className="text-center">{clicks}</TableCell>
                <TableCell className="text-center">{signups}</TableCell>
                <TableCell className="text-center font-medium">{calculateConversionRate(clicks, signups)}</TableCell>
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
                     <Button variant="outline" size="sm" disabled>{t("affiliateManagement.table.approved")}</Button>
                  )}
                   {affiliate.status === 'rejected' && (
                     <Button variant="outline" size="sm" disabled>{t("affiliateManagement.table.rejected")}</Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
