import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { 
  getUserPages,
  getInstagramBusinessAccountIds,
  getAllComments
} from '@/app/lib/comments';

export async function GET(request: NextRequest) {
  const session = getSession(request);
  
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get all Instagram business account IDs linked to the user's Facebook pages
    const instagramIds = await getInstagramBusinessAccountIds(session.accessToken);
    
    if (instagramIds.length === 0) {
      return NextResponse.json({ 
        pages: [], 
        comments: [],
        message: "No Instagram business accounts found" 
      }, { status: 200 });
    }
    
    // For each Instagram business account, get all comments
    const commentsPromises = instagramIds.map(instagramId => 
      getAllComments(instagramId, session.accessToken)
    );
    
    const commentsArrays = await Promise.all(commentsPromises);
    
    // Flatten all comments into a single array
    const allComments = commentsArrays.flat();
    
    // Also get pages info for reference
    const pages = await getUserPages(session.accessToken);
    
    return NextResponse.json({
      pages: pages,
      comments: allComments,
      totalComments: allComments.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
