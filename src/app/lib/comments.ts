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

interface PagesResponse {
  data: FacebookPage[];
  paging: {
    cursors: {
      before: string;
      after: string;
    }
  };
}

async function getUserPages(accessToken: string): Promise<FacebookPage[] | null> {
  try {
    const pagesRes = await fetch(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesRes.json() as PagesResponse;
    
    if (!pagesData.data || !Array.isArray(pagesData.data)) {
      return null;
    }
    
    return pagesData.data;
  } catch (error) {
    console.error('Error fetching user pages:', error);
    return null;
  }
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

/**
 * Fetches all Instagram business account IDs for a user in one request
 * @param accessToken Facebook access token
 * @returns Array of Instagram business account IDs
 */
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

interface Comment {
  text: string;
  username: string;
  hidden: boolean;
  id: string;
  mediaId?: string;  // Add the parent media ID for reference
  timestamp?: string; // Add the media timestamp for reference
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

// Export all functions and types
export { getUserPages, getInstagramBusinessAccountIds, getAllComments };
