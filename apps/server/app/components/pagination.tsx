import { useMemo } from "react";
import {
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationContent,
  Pagination as ShadcnPagination,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { useLocation, useNavigate } from "react-router";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  maxDisplayed?: number;
  preserveParams?: boolean;
}

export function Pagination({
  totalPages,
  currentPage,
  maxDisplayed = 5,
  preserveParams = true,
}: PaginationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    const searchParams = preserveParams
      ? new URLSearchParams(location.search)
      : new URLSearchParams();
    searchParams.set("page", page.toString());
    navigate(`?${searchParams.toString()}`);
  };

  const paginationItems = useMemo(() => {
    const pages = [];
    const halfDisplayed = Math.floor(maxDisplayed / 2);

    const startPage = Math.max(1, currentPage - halfDisplayed);
    const endPage = Math.min(totalPages, startPage + maxDisplayed - 1);

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (totalPages > endPage) {
      if (totalPages - 1 > endPage) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  }, [currentPage, totalPages, maxDisplayed]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <ShadcnPagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => navigate(`page=${Math.max(1, currentPage - 1)}`)}
            />
          </PaginationItem>
        )}

        {paginationItems}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                navigate(`?page=${Math.min(totalPages, currentPage + 1)}`)
              }
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </ShadcnPagination>
  );
}
