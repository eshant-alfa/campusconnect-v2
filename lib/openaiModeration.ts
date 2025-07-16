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
 * Enhanced blocked keywords for strict filtering.
 * Use lower-case only, checked with word boundaries.
 * These are very specific harmful terms that should always be blocked.
 */
const BLOCKED_KEYWORDS = [
  // 1️⃣ Profanity / Swear Words
  "fuck", "shit", "bitch", "asshole", "bastard", "damn", "crap", "dick", "pussy", "cunt", "motherfucker", "fucking", "slut", "whore", "prick", "wank", "bollocks", "piss", "twat",

  // 2️⃣ Hateful or Discriminatory Slurs
  "nigger", "nigga", "chink", "gook", "spic", "wetback", "faggot", "fag", "dyke", "tranny", "retard", "mongoloid", "kike", "yid", "paki", "towelhead", "sandnigger", "jap", "cripple", "invalid",

  // 3️⃣ Violent / Threatening Language
  "kill", "murder", "shoot", "stab", "bomb", "blow up", "execute", "slaughter", "massacre", "hang", "lynch", "beat up", "attack", "assault", "burn", "rape", "kidnap", "decapitate", "torture", "mutilate",

  // 4️⃣ Harassment / Insults
  "idiot", "stupid", "dumb", "moron", "imbecile", "loser", "worthless", "pathetic", "ugly", "fat", "disgusting", "repulsive", "scum", "trash", "garbage", "useless", "incompetent",

  // 5️⃣ Sexual Content / Explicit Language
  "sex", "sexual", "blowjob", "handjob", "cum", "orgasm", "dildo", "vibrator", "porn", "pornography", "nude", "naked", "erection", "penis", "vagina", "anal", "oral", "masturbation", "gangbang", "fetish", "bdsm", "incest", "bestiality", "necrophilia", "pedophile", "pedophilia", "underage", "child porn",

  // 6️⃣ Extremist / Terrorist Phrases
  "jihad", "terrorist", "terrorism", "isis", "al qaeda", "bomb-making", "martyrdom", "holy war", "recruit fighters", "radicalize", "join isis", "kill infidels",

  // 7️⃣ Self-Harm / Suicide References
  "suicide", "kill myself", "end it all", "cut myself", "slit wrists", "overdose", "hang myself", "jump off", "no reason to live", "i want to die",

  // 8️⃣ Drugs and Illegal Activity
  "weed", "marijuana", "cocaine", "heroin", "meth", "crack", "lsd", "shrooms", "ecstasy", "mdma", "drug dealing", "buy drugs", "sell drugs", "fentanyl", "narcotics", "trafficking", "smuggling", "cartel",

  // 9️⃣ Academic Cheating / Plagiarism
  "pay someone to do", "buy assignment", "sell answers", "exam leak", "cheat sheet", "get someone to write", "plagiarize", "copy-paste", "essay mill", "contract cheating",

  // 10️⃣ Sensitive / Banned Topics
  "child abuse", "sexual assault", "incest", "bestiality", "necrophilia", "genocide", "holocaust denial", "school shooting", "bomb threat",

  // Existing and previously added keywords (for completeness)
  // Violence and threats
  "nazi", "terrorist", "slur", "fuck you", "kill yourself", "die bitch", 
  "you're dead", "i'll kill you", "hate speech", "racist", "sexist", 
  "harassment", "bully", "threat", "kill you", "kill", "blow up", "bomb", 
  "explode", "murder", "assassinate", "threaten", "end it all", "suicide",
  "worthless", "idiot", "stupid", "dumb", "fail", "disgusting", "animals",
  "removed", "obscene", "credit card", "win money", "click this link",
  
  // Hate speech and discrimination
  "hate", "disgusting", "animals", "worthless", "useless", "trash",
  "scum", "filth", "vermin", "pest", "parasite", "leech", "freak",
  "monster", "beast", "savage", "barbarian", "primitive", "inferior",
  "superior", "pure", "impure", "defile", "contaminate", "pollute",
  
  // Harassment and insults
  "idiot", "stupid", "dumb", "moron", "imbecile", "retard", "cretin",
  "fool", "clown", "joke", "pathetic", "pitiful", "sad", "loser",
  "failure", "worthless", "useless", "hopeless", "desperate", "weak",
  "coward", "chicken", "scared", "afraid", "terrified", "fearful",
  
  // Self-harm and suicide
  "end it all", "no point", "pointless", "meaningless", "hopeless",
  "despair", "desperate", "suicide", "kill myself", "self harm",
  "cut myself", "bleed", "die", "death", "dead", "gone", "over",
  "finished", "done", "enough", "can't take it", "can't handle",
  
  // Sexual and explicit content
  "obscene", "sexual", "porn", "nude", "naked", "explicit", "adult",
  "mature", "intimate", "private", "bedroom", "bed", "sleep", "night",
  "touch", "feel", "kiss", "hug", "love", "romance", "relationship",
  
  // Spam and scams
  "click this", "click here", "free money", "win money", "earn money",
  "make money", "quick cash", "fast cash", "easy money", "rich",
  "millionaire", "billionaire", "credit card", "bank account", "password",
  "login", "sign up", "register", "subscribe", "buy now", "limited time",
  "act now", "don't miss", "exclusive", "secret", "hidden", "revealed",
  
  // Additional harmful patterns
  "all [group] are", "every [group] is", "nobody likes", "everyone hates",
  "no one cares", "nobody wants", "everyone knows", "everybody thinks",
  "should be banned", "should be removed", "should be deleted",
  "should be killed", "should be destroyed", "should be eliminated"
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
  
  // Harassment patterns
  "you're such a", "you are a", "you're a", "you are such", "you're such",
  "hope you", "wish you", "want you to", "should be", "deserve to",
  
  // Self-harm indicators
  "end it all", "no point", "pointless", "meaningless", "hopeless",
  "despair", "desperate", "suicide", "kill myself", "self harm",
  
  // Spam indicators
  "click this", "free money", "win money", "earn money", "make money",
  "quick cash", "fast cash", "easy money", "credit card", "bank account",
  
  // Hate speech patterns
  "all [group] are", "every [group] is", "nobody likes", "everyone hates",
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
 * Enhanced utility: Checks for harmful patterns and phrases.
 */
function containsHarmfulPatterns(text: string): boolean {
  const harmfulPatterns = [
    // Hate speech patterns
    /\b(all|every|nobody|everyone|no one)\s+[a-z]+\s+(are|is|likes|hates|wants|knows|thinks)\b/i,
    /\b(should be|deserve to|hope you|wish you|want you to)\s+(banned|removed|killed|destroyed|eliminated|fail|die)\b/i,
    
    // Harassment patterns
    /\b(you're|you are)\s+(such a|a)\s+(worthless|useless|stupid|idiot|dumb|pathetic|loser)\b/i,
    
    // Self-harm patterns
    /\b(end it all|no point|pointless|meaningless|hopeless|despair|desperate)\b/i,
    /\b(can't take it|can't handle|can't deal|can't cope)\b/i,
    
    // Spam patterns
    /\b(click this|click here|free money|win money|earn money|make money)\b/i,
    /\b(credit card|bank account|password|login|sign up|register)\b/i,
    
    // Sexual/explicit patterns
    /\b(obscene|sexual|porn|nude|naked|explicit|adult|mature)\b/i,
    /\b(intimate|private|bedroom|bed|sleep|night|touch|feel)\b/i
  ];
  
  return harmfulPatterns.some(pattern => pattern.test(text));
}

/**
 * Enhanced utility: Computes a strict toxicity score based on negative word frequency.
 * Returns a score from 0 to N where N is the number of negative words found.
 * Lower threshold for stricter moderation.
 */
function computeToxicityScore(text: string): number {
  let score = 0;
  
  // Check for negative words
  score += NEGATIVE_WORDS.reduce((wordScore, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = text.match(regex);
    return wordScore + (matches ? matches.length : 0);
  }, 0);
  
  // Bonus points for harmful patterns
  if (containsHarmfulPatterns(text)) {
    score += 3;
  }
  
  // Bonus points for excessive punctuation (often indicates anger)
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  if (exclamationCount > 2 || questionCount > 3) {
    score += 1;
  }
  
  // Bonus points for all caps (often indicates shouting/anger)
  const upperCaseRatio = text.replace(/[^A-Z]/g, '').length / text.length;
  if (upperCaseRatio > 0.3 && text.length > 10) {
    score += 2;
  }
  
  return score;
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
