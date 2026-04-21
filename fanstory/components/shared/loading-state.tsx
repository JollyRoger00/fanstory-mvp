import { LoaderCircle } from "lucide-react";

type LoadingStateProps = {
  title: string;
  description: string;
};

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_24%),linear-gradient(180deg,_#fffef8_0%,_#f6f2ea_100%)] px-6">
      <div className="max-w-lg rounded-[2rem] border border-white/60 bg-white/85 p-8 text-center shadow-xl">
        <LoaderCircle className="mx-auto size-8 animate-spin text-amber-600" />
        <h1 className="font-heading mt-5 text-4xl text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
