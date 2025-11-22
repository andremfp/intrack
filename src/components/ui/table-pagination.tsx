import { useState, useEffect } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface TablePaginationProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

export function TablePagination({
  totalCount,
  currentPage,
  pageSize,
  isLoading = false,
  onPageChange,
}: TablePaginationProps) {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Update page input when current page changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string for clearing
    if (value === "") {
      setPageInput(value);
      return;
    }

    // Only allow numbers
    if (/^\d+$/.test(value)) {
      const pageNum = parseInt(value);
      // Prevent 0 and numbers greater than totalPages
      if (pageNum >= 1 && pageNum <= totalPages) {
        setPageInput(value);
      }
      // If they try to type a number > totalPages, set it to totalPages
      else if (pageNum > totalPages) {
        setPageInput(totalPages.toString());
      }
      // Don't allow 0 or leading zeros
    }
  };

  const handlePageInputSubmit = () => {
    if (pageInput === "") {
      // If empty, reset to current page
      setPageInput(currentPage.toString());
      return;
    }

    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange?.(pageNum);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageInputSubmit();
      e.currentTarget.blur();
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-t flex-shrink-0">
      <div className="text-xs text-muted-foreground">
        <span className="hidden sm:inline">
          Mostrando {startItem} a {endItem} de {totalCount} consultas
        </span>
        <span className="inline sm:hidden">
          {startItem}-{endItem} de {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1 || isLoading}
          className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Página
          </span>
          <input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            onBlur={handlePageInputSubmit}
            onKeyDown={handlePageInputKeyDown}
            disabled={isLoading}
            className="w-10 h-7 px-2 text-center text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-xs text-muted-foreground">de {totalPages}</span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
