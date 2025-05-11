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

interface InstagramBusinessAccountResponse {
  instagram_business_account?: {
    id: string;
  };
  id: string;
}

async function getInstagramBusinessAccountId(
  pageId: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
    );
    
    const data = await response.json() as InstagramBusinessAccountResponse;
    
    if (!data.instagram_business_account || !data.instagram_business_account.id) {
      return null;
    }
    
    return data.instagram_business_account.id;
  } catch (error) {
    console.error('Error fetching Instagram business account:', error);
    return null;
  }
}

// getInstagramBusinessAccountIds FUNCTION - should return all the instagram business account ids for a user in one array
// me/accounts?fields=id,name,instagram_business_account

// {
//   "data": [
//     {
//       "id": "689359750920006",
//       "name": "Test Fendrapp 2"
//     },
//     {
//       "id": "630361413494206",
//       "name": "Test fendrapp",
//       "instagram_business_account": {
//         "id": "17841473880673594"
//       }
//     }
//   ],
//   "paging": {
//     "cursors": {
//       "before": "QVFIUmhtN0VtZAjlYMVVNNmlvdTJTNnl4OWNBLXJRTXJSNjlhcEN5RENiMEVQaXZAsSVBzR2NEMUF5bS1NY3F2UnAzQ3JvZA3kzaEFpaDIwRDFCcmR5aUJkdnJ3",
//       "after": "QVFIUlpJdXo0eFNMaG5tZA0puLXBfNjNiRmJacHNxOGw3Q2wzY1N5ZATF0bzF0d1NZAV1R1NW45UVA2bENXcVVXMXRUX2hqbUlaQ096aW9nTWpJUFkxQ1JhcmNn"
//     }
//   }
// }

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

// getAllComments - should return all the comments in a single array

// /{instagram_business_account_id}/media?fields=id,timestamp,comments{text,username,hidden}
// {
//   "data": [
//     {
//       "id": "18055492187275100",
//       "timestamp": "2025-04-07T20:14:17+0000",
//       "comments": {
//         "data": [
//           {
//             "text": "Ugly food looks awful",
//             "username": "fendrapptest",
//             "hidden": false,
//             "id": "18002962316765127"
//           },
//           {
//             "text": "This is the stupidest thing I've ever seen",
//             "username": "fendrapptest",
//             "hidden": false,
//             "id": "18040771298199778"
//           },
//           {
//             "text": "Maybe I need to comment using someone else's account",
//             "username": "gerry.004",
//             "hidden": false,
//             "id": "17930483130040400"
//           }
//         ]
//       }
//     }
//   ]
// }

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

/**
 * Fetches all comments from an Instagram business account
 * @param instagramBusinessAccountId Instagram business account ID
 * @param accessToken Facebook access token
 * @returns Array of comments from all media posts
 */
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
export { getUserPages, getInstagramBusinessAccountId, getInstagramBusinessAccountIds, getAllComments };
export type { FacebookPage, Comment };