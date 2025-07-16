import { adminClient } from '../sanity/lib/adminClient';
import { client } from '../sanity/lib/client';
import { nanoid } from 'nanoid';

async function fixSurveyKeys() {
  const surveys = await client.fetch(`*[_type == "survey"]{ _id, questions }`);
  let updatedCount = 0;

  for (const survey of surveys) {
    let changed = false;
    const questions = (survey.questions || []).map((q: any) => {
      if (!q._key) {
        changed = true;
        return { ...q, _key: nanoid() };
      }
      return q;
    });
    if (changed) {
      await adminClient.patch(survey._id).set({ questions }).commit();
      updatedCount++;
      console.log(`Updated survey ${survey._id}`);
    }
  }
  console.log(`Done. Updated ${updatedCount} surveys.`);
}

fixSurveyKeys().catch((err) => {
  console.error('Error fixing survey keys:', err);
  process.exit(1);
}); 