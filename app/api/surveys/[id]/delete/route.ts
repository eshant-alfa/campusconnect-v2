import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { adminClient } from '@/sanity/lib/adminClient';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: surveyId } = await params;
    console.log(`Starting deletion process for survey: ${surveyId} by user: ${userId}`);

    // First, check if the survey exists and belongs to the user
    console.log('Fetching survey details...');
    const survey = await client.fetch(
      `*[_type == "survey" && _id == $surveyId][0]{
        _id,
        "creatorId": creator->clerkId,
        status
      }`,
      { surveyId }
    );

    console.log('Survey details:', survey);

    if (!survey) {
      console.log('Survey not found');
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    if (survey.creatorId !== userId) {
      console.log('User not authorized to delete this survey');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow deletion of closed surveys
    if (survey.status !== 'closed') {
      console.log('Survey is not closed, cannot delete');
      return NextResponse.json({ error: 'Only closed surveys can be deleted' }, { status: 400 });
    }

    console.log('Survey validation passed, proceeding with deletion...');

    // Check if we have a write token
    const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;
    if (!token) {
      console.error('No Sanity write token available');
      return NextResponse.json({ 
        error: 'Server configuration error: Write token not available',
        details: 'Contact administrator to configure Sanity write permissions'
      }, { status: 500 });
    }

    // Delete all survey responses first
    console.log('Fetching survey responses to delete...');
    const responsesToDelete = await client.fetch(
      `*[_type == "surveyResponse" && survey._ref == $surveyId]._id`,
      { surveyId }
    );
    
    console.log(`Found ${responsesToDelete.length} responses to delete for survey ${surveyId}`);
    
    if (responsesToDelete.length > 0) {
      console.log('Deleting survey responses...');
      try {
        await adminClient.delete(responsesToDelete);
        console.log(`Successfully deleted ${responsesToDelete.length} survey responses`);
      } catch (responseError) {
        console.error('Error deleting survey responses:', responseError);
        // If we can't delete responses, we should still try to delete the survey
        // but log the error for debugging
      }
    }

    // Delete the survey
    console.log('Deleting survey document...');
    try {
      await adminClient.delete(surveyId);
      console.log(`Survey ${surveyId} deleted successfully`);
    } catch (surveyError) {
      console.error('Error deleting survey document:', surveyError);
      
      // If it's a permissions error, provide a helpful message
      if (surveyError instanceof Error && surveyError.message.includes('permission')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions to delete survey',
          details: 'The server does not have write permissions to Sanity. Please contact the administrator.'
        }, { status: 403 });
      }
      
      throw surveyError;
    }
    
    return NextResponse.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error in delete survey API:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to delete survey',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 