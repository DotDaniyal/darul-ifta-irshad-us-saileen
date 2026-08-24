import { Fragment } from "react";
import type { DailyPost } from "@/data/dailyPostsApi";

export type ReadingLanguage = "ur" | "en";

export function localizedPostValue(post: DailyPost, field: "title" | "excerpt" | "content" | "featuredImageAlt" | "seoDescription", language: ReadingLanguage) {
  const suffix = language === "ur" ? ["Ur", "Ar", "En"] : ["En", "Ur", "Ar"];
  for (const ending of suffix) {
    const key = `${field}${ending}` as keyof DailyPost;
    const value = post[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function safeUrl(value: string) {
  return value.startsWith("/manus-storage/") || /^https:\/\//i.test(value) ? value : undefined;
}

function inlineText(value: string) {
  const tokens = value.split(/(!?\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*|_[^_]+_)/g);
  return tokens.map((token, index) => {
    const image = token.match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
    if (image) {
      const source = safeUrl(image[2]);
      return source ? <img key={index} src={source} alt={image[1]} className="my-5 max-h-[420px] w-full object-cover" loading="lazy" /> : token;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
    if (link) {
      const href = safeUrl(link[2]);
      return href ? <a key={index} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="font-semibold text-[#075A9B] underline decoration-[#C89C46] underline-offset-4">{link[1]}</a> : token;
    }
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{token.slice(2, -2)}</strong>;
    if (token.startsWith("_") && token.endsWith("_")) return <em key={index}>{token.slice(1, -1)}</em>;
    return <Fragment key={index}>{token}</Fragment>;
  });
}

export function DailyPostContent({ value, language }: { value: string; language: ReadingLanguage }) {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const Heading = heading[1].length === 2 ? "h2" : "h3";
      nodes.push(<Heading key={index} className={Heading === "h2" ? "mt-10 font-display text-3xl text-[#10223A] sm:text-4xl" : "mt-8 font-display text-2xl text-[#10223A]"}>{inlineText(heading[2])}</Heading>);
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      nodes.push(<blockquote key={index} className="my-7 border-s-4 border-[#C89C46] bg-[#F6F1E7] px-5 py-4 font-urdu text-xl leading-10 text-[#273951]">{inlineText(line.slice(2))}</blockquote>);
      index += 1;
      continue;
    }
    const unordered = /^[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) { items.push(lines[index].trim().replace(/^[-*]\s+/, "")); index += 1; }
      nodes.push(<ul key={index} className="my-5 list-disc space-y-2 ps-6 font-sans text-base leading-8 text-[#34465F]">{items.map((item, itemIndex) => <li key={itemIndex}>{inlineText(item)}</li>)}</ul>);
      continue;
    }
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (ordered) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) { items.push(lines[index].trim().replace(/^\d+\.\s+/, "")); index += 1; }
      nodes.push(<ol key={index} className="my-5 list-decimal space-y-2 ps-6 font-sans text-base leading-8 text-[#34465F]">{items.map((item, itemIndex) => <li key={itemIndex}>{inlineText(item)}</li>)}</ol>);
      continue;
    }
    nodes.push(<p key={index} className={language === "ur" ? "font-urdu text-xl leading-[2.05] text-[#273951]" : "font-sans text-base leading-8 text-[#34465F]"}>{inlineText(line)}</p>);
    index += 1;
  }
  return <div lang={language === "ur" ? "ur" : "en"} dir={language === "ur" ? "rtl" : "ltr"} className="space-y-5">{nodes}</div>;
}
