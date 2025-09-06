
"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { JobApplication, JobApplicationStatus, KanbanColumnId } from "@/types";
import { useI18n } from "@/hooks/use-i18n";
import JobCard from "./JobCard";

const logger = (component: string) => ({
  log: (message: string, ...args: any[]) => console.log(`[KanbanBoard][${component}] ${message}`, ...args),
});
const boardLogger = logger("MainBoard");
const columnLogger = logger("Column");

const KANBAN_COLUMNS_CONFIG: { id: KanbanColumnId; titleKey: string; descriptionKey: string; acceptedStatuses: JobApplicationStatus[] }[] = [
  { id: 'Saved', titleKey: 'jobTracker.kanban.Saved.title', descriptionKey: 'jobTracker.kanban.Saved.description', acceptedStatuses: ['Saved'] },
  { id: 'Applied', titleKey: 'jobTracker.kanban.Applied.title', descriptionKey: 'jobTracker.kanban.Applied.description', acceptedStatuses: ['Applied'] },
  { id: 'Interviewing', titleKey: 'jobTracker.kanban.Interviewing.title', descriptionKey: 'jobTracker.kanban.Interviewing.description', acceptedStatuses: ['Interviewing'] },
  { id: 'Offer', titleKey: 'jobTracker.kanban.Offer.title', descriptionKey: 'jobTracker.kanban.Offer.description', acceptedStatuses: ['Offer'] },
];

interface KanbanColumnProps {
  column: { id: KanbanColumnId; title: string; description: string; acceptedStatuses: JobApplicationStatus[] };
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onMove: (appId: string, newStatus: JobApplicationStatus) => void;
}

function KanbanColumn({ column, applications, onEdit, onDelete, onMove }: KanbanColumnProps) {
  columnLogger.log("Component rendering for column:", column.id, { appCount: applications.length });
  const { t } = useI18n();
  return (
    <Card data-testid={`kanban-column-${column.id}`} className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-secondary/50 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-md font-semibold">{column.title} ({applications.length})</CardTitle>
        <CardDescription className="text-xs">{column.description}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow p-4 pt-0">
        {applications.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-md p-6 text-center text-muted-foreground h-24 flex items-center justify-center mt-4">
            {t("jobTracker.dialog.dragJobsHere", { default: "Drag jobs here" })}
          </div>
        ) : (
          applications.map(app => (
            <JobCard key={app.id} application={app} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
          ))
        )}
      </ScrollArea>
    </Card>
  );
}

interface KanbanBoardProps {
    applications: JobApplication[];
    onEdit: (app: JobApplication) => void;
    onDelete: (id: string) => void;
    onMove: (appId: string, newStatus: JobApplicationStatus) => void;
}

export default function KanbanBoard({ applications, onEdit, onDelete, onMove }: KanbanBoardProps) {
    boardLogger.log("Component rendering or re-rendering.", { totalApps: applications.length });
    const { t } = useI18n();

    const getAppsForColumn = (column: { acceptedStatuses: JobApplicationStatus[] }): JobApplication[] => {
        boardLogger.log("getAppsForColumn called for statuses:", column.acceptedStatuses);
        const filteredApps = applications.filter(app => column.acceptedStatuses.includes(app.status));
        boardLogger.log("getAppsForColumn finished.", { count: filteredApps.length });
        return filteredApps;
    };

    return (
        <div className="flex flex-col md:flex-row flex-1 gap-4 h-full">
            {KANBAN_COLUMNS_CONFIG.map((colConfig) => (
                <KanbanColumn
                    key={colConfig.id}
                    column={{
                        ...colConfig,
                        title: t(colConfig.titleKey, { default: colConfig.id }),
                        description: t(colConfig.descriptionKey, { default: `Jobs in ${colConfig.id} state` })
                    }}
                    applications={getAppsForColumn(colConfig)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMove={onMove}
                />
            ))}
        </div>
    );
}
