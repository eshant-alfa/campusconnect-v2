"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fixMemberCount } from "@/action/fixMemberCount";

export default function FixMemberCount() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFixMemberCount = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fixMemberCount();
      setResult(response);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Fix Member Count</h3>
      
      <Button 
        onClick={handleFixMemberCount} 
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? "Fixing..." : "Fix Member Count"}
      </Button>

      {result && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 