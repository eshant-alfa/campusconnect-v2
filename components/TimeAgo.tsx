"use client";

import { useEffect, useState } from "react";
import TimeAgoComponent from "react-timeago";

function TimeAgo({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a fallback during SSR and initial render to prevent hydration mismatch
  if (!mounted) {
    // Use a consistent format that won't vary between server and client
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const formattedTime = date.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS format
    
    return (
      <time dateTime={date.toISOString()} title={`${formattedDate} ${formattedTime} UTC`}>
        {formattedDate}
      </time>
    );
  }

  return <TimeAgoComponent date={date} />;
}

export default TimeAgo;
