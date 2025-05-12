interface FacebookPage {
  access_token: string;
  category: string;
  category_list: {
    id: string;
    name: string;
  }[];
  name: string;
  id: string;
  tasks: string[];
}

interface InstagramBusinessAccount {
  id: string;
}

interface PageWithInstagram extends FacebookPage {
  instagram_business_account?: InstagramBusinessAccount;
}

interface PagesWithInstagramResponse {
  data: PageWithInstagram[];
  paging: {
    cursors: {
      before: string;
      after: string;
    }
  };
}

interface Comment {
  text: string;
  username: string;
  hidden: boolean;
  id: string;
  mediaId?: string;  // Add the parent media ID for reference
  timestamp?: string; // Add the media timestamp for reference
  isHarmful?: boolean; // Add analysis result
  analyzing?: boolean; // Flag for loading state
}

interface MediaItem {
  id: string;
  timestamp: string;
  comments?: {
    data: Comment[];
  };
}

interface MediaResponse {
  data: MediaItem[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

import { prisma } from '../prismaClient';

async function getInstagramBusinessAccountIds(accessToken: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`
    );
    
    const data = await response.json() as PagesWithInstagramResponse;
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    // Filter out pages without Instagram accounts and extract IDs
    return data.data
      .filter(page => page.instagram_business_account && page.instagram_business_account.id)
      .map(page => page.instagram_business_account!.id);
  } catch (error) {
    console.error('Error fetching Instagram business account IDs:', error);
    return [];
  }
}

async function getAllComments(
  instagramBusinessAccountId: string,
  accessToken: string
): Promise<Comment[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${instagramBusinessAccountId}/media?fields=id,timestamp,comments{text,username,hidden}&access_token=${accessToken}`
    );
    
    const data = await response.json() as MediaResponse;
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    // Flatten the comments from all media posts into a single array
    // and add mediaId and timestamp to each comment for reference
    const allComments: Comment[] = [];
    
    data.data.forEach(mediaItem => {
      if (mediaItem.comments && mediaItem.comments.data) {
        const commentsWithMediaInfo = mediaItem.comments.data.map(comment => ({
          ...comment,
          mediaId: mediaItem.id,
          timestamp: mediaItem.timestamp
        }));
        
        allComments.push(...commentsWithMediaInfo);
      }
    });
    
    return allComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// Save analyzed comment to database
async function saveAnalyzedComment(userId: string, comment: Comment, isHarmful: boolean): Promise<void> {
  try {
    await prisma.analyzedComment.upsert({
      where: {
        userId_commentId: {
          userId,
          commentId: comment.id,
        },
      },
      update: {
        isHarmful,
      },
      create: {
        userId,
        commentId: comment.id,
        mediaId: comment.mediaId,
        text: comment.text,
        username: comment.username,
        isHarmful,
      },
    });
  } catch (error) {
    console.error('Error saving analyzed comment:', error);
    throw error;
  }
}

// Get previously analyzed comments for a user
async function getAnalyzedComments(userId: string): Promise<Record<string, boolean>> {
  try {
    const analyzedComments = await prisma.analyzedComment.findMany({
      where: {
        userId,
      },
      select: {
        commentId: true,
        isHarmful: true,
      },
    });
    
    // Create a map of comment IDs to their harmful status for quick lookup
    return analyzedComments.reduce((acc: Record<string, boolean>, comment: { commentId: string; isHarmful: boolean }) => {
      acc[comment.commentId] = comment.isHarmful;
      return acc;
    }, {} as Record<string, boolean>);
  } catch (error) {
    console.error('Error retrieving analyzed comments:', error);
    return {};
  }
}

// Analyze a comment's text and determine if it's harmful
async function analyzeCommentText(text: string): Promise<boolean> {
  try {
    const response = await fetch('/api/data/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: text }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze comment');
    }
    
    return data.isHarmful;
  } catch (error) {
    console.error('Error analyzing comment text:', error);
    throw error;
  }
}

// Export all functions and types
export { 
  getInstagramBusinessAccountIds, 
  getAllComments, 
  saveAnalyzedComment, 
  getAnalyzedComments,
  analyzeCommentText,
  type Comment 
};
