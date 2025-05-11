import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeComment(comment: string): Promise<boolean> {
  try {
    const prompt = `You are a content moderation AI that analyzes Instagram comments for hateful or harmful language.
    
### Instructions:
You are an expert content moderator for a social media platform. Your task is to detect whether a comment is *abusive, harmful, or intentionally negative* and should be removed immediately.

Classify a comment as abusive if it meets *one or more* of the following:

• It directly insults or attacks the user (e.g., calling them fake, annoying, a liar, stupid, etc.)
• It targets someone's appearance, intelligence, or abilities (e.g., body-shaming, mocking speech, belittling performance)
• It uses hate speech or discriminatory language (e.g., racism, misogyny, xenophobia, homophobia)
• It conveys threatening, malicious, or harmful intent (e.g., veiled threats, wishing harm, encouraging self-harm)
• It shames, ridicules, or undermines the person in a sarcastic, passive-aggressive, or condescending way with the *intent to humiliate or provoke*

Do *not* flag comments that are clearly positive or supportive. Focus on anything hostile, critical, or shaming that could negatively affect the person's well-being.

• If this sentence is hateful or harmful, return *"Yes"*
• If this sentence is not hateful or harmful, return *"No"*

Now, analyze this comment:
${comment}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a content moderation assistant that only responds with Yes or No." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const result = response.choices[0]?.message.content?.trim();
    return result === "Yes";
  } catch (error) {
    console.error("Error analyzing comment:", error);
    // In case of error, default to false (not harmful)
    // In production, you might want to handle this differently
    return false;
  }
}