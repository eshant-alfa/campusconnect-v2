const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fttvx1fa',
  dataset: 'production',
  token: 'sk3jSRyJO2axfO1QYuZGBWsOcs7LUSzcI3Tndjnm4cLExxidnJiZEtDXhdksXYuZBN84PFiATi0BQUYufdsRXclkMhp2Ul8sQjiZNdAQ2dVsedUV4iP0D3QY9TsL8Rnbl2znJ5zpyNxfoS0rFFgXzruBAt7kgWCUO9EO3lkiNCcqK0N3c7Y1',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function fixSurveyKeys() {
  try {
    console.log('Finding surveys with missing keys...');
    
    // Find all surveys
    const surveys = await client.fetch(`*[_type == "survey"]{_id, title, questions}`);
    
    console.log(`Found ${surveys.length} surveys`);
    
    let fixedCount = 0;
    for (const survey of surveys) {
      let needsUpdate = false;
      const updatedQuestions = [];
      
      for (let i = 0; i < (survey.questions || []).length; i++) {
        const question = survey.questions[i];
        
        // Check if question has a _key
        if (!question._key) {
          console.log(`Survey "${survey.title}" - Question ${i + 1} missing _key`);
          needsUpdate = true;
          
          // Add a unique _key
          question._key = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        updatedQuestions.push(question);
      }
      
      if (needsUpdate) {
        console.log(`Updating survey "${survey.title}" with ${updatedQuestions.length} questions`);
        
        await client.patch(survey._id)
          .set({ questions: updatedQuestions })
          .commit();
          
        console.log(`Fixed survey: ${survey.title}`);
        fixedCount++;
      }
    }
    
    if (fixedCount === 0) {
      console.log('No surveys needed fixing - all questions already have _key fields.');
    } else {
      console.log(`Fixed ${fixedCount} surveys with missing _key fields.`);
    }
    
  } catch (error) {
    console.error('Error fixing survey keys:', error);
  }
}

fixSurveyKeys(); 