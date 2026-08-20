import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BookOpenCheck, ClipboardList, Loader2, Send, Stamp } from "lucide-react";
import { useState } from "react";

type AssignedCase = { id: number; referenceCode: string; subject: string; questionBody: string; status: string; fatwaId: number | null; fatwaStatus: string | null };
type Draft = { id: number; referenceNumber: string; status: "draft" | "research" | "review"; titleEn: string | null; titleUr: string | null; bodyEn: string | null; bodyUr: string | null };

function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className="border-[#B88632] bg-[#FFF9E9] font-sans text-xs uppercase tracking-[0.1em] text-[#815A19]">{status.replaceAll("_", " ")}</Badge>;
}

function Notice({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return <div role="status" className={`border px-4 py-3 font-sans text-sm leading-6 ${error ? "border-[#E8C8A8] bg-[#FFF7EF] text-[#7A421A]" : "border-[#B9D8C4] bg-[#F0F9F2] text-[#24583B]"}`}>{children}</div>;
}

function Heading({ title, detail, icon: Icon }: { title: string; detail: string; icon: typeof BookOpenCheck }) {
  return <div><div className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#87611B]"><Icon className="h-4 w-4" />Governed scholarly work</div><h2 className="mt-2 font-display text-3xl text-[#10223A]">{title}</h2><p className="mt-2 font-sans text-sm leading-6 text-[#5D6B7E]">{detail}</p></div>;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor} className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-[#53657A]">{label}</Label>{children}</div>;
}

export function ScholarOperations() {
  const utils = trpc.useUtils();
  const assigned = trpc.questions.assigned.useQuery();
  const claimable = trpc.questions.claimable.useQuery();
  const drafts = trpc.fatwaDraft.mine.useQuery();
  const taxonomy = trpc.publicCatalogue.taxonomy.useQuery();
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [caseToDraft, setCaseToDraft] = useState<AssignedCase | null>(null);
  const [draftToEdit, setDraftToEdit] = useState<Draft | null>(null);
  const [titleUr, setTitleUr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [bodyUr, setBodyUr] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [methodologySlug, setMethodologySlug] = useState("");
  const [targetStatus, setTargetStatus] = useState<"draft" | "research" | "review">("draft");

  const refresh = async () => {
    await Promise.all([utils.questions.assigned.invalidate(), utils.questions.claimable.invalidate(), utils.fatwaDraft.mine.invalidate(), utils.review.queue.invalidate()]);
  };
  const claim = trpc.questions.claim.useMutation({
    onSuccess: async () => { setNotice({ text: "The case is now assigned to your scholarly account." }); await refresh(); },
    onError: error => setNotice({ text: error.message, error: true }),
  });
  const create = trpc.fatwaDraft.create.useMutation({
    onSuccess: async result => { setNotice({ text: `Draft ${result.referenceNumber} was created as ${result.status}.` }); setCaseToDraft(null); await refresh(); },
    onError: error => setNotice({ text: error.message, error: true }),
  });
  const update = trpc.fatwaDraft.update.useMutation({
    onSuccess: async result => { setNotice({ text: `Fatwa draft saved as ${result.status}.` }); await refresh(); },
    onError: error => setNotice({ text: error.message, error: true }),
  });

  const beginDraft = (question: AssignedCase) => {
    setCaseToDraft(question); setDraftToEdit(null); setTitleUr(question.subject); setTitleEn(""); setBodyUr(""); setBodyEn(""); setCategorySlug(""); setMethodologySlug(""); setTargetStatus("draft"); setNotice(null);
  };
  const editDraft = (draft: Draft) => {
    setDraftToEdit(draft); setCaseToDraft(null); setTitleUr(draft.titleUr ?? ""); setTitleEn(draft.titleEn ?? ""); setBodyUr(draft.bodyUr ?? ""); setBodyEn(draft.bodyEn ?? ""); setTargetStatus(draft.status); setNotice(null);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = { titleUr: titleUr.trim() || undefined, titleEn: titleEn.trim() || undefined, bodyUr: bodyUr.trim() || undefined, bodyEn: bodyEn.trim() || undefined, categorySlug: categorySlug || undefined, methodologySlug: methodologySlug || undefined, targetStatus };
    if (caseToDraft) create.mutate({ questionId: caseToDraft.id, ...payload });
    if (draftToEdit) update.mutate({ fatwaId: draftToEdit.id, ...payload });
  };
  const saving = create.isPending || update.isPending;

  return <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
    <div className="space-y-6">
      {notice ? <Notice error={notice.error}>{notice.text}</Notice> : null}
      <section aria-labelledby="my-assigned-cases"><Heading title="My assigned cases" detail="Only the assigned scholar can read these question details. Requester identity and contact details are excluded." icon={BookOpenCheck} /><div className="mt-4 grid gap-4">{assigned.isLoading ? <Loading /> : assigned.data?.length ? assigned.data.map(question => <Card key={question.id} className="border-[#D8D0C3] bg-[#FFFEFA]"><CardHeader className="pb-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardDescription className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#87611B]">{question.referenceCode}</CardDescription><CardTitle className="mt-1 font-display text-2xl text-[#10223A]">{question.subject}</CardTitle></div><StatusBadge status={question.fatwaStatus ?? question.status} /></div></CardHeader><CardContent className="space-y-4"><p className="whitespace-pre-wrap font-sans text-sm leading-7 text-[#43556A]">{question.questionBody}</p>{question.fatwaId ? <p className="font-sans text-xs leading-5 text-[#6C7A8F]">A linked controlled Fatwa exists in your draft ledger.</p> : <Button type="button" onClick={() => beginDraft(question)} className="bg-[#1C4399] font-sans text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-[#102F73]"><BookOpenCheck className="mr-2 h-4 w-4" />Start controlled draft</Button>}</CardContent></Card>) : <Empty text="No private questions are currently assigned to your account." />}</div></section>
      <section aria-labelledby="my-drafts"><Heading title="My controlled drafts" detail="Each save and status transition is captured in the immutable editorial ledger. Review-ready drafts await independent review." icon={Stamp} /><div className="mt-4 grid gap-4">{drafts.isLoading ? <Loading /> : drafts.data?.length ? (drafts.data as Draft[]).map(draft => <Card key={draft.id} className="border-[#D8D0C3] bg-[#FFFEFA]"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#87611B]">{draft.referenceNumber}</p><p className="mt-1 font-display text-xl text-[#10223A]">{draft.titleUr ?? draft.titleEn ?? "Untitled scholarly draft"}</p><div className="mt-3"><StatusBadge status={draft.status} /></div></div>{draft.status === "review" ? <p className="font-sans text-xs leading-5 text-[#6C7A8F]">Awaiting independent review</p> : <Button type="button" variant="outline" onClick={() => editDraft(draft)} className="border-[#1C4399] text-[#163979] hover:bg-[#EEF4FF]">Continue drafting</Button>}</CardContent></Card>) : <Empty text="Your saved Fatwa drafts will appear here." />}</div></section>
      <section aria-labelledby="available-cases"><Heading title="Available cases" detail="Claiming a case is an accountable assignment action. Full question details remain hidden until you claim it." icon={ClipboardList} /><div className="mt-4 grid gap-3">{claimable.isLoading ? <Loading /> : claimable.data?.length ? claimable.data.map(question => <Card key={question.id} className="border-[#D8D0C3] bg-[#FBFCFE]"><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#87611B]">{question.referenceCode} · {question.preferredLanguage.toUpperCase()}</p><p className="mt-1 font-display text-xl text-[#10223A]">{question.subject}</p></div><Button type="button" disabled={claim.isPending} onClick={() => claim.mutate({ questionId: question.id })} className="bg-[#061A34] text-white hover:bg-[#102B55]">{claim.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim case"}</Button></CardContent></Card>) : <Empty text="There are no unassigned cases in the current scholarly queue." />}</div></section>
    </div>
    <aside className="xl:sticky xl:top-6 xl:self-start"><Card className="border-[#CDBB8C] bg-[#FFFCF4] shadow-[0_15px_35px_rgba(90,70,32,0.10)]"><CardHeader><CardDescription className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[#87611B]">{caseToDraft ? "New scholarly draft" : draftToEdit ? "Edit controlled draft" : "Drafting desk"}</CardDescription><CardTitle className="font-display text-3xl text-[#10223A]">{caseToDraft ? caseToDraft.subject : "Select a case or draft"}</CardTitle></CardHeader><CardContent>{caseToDraft || draftToEdit ? <form className="space-y-5" onSubmit={submit}>
      <div className="grid gap-4"><Field label="Urdu title" htmlFor="fatwa-title-ur"><Input id="fatwa-title-ur" dir="rtl" value={titleUr} onChange={event => setTitleUr(event.target.value)} /></Field><Field label="English title" htmlFor="fatwa-title-en"><Input id="fatwa-title-en" value={titleEn} onChange={event => setTitleEn(event.target.value)} /></Field></div>
      <Field label="Urdu scholarly answer" htmlFor="fatwa-body-ur"><Textarea id="fatwa-body-ur" dir="rtl" className="min-h-44 leading-8" value={bodyUr} onChange={event => setBodyUr(event.target.value)} /></Field>
      <Field label="English scholarly answer" htmlFor="fatwa-body-en"><Textarea id="fatwa-body-en" className="min-h-36 leading-7" value={bodyEn} onChange={event => setBodyEn(event.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Category" htmlFor="fatwa-category"><select id="fatwa-category" value={categorySlug} onChange={event => setCategorySlug(event.target.value)} className="h-10 w-full border border-input bg-background px-3 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">No category yet</option>{taxonomy.data?.categories.map(item => <option value={item.slug} key={item.slug}>{item.nameEn}</option>)}</select></Field><Field label="Methodology" htmlFor="fatwa-methodology"><select id="fatwa-methodology" value={methodologySlug} onChange={event => setMethodologySlug(event.target.value)} className="h-10 w-full border border-input bg-background px-3 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">No methodology yet</option>{taxonomy.data?.methodologies.map(item => <option value={item.slug} key={item.slug}>{item.nameEn}</option>)}</select></Field></div>
      <Field label="Save status" htmlFor="fatwa-status"><select id="fatwa-status" value={targetStatus} onChange={event => setTargetStatus(event.target.value as "draft" | "research" | "review")} className="h-10 w-full border border-input bg-background px-3 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="draft">Draft — private working copy</option><option value="research">Research — continuing scholarly work</option><option value="review">Send for independent review</option></select></Field>
      <p className="border border-[#C9D6E7] bg-[#F4F8FC] px-4 py-3 font-sans text-xs leading-5 text-[#274766]">Do not include names, contact details, uploaded evidence, or uniquely identifying facts in public-facing text. A final publication safeguard redacts obvious contact identifiers, but it cannot replace scholarly judgment.</p>
      <div className="flex flex-wrap gap-3"><Button disabled={saving} type="submit" className="bg-[#1C4399] text-white hover:bg-[#102F73]">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}{caseToDraft ? "Create versioned draft" : "Save governed revision"}</Button><Button type="button" variant="outline" disabled={saving} onClick={() => { setCaseToDraft(null); setDraftToEdit(null); }}>Cancel</Button></div>
    </form> : <p className="font-sans text-sm leading-7 text-[#5D6B7E]">Choose an assigned case to begin a draft, or select a saved draft to continue scholarly preparation.</p>}</CardContent></Card></aside>
  </div>;
}

function Empty({ text }: { text: string }) { return <Card className="border-[#D8D0C3] bg-[#FFFEFA]"><CardContent className="p-7 font-sans text-sm leading-6 text-[#5A6980]">{text}</CardContent></Card>; }
function Loading() { return <div className="h-40 animate-pulse border border-[#D8D0C3] bg-[#F7F4EE]" />; }
