export type Template = Readonly<{
  id: string;
  name: string;
  description: string;
  content: string;
  platforms: ReadonlyArray<string>;
  tone: string;
}>;

export const defaultTemplates: Template[] = [
  {
    id: "launch-post",
    name: "Launch Post",
    description: "Announce a new product, feature, or milestone with a strong opening.",
    content:
      "Hook: We built something new.\n\nWhat it is: Explain the launch in one clear paragraph.\n\nWhy it matters: Share the value for your audience.\n\nCTA: Invite people to try it or share feedback.",
    platforms: ["x-short", "x-thread", "linkedin-short", "linkedin-long"],
    tone: "professional",
  },
  {
    id: "feature-update",
    name: "Feature Update",
    description: "Share a product improvement, release note, or workflow enhancement.",
    content:
      "Hook: A better way to do the same job.\n\nUpdate: Describe the feature and what changed.\n\nBenefit: Explain the outcome for users.\n\nCTA: Ask readers to explore the update.",
    platforms: ["x-short", "linkedin-short", "newsletter"],
    tone: "professional",
  },
  {
    id: "customer-story",
    name: "Customer Story",
    description: "Show how a customer achieved results with a concise narrative structure.",
    content:
      "Hook: A real result from a real customer.\n\nChallenge: Outline the problem they faced.\n\nSolution: Show how the product or service helped.\n\nOutcome: Share the impact and results.\n\nCTA: Invite others to see the same outcome.",
    platforms: ["linkedin-long", "newsletter", "instagram"],
    tone: "founder-style",
  },
  {
    id: "weekly-recap",
    name: "Weekly Recap",
    description: "Summarize the week with highlights, learnings, and a next-step CTA.",
    content:
      "Hook: This week in review.\n\nHighlights: Share the top wins, updates, or lessons.\n\nTakeaway: Explain what matters most.\n\nCTA: Ask readers what they want next week.",
    platforms: ["threads", "newsletter", "linkedin-short"],
    tone: "casual",
  },
];
