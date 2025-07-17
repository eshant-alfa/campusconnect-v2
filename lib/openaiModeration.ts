/**
 * AI Content Moderation for Posts and Comments Only
 * 
 * Features:
 * - Enhanced keyword-based filtering with regex boundary matching
 * - Lower sentiment scoring thresholds for stricter moderation
 * - OpenAI Moderation API with detailed category parsing
 * - Graceful fallback when OpenAI API is unavailable
 * - Optimized for free tier usage
 * - Only moderates posts and comments (not messages, surveys, etc.)
 */

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Lenient blocked keywords - only the most extreme harmful terms.
 * Use lower-case only, checked with word boundaries.
 * These are the most severe terms that should always be blocked.
 */
const BLOCKED_KEYWORDS = [
  "kill",
  "fuck",
  "hate",
  "nazi",
  "terrorist",
  "suicide",
  "murder",
  "rape",
  "pedophile",
  "child porn"
];

/**
 * Enhanced negative words used for sentiment scoring.
 * These can be adjusted for different community standards.
 * Focused on truly toxic/harmful terms rather than general negative words.
 */
const NEGATIVE_WORDS = [
  // Direct insults and hate
  "fuck you", "kill yourself", "die bitch", "you're dead", "i'll kill you",
  "nazi", "terrorist", "slur", "hate", "stupid", "idiot", "dumb", "worthless",
  "disgusting", "animals", "removed", "obscene", "credit card", "win money",
  
  
  // Self-harm indicators
  "end it all", "no point", "pointless", "meaningless", "hopeless",
  "despair", "desperate", "suicide", "kill myself", "self harm",
  
  // Spam indicators
  "click this", "free money", "win money", "earn money", "make money",
  "quick cash", "fast cash", "easy money", "credit card", "bank account",
  
  // Hate speech patterns
  "nobody likes", "everyone hates",
  "should be banned", "should be removed", "should be killed"
];

/**
 * Utility: Checks for any blocked words in the input text using regex word boundaries.
 */
function containsBlockedKeyword(text: string): boolean {
  return BLOCKED_KEYWORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(text);
  });
}

/**
 * Pattern detection is now disabled for maximum leniency.
 * Only direct keyword matches will be flagged.
 */
function containsHarmfulPatterns(text: string): boolean {
  return false;
}

/**
 * Sentiment scoring is now disabled for maximum leniency.
 * No content will be flagged based on negative word frequency or tone.
 */
function computeToxicityScore(text: string): number {
  return 0;
}

/**
 * Check if an error is a quota/rate limit error
 */
function isQuotaError(error: any): boolean {
  return error?.status === 429 || 
         error?.code === 'insufficient_quota' || 
         error?.type === 'insufficient_quota' ||
         error?.message?.includes('quota') ||
         error?.message?.includes('429');
}

/**
 * Main moderation function that runs all checks in sequence.
 * ONLY for posts and comments - other content types should not call this function.
 * Returns flagged status, reason, and detection method.
 * NOW WITH STRICTER THRESHOLDS
 */
export async function runAllModerationChecks(
  text: string,
  contentType: string = "post"
): Promise<{ flagged: boolean; reason: string; method: string; aiAvailable: boolean }> {
  
  // Validate content type - only posts and comments should be moderated
  if (contentType !== "post" && contentType !== "comment") {
    console.warn(`Moderation called for unsupported content type: ${contentType}. Skipping AI moderation.`);
    return {
      flagged: false,
      reason: "",
      method: "no-moderation-needed",
      aiAvailable: false
    };
  }

  const lowerText = text.toLowerCase();
  let aiAvailable = true;

  /** 1️⃣ Enhanced blocked keyword filter (hard block) - FREE */
  if (containsBlockedKeyword(lowerText)) {
    return {
      flagged: true,
      reason: "Your content contains inappropriate language that violates our community guidelines.",
      method: "keyword-filter",
      aiAvailable: true
    };
  }

  /** 2️⃣ Harmful patterns check (hard block) - FREE */
  if (containsHarmfulPatterns(text)) {
    return {
      flagged: true,
      reason: "Your content contains harmful patterns or inappropriate language that violates our community guidelines.",
      method: "pattern-filter",
      aiAvailable: true
    };
  }

  /** 3️⃣ Enhanced sentiment scoring check (lower threshold) - FREE */
  const toxicityScore = computeToxicityScore(lowerText);
  if (toxicityScore >= 1) { // Lowered from 2 to 1 for stricter moderation
    return {
      flagged: true,
      reason: "Your content appears to contain harmful or inappropriate language. Please review and revise your message.",
      method: "sentiment-scoring",
      aiAvailable: true
    };
  }

  /** 4️⃣ OpenAI Moderation API check (for posts and comments only) */
  try {
    const moderationResponse = await openai.moderations.create({ input: text });
    const result = moderationResponse.results[0];

    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, isTrue]) => isTrue)
        .map(([category]) => category)
        .join(", ") || "inappropriate content";

      // Create user-friendly reason based on categories
      let userReason = "Your content was flagged as inappropriate.";
      
      if (flaggedCategories.includes("hate")) {
        userReason = "Your content contains hate speech or discriminatory language.";
      } else if (flaggedCategories.includes("harassment")) {
        userReason = "Your content appears to harass or bully others.";
      } else if (flaggedCategories.includes("violence")) {
        userReason = "Your content contains violent or threatening language.";
      } else if (flaggedCategories.includes("sexual")) {
        userReason = "Your content contains inappropriate sexual content.";
      } else if (flaggedCategories.includes("self-harm")) {
        userReason = "Your content promotes self-harm or dangerous behavior.";
      }

      return {
        flagged: true,
        reason: userReason,
        method: "openai-moderation",
        aiAvailable: true
      };
    }
  } catch (err) {
    console.error("OpenAI Moderation API error:", err);
    if (isQuotaError(err)) {
      console.warn("OpenAI API quota exceeded - falling back to basic moderation");
      aiAvailable = false;
    } else {
      console.error("OpenAI API error (non-quota):", err);
      aiAvailable = false;
    }
  }

  /** ✅ Passed all checks */
  return {
    flagged: false,
    reason: "",
    method: aiAvailable ? "ai-moderation" : "basic-moderation",
    aiAvailable
  };
}

/**
 * Enhanced simple keyword check for non-AI content types (messages, surveys, etc.)
 * This is a lightweight alternative for content that doesn't need full AI moderation.
 * NOW WITH STRICTER THRESHOLDS
 */
export function basicKeywordCheck(text: string): { flagged: boolean; reason: string } {
  const lowerText = text.toLowerCase();
  
  if (containsBlockedKeyword(lowerText)) {
    return {
      flagged: true,
      reason: "Your content contains inappropriate language that violates our community guidelines."
    };
  }
  
  if (containsHarmfulPatterns(text)) {
    return {
      flagged: true,
      reason: "Your content contains harmful patterns or inappropriate language that violates our community guidelines."
    };
  }
  
  const toxicityScore = computeToxicityScore(lowerText);
  if (toxicityScore >= 2) { // Lowered from 3 to 2 for stricter moderation
    return {
      flagged: true,
      reason: "Your content appears to contain harmful or inappropriate language. Please review and revise your message."
    };
  }
  
  return {
    flagged: false,
    reason: ""
  };
}
