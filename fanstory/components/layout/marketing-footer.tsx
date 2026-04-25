import Link from "next/link";
import { getCurrentLocale } from "@/lib/i18n/server";
import { APP_NAME } from "@/lib/site";
import { getPublicSiteContent } from "@/features/public/content";

export async function MarketingFooter() {
  const locale = await getCurrentLocale();
  const { footer } = getPublicSiteContent(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900/10 bg-[#f5efe5]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
            {APP_NAME}
          </p>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            {footer.summary}
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-950">
            {footer.linksTitle}
          </h2>
          <nav className="flex flex-col gap-2 text-sm text-slate-600">
            {footer.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-slate-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-950">
            {footer.supportTitle}
          </h2>
          <p className="text-sm leading-7 text-slate-600">{footer.contactLine}</p>
        </div>
      </div>
      <div className="border-t border-slate-900/10 px-6 py-4 text-center text-xs text-slate-500">
        © {year} {APP_NAME}. {footer.reserved}
      </div>
    </footer>
  );
}
