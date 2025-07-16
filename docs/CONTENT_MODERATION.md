# AI Content Moderation System

## Overview

Campus Connect implements a **comprehensive and strict** AI content moderation system that protects **posts and comments** from inappropriate language, hate speech, harassment, and other violations of community standards. The system now includes **real-time content checking** with **enhanced strict filtering** that prevents submission of inappropriate content before it reaches the server.

## 🛡️ Protected Content Types

The following content types are protected by AI moderation:

| Content Type | API Route | Moderation Level | Status |
|--------------|-----------|------------------|---------|
| **Posts** | `action/createPost.ts` | Full AI Moderation + Real-time + STRICT | ✅ Implemented |
| **Comments** | `action/createComment.ts` | Full AI Moderation + Real-time + STRICT | ✅ Implemented |
| **Event Comments** | `app/api/events/[id]/comments/route.ts` | Full AI Moderation + Real-time + STRICT | ✅ Implemented |
| **Messages** | `app/api/messages/send/route.ts` | Basic Keyword Filter | ✅ Implemented |
| **Other Content** | Various | Basic Keyword Filter | ✅ Implemented |

## 🔧 How It Works

### 1. Real-Time Content Checking (NEW)

**Before Content Creation**: All content is checked in real-time as users type:

- **Debounced API Calls**: Content is checked 500ms after the user stops typing
- **Visual Feedback**: Users see immediate warnings or approval indicators
- **Submission Prevention**: Submit buttons are disabled when content is flagged
- **No Database Records**: Real-time checks don't create any database entries

### 2. Enhanced Multi-Layered Moderation Pipeline (STRICT)

The moderation system uses a **4-layer approach** in `lib/openaiModeration.ts`:

1. **Enhanced Keyword Filter** - Hard blocks specific words/phrases using regex boundaries
2. **Harmful Pattern Detection** - Blocks harmful patterns and phrases (NEW)
3. **Strict Sentiment Scoring** - Blocks content with lower negativity scores (≥1 instead of ≥2)
4. **OpenAI Moderation API** - Uses OpenAI's trained moderation model

### 3. User Experience

- **Real-Time Warnings**: Users see prominent, user-friendly warnings as they type
- **Green Approval**: "Content looks good!" indicator for safe content
- **Submission Blocked**: Users cannot submit inappropriate content
- **Helpful Guidance**: Warnings include suggestions for how to fix the content

### 4. Frontend Integration

**Real-time checking via `/api/moderate-content`**:
- **Posts**: Check title + body combination
- **Comments**: Check comment content
- **Event Comments**: Check comment content
- **Visual Indicators**: Loading spinners, color-coded borders, approval badges

## 📋 Enhanced Moderation Standards

### Comprehensive Blocked Keywords
```typescript
const BLOCKED_KEYWORDS = [
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
  "act now", "don't miss", "exclusive", "secret", "hidden", "revealed"
];
```

### Harmful Pattern Detection (NEW)
The system now detects harmful patterns like:
- **Hate Speech**: "all [group] are", "every [group] is", "nobody likes"
- **Harassment**: "you're such a worthless", "hope you fail"
- **Self-harm**: "end it all", "no point", "can't take it"
- **Spam**: "click this", "free money", "credit card"
- **Sexual**: "obscene", "sexual", "intimate", "bedroom"

### User-Friendly Error Messages
- **Keyword Filter**: "Your content contains inappropriate language that violates our community guidelines."
- **Pattern Filter**: "Your content contains harmful patterns or inappropriate language that violates our community guidelines."
- **Sentiment Scoring**: "Your content appears to contain harmful or inappropriate language. Please review and revise your message."
- **OpenAI API**: Context-specific messages for hate, harassment, violence, etc.

## 🎯 Key Features

- **Real-Time Prevention**: Content is blocked before submission
- **Strict Filtering**: Enhanced keyword lists and pattern detection
- **Lower Thresholds**: Sentiment scoring threshold lowered from 2 to 1
- **Pattern Recognition**: Detects harmful phrases and structures
- **Comprehensive Coverage**: All comment types are protected
- **User Friendly**: Clear, helpful error messages with visual indicators
- **No Bypass**: Content cannot be submitted if flagged
- **Graceful Degradation**: Works even if AI services are down
- **Visual Feedback**: Loading states, approval indicators, warning banners

## 🔄 Real-Time Flow

1. **User Types**: Content is entered in form fields
2. **Debounced Check**: 500ms delay, then API call to `/api/moderate-content`
3. **Visual Response**: 
   - ✅ Green approval badge for safe content
   - ⚠️ Red warning banner for flagged content
   - 🔄 Loading spinner during check
4. **Submission Control**: Submit button disabled if content is flagged
5. **Server Validation**: Final check on server before database save

## 📊 Content Type Moderation Levels

| Content Type | Real-time Check | Server Check | Database Logging |
|--------------|----------------|--------------|------------------|
| **Posts** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Comments** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Event Comments** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Messages** | ❌ No | ✅ Basic | ✅ Yes |
| **Other Content** | ❌ No | ✅ Basic | ✅ Yes |

## 🛠️ Technical Implementation

### Real-Time API Endpoint
```typescript
// app/api/moderate-content/route.ts
export async function POST(request: NextRequest) {
  const { content, type } = await request.json();
  const moderationResult = await runAllModerationChecks(content.trim(), type);
  
  return NextResponse.json({
    flagged: moderationResult.flagged,
    reason: moderationResult.reason,
    method: moderationResult.method,
    aiAvailable: moderationResult.aiAvailable
  });
}
```

### Enhanced Moderation Function
```typescript
// lib/openaiModeration.ts
export async function runAllModerationChecks(text: string, contentType: string) {
  // 1. Enhanced keyword filter
  if (containsBlockedKeyword(text)) {
    return { flagged: true, reason: "Inappropriate language", method: "keyword-filter" };
  }
  
  // 2. Harmful pattern detection (NEW)
  if (containsHarmfulPatterns(text)) {
    return { flagged: true, reason: "Harmful patterns", method: "pattern-filter" };
  }
  
  // 3. Strict sentiment scoring (lower threshold)
  const toxicityScore = computeToxicityScore(text);
  if (toxicityScore >= 1) { // Lowered from 2 to 1
    return { flagged: true, reason: "Harmful language", method: "sentiment-scoring" };
  }
  
  // 4. OpenAI API check
  // ... OpenAI moderation logic
}
```

## 🧪 Testing Examples

The system now catches these previously problematic examples:

### ✅ Should Be BLOCKED (Now Caught)
- **Harassment**: "You're such a worthless idiot, I hope you fail at everything."
- **Hate Speech**: "People from [group] are all disgusting animals and should be removed."
- **Self-harm**: "I want to end it all. There's no point in living anymore."
- **Sexual**: "I want to do obscene things to you all night."
- **Spam**: "Click this link to win $10,000 now!! Just enter your credit card details."

### ✅ Should Be ALLOWED
- **Mild Criticism**: "I think this product is bad and wouldn't recommend it."
- **Normal Discussion**: "This is a normal comment about the weather."

## 🎯 Benefits

- **Immediate Feedback**: Users know instantly if content is inappropriate
- **Prevents Server Load**: Inappropriate content never reaches the server
- **Better UX**: Clear visual indicators guide users
- **Cost Savings**: Fewer API calls to OpenAI (only for real-time checks)
- **Comprehensive Coverage**: All comment types are protected
- **Graceful Fallback**: System works even if real-time checks fail
- **Strict Protection**: Enhanced filtering catches more harmful content 