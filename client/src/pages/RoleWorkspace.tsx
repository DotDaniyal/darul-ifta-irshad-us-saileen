import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, ClipboardList, FileCheck2, Loader2, ShieldCheck, UsersRound } from "lucide-react";

type WorkspaceKind = "scholar" | "reviewer" | "admin";

const copy = {
  scholar: {
    eyebrow: "Assigned private questions",
    title: "Scholar queue",
    description: "Questions are shown only when assigned to your account. Personal contact details remain hidden from this operational list.",
    icon: ClipboardList,
  },
  reviewer: {
    eyebrow: "Independent editorial review",
    title: "Review queue",
    description: "Review-ready Fatwa drafts are separated from confidential question intake and remain subject to independent approval.",
    icon: FileCheck2,
  },
  admin: {
    eyebrow: "Platform governance",
    title: "Administration overview",
    description: "Operational counts help administrators govern roles, taxonomy, policy, and publication without exposing private question content.",
    icon: UsersRound,
  },
} as const;

function isAllowed(kind: WorkspaceKind, role: "user" | "scholar" | "reviewer" | "admin" | undefined) {
  if (kind === "scholar") return role === "scholar" || role === "reviewer" || role === "admin";
  if (kind === "reviewer") return role === "reviewer" || role === "admin";
  return role === "admin";
}

export function RoleWorkspace({ kind }: { kind: WorkspaceKind }) {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const permitted = isAllowed(kind, user?.role);
  const scholarQueue = trpc.questions.assigned.useQuery(undefined, { enabled: permitted && kind === "scholar" });
  const reviewQueue = trpc.review.queue.useQuery(undefined, { enabled: permitted && kind === "reviewer" });
  const overview = trpc.administration.overview.useQuery(undefined, { enabled: permitted && kind === "admin" });
  const config = copy[kind];
  const Icon = config.icon;

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-1 py-3 sm:px-4 sm:py-8">
        <Link href="/workspace" className="inline-flex w-fit items-center gap-2 font-sans text-sm font-semibold text-[#365779] hover:text-[#061A34]">
          <ArrowLeft className="h-4 w-4" /> Workspace overview
        </Link>
        <section className="border border-[#D6CCB8] bg-[#061A34] px-6 py-8 text-white shadow-[0_20px_50px_rgba(6,26,52,0.16)] sm:px-9 sm:py-10">
          <div className="flex items-center gap-3 text-[#E9D4A2]"><ShieldCheck className="h-5 w-5" /><span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em]">{config.eyebrow}</span></div>
          <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">{config.title}</h1>
          <p className="mt-4 max-w-3xl font-sans text-sm leading-7 text-white/75 sm:text-base">{config.description}</p>
        </section>

        {loading ? <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#B88632]" /></div> : null}
        {!loading && !permitted ? (
          <Card className="border-[#E8C8A8] bg-[#FFF9F2]"><CardContent className="flex gap-4 p-6"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A35720]" /><div><p className="font-display text-xl text-[#673A17]">Access not granted</p><p className="mt-2 font-sans text-sm leading-6 text-[#6B4E35]">This operational area is restricted to its designated scholarly role. Your current account is not authorized for this queue.</p></div></CardContent></Card>
        ) : null}

        {!loading && permitted && kind === "scholar" ? <QueueCards items={scholarQueue.data ?? []} pending={scholarQueue.isLoading} empty="No questions are currently assigned to your account." /> : null}
        {!loading && permitted && kind === "reviewer" ? <QueueCards items={reviewQueue.data ?? []} pending={reviewQueue.isLoading} empty="No Fatwa drafts are currently awaiting review." /> : null}
        {!loading && permitted && kind === "admin" ? <AdminCards counts={overview.data} pending={overview.isLoading} /> : null}
      </div>
    </DashboardLayout>
  );
}

function QueueCards({ items, pending, empty }: { items: Array<{ id: number; referenceCode?: string; referenceNumber?: string; subject?: string; titleEn?: string | null; titleUr?: string | null; status: string }>; pending: boolean; empty: string }) {
  if (pending) return <div className="h-40 animate-pulse border border-[#D8D0C3] bg-[#F7F4EE]" />;
  if (!items.length) return <Card className="border-[#D8D0C3] bg-[#FFFEFA]"><CardContent className="p-7 font-sans text-sm leading-6 text-[#5A6980]">{empty}</CardContent></Card>;
  return <div className="grid gap-4 md:grid-cols-2">{items.map(item => <Card key={item.id} className="border-[#D8D0C3] bg-[#FFFEFA]"><CardHeader><CardDescription className="font-sans text-xs uppercase tracking-[0.12em] text-[#87611B]">{item.referenceCode ?? item.referenceNumber}</CardDescription><CardTitle className="font-display text-2xl text-[#10223A]">{item.subject ?? item.titleUr ?? item.titleEn}</CardTitle></CardHeader><CardContent><Badge variant="outline" className="border-[#B88632] bg-[#FFF9E9] font-sans text-xs uppercase tracking-[0.1em] text-[#815A19]">{item.status.replaceAll("_", " ")}</Badge></CardContent></Card>)}</div>;
}

function AdminCards({ counts, pending }: { counts: { openQuestions: number; reviewQueue: number; publishedFatwas: number; scholars: number } | undefined; pending: boolean }) {
  if (pending) return <div className="h-40 animate-pulse border border-[#D8D0C3] bg-[#F7F4EE]" />;
  const metrics = [
    ["Open questions", counts?.openQuestions ?? 0],
    ["Fatwas awaiting review", counts?.reviewQueue ?? 0],
    ["Published Fatwas", counts?.publishedFatwas ?? 0],
    ["Scholarly accounts", counts?.scholars ?? 0],
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <Card key={String(label)} className="border-[#D8D0C3] bg-[#FFFEFA]"><CardContent className="p-6"><p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#6C7A8F]">{label}</p><p className="mt-4 font-display text-4xl text-[#10223A]">{value}</p></CardContent></Card>)}</div>;
}

