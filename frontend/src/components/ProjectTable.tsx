"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Project } from "@/lib/api"
import { 
  CircleCheckIcon, 
  Loader2Icon, 
  ClockIcon, 
  AlertCircleIcon, 
  FileTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react"

interface ProjectTableProps {
  data: Project[];
}

export function ProjectTable({ data }: ProjectTableProps) {
  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("approved")) return <CircleCheckIcon className="size-3 text-emerald-500" />;
    if (s.includes("pending")) return <ClockIcon className="size-3 text-amber-500" />;
    if (s.includes("review") || s.includes("evaluating")) return <Loader2Icon className="size-3 text-blue-500 animate-spin" />;
    if (s.includes("rejected")) return <AlertCircleIcon className="size-3 text-destructive" />;
    return <FileTextIcon className="size-3 text-muted-foreground" />;
  };

  const getStatusVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("approved") || s.includes("pending") || s.includes("review") || s.includes("evaluating")) {
      return "outline" as const;
    }
    if (s.includes("rejected")) {
      return "destructive" as const;
    }
    return "secondary" as const;
  };

  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Ref.",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            RKH-{2026}-{String(row.original.id).padStart(4, '0')}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Project Title",
        cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
            {row.getValue("type")}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={getStatusVariant(status)} className="gap-1 px-2 py-0.5 font-medium">
              {getStatusIcon(status)}
              <span className="capitalize">{status}</span>
            </Badge>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: () => <div className="text-right">Date</div>,
        cell: ({ row }) => (
          <div className="text-right text-xs text-muted-foreground">
            {new Date(row.getValue("created_at") || Date.now()).toLocaleDateString("en-US")}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors border-border/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No dossiers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} ({data.length} total dossiers)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
