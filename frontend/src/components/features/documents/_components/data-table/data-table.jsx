"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import { LoadingSpinner } from "../../../../shared/loading-spinner";
import { Input } from "../../../../ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { WorkspaceSelect } from "../WorkspaceSelect";

export function DataTable({ columns, data, loading, error }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const navigate = useNavigate();
  const [selectedWorkspace, setSelectedWorkspace] = useState();

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnFilters,
    },
    initialState: {
      columnVisibility: {
        workspace_id: false,
      },
    },
  });

  useEffect(() => {
    table.setColumnFilters((prevFilters) => {
      const otherFilters = prevFilters.filter(
        (filter) => filter.id !== "workspace_id",
      );
      if (!selectedWorkspace) {
        return otherFilters;
      }
      return [
        ...otherFilters,
        { id: "workspace_id", value: selectedWorkspace },
      ];
    });
  }, [selectedWorkspace, table]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center py-4 gap-x-2">
        <Input
          placeholder="Filter Documents by Name..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-neutral-900 text-neutral-100 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none rounded-md transition-colors duration-150"
        />
        {/* <WorkspaceSelect
          selectedWorkspace={selectedWorkspace}
          setSelectedWorkspace={setSelectedWorkspace}
          label="Filter by Workspace"
        /> */}
      </div>
      <div className="rounded-md border h-[70vh] 2xl:h-[80vh] overflow-y-scroll">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth: header.column.columnDef.size,
                        maxWidth: header.column.columnDef.size,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-red-400"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: cell.column.columnDef.size,
                        maxWidth: cell.column.columnDef.size,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (cell.column.columnDef.id !== "actions") {
                          navigate(`/document/${row.original.id}`);
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-neutral-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex-1 text-sm text-neutral-400 h-24 py-2 px-1">
        {table.getFilteredRowModel().rows.length} Documents
      </div>
    </div>
  );
}
