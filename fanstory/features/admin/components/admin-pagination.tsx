import Link from "next/link";
import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  pathname: string;
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | string[] | undefined>;
};

function buildHref(
  pathname: string,
  page: number,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(searchParams ?? {})) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (!value || key === "page") {
      continue;
    }

    params.set(key, value);
  }

  params.set("page", String(page));
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function AdminPagination({
  pathname,
  page,
  totalPages,
  searchParams,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Страница {page} из {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          className="rounded-full"
          disabled={page <= 1}
        >
          <Link href={buildHref(pathname, Math.max(1, page - 1), searchParams)}>
            Назад
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full"
          disabled={page >= totalPages}
        >
          <Link
            href={buildHref(
              pathname,
              Math.min(totalPages, page + 1),
              searchParams,
            )}
          >
            Дальше
          </Link>
        </Button>
      </div>
    </div>
  );
}
