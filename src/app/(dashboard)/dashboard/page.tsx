"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useStackStore } from "@/store/stackStore";
import { useTemplateStore } from "@/store/template.store";
import { useStackUsage, useUsageStore } from "@/store";
import type { Stack, StackDraft } from "@/types";

type StackStatus = "draft" | "ready" | "posted";

function StatusPill({ status }: { status: StackStatus }) {
  const styles = {
    draft: "bg-[rgba(245,158,11,0.14)] text-[#92400e]",
    ready: "bg-[rgba(16,185,129,0.12)] text-[#047857]",
    posted: "bg-[rgba(59,130,246,0.12)] text-[#1d4ed8]",
  } as const;

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", styles[status])}>
      {status === "draft" ? "Draft" : status === "ready" ? "Ready" : "Posted"}
    </span>
  );
}

function formatStackTime(createdAt: Date) {
  const date = new Date(createdAt);
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) {
    return `Today - ${time}`;
  }

  const day = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return `${day} - ${time}`;
}

type QuickActionItem = Readonly<{
  label: string;
  onClick?: () => void;
  href?: string;
}>;

type PlatformOption = Readonly<{
  label: string;
  value: string;
}>;

type ToneOption = Readonly<{
  label: string;
  value: string;
  description: string;
}>;

type DraftContext = Readonly<{
  topic: string;
  sourceUrl: string;
  tone: string;
  brandVoice: string;
}>;

function getPlatformGroupLabel(platform: string) {
  if (platform.startsWith("x-")) {
    return "X";
  }

  if (platform.startsWith("linkedin-")) {
    return "LinkedIn";
  }

  if (platform === "threads") {
    return "Threads";
  }

  if (platform === "newsletter") {
    return "Newsletter";
  }

  if (platform === "instagram") {
    return "Instagram";
  }

  return platform;
}

function getDraftVariationCount(platform: string) {
  if (platform === "x-short" || platform === "x-thread" || platform === "linkedin-short") {
    return 3;
  }

  return 2;
}

const platformOptions: PlatformOption[] = [
  { label: "X (Short)", value: "x-short" },
  { label: "X (Thread)", value: "x-thread" },
  { label: "LinkedIn (Short)", value: "linkedin-short" },
  { label: "LinkedIn (Long)", value: "linkedin-long" },
  { label: "Threads", value: "threads" },
  { label: "Newsletter", value: "newsletter" },
  { label: "Instagram", value: "instagram" },
];

const toneOptions: ToneOption[] = [
  { label: "Professional", value: "professional", description: "Clear, polished, and direct" },
  { label: "Casual", value: "casual", description: "Light, conversational, and easygoing" },
  { label: "Founder-style", value: "founder-style", description: "Opinionated and personal" },
  { label: "Educational", value: "educational", description: "Helpful and insight-led" },
  { label: "Promotional", value: "promotional", description: "Announcement-focused" },
  { label: "Contrarian", value: "contrarian", description: "Challenges common ideas" },
  { label: "Storytelling", value: "storytelling", description: "Narrative-driven" },
  { label: "Sales-focused", value: "sales-focused", description: "Conversion-focused" },
];

function getDraftTopic(inputContent: string, sourceUrl: string) {
  const firstLine = inputContent
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !/^https?:\/\//i.test(line) && !/^www\./i.test(line));

  if (firstLine) {
    return firstLine.replace(/^#+\s*/, "").replace(/\s+/g, " ").slice(0, 90);
  }

  if (sourceUrl) {
    try {
      return new URL(sourceUrl).hostname.replace(/^www\./i, "");
    } catch {
      return "the topic";
    }
  }

  return "the topic";
}

function buildDraftContent(platform: string, context: DraftContext) {
  const topic = context.topic;
  const sourceLine = context.sourceUrl ? `Source: ${context.sourceUrl}` : "";
  const voiceLine = context.brandVoice ? `Brand voice: ${context.brandVoice}` : "";

  switch (platform) {
    case "x-short":
      return `${topic} is changing how people create.\n\nStop rewriting from scratch. Ship the idea faster.`;
    case "x-thread":
      return [
        `1/5 ${topic} is changing the way people work.`,
        "2/5 The old workflow was: read, rewrite, and hope it lands.",
        "3/5 The new workflow is: capture the idea, shape the angle, and publish faster.",
        "4/5 That means less busywork and more time for the parts only humans can do well.",
        "5/5 The edge now is clarity, speed, and consistency.",
      ].join("\n");
    case "linkedin-short":
      return [
        `${topic} is a good reminder that speed matters, but structure matters more.`,
        "",
        "When teams turn raw input into clear content formats, they reduce friction and publish with more confidence.",
        "",
        "The win is not just faster output. It is cleaner thinking.",
      ].join("\n");
    case "linkedin-long":
      return [
        `${topic} is changing how modern teams think about content creation.`,
        "",
        "Hook:",
        "Most teams do not need more ideas. They need a better system for turning good ideas into platform-ready drafts.",
        "",
        "Body:",
        "That is where structured generation helps. Instead of a single generic draft, each platform gets a format that matches how people actually read there. Short-form stays punchy. Long-form gets a stronger hook, a clearer body, and a direct CTA. Thread formats stay sequential and easy to scan.",
        "",
        "The result is simple: less editing, better fit, and faster publishing.",
        "",
        "CTA:",
        "If you are building a content workflow, start by matching the draft structure to the channel. The format is part of the message.",
        sourceLine,
        voiceLine,
      ]
        .filter(Boolean)
        .join("\n");
    case "threads":
      return [
        `${topic} is a reminder that simple content often wins.`,
        "",
        "Keep the tone casual, make the point quickly, and leave enough space for the idea to breathe.",
        "",
        "That is what makes a post feel native on Threads.",
      ].join("\n");
    case "newsletter":
      return [
        `Intro: ${topic} is worth paying attention to because content is now a format problem as much as a writing problem.`,
        "",
        "Value: When you shape the same idea for each channel, the draft becomes easier to scan, easier to edit, and more likely to perform. The structure does the heavy lifting: a clean opening, a useful middle, and a clear takeaway at the end.",
        sourceLine,
      ]
        .filter(Boolean)
        .join("\n");
    case "instagram":
      return [
        `${topic}`,
        "",
        "A better workflow starts with a better format.",
        "",
        "Turn one idea into content that fits the channel instead of forcing one generic version everywhere.",
        "",
        "Save this if you want to build faster.",
        voiceLine,
      ]
        .filter(Boolean)
        .join("\n");
    default:
      return `${topic}\n\nCreate the right format for the channel.`;
  }
}

function buildDraftVariations(platform: string, context: DraftContext) {
  const topic = context.topic;
  const sourceLine = context.sourceUrl ? `Source: ${context.sourceUrl}` : "";
  const voiceLine = context.brandVoice ? `Brand voice: ${context.brandVoice}` : "";

  switch (platform) {
    case "x-short":
      return [
        `${topic} is changing how creators work.\n\nStop rewriting content manually.`,
        `Creators are moving faster with ${topic}.\n\nLess friction. More shipping.`,
        `${topic} is a workflow upgrade.\n\nWrite once. Shape it for the channel.`,
      ];
    case "x-thread":
      return [
        [
          `1/5 ${topic} changes how teams publish.`,
          "2/5 The old way was to write one draft and force it everywhere.",
          "3/5 The better way is to shape the idea for each channel.",
          "4/5 That keeps the writing cleaner and the editing lighter.",
          "5/5 Native format wins.",
        ].join("\n"),
        [
          `1/5 ${topic} is a reminder that format matters.`,
          "2/5 A thread should move fast and stay easy to scan.",
          "3/5 Each point should earn the next line.",
          "4/5 That is how you keep attention without sounding stiff.",
          "5/5 Give readers momentum, not noise.",
        ].join("\n"),
        [
          `1/5 ${topic} works best when the structure is clear.`,
          "2/5 Start with the point, not the setup.",
          "3/5 Keep each tweet focused on one idea.",
          "4/5 End with a takeaway people can use.",
          "5/5 Simple threads perform better.",
        ].join("\n"),
      ];
    case "linkedin-short":
      return [
        [
          `${topic} is a useful reminder that clarity beats volume.`,
          "",
          "When teams make the format explicit, the writing gets easier to review and publish.",
          "",
          "That is the kind of structure that compounds over time.",
        ].join("\n"),
        [
          `${topic} shows why content workflows matter.`,
          "",
          "A strong draft is not just well written. It is also shaped for the channel it is going to live on.",
          "",
          "That simple shift improves speed and consistency.",
        ].join("\n"),
        [
          `${topic} makes one thing clear: the best teams do not improvise every draft.`,
          "",
          "They use repeatable structure so each post feels intentional and on brand.",
          "",
          "That is how content becomes a system.",
        ].join("\n"),
      ];
    case "linkedin-long":
      return [
        [
          `${topic} is changing how modern teams think about content creation.`,
          "",
          "Hook:",
          "Most teams do not need more ideas. They need a better system for turning good ideas into platform-ready drafts.",
          "",
          "Body:",
          "That is where structured generation helps. Instead of one generic draft, each platform gets the shape it needs. Short-form stays punchy. Long-form gets a stronger hook, a clearer body, and a direct CTA.",
          "",
          "The result is less editing and more publishing momentum.",
          "",
          "CTA:",
          "If you are building a content workflow, start by matching the draft structure to the channel.",
          sourceLine,
          voiceLine,
        ]
          .filter(Boolean)
          .join("\n"),
        [
          `${topic} is a good example of why channel-native writing matters.`,
          "",
          "Hook:",
          "A polished draft is not just about good sentences. It is about matching the rhythm of the platform.",
          "",
          "Body:",
          "A LinkedIn post should feel considered, easy to skim, and built around a clear takeaway. When the structure is intentional, the content looks more professional and performs with less editing.",
          "",
          "That is the advantage of a platform-first workflow.",
          "",
          "CTA:",
          "Design the format first, then write the message into it.",
          sourceLine,
        ]
          .filter(Boolean)
          .join("\n"),
      ];
    case "threads":
      return [
        [
          `${topic} is a reminder that simple content often wins.`,
          "",
          "Keep it casual, keep it clear, and let the idea breathe a little.",
        ].join("\n"),
        [
          `${topic} feels like a better workflow, not just a better draft.`,
          "",
          "Less polish, more personality.",
          "",
          "That is usually the sweet spot on Threads.",
        ].join("\n"),
      ];
    case "newsletter":
      return [
        [
          `Intro: ${topic} is worth paying attention to because content is now a format problem as much as a writing problem.`,
          "",
          "Value: When you shape the same idea for each channel, the draft becomes easier to scan, easier to edit, and more likely to perform. The structure does the heavy lifting by giving the reader a clean entry point, a useful middle, and a clear takeaway.",
          "",
          sourceLine,
        ]
          .filter(Boolean)
          .join("\n"),
        [
          `Intro: ${topic} is a useful example of why a content system matters.`,
          "",
          "Value: Instead of starting from scratch for every platform, the workflow becomes repeatable. That means less rewriting, faster approvals, and a stronger final draft because the shape of the content already matches the channel.",
          "",
          "A good newsletter does not feel generic. It feels organized.",
        ].join("\n"),
      ];
    case "instagram":
      return [
        [
          `${topic}`,
          "",
          "A better workflow starts with a better format.",
          "",
          "Turn one idea into content that fits the channel instead of forcing one generic version everywhere.",
          "",
          "Save this if you want to build faster.",
          voiceLine,
        ]
          .filter(Boolean)
          .join("\n"),
        [
          `${topic}`,
          "",
          "Build the post like a caption, not like an article.",
          "",
          "Short lines.",
          "Clear spacing.",
          "One idea per section.",
          "",
          "That is what makes it feel native on Instagram.",
        ].join("\n"),
      ];
    default:
      return [buildDraftContent(platform, context)];
  }
}

type RewriteMode = "shorter" | "casual" | "professional";

function normalizeSpacing(content: string) {
  return content
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSentences(content: string) {
  return content.match(/[^.!?]+[.!?]*/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
}

function shortenDraft(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.slice(0, 2).join("\n\n");
  }

  const sentences = splitSentences(content);
  if (sentences.length > 1) {
    return sentences.slice(0, 2).join(" ");
  }

  return content.length > 220 ? `${content.slice(0, 220).trimEnd()}...` : content;
}

function makeMoreCasual(content: string) {
  const rewritten = content
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/\bthat is\b/gi, "that's")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bwe are\b/gi, "we're")
    .replace(/\byou are\b/gi, "you're")
    .replace(/\bfor example\b/gi, "for instance")
    .replace(/\bmore professional\b/gi, "more polished");

  if (/^(honestly|basically|quick note)/i.test(rewritten)) {
    return rewritten;
  }

  return `Honestly, ${rewritten.charAt(0).toLowerCase()}${rewritten.slice(1)}`;
}

function makeMoreProfessional(content: string) {
  const rewritten = content
    .replace(/\bdon't\b/gi, "do not")
    .replace(/\bcan't\b/gi, "cannot")
    .replace(/\bwon't\b/gi, "will not")
    .replace(/\bthat's\b/gi, "that is")
    .replace(/\bit's\b/gi, "it is")
    .replace(/\bwe're\b/gi, "we are")
    .replace(/\byou're\b/gi, "you are")
    .replace(/\bHonestly,\s*/gi, "In practice, ")
    .replace(/\bbasically,\s*/gi, "In practice, ");

  if (/^(in practice|overall|more importantly)/i.test(rewritten)) {
    return rewritten;
  }

  return `In practice, ${rewritten.charAt(0).toLowerCase()}${rewritten.slice(1)}`;
}

function rewriteDraftContent(content: string, mode: RewriteMode) {
  if (mode === "shorter") {
    return shortenDraft(content);
  }

  if (mode === "casual") {
    return makeMoreCasual(content);
  }

  return makeMoreProfessional(content);
}

type PlatformFamily = "x" | "linkedin" | "threads" | "newsletter" | "instagram" | "other";

function getPlatformFamily(platform: string): PlatformFamily {
  if (platform.startsWith("x-")) {
    return "x";
  }

  if (platform.startsWith("linkedin-")) {
    return "linkedin";
  }

  if (platform === "threads") {
    return "threads";
  }

  if (platform === "newsletter") {
    return "newsletter";
  }

  if (platform === "instagram") {
    return "instagram";
  }

  return "other";
}

function firstParagraph(content: string) {
  return normalizeSpacing(content).split("\n\n").find(Boolean) ?? normalizeSpacing(content);
}

function firstTwoSentences(content: string) {
  const sentences = splitSentences(normalizeSpacing(content));
  return sentences.slice(0, 2).join(" ");
}

function applyContrarianTone(content: string, platformFamily: PlatformFamily) {
  const base = normalizeSpacing(content);

  if (/most people are doing this wrong/i.test(base)) {
    return base;
  }

  if (platformFamily === "x") {
    return `Most people are doing this wrong.\n\n${firstTwoSentences(base) || firstParagraph(base)}`;
  }

  if (platformFamily === "linkedin") {
    return [
      "Most people assume the standard approach is enough.",
      "",
      "That is usually the wrong place to start.",
      "",
      base,
    ].join("\n");
  }

  if (platformFamily === "newsletter") {
    return [
      "Most people are solving this the easy way, not the effective way.",
      "",
      base,
      "",
      "That is why the outcome stays average.",
    ].join("\n");
  }

  if (platformFamily === "instagram") {
    return [
      "Most people are doing this wrong.",
      "",
      firstParagraph(base),
      "",
      "Save this if you want a better approach.",
    ].join("\n");
  }

  return `Most people are doing this wrong.\n\n${base}`;
}

function applyStorytellingTone(content: string, platformFamily: PlatformFamily) {
  const base = normalizeSpacing(content);

  if (/last year, i struggled/i.test(base)) {
    return base;
  }

  if (platformFamily === "linkedin") {
    return [
      "Last year, I struggled with this exact problem.",
      "",
      "At first, I tried to force one draft everywhere and it never felt right.",
      "",
      "Then I changed the structure.",
      "",
      base,
    ].join("\n");
  }

  if (platformFamily === "newsletter") {
    return [
      "Last year, I struggled with this exact problem.",
      "",
      "Here is what changed: I stopped treating the content as one block and started shaping it by channel.",
      "",
      base,
    ].join("\n");
  }

  if (platformFamily === "x") {
    return `Last year, I struggled with this.\n\n${firstTwoSentences(base) || firstParagraph(base)}`;
  }

  return `Last year, I struggled with this exact problem.\n\n${base}`;
}

function applySalesFocusedTone(content: string, topic: string, platformFamily: PlatformFamily) {
  const base = normalizeSpacing(content);

  if (/if you want/i.test(base) && /this will help/i.test(base)) {
    return base;
  }

  const subject = topic && topic !== "the topic" ? topic.toLowerCase() : "a better result";

  if (platformFamily === "x") {
    return [
      `If you want ${subject}, this will help you.`,
      firstTwoSentences(base) || firstParagraph(base),
      "Try it today.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (platformFamily === "linkedin") {
    return [
      `If you want ${subject}, this will help you get there faster.`,
      "",
      base,
      "",
      "The benefit is simple: less friction, more output, better results.",
      "",
      "CTA: If this is relevant, start using this structure now.",
    ].join("\n");
  }

  if (platformFamily === "newsletter") {
    return [
      `If you want ${subject}, this will help you.`,
      "",
      "Here is the value: a clearer structure, less rewriting, and a smoother path to publish.",
      "",
      base,
      "",
      "CTA: Use this approach in your next draft.",
    ].join("\n");
  }

  return [
    `If you want ${subject}, this will help you.`,
    base,
    "If this matters to you, start here today.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function applyToneTransformation(content: string, tone: string, context: DraftContext, platform: string) {
  const platformFamily = getPlatformFamily(platform);

  switch (tone) {
    case "contrarian":
      return applyContrarianTone(content, platformFamily);
    case "storytelling":
      return applyStorytellingTone(content, platformFamily);
    case "sales-focused":
      return applySalesFocusedTone(content, context.topic, platformFamily);
    default:
      return content;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const stacks = useStackStore((state) => state.stacks);
  const currentStack = useStackStore((state) => state.currentStack);
  const createStack = useStackStore((state) => state.createStack);
  const updateStack = useStackStore((state) => state.updateStack);
  const setCurrentStack = useStackStore((state) => state.setCurrentStack);
  const deleteStack = useStackStore((state) => state.deleteStack);
  const templates = useTemplateStore((state) => state.templates);
  const loadTemplates = useTemplateStore((state) => state.loadTemplates);
  const { totalLimit, canCreate } = useStackUsage();
  const incrementUsage = useUsageStore((state) => state.incrementUsage);
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [brandVoice, setBrandVoice] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem("stak-brand-voice") ?? "";
  });
  const [generateError, setGenerateError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedDraftId, setCopiedDraftId] = useState("");
  const copyTimeoutRef = useRef<number | null>(null);
  const [modalOpenFor, setModalOpenFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();

    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, [loadTemplates]);

  useEffect(() => {
    if (currentStack?.tone) {
      setSelectedTone(currentStack.tone);
    }
  }, [currentStack?.tone, currentStack?.id]);

  const recentStacks = useMemo(
    () =>
      [...stacks].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
    [stacks]
  );

  const readyStacks = stacks.filter((stack) => stack.status === "ready").length;
  const draftStacks = stacks.filter((stack) => stack.status === "draft").length;
  const postedStacks = stacks.filter((stack) => stack.status === "posted").length;

  const groupedDrafts = useMemo(() => {
    const drafts = [...(currentStack?.drafts ?? [])].sort((left, right) => left.order - right.order);
    const groups = new Map<string, StackDraft[]>();

    drafts.forEach((draft) => {
      const label = getPlatformGroupLabel(draft.platform);
      const currentGroup = groups.get(label) ?? [];
      groups.set(label, [...currentGroup, draft]);
    });

    return Array.from(groups.entries())
      .map(([label, items]) => ({
        label,
        drafts: [...items].sort((left, right) => left.order - right.order),
        sortOrder: items[0]?.order ?? Number.MAX_SAFE_INTEGER,
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }, [currentStack]);

  function handleGenerateContent() {
    if (!canCreate) {
      setGenerateError(`You've reached your ${totalLimit} stack limit this month`);
      return;
    }

    const contentSource =
      selectedTemplateId && currentStack ? currentStack.inputContent : content;
    const normalizedContent = contentSource.trim();
    const normalizedUrl = sourceUrl.trim();
    const normalizedTranscript = transcript.trim();
    const inputContent = [normalizedContent, normalizedUrl, normalizedTranscript]
      .filter(Boolean)
      .join("\n\n");

    if (!inputContent) {
      setGenerateError("Add content, a URL, or a transcript before generating.");
      return;
    }

    if (!selectedPlatforms.length) {
      setGenerateError("Select at least one platform before generating.");
      return;
    }

    setGenerateError("");
    setIsGenerating(true);
    console.log("Generating content...");

    const nextStack = {
      id: `stack-${Date.now()}`,
      title: normalizedContent.slice(0, 40) || "Untitled Stack",
      inputContent,
      platforms: selectedPlatforms,
      tone: selectedTone,
      brandVoice,
      drafts: [],
      status: "draft" as const,
      createdAt: new Date(),
    };

    createStack(nextStack);
    incrementUsage();
    setCurrentStack(nextStack);

    window.setTimeout(() => {
      const draftContext: DraftContext = {
        topic: getDraftTopic(inputContent, normalizedUrl),
        sourceUrl: normalizedUrl,
        tone: selectedTone,
        brandVoice,
      };

      let nextDraftOrder = 1;
      const generatedDrafts: StackDraft[] = selectedPlatforms.flatMap((platform) => {
        const variationCount = getDraftVariationCount(platform);
        const variations = buildDraftVariations(platform, draftContext).slice(0, variationCount);

        return variations.map((content, index) => {
          const toneAdjustedContent = applyToneTransformation(
            content,
            selectedTone,
            draftContext,
            platform
          );

          return {
            id: `draft_${platform}_${index + 1}`,
            platform,
            status: "draft" as const,
            order: nextDraftOrder++,
            content: toneAdjustedContent,
          };
        });
      });

      console.log("Generated drafts:", generatedDrafts);
      updateStack(nextStack.id, { drafts: generatedDrafts });
      setCurrentStack({ ...nextStack, drafts: generatedDrafts });
      setContent("");
      setSourceUrl("");
      setTranscript("");
      setSelectedPlatforms([]);
      setSelectedTone("professional");
      setSelectedTemplateId(null);
      setBrandVoice("");
      setIsGenerating(false);
    }, 1500);
  }

  function togglePlatform(value: string) {
    setSelectedPlatforms((current) =>
      current.includes(value)
        ? current.filter((platform) => platform !== value)
        : [...current, value]
    );
    if (generateError) {
      setGenerateError("");
    }
  }

  function selectTone(value: string) {
    setSelectedTone(value);

    if (!currentStack) {
      return;
    }

    const updatedStack = {
      ...currentStack,
      tone: value,
    };

    setCurrentStack(updatedStack);

    if (stacks.some((stack) => stack.id === currentStack.id)) {
      updateStack(currentStack.id, { tone: value });
    }
  }

  function handleTemplateSelect(templateId: string) {
    const template = templates.find((item) => item.id === templateId);

    if (!template) {
      return;
    }

    const templateStack: Stack = {
      id: `stack-template-${template.id}`,
      title: template.name,
      inputContent: template.content,
      platforms: [...template.platforms],
      tone: template.tone,
      brandVoice,
      drafts: [],
      status: "draft",
      createdAt: new Date(),
    };

    setSelectedTemplateId(template.id);
    setContent(template.content);
    setSelectedPlatforms([...template.platforms]);
    setSelectedTone(template.tone);
    setCurrentStack(templateStack);
    setGenerateError("");
  }

  function handleOpenQueue() {
    router.push("/queue");
  }

  function handleCopyDraft(draftId: string, content: string) {
    const copyText = async () => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        return;
      }

      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    };

    copyText()
      .then(() => {
        setCopiedDraftId(draftId);

        if (copyTimeoutRef.current) {
          window.clearTimeout(copyTimeoutRef.current);
        }

        copyTimeoutRef.current = window.setTimeout(() => {
          setCopiedDraftId("");
        }, 1500);
      })
      .catch((error) => {
        console.error("Failed to copy draft:", error);
      });
  }

  function handleRewriteDraft(draftId: string, mode: RewriteMode) {
    if (!currentStack) {
      return;
    }

    const updatedDrafts = currentStack.drafts.map((draft) =>
      draft.id === draftId ? { ...draft, content: rewriteDraftContent(draft.content, mode) } : draft
    );

    updateStack(currentStack.id, { drafts: updatedDrafts });
    setCurrentStack({ ...currentStack, drafts: updatedDrafts });
  }

  function handleDeleteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setModalOpenFor(id);
  }

  async function confirmDelete(id: string) {
    setDeletingId(id);
    deleteStack(id);
    setModalOpenFor(null);

    try {
      const res = await fetch(`/api/stacks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete draft");
      }

      toast.success("Draft deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete draft");
    } finally {
      setDeletingId(null);
    }
  }

  const quickActions: QuickActionItem[] = [
    { label: "Create Content", onClick: handleGenerateContent },
    { label: "Go to Queue", href: "/queue" },
  ];

  const lightButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-2 text-sm font-medium text-[rgb(17,24,39)] transition hover:bg-[rgb(243,244,246)]";

  return (
    <div className="space-y-4">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <aside className="order-2 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
                Activity
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                Recent Stacks
              </h2>
            </div>
            <span className="text-xs text-[var(--muted)]">
              {recentStacks.length ? `${recentStacks.length} in memory` : "No stacks yet"}
            </span>
          </div>

          <Card className="overflow-hidden p-0">
            {recentStacks.length ? (
              <div className="divide-y divide-[var(--border)]">
                {recentStacks.map((stack) => {
                  const isSelected = currentStack?.id === stack.id;

                  return (
                    <div
                      key={stack.id}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-5 py-4 transition hover:bg-[rgb(243,244,246)]",
                        isSelected && "bg-[rgba(255,255,255,0.72)] dark:bg-white/5"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Selected stack:", stack);
                          setCurrentStack(stack);
                        }}
                        className="flex flex-1 cursor-pointer items-start gap-3 text-left"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e2e8f0,#f8fafc)] text-xs font-semibold text-[#0f172a] shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                          {stack.title
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((word) => word[0]?.toUpperCase() ?? "")
                            .join("") || "ST"}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="truncate text-sm font-medium text-[var(--foreground)]">
                              {stack.title}
                            </h3>
                            <StatusPill status={stack.status} />
                          </div>
                          <p className="text-xs text-[var(--muted)]">
                            {formatStackTime(stack.createdAt)}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, stack.id)}
                        disabled={deletingId === stack.id}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                        aria-label="Delete draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-8">
                <div className="rounded-[24px] border border-dashed border-[rgb(229,231,235)] bg-[rgb(249,250,251)] p-5 text-center">
                  <p className="text-sm font-medium text-[rgb(17,24,39)]">No recent stacks</p>
                  <p className="mt-1 text-sm text-[rgb(107,114,128)]">
                    Recent stack activity will appear here once stacks are added to the store.
                  </p>
                  <Link href="/queue" className={`${lightButtonClass} mt-4`}>
                    Go to Queue
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                Snapshot
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Workspace health
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:bg-white/5">
                <p className="text-xs text-[var(--muted)]">Stacks used</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{stacks.length}/3</p>
              </div>
              <div className="rounded-[22px] bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:bg-white/5">
                <p className="text-xs text-[var(--muted)]">Queue depth</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {String(draftStacks + readyStacks).padStart(2, "0")}
                </p>
              </div>
            </div>
            <div className="grid gap-2 rounded-[22px] bg-white/70 p-4 text-sm text-[var(--muted)] dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <span>Draft</span>
                <span className="font-medium text-[var(--foreground)]">{draftStacks}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Ready</span>
                <span className="font-medium text-[var(--foreground)]">{readyStacks}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Posted</span>
                <span className="font-medium text-[var(--foreground)]">{postedStacks}</span>
              </div>
            </div>
          </Card>
        </aside>

        <section className="order-1 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
                Workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                Create New Content
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
                Compose a new stack, review the draft, and move it into the queue
                with one clean flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={handleOpenQueue}
                className="rounded-full border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-2 text-sm font-medium text-[rgb(17,24,39)] shadow-none hover:bg-[rgb(243,244,246)] hover:opacity-100"
              >
                Go to Queue
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-3 py-1 text-xs font-medium text-[rgb(75,85,99)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Create Content
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-[rgb(17,24,39)]">
                    Create a polished starting point
                  </h3>
                  <p className="max-w-md text-sm leading-6 text-[rgb(107,114,128)]">
                    Add content, a source URL, or transcript notes to generate a new stack.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] text-[rgb(17,24,39)]">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-[rgb(17,24,39)]">
                      Start from Template
                    </p>
                    <p className="mt-1 text-sm text-[rgb(107,114,128)]">
                      Choose a reusable structure to prefill the stack.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {templates.map((template) => {
                      const isSelected = selectedTemplateId === template.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleTemplateSelect(template.id)}
                          className={cn(
                            "flex h-full flex-col items-start rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5 hover:border-[rgb(209,213,219)] hover:bg-white",
                            isSelected
                              ? "border-[rgb(209,213,219)] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
                              : "border-[rgb(229,231,235)] bg-[rgb(249,250,251)]"
                          )}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-xs font-semibold text-[rgb(17,24,39)] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                                {template.name
                                  .split(" ")
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((word) => word[0]?.toUpperCase() ?? "")
                                  .join("")}
                              </span>
                              <h4 className="text-sm font-medium text-[rgb(17,24,39)]">
                                {template.name}
                              </h4>
                            </div>
                            <p className="text-sm leading-6 text-[rgb(107,114,128)]">
                              {template.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-[rgb(17,24,39)]">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(event) => {
                      setContent(event.target.value);
                      setSelectedTemplateId(null);
                      if (generateError) {
                        setGenerateError("");
                      }
                    }}
                    placeholder="Paste your content (blog, transcript, notes...)"
                    className="min-h-[180px] w-full rounded-[22px] border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-3 text-sm text-[rgb(17,24,39)] outline-none transition placeholder:text-[rgb(156,163,175)] focus:bg-white focus:border-[rgb(209,213,219)]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sourceUrl" className="text-sm font-medium text-[rgb(17,24,39)]">
                    Import from URL
                  </label>
                  <input
                    id="sourceUrl"
                    type="url"
                    value={sourceUrl}
                    onChange={(event) => {
                      setSourceUrl(event.target.value);
                      if (generateError) {
                        setGenerateError("");
                      }
                    }}
                    placeholder="https://example.com/article"
                    className="w-full rounded-[22px] border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-3 text-sm text-[rgb(17,24,39)] outline-none transition placeholder:text-[rgb(156,163,175)] focus:bg-white focus:border-[rgb(209,213,219)]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="transcript" className="text-sm font-medium text-[rgb(17,24,39)]">
                    Transcript
                  </label>
                  <textarea
                    id="transcript"
                    value={transcript}
                    onChange={(event) => {
                      setTranscript(event.target.value);
                      if (generateError) {
                        setGenerateError("");
                      }
                    }}
                    placeholder="Optional transcript or notes..."
                    className="min-h-[120px] w-full rounded-[22px] border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-3 text-sm text-[rgb(17,24,39)] outline-none transition placeholder:text-[rgb(156,163,175)] focus:bg-white focus:border-[rgb(209,213,219)]"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-[rgb(17,24,39)]">Platforms</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {platformOptions.map((platform) => {
                      const isSelected = selectedPlatforms.includes(platform.value);

                      return (
                        <button
                          key={platform.value}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(null);
                            togglePlatform(platform.value);
                          }}
                          className={cn(
                            "flex items-center justify-between rounded-[22px] border px-4 py-3 text-left text-sm transition",
                            isSelected
                              ? "border-[rgb(209,213,219)] bg-[rgb(243,244,246)] text-[rgb(17,24,39)]"
                              : "border-[rgb(229,231,235)] bg-[rgb(249,250,251)] text-[rgb(75,85,99)] hover:bg-[rgb(243,244,246)]"
                          )}
                        >
                          <span>{platform.label}</span>
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                              isSelected
                                ? "border-[rgb(209,213,219)] bg-white text-[rgb(17,24,39)]"
                                : "border-[rgb(229,231,235)] bg-white text-[rgb(156,163,175)]"
                            )}
                          >
                            {isSelected ? "✓" : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-[rgb(17,24,39)]">Tone</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {toneOptions.map((tone) => {
                      const isSelected = selectedTone === tone.value;

                      return (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(null);
                            selectTone(tone.value);
                          }}
                          className={cn(
                            "rounded-[22px] border px-4 py-3 text-left text-sm transition",
                            isSelected
                              ? "border-[rgb(37,99,235)] bg-[rgba(37,99,235,0.08)] text-[rgb(17,24,39)] shadow-[0_12px_28px_rgba(37,99,235,0.12)]"
                              : "border-[rgb(229,231,235)] bg-[rgb(249,250,251)] text-[rgb(75,85,99)] hover:bg-[rgb(243,244,246)]"
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium">{tone.label}</span>
                              <span
                                className={cn(
                                  "h-3 w-3 rounded-full border",
                                  isSelected
                                    ? "border-[rgb(37,99,235)] bg-[rgb(37,99,235)]"
                                    : "border-[rgb(209,213,219)] bg-white"
                                )}
                              />
                            </div>
                            <p className="text-xs leading-5 text-[rgb(107,114,128)]">
                              {tone.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="brandVoice" className="text-sm font-medium text-[rgb(17,24,39)]">
                    Brand Voice
                  </label>
                  <input
                    id="brandVoice"
                    type="text"
                    value={brandVoice}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setBrandVoice(nextValue);
                      setSelectedTemplateId(null);
                      window.localStorage.setItem("stak-brand-voice", nextValue);
                      if (generateError) {
                        setGenerateError("");
                      }
                    }}
                    placeholder="e.g. no emojis, short sentences, technical tone"
                    className="w-full rounded-[22px] border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-3 text-sm text-[rgb(17,24,39)] outline-none transition placeholder:text-[rgb(156,163,175)] focus:bg-white focus:border-[rgb(209,213,219)]"
                  />
                </div>

                {generateError ? (
                  <p className="text-sm text-red-600">{generateError}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    className="rounded-full border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-2 text-sm font-medium text-[rgb(17,24,39)] shadow-none hover:bg-[rgb(243,244,246)] hover:opacity-100 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? "Generating..." : "Generate Content"}
                  </Button>
                  <span className="inline-flex items-center rounded-full border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-3 py-2 text-xs text-[rgb(107,114,128)]">
                    At least one input required
                  </span>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 overflow-hidden p-0">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                    Drafts
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    Generated options
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  {currentStack?.drafts.length ?? 0}
                </span>
              </div>

              {groupedDrafts.length ? (
                <div className="max-h-[560px] overflow-y-auto px-5 py-4 pr-3">
                  <div className="space-y-5">
                    {groupedDrafts.map((group) => (
                      <div key={group.label} className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-medium text-[var(--foreground)]">
                            {group.label}
                          </h4>
                          <span className="text-xs text-[var(--muted)]">
                            {group.drafts.length} drafts
                          </span>
                        </div>

                        <div className="grid gap-3">
                          {group.drafts.map((draft, index) => (
                            <article
                              key={draft.id || (draft as StackDraft & { created_at?: string }).created_at || index}
                              className="rounded-[24px] border border-[var(--border)] bg-[rgb(249,250,251)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                                    {group.label}
                                  </span>
                                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                                    Draft {draft.order}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyDraft(draft.id, draft.content)}
                                    className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                  >
                                    Copy
                                  </button>
                                  {copiedDraftId === draft.id ? (
                                    <span className="text-xs font-medium text-[var(--accent)]">
                                      Copied!
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">
                                {draft.content}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRewriteDraft(draft.id, "shorter")}
                                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                  Shorter
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRewriteDraft(draft.id, "casual")}
                                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                  More casual
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRewriteDraft(draft.id, "professional")}
                                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                  More professional
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-5 py-8">
                  <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-white/50 p-6 text-center dark:bg-white/5">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      No drafts yet
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Generated drafts will appear here after you create a stack.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                    Quick Actions
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    Shortcuts
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  4 items
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {quickActions.map((item) => {
                  const rowClassName =
                    "flex items-center justify-between rounded-[22px] border border-[rgb(229,231,235)] bg-[rgb(249,250,251)] px-4 py-3 text-sm text-[rgb(17,24,39)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[rgb(243,244,246)]";

                  if (item.onClick) {
                    return (
                      <button key={item.label} type="button" onClick={item.onClick} className="text-left">
                        <div className={rowClassName}>
                          <span>{item.label}</span>
                          <ArrowRight className="h-4 w-4 text-[rgb(107,114,128)]" />
                        </div>
                      </button>
                    );
                  }

                  if (item.href) {
                    return (
                      <Link key={item.label} href={item.href}>
                        <div className={rowClassName}>
                          <span>{item.label}</span>
                          <ArrowRight className="h-4 w-4 text-[rgb(107,114,128)]" />
                        </div>
                      </Link>
                    );
                  }

                })}
              </div>
            </Card>
          </div>
        </section>
      </div>

      {modalOpenFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl dark:bg-[#0f172a] border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Delete Draft</h3>
            <p className="mb-6 text-sm text-[var(--muted)]">
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpenFor(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition"
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(modalOpenFor)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
                disabled={!!deletingId}
              >
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
