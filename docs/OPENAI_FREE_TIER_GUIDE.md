# 🆓 OpenAI Free Tier Optimization Guide

## Overview

This guide helps you maximize your OpenAI free tier ($5/month) while maintaining effective content moderation for your campus community platform.

## 💰 Free Tier Limits

- **Monthly Credit**: $5
- **OpenAI Moderation API**: ~$0.0001 per request
- **GPT-4**: ~$0.01-0.03 per request (disabled by default)
- **Estimated Capacity**: ~50,000 moderation requests per month

## 🔧 Current Moderation Strategy

### ✅ **FREE Methods (Always Available)**
1. **Keyword Filtering** - Blocks specific harmful words
2. **Sentiment Scoring** - Detects high negativity levels
3. **Basic Content Validation** - Checks for required fields

### ⚠️ **Paid Methods (Optimized for Free Tier)**
1. **OpenAI Moderation API** - Used only for posts and comments
2. **GPT-4 Contextual Analysis** - Disabled by default (too expensive)

## 📊 Content Type Moderation Levels

| Content Type | Moderation Level | Cost | Reasoning |
|--------------|------------------|------|-----------|
| **Posts** | Basic + OpenAI API | ~$0.0001 | High visibility, worth AI check |
| **Comments** | Basic + OpenAI API | ~$0.0001 | User-generated, needs moderation |
| **Messages** | Basic only | $0.00 | Private, basic filtering sufficient |
| **Surveys** | Basic only | $0.00 | Structured content, low risk |
| **Marketplace** | Basic only | $0.00 | Transactional, basic filtering OK |
| **Events** | Basic only | $0.00 | Event details, low risk |

## 🎯 Optimization Tips

### 1. **Monitor Usage**
```bash
pnpm run check-openai
```
Check your usage at: https://platform.openai.com/usage

### 2. **Enable GPT-4 Only When Needed**
If you want advanced contextual analysis, uncomment the GPT-4 section in `lib/openaiModeration.ts`:

```typescript
// Uncomment this block for GPT-4 analysis (costs ~$0.01-0.03 per request)
/*
if (aiAvailable) {
  // GPT-4 contextual moderation code
}
*/
```

### 3. **Adjust Moderation Thresholds**
Modify the sentiment scoring threshold in `lib/openaiModeration.ts`:

```typescript
// Increase threshold to reduce false positives
if (toxicityScore >= 5) { // Changed from 3 to 5
  // Flag content
}
```

### 4. **Add More Keywords**
Expand the blocked keywords list for better free-tier coverage:

```typescript
const BLOCKED_KEYWORDS = [
  "hate", "idiot", "stupid", "dumb", "kill", "racist", "sexist", 
  "nazi", "terrorist", "violence", "abuse", "slur",
  // Add more specific terms for your community
  "harassment", "bully", "threat", "attack"
];
```

## 🚨 Usage Alerts

### Warning Signs
- **High Daily Usage**: >$0.20 per day
- **Projected Monthly**: >$4.50
- **Frequent Quota Errors**: 429 status codes

### Emergency Measures
If you're approaching your limit:

1. **Disable AI Moderation Temporarily**:
   ```typescript
   // In lib/openaiModeration.ts, comment out OpenAI calls
   // const moderationResponse = await openai.moderations.create({ input: text });
   ```

2. **Increase Basic Filtering**:
   - Add more keywords to `BLOCKED_KEYWORDS`
   - Lower sentiment scoring threshold
   - Add regex patterns for common issues

3. **Limit AI to Critical Content Only**:
   - Only moderate posts (not comments)
   - Add user reputation system
   - Implement manual review for flagged content

## 📈 Scaling Strategy

### Phase 1: Free Tier (Current)
- Basic + OpenAI Moderation API for posts/comments
- Keyword filtering for everything else
- Monitor usage closely

### Phase 2: Growth (Consider Paid Plan)
- Enable GPT-4 for edge cases
- Add more sophisticated moderation
- Implement user reputation system

### Phase 3: Enterprise
- Custom moderation models
- Real-time content analysis
- Advanced user management

## 🔍 Troubleshooting

### Common Issues

**Quota Exceeded (429 Error)**
- ✅ **Fixed**: System falls back to basic moderation
- ✅ **No crashes**: App continues to function
- ✅ **Logged**: Warnings appear in console

**High Usage**
- Run `pnpm run check-openai` for tips
- Review moderation settings
- Consider upgrading plan

**False Positives**
- Adjust sentiment scoring threshold
- Add exceptions to keyword list
- Enable GPT-4 for borderline cases

## 📞 Support

If you need help optimizing your OpenAI usage:

1. Check the usage dashboard: https://platform.openai.com/usage
2. Review this guide for optimization tips
3. Consider upgrading to a paid plan for higher limits

## 🎉 Success Metrics

With proper optimization, you should see:
- ✅ **< $2/month** in OpenAI costs
- ✅ **No quota errors** in production
- ✅ **Effective moderation** of harmful content
- ✅ **Fast response times** for content creation
- ✅ **Happy users** with minimal false positives

---

*Remember: The goal is to maintain a safe, welcoming community while staying within your free tier budget!* 🚀 