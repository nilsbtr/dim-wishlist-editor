import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Star,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdeptIcon, CraftableIcon, HolofoilIcon, WeaponIcon } from "@/components/weapons";
import {
  formatSeason,
  getAmmoTypeName,
  getDamageTypeColor,
  getDamageTypeName,
  getSlotTypeName,
  getTierTypeColor,
  getTierTypeName,
} from "@/lib/destiny-utils";
import { cn } from "@/lib/utils";
import type { WeaponConcise } from "@/types/weapons";

interface WeaponTableProps {
  weapons: Array<WeaponConcise>;
  wishlistId: string;
  wishlistedHashes: Set<number>;
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<WeaponConcise>();

export function WeaponTable({
  weapons,
  wishlistId,
  wishlistedHashes,
  isLoading,
}: WeaponTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-muted-foreground hover:text-foreground -ml-3 gap-1.5 font-semibold"
          >
            Weapon
            <ArrowUpDown className="size-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const weapon = row.original;
          const isWishlisted = wishlistedHashes.has(weapon.hash);

          return (
            <Link
              to="/edit/$wishlistId/weapon/$hash"
              params={{ wishlistId, hash: String(weapon.hash) }}
              className="group/weapon flex items-center gap-3 py-1"
            >
              <WeaponIcon
                iconSrc={weapon.iconSrc}
                watermarkSrc={weapon.watermarkSrc}
                watermarkFeaturedSrc={weapon.watermarkFeaturedSrc}
                isFeatured={weapon.isFeatured}
                tierType={weapon.tierType}
                name={weapon.name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="group-hover/weapon:text-primary truncate font-medium transition-colors">
                    {weapon.name}
                  </span>
                  {isWishlisted && (
                    <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                  {weapon.isAdept && <AdeptIcon className="shrink-0" />}
                  {weapon.isCraftable && <CraftableIcon className="shrink-0" />}
                  {weapon.isHolofoil && <HolofoilIcon className="shrink-0" />}
                </div>
                <div className="text-muted-foreground text-xs">{weapon.itemType}</div>
              </div>
            </Link>
          );
        },
        filterFn: "includesString",
      }),
      columnHelper.accessor("tierType", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            className="text-muted-foreground hover:text-foreground -ml-3 gap-1.5 font-semibold"
          >
            Rarity
            <ArrowUpDown className="size-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const tier = getValue();
          return (
            <span className={cn("text-sm font-medium", getTierTypeColor(tier))}>
              {getTierTypeName(tier)}
            </span>
          );
        },
        sortingFn: (rowA, rowB) => {
          // Sort by tier type (Exotic=6, Legendary=5, etc.)
          const a = rowA.getValue<number>("tierType");
          const b = rowB.getValue<number>("tierType");
          return a - b;
        },
      }),
      columnHelper.accessor("damageType", {
        header: "Element",
        cell: ({ getValue }) => {
          const damage = getValue();
          return (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 border border-white/10 bg-white/5 font-medium",
                getDamageTypeColor(damage)
              )}
            >
              {getDamageTypeName(damage)}
            </Badge>
          );
        },
        sortingFn: "basic",
      }),
      columnHelper.accessor("slot", {
        header: "Slot",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm">{getSlotTypeName(getValue())}</span>
        ),
        sortingFn: "basic",
      }),
      columnHelper.accessor("ammoType", {
        header: "Ammo",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm">{getAmmoTypeName(getValue())}</span>
        ),
        sortingFn: "basic",
      }),
      columnHelper.accessor("season", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            className="text-muted-foreground hover:text-foreground -ml-3 gap-1.5 font-semibold"
          >
            Season
            <ArrowUpDown className="size-3" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm tabular-nums">
            {formatSeason(getValue())}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          const a = rowA.getValue<number | null>("season") ?? -1;
          const b = rowB.getValue<number | null>("season") ?? -1;
          return a - b;
        },
      }),
    ],
    [wishlistId, wishlistedHashes]
  );

  const table = useReactTable({
    data: weapons,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* Search and count */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search weapons..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="bg-background/50 focus:border-primary/50 border-white/10 pr-10 pl-10"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground text-sm">
            <span className="text-foreground font-semibold tabular-nums">
              {totalRows.toLocaleString()}
            </span>{" "}
            weapon{totalRows !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground bg-white/[0.02] text-xs font-semibold tracking-wider uppercase"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-3">
                    <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
                    <span className="text-sm">Loading weapons...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Search className="size-8 opacity-40" />
                    <span className="text-sm">No weapons found</span>
                    <span className="text-xs opacity-60">Try adjusting your filters</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer border-white/5 transition-colors duration-150",
                    index % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]",
                    "hover:bg-primary/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">Rows per page</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] border-white/10 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Page <span className="text-foreground font-medium tabular-nums">{currentPage}</span>{" "}
              of <span className="text-foreground font-medium tabular-nums">{pageCount}</span>
            </span>
            <div className="ml-2 flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="border-white/10 bg-white/5 hover:bg-white/10"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-white/10 bg-white/5 hover:bg-white/10"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-white/10 bg-white/5 hover:bg-white/10"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
                className="border-white/10 bg-white/5 hover:bg-white/10"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
