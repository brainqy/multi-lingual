
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Affiliate, AffiliateStatus } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface AffiliateTableProps {
  affiliates: Affiliate[];
  handleAffiliateStatusChange: (affiliateId: string, newStatus: AffiliateStatus) => void;
  getAffiliateSignupsCount: (affiliateId: string) => number;
  getAffiliateEarnedAmount: (affiliateId: string) => number;
}

export default function AffiliateTable({ 
  affiliates, 
  handleAffiliateStatusChange, 
  getAffiliateSignupsCount, 
  getAffiliateEarnedAmount 
}: AffiliateTableProps) {
  const { t } = useI18n();
  
  if (affiliates.length === 0) {
    return <p className="text-center text-muted-foreground py-8">{t("affiliateManagement.table.noResults")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("affiliateManagement.table.name")}</TableHead>
          <TableHead>{t("affiliateManagement.table.email")}</TableHead>
          <TableHead>{t("affiliateManagement.table.code")}</TableHead>
          <TableHead>{t("affiliateManagement.table.status")}</TableHead>
          <TableHead className="text-center">{t("affiliateManagement.table.signups")}</TableHead>
          <TableHead className="text-right">{t("affiliateManagement.table.earned")}</TableHead>
          <TableHead className="text-right">{t("affiliateManagement.table.rate")}</TableHead>
          <TableHead className="text-right">{t("affiliateManagement.table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {affiliates.map((affiliate) => (
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
                 <Button variant="outline" size="sm" disabled>{t("affiliateManagement.table.approved")}</Button>
              )}
               {affiliate.status === 'rejected' && (
                 <Button variant="outline" size="sm" disabled>{t("affiliateManagement.table.rejected")}</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
