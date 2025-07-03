"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { testSanityConnection } from "@/action/testSanityConnection";

export default function SanityTest() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const testResult = await testSanityConnection();
      setResult(testResult);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Sanity Connection Test</h3>
      <Button onClick={handleTest} disabled={loading}>
        {loading ? "Testing..." : "Test Connection"}
      </Button>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-medium">Result:</h4>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {typeof result === 'string' || typeof result === 'number' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 