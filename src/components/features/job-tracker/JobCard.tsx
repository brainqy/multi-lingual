
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, GripVertical, Trash2, Clock } from "lucide-react";
import type { JobApplication, JobApplicationStatus, KanbanColumnId } from "@/types";
import { useI18n } from "@/hooks/use-i18n";
import { format, parseISO } from "date-fns";

const KANBAN_COLUMNS_CONFIG: { id: KanbanColumnId; titleKey: string; acceptedStatuses: JobApplicationStatus[] }[] = [
  { id: 'Saved', titleKey: 'jobTracker.kanban.Saved.title', acceptedStatuses: ['Saved'] },
  { id: 'Applied', titleKey: 'jobTracker.kanban.Applied.title', acceptedStatuses: ['Applied'] },
  { id: 'Interviewing', titleKey: 'jobTracker.kanban.Interviewing.title', acceptedStatuses: ['Interviewing'] },
  { id: 'Offer', titleKey: 'jobTracker.kanban.Offer.title', acceptedStatuses: ['Offer'] },
];

interface JobCardProps {
    application: JobApplication;
    onEdit: (app: JobApplication) => void;
    onDelete: (id: string) => void;
    onMove: (appId: string, newStatus: JobApplicationStatus) => void;
}

export default function JobCard({ application, onEdit, onDelete, onMove }: JobCardProps) {
  const { t } = useI18n();
  return (
    <Card className="mb-3 shadow-md bg-card hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => onEdit(application)}>
      <CardContent className="p-3 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-sm text-foreground">{application.jobTitle}</h4>
            <p className="text-xs text-muted-foreground">{application.companyName}</p>
            {application.location && <p className="text-xs text-muted-foreground">{application.location}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEdit(application)}>
                <Edit3 className="mr-2 h-4 w-4" /> {t("jobTracker.dialog.edit", { default: "Edit" })}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("jobTracker.dialog.moveTo", { default: "Move to" })}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {KANBAN_COLUMNS_CONFIG.map(col => (
                       col.acceptedStatuses[0] !== application.status &&
                        <DropdownMenuItem key={col.id} onClick={() => onMove(application.id, col.acceptedStatuses[0])}>
                          {t(col.titleKey, { default: col.id })}
                        </DropdownMenuItem>
                    ))}
                    {application.status !== 'Rejected' &&
                        <DropdownMenuItem onClick={() => onMove(application.id, 'Rejected')}>{t("jobTracker.statuses.Rejected", { default: "Rejected" })}</DropdownMenuItem>
                    }
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(application.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> {t("jobTracker.dialog.delete", { default: "Delete" })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {application.reminderDate && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {t("jobTracker.dialog.reminder", { default: "Reminder" })}: {format(parseISO(application.reminderDate), 'MMM dd, yyyy')}
            </p>
        )}
      </CardContent>
    </Card>
  );
}
