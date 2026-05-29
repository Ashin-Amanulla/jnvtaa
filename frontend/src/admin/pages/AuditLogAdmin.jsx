import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAuditLogAPI } from "@/api/admin";
import DataTable from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";

export default function AuditLogAdmin() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-log", page],
    queryFn: () =>
      adminAuditLogAPI.getAll({ page: page + 1, limit: pageSize }),
  });

  const logs = data?.data?.auditLogs ?? [];
  const pageCount = data?.pagination?.totalPages ?? 0;

  const columns = [
    {
      accessorKey: "createdAt",
      header: "Time",
      cell: ({ row }) => formatDate(row.original.createdAt, "PPp"),
    },
    {
      accessorKey: "actor",
      header: "Actor",
      cell: ({ row }) => {
        const actor = row.original.actor;
        return actor ? `${actor.firstName} ${actor.lastName}` : "System";
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
    },
    { accessorKey: "resourceType", header: "Resource" },
    { accessorKey: "resourceId", header: "Resource ID" },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => (
        <span className="max-w-xs truncate text-muted-foreground">
          {row.original.details
            ? JSON.stringify(row.original.details).slice(0, 80)
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Read-only record of admin actions on the platform.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pageIndex={page}
        onPageChange={setPage}
        pageSize={pageSize}
      />
    </div>
  );
}
