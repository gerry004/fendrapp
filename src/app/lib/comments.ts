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
        isHidden: comment.hidden,
      },
      create: {
        userId,
        commentId: comment.id,
        mediaId: comment.mediaId,
        text: comment.text,
        username: comment.username,
        isHarmful,
        isHidden: comment.hidden || false,
      },
    });
  } catch (error) {
    console.error('Error saving analyzed comment:', error);
    throw error;
  }
}

// Get previously analyzed comments for a user
async function getAnalyzedComments(userId: string): Promise<Record<string, { isHarmful: boolean; isHidden: boolean; }>> {
  try {
    const analyzedComments = await prisma.analyzedComment.findMany({
      where: {
        userId,
      },
      select: {
        commentId: true,
        isHarmful: true,
        isHidden: true,
      },
    });
    
    // Create a map of comment IDs to their status for quick lookup
    return analyzedComments.reduce((acc: Record<string, { isHarmful: boolean; isHidden: boolean; }>, 
        comment: { commentId: string; isHarmful: boolean; isHidden: boolean; }) => {
      acc[comment.commentId] = { 
        isHarmful: comment.isHarmful,
        isHidden: comment.isHidden
      };
      return acc;
    }, {} as Record<string, { isHarmful: boolean; isHidden: boolean; }>);
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

async function hideComment(commentId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${commentId}?hide=true&access_token=${accessToken}`,
      {
        method: 'POST',
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to hide comment');
    }
    
    // Facebook Graph API typically returns { success: true } OR the updated object itself
    if (data.success === true || data.id === commentId) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error hiding comment:', error);
    throw error;
  }
}

async function unhideComment(commentId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${commentId}?hide=false&access_token=${accessToken}`,
      {
        method: 'POST',
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to unhide comment');
    }
    
    // Facebook Graph API typically returns { success: true } OR the updated object itself
    if (data.success === true || data.id === commentId) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unhiding comment:', error);
    throw error;
  }
}

async function deleteComment(commentId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${commentId}?access_token=${accessToken}`,
      {
        method: 'DELETE',
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to delete comment');
    }
    
    // Facebook Graph API typically returns { success: true } OR a confirmation object
    if (data.success === true || data.id === commentId || data.deleted === true) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Update the hidden status of a comment in the database
async function updateCommentHiddenStatus(userId: string, commentId: string, isHidden: boolean): Promise<void> {
  try {
    await prisma.analyzedComment.update({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
      data: {
        isHidden,
      },
    });
  } catch (error) {
    console.error('Error updating comment hidden status:', error);
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
  hideComment,
  unhideComment,
  deleteComment,
  updateCommentHiddenStatus,
  type Comment 
};
