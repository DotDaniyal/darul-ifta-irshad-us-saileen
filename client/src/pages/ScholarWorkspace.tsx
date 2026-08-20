import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookMarked, ClipboardCheck, ShieldCheck, UserRoundCheck } from "lucide-react";
import { Link } from "wouter";

const roleCopy = {
  user: {
    title: "Questioner workspace",
    description: "A private area for tracking submitted questions and receiving guidance when it is ready.",
    access: ["Private submission tracking", "Confidential communication"],
  },
  scholar: {
    title: "Scholar workspace",
    description: "A controlled scholarly environment for reviewing assigned questions and preparing draft guidance.",
    access: ["Draft preparation", "Assigned-question review"],
  },
  reviewer: {
    title: "Reviewer workspace",
    description: "An independent review environment for assessing scholarly drafts before publication.",
    access: ["Draft review", "Approval recommendations"],
  },
  admin: {
    title: "Platform administration",
    description: "A governed control area for platform policies, taxonomy, scholar roles, and publication safeguards.",
    access: ["Role administration", "Policy and taxonomy controls", "Publication governance"],
  },
} as const;

export default function ScholarWorkspace() {
  const { data, isLoading } = trpc.workspace.summary.useQuery();

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-1 py-3 sm:px-4 sm:py-8">
        <section className="relative overflow-hidden border border-[#D6CCB8] bg-[#061A34] px-6 py-8 text-white shadow-[0_20px_50px_rgba(6,26,52,0.16)] sm:px-9 sm:py-10">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 8% 14%, #D1AC5B 0 1px, transparent 1.4px), radial-gradient(circle at 85% 80%, #D1AC5B 0 1px, transparent 1.4px)", backgroundSize: "40px 40px" }} />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3 text-[#E9D4A2]">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em]">Secure scholarly platform</span>
            </div>
            <h1 className="mt-5 font-display text-4xl leading-tight text-white sm:text-5xl">
              {isLoading ? "Preparing your workspace" : roleCopy[data?.role ?? "user"].title}
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-white/75 sm:text-base">
              {isLoading ? "Confirming your authenticated access and platform permissions." : roleCopy[data?.role ?? "user"].description}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="border-[#D8D0C3] bg-[#FFFEFA] shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#CBA75B] bg-[#FBF5E6] text-[#9A6B20]">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl text-[#10223A]">Governed workflow foundation</CardTitle>
                  <CardDescription className="mt-1 font-sans text-sm leading-6 text-[#617087]">Permissions are verified on the server for each private procedure, not merely hidden in the interface.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(isLoading ? [] : roleCopy[data?.role ?? "user"].access).map(item => (
                <div className="flex items-center gap-3 border border-[#E1D9CB] bg-white px-4 py-3" key={item}>
                  <BookMarked className="h-4 w-4 shrink-0 text-[#B88632]" />
                  <span className="font-sans text-sm text-[#334661]">{item}</span>
                </div>
              ))}
              {isLoading ? <div className="h-14 animate-pulse bg-[#F2EFE8] sm:col-span-2" /> : null}
            </CardContent>
          </Card>

          <Card className="border-[#D8D0C3] bg-[#FBF9F3] shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#B6C6D5] bg-[#EDF4F9] text-[#075A9B]">
                  <UserRoundCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl text-[#10223A]">Access status</CardTitle>
                  <CardDescription className="mt-1 font-sans text-sm">Your authenticated platform role.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="border-[#B88632] bg-[#FFF9E9] px-3 py-1 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#815A19]">
                {isLoading ? "Checking" : data?.role ?? "user"}
              </Badge>
              <p className="mt-5 font-sans text-sm leading-7 text-[#5A6980]">Sensitive personal questions, internal notes, editorial histories, and approvals are designed to remain private to their authorized roles.</p>
            </CardContent>
          </Card>
        </section>

        {!isLoading ? (
          <section className="grid gap-3 sm:grid-cols-3">
            {data?.permissions.canDraftFatwas ? <Link href="/workspace/scholar" className="border border-[#D8D0C3] bg-[#FFFEFA] px-5 py-4 font-sans text-sm font-semibold text-[#173A61] transition hover:border-[#B88632] hover:bg-[#FFF9E9]">Open scholar queue</Link> : null}
            {data?.permissions.canReviewFatwas ? <Link href="/workspace/review" className="border border-[#D8D0C3] bg-[#FFFEFA] px-5 py-4 font-sans text-sm font-semibold text-[#173A61] transition hover:border-[#B88632] hover:bg-[#FFF9E9]">Open review queue</Link> : null}
            {data?.permissions.canAdministerPlatform ? <Link href="/workspace/admin" className="border border-[#D8D0C3] bg-[#FFFEFA] px-5 py-4 font-sans text-sm font-semibold text-[#173A61] transition hover:border-[#B88632] hover:bg-[#FFF9E9]">Open administration</Link> : null}
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
