#!/usr/bin/env tsx

/**
 * OpenAI Usage Monitor for Free Tier
 * 
 * This script helps you monitor your OpenAI API usage and provides
 * tips for optimizing your free tier credits.
 */

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function checkUsage() {
  try {
    console.log("🔍 Checking OpenAI API Usage...\n");

    // Note: OpenAI doesn't provide a direct usage API in the client
    // You can check usage at: https://platform.openai.com/usage
    
    console.log("📊 Usage Monitoring:");
    console.log("   Check your usage at: https://platform.openai.com/usage");
    console.log("   Free tier includes: $5 credit per month\n");

    // Provide optimization tips
    console.log("💡 Free Tier Optimization Tips:");
    console.log("   1. ✅ Basic keyword filtering is FREE");
    console.log("   2. ✅ Sentiment scoring is FREE");
    console.log("   3. ⚠️  OpenAI Moderation API costs ~$0.0001 per request");
    console.log("   4. ❌ GPT-4 costs ~$0.01-0.03 per request (disabled by default)");
    console.log("   5. 📝 Only posts and comments use AI moderation");
    console.log("   6. 💬 Messages use basic filtering only");
    console.log("   7. 🎯 Focus AI moderation on high-impact content\n");

    console.log("🔧 Current Moderation Settings:");
    console.log("   - Posts: Basic + OpenAI Moderation API");
    console.log("   - Comments: Basic + OpenAI Moderation API");
    console.log("   - Messages: Basic filtering only");
    console.log("   - Surveys: Basic filtering only");
    console.log("   - Marketplace: Basic filtering only");
    console.log("   - Events: Basic filtering only\n");

    console.log("💰 Cost Estimates (per request):");
    console.log("   - Keyword filtering: $0.00");
    console.log("   - Sentiment scoring: $0.00");
    console.log("   - OpenAI Moderation API: ~$0.0001");
    console.log("   - GPT-4 (disabled): ~$0.01-0.03");
    console.log("\n📈 With $5 free tier, you can make:");
    console.log("   - ~50,000 OpenAI Moderation API calls");
    console.log("   - ~500 GPT-4 calls (if enabled)");

  } catch (error) {
    console.error("❌ Error:", error);
    console.log("\n💡 Make sure your OPENAI_API_KEY is set correctly.");
  }
}

// Run the check
checkUsage(); 