import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileCheck2, Loader2, Stamp } from "lucide-react";
import { useState } from "react";

function Notice({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return <div role="status" className={`border px-4 py-3 font-sans text-sm leading-6 ${error ? "border-[#E8C8A8] bg-[#FFF7EF] text-[#7A421A]" : "border-[#B9D8C4] bg-[#F0F9F2] text-[#24583B]"}`}>{children}</div>;
}

function Heading({ title, detail, icon: Icon }: { title: string; detail: string; icon: typeof FileCheck2 }) {
  return <div><div className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#87611B]"><Icon className="h-4 w-4" />Independent scholarly review</div><h2 className="mt-2 font-display text-3xl text-[#10223A]">{title}</h2><p className="mt-2 font-sans text-sm leading-6 text-[#5D6B7E]">{detail}</p></div>;
}

function Empty({ text }: { text: string }) { return <Card className="border-[#D8D0C3] bg-[#FFFEFA]"><CardContent className="p-7 font-sans text-sm leading-6 text-[#5A6980]">{text}</CardContent></Card>; }
function Loading() { return <div className="h-40 animate-pulse border border-[#D8D0C3] bg-[#F7F4EE]" />; }

export function ReviewerOperations({ reviewerId }: { reviewerId: number }) {
  const utils = trpc.useUtils();
  const reviewQueue = trpc.review.queue.useQuery();
  const publicationQueue = trpc.fatwaPublish.queue.useQuery();
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [treatment, setTreatment] = useState<Record<number, "anonymized" | "generalized">>({});
  const refresh = async () => {
    await Promise.all([utils.review.queue.invalidate(), utils.fatwaPublish.queue.invalidate(), utils.publicCatalogue.search.invalidate()]);
  };
  const approve = trpc.review.approve.useMutation({
    onSuccess: async () => { setNotice({ text: "The draft was independently approved for controlled publication review." }); await refresh(); },
    onError: error => setNotice({ text: error.message, error: true }),
  });
  const returnDraft = trpc.review.return.useMutation({
    onSuccess: async () => { setNotice({ text: "The draft was returned to scholarly research with recorded feedback." }); await refresh(); },
    onError: error => setNotice({ text: error.message, error: true }),
  });
  const publish = trpc.fatwaPublish.publish.useMutation({
    onSuccess: async () => { setNotice({ text: "The approved Fatwa is now published in the governed archive." }); await refresh(); },
    onError: error => setNotice({ text: error.message, error: true }),
  });

  return <div className="space-y-6">
    {notice ? <Notice error={notice.error}>{notice.text}</Notice> : null}
    <section aria-labelledby="review-queue-heading"><Heading title="Drafts awaiting a decision" detail="The drafting scholar cannot approve or publish their own work. Returning a draft requires concise recorded feedback." icon={FileCheck2} /><div className="mt-4 grid gap-4 lg:grid-cols-2">{reviewQueue.isLoading ? <Loading /> : reviewQueue.data?.length ? reviewQueue.data.map(item => {
      const ownDraft = item.authorId === reviewerId;
      const note = feedback[item.id] ?? "";
      return <Card key={item.id} className="border-[#D8D0C3] bg-[#FFFEFA]"><CardHeader><CardDescription className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#87611B]">{item.referenceNumber}</CardDescription><CardTitle className="font-display text-2xl text-[#10223A]">{item.titleUr ?? item.titleEn ?? "Untitled Fatwa"}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="font-sans text-sm leading-7 text-[#53657A]">{item.summaryUr ?? item.summaryEn ?? "No public summary supplied."}</p>{ownDraft ? <Notice error>This is your authored draft. An independent reviewer must decide it.</Notice> : <><div className="space-y-2"><Label htmlFor={`feedback-${item.id}`} className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-[#53657A]">Return-for-revision feedback</Label><Textarea id={`feedback-${item.id}`} className="min-h-24" value={note} onChange={event => setFeedback(current => ({ ...current, [item.id]: event.target.value }))} placeholder="State the needed scholarly revision for the record." /></div><div className="flex flex-wrap gap-3"><Button type="button" disabled={approve.isPending || returnDraft.isPending} onClick={() => approve.mutate({ fatwaId: item.id })} className="bg-[#1C4399] text-white hover:bg-[#102F73]">{approve.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4" />}Approve</Button><Button type="button" variant="outline" disabled={note.trim().length < 5 || approve.isPending || returnDraft.isPending} onClick={() => returnDraft.mutate({ fatwaId: item.id, feedback: note.trim() })} className="border-[#A35720] text-[#8B471C] hover:bg-[#FFF3E8]">Return for revision</Button></div></>}</CardContent></Card>;
    }) : <Empty text="No Fatwa drafts are currently awaiting independent review." />}</div></section>
    <section aria-labelledby="publication-queue-heading"><Heading title="Approved Fatwas awaiting publication" detail="Record whether the public answer is anonymized or generalized. Publication redacts obvious contact identifiers and marks the linked private question as answered." icon={Stamp} /><div className="mt-4 grid gap-4 lg:grid-cols-2">{publicationQueue.isLoading ? <Loading /> : publicationQueue.data?.length ? publicationQueue.data.map(item => {
      const selected = treatment[item.id] ?? "anonymized";
      return <Card key={item.id} className="border-[#CDBB8C] bg-[#FFFCF4]"><CardContent className="space-y-4 p-5"><p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#87611B]">{item.referenceNumber}</p><p className="font-display text-2xl text-[#10223A]">{item.titleUr ?? item.titleEn ?? "Approved Fatwa"}</p><div className="space-y-2"><Label htmlFor={`treatment-${item.id}`} className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-[#53657A]">Recorded editorial treatment</Label><select id={`treatment-${item.id}`} value={selected} onChange={event => setTreatment(current => ({ ...current, [item.id]: event.target.value as "anonymized" | "generalized" }))} className="h-10 w-full border border-input bg-white px-3 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="anonymized">Publish after anonymization</option><option value="generalized">Publish as generalized guidance</option></select></div><Button type="button" disabled={publish.isPending} onClick={() => publish.mutate({ fatwaId: item.id, publicationTreatment: selected })} className="bg-[#061A34] text-white hover:bg-[#102B55]">{publish.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Stamp className="mr-2 h-4 w-4" />}Publish controlled record</Button></CardContent></Card>;
    }) : <Empty text="No independently approved Fatwas are awaiting a publication decision." />}</div></section>
  </div>;
}
