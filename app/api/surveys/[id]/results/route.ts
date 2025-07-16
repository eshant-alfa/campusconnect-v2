import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

// GET /api/surveys/[id]/results - Get aggregated survey results
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Fetch survey with questions
    const survey = await client.fetch(
      `*[_type == "survey" && _id == $id][0]{
        _id,
        title,
        questions[]{ _key, text, type, options }
      }`,
      { id }
    );
    if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    // Fetch all responses
    const responses = await client.fetch(
      `*[_type == "surveyResponse" && survey._ref == $id]{ responses }`,
      { id }
    );
    console.log('Fetched survey responses:', JSON.stringify(responses, null, 2));
    // Aggregate results per question
    const questions = survey.questions.map((q: any) => {
      if (q.type === 'single' || q.type === 'multiple') {
        // Count votes per option
        const results: Record<string, number> = {};
        for (const opt of q.options || []) results[opt] = 0;
        let total = 0;
        for (const resp of responses) {
          const entry = Array.isArray(resp.responses)
            ? resp.responses.find((e: any) => e.key === q._key)
            : null;
          const answer = entry ? entry.value : undefined;
          console.log(`Response for question ${q._key}:`, { answer, type: q.type });
          if (answer) {
            total++;
            if (q.type === 'single') {
              if (results[answer] !== undefined) results[answer]++;
            } else if (q.type === 'multiple') {
              let arr: string[] = [];
              try {
                // For multiple choice, the value should be a JSON string of an array
                arr = JSON.parse(answer);
                console.log(`Parsed multiple choice array:`, arr);
                if (Array.isArray(arr)) {
                  for (const val of arr) {
                    if (results[val] !== undefined) results[val]++;
                  }
                }
              } catch (parseError) {
                console.error(`Failed to parse multiple choice answer: ${answer}`, parseError);
                // If parsing fails, try to treat it as a single value
                if (results[answer] !== undefined) results[answer]++;
              }
            }
          }
        }
        console.log(`Question ${q._key}: total=${total}, results=`, results);
        return {
          _key: q._key,
          text: q.text,
          type: q.type,
          options: q.options,
          results,
          total
        };
      }
      return null;
    }).filter(Boolean);
    
    return NextResponse.json({
      title: survey.title,
      questions
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
} 