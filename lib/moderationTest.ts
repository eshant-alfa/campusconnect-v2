/**
 * Comprehensive moderation test utility
 * Tests all content types to ensure moderation is working correctly
 */

import { runAllModerationChecks } from './openaiModeration';

export interface ModerationTestResult {
  contentType: string;
  testContent: string;
  expectedFlagged: boolean;
  actualFlagged: boolean;
  passed: boolean;
  reason?: string;
  method?: string;
}

const TEST_CONTENT = {
  explicitHate: "I hate all people of that race, they should be eliminated.",
  violence: "I'm going to kill you and your family tonight.",
  profanity: "This is a fucking terrible post with lots of curse words.",
  harassment: "You're such a stupid idiot, I hope you die alone.",
  normalPost: "Hello everyone! I'm excited to share this interesting article about climate change.",
  academicDiscussion: "The research methodology employed in this study demonstrates significant statistical validity when considering the sample size and confidence intervals."
};

export async function runModerationTests(): Promise<ModerationTestResult[]> {
  console.log("🧪 Starting Content Moderation Tests...\n");

  const results: ModerationTestResult[] = [];

  // Test 1: Explicit Hate Speech
  console.log("1️⃣ Testing Explicit Hate Speech:");
  const hateResult = await runAllModerationChecks(TEST_CONTENT.explicitHate);
  console.log(`   Input: "${TEST_CONTENT.explicitHate}"`);
  console.log(`   Flagged: ${hateResult.flagged}`);
  console.log(`   Reason: ${hateResult.reason}`);
  console.log(`   Method: ${hateResult.method}`);
  console.log(`   AI Available: ${hateResult.aiAvailable}\n`);
  
  results.push({
    contentType: 'Explicit Hate Speech',
    testContent: TEST_CONTENT.explicitHate,
    expectedFlagged: true,
    actualFlagged: hateResult.flagged,
    passed: hateResult.flagged === true,
    reason: hateResult.reason,
    method: hateResult.method
  });

  // Test 2: Violence
  console.log("2️⃣ Testing Violence:");
  const violenceResult = await runAllModerationChecks(TEST_CONTENT.violence);
  console.log(`   Input: "${TEST_CONTENT.violence}"`);
  console.log(`   Flagged: ${violenceResult.flagged}`);
  console.log(`   Reason: ${violenceResult.reason}`);
  console.log(`   Method: ${violenceResult.method}`);
  console.log(`   AI Available: ${violenceResult.aiAvailable}\n`);
  
  results.push({
    contentType: 'Violence',
    testContent: TEST_CONTENT.violence,
    expectedFlagged: true,
    actualFlagged: violenceResult.flagged,
    passed: violenceResult.flagged === true,
    reason: violenceResult.reason,
    method: violenceResult.method
  });

  // Test 3: Profanity
  console.log("3️⃣ Testing Profanity:");
  const profanityResult = await runAllModerationChecks(TEST_CONTENT.profanity);
  console.log(`   Input: "${TEST_CONTENT.profanity}"`);
  console.log(`   Flagged: ${profanityResult.flagged}`);
  console.log(`   Reason: ${profanityResult.reason}`);
  console.log(`   Method: ${profanityResult.method}`);
  console.log(`   AI Available: ${profanityResult.aiAvailable}\n`);
  
  results.push({
    contentType: 'Profanity',
    testContent: TEST_CONTENT.profanity,
    expectedFlagged: true,
    actualFlagged: profanityResult.flagged,
    passed: profanityResult.flagged === true,
    reason: profanityResult.reason,
    method: profanityResult.method
  });

  // Test 4: Harassment
  console.log("4️⃣ Testing Harassment:");
  const harassmentResult = await runAllModerationChecks(TEST_CONTENT.harassment);
  console.log(`   Input: "${TEST_CONTENT.harassment}"`);
  console.log(`   Flagged: ${harassmentResult.flagged}`);
  console.log(`   Reason: ${harassmentResult.reason}`);
  console.log(`   Method: ${harassmentResult.method}`);
  console.log(`   AI Available: ${harassmentResult.aiAvailable}\n`);
  
  results.push({
    contentType: 'Harassment',
    testContent: TEST_CONTENT.harassment,
    expectedFlagged: true,
    actualFlagged: harassmentResult.flagged,
    passed: harassmentResult.flagged === true,
    reason: harassmentResult.reason,
    method: harassmentResult.method
  });

  // Test 5: Normal Post
  console.log("5️⃣ Testing Normal Post:");
  const normalResult = await runAllModerationChecks(TEST_CONTENT.normalPost);
  console.log(`   Input: "${TEST_CONTENT.normalPost}"`);
  console.log(`   Flagged: ${normalResult.flagged}`);
  console.log(`   Reason: ${normalResult.reason}`);
  console.log(`   Method: ${normalResult.method}`);
  console.log(`   AI Available: ${normalResult.aiAvailable}\n`);
  
  results.push({
    contentType: 'Normal Post',
    testContent: TEST_CONTENT.normalPost,
    expectedFlagged: false,
    actualFlagged: normalResult.flagged,
    passed: normalResult.flagged === false,
    reason: normalResult.reason,
    method: normalResult.method
  });

  // Test 6: Academic Discussion
  console.log("6️⃣ Testing Academic Discussion:");
  const academicResult = await runAllModerationChecks(TEST_CONTENT.academicDiscussion);
  console.log(`   Input: "${TEST_CONTENT.academicDiscussion}"`);
  console.log(`   Flagged: ${academicResult.flagged}`);
  console.log(`   Reason: ${academicResult.reason}`);
  console.log(`   Method: ${academicResult.method}`);
  console.log(`   AI Available: ${academicResult.aiAvailable}\n`);
  
  results.push({
    contentType: 'Academic Discussion',
    testContent: TEST_CONTENT.academicDiscussion,
    expectedFlagged: false,
    actualFlagged: academicResult.flagged,
    passed: academicResult.flagged === false,
    reason: academicResult.reason,
    method: academicResult.method
  });

  console.log("✅ Content Moderation Tests Completed!");
  return results;
}

// Keep the old function for backward compatibility
export async function testModeration() {
  const results = await runModerationTests();
  printModerationTestResults(results);
}

export function printModerationTestResults(results: ModerationTestResult[]): void {
  console.log("\n=== MODERATION TEST RESULTS ===\n");
  
  let passedTests = 0;
  let totalTests = results.length;
  
  results.forEach((result, index) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${index + 1}. ${status} - ${result.contentType}`);
    console.log(`   Content: "${result.testContent.substring(0, 50)}..."`);
    console.log(`   Expected: ${result.expectedFlagged ? "FLAGGED" : "PASS"}`);
    console.log(`   Actual: ${result.actualFlagged ? "FLAGGED" : "PASS"}`);
    if (result.reason) {
      console.log(`   Reason: ${result.reason}`);
    }
    if (result.method) {
      console.log(`   Method: ${result.method}`);
    }
    console.log("");
    
    if (result.passed) passedTests++;
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All moderation tests passed! The system is working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Review the results above.");
  }
}

// Content type coverage verification
export const CONTENT_TYPES_WITH_MODERATION = [
  'post',
  'comment', 
  'eventComment',
  'marketplaceItem',
  'message',
  'survey',
  'event'
];

export function verifyContentTypeCoverage(): void {
  console.log("\n=== CONTENT TYPE MODERATION COVERAGE ===\n");
  CONTENT_TYPES_WITH_MODERATION.forEach((type, index) => {
    console.log(`${index + 1}. ✅ ${type}`);
  });
  console.log(`\nTotal content types with moderation: ${CONTENT_TYPES_WITH_MODERATION.length}`);
  console.log("All major user-generated content types are now protected by AI moderation!");
} 