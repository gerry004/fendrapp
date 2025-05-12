import { useEffect, useState } from 'react';
import { Comment } from '../lib/comments';

interface CommentAnalyzerProps {
  comments: Comment[];
  userId: string;
  onAnalysisComplete: (commentId: string, isHarmful: boolean) => void;
}

export default function CommentAnalyzer({ 
  comments, 
  userId,
  onAnalysisComplete
}: CommentAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzedComments, setAnalyzedComments] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Skip if already analyzing or no comments to analyze
    if (analyzing || comments.length === 0) return;
    
    const fetchExistingAnalyses = async () => {
      try {
        const response = await fetch(`/api/data/analyzed-comments?userId=${userId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch analyzed comments');
          return;
        }
        
        const data = await response.json();
        const existingAnalyses = new Set(Object.keys(data.analyzedComments || {}));
        setAnalyzedComments(existingAnalyses);
        
        // Start analyzing unanalyzed comments
        const unanalyzedComments = comments.filter(
          comment => !existingAnalyses.has(comment.id)
        );
        
        if (unanalyzedComments.length > 0) {
          analyzeComments(unanalyzedComments);
        }
      } catch (error) {
        console.error('Error fetching analyzed comments:', error);
      }
    };
    
    fetchExistingAnalyses();
  }, [comments, userId, analyzing]);
  
  const analyzeComments = async (commentsToAnalyze: Comment[]) => {
    setAnalyzing(true);
    setProgress(0);
    
    for (let i = 0; i < commentsToAnalyze.length; i++) {
      const comment = commentsToAnalyze[i];
      
      try {
        // Skip already analyzed comments
        if (analyzedComments.has(comment.id)) continue;
        
        // Analyze the comment
        const analyzeResponse = await fetch('/api/data/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: comment.text }),
        });
        
        if (!analyzeResponse.ok) {
          console.error(`Failed to analyze comment ${comment.id}`);
          continue;
        }
        
        const analyzeData = await analyzeResponse.json();
        
        // Save the analysis result to the database
        const saveResponse = await fetch('/api/data/save-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            commentId: comment.id,
            mediaId: comment.mediaId,
            text: comment.text,
            username: comment.username,
            isHarmful: analyzeData.isHarmful,
          }),
        });
        
        if (!saveResponse.ok) {
          console.error(`Failed to save analysis for comment ${comment.id}`);
        } else {
          // Update the local set of analyzed comments
          setAnalyzedComments(prev => new Set([...prev, comment.id]));
          
          // Notify parent component about the analysis
          onAnalysisComplete(comment.id, analyzeData.isHarmful);
        }
      } catch (error) {
        console.error(`Error analyzing comment ${comment.id}:`, error);
      }
      
      // Update progress
      setProgress(Math.round(((i + 1) / commentsToAnalyze.length) * 100));
    }
    
    setAnalyzing(false);
  };
  
  // This component doesn't render anything visible
  // It just runs the analysis in the background
  return null;
} 