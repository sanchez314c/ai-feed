import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { truncateText, delay } from '../utils/helpers';
import { ArxivPaper, NewsArticle, YouTubeVideo, BlogPost } from '../types';

type ContentItem = ArxivPaper | NewsArticle | YouTubeVideo | BlogPost;

interface ProcessedContent {
  categories: string[];
  importance_score: number;
  keywords: string[];
  summary: string;
}

export class ClaudeProcessor {
  private client?: Anthropic;
  private model = 'claude-3-5-sonnet-20241022';
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!this.apiKey) {
      logger.warn('ANTHROPIC_API_KEY not found - Claude processing will be disabled');
      return;
    }

    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  async generateSummary(text: string, maxLength = 150): Promise<string> {
    if (!this.apiKey || !text || !this.client) {
      return truncateText(text, maxLength);
    }

    const prompt = `Please provide a concise summary of the following text. The summary should be under ${maxLength} characters, capture the main points, and be written in a clear, engaging style.

Text to summarize:
${text}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: Math.ceil(maxLength / 2), // Estimate tokens from characters
        temperature: 0.2,
        system: 'You are a helpful AI assistant that summarizes text concisely and accurately.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const summary = response.content[0]?.type === 'text' 
        ? response.content[0].text.trim() 
        : '';
      
      return truncateText(summary, maxLength);
    } catch (error) {
      logger.error('Error generating summary with Claude:', error);
      
      if (error instanceof Anthropic.RateLimitError) {
        logger.warn('Claude API rate limit exceeded - using fallback summary');
        await delay(10000); // Wait 10 seconds for rate limit
      }
      
      // Fallback to simple truncation
      return truncateText(text, maxLength);
    }
  }

  async categorizeContent(item: ContentItem): Promise<ContentItem & ProcessedContent> {
    if (!this.apiKey || !this.client) {
      return this.getFallbackProcessing(item);
    }

    const title = item.title || '';
    const contentToAnalyze = this.getContentForAnalysis(item);

    const prompt = `Analyze this AI-related content:
Title: ${title}
Content: ${contentToAnalyze.substring(0, 4000)}

Provide your analysis in a VALID JSON format with the following fields:
1. "categories": A list of 1-3 relevant topic categories from this specific list: [Research, Applications, Business, Ethics, Policy, Tools, Tutorials, Hardware, Theory, Community].
2. "importance_score": An integer from 1 (low) to 10 (high) assessing relevance for someone tracking general AI developments. Consider novelty, impact, and breadth of interest.
3. "keywords": A list of 3-5 relevant keywords or keyphrases (can include named entities like 'GPT-4', 'TensorFlow').
4. "suggested_short_summary": A very concise one-sentence summary (max 100 characters).

JSON response should look like:
{
  "categories": ["Research", "Applications"],
  "importance_score": 8,
  "keywords": ["transformer architecture", "large language models", "AI ethics"],
  "suggested_short_summary": "A new paper explores transformer efficiency."
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        temperature: 0.1,
        system: 'You are an expert AI researcher and analyst. Provide structured analysis in valid JSON format only.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0]?.type === 'text' 
        ? response.content[0].text.trim() 
        : '';
      
      const analysis = this.parseClaudeResponse(content);
      
      return {
        ...item,
        categories: analysis.categories,
        importance_score: analysis.importance_score,
        keywords: analysis.keywords,
        summary: analysis.summary || (await this.generateSummary(contentToAnalyze, 150))
      };
    } catch (error) {
      logger.error('Error categorizing content with Claude:', error);
      
      if (error instanceof Anthropic.RateLimitError) {
        logger.warn('Claude API rate limit exceeded during categorization');
        await delay(15000); // Wait 15 seconds for rate limit
      }
      
      // Return fallback processing
      return this.getFallbackProcessing(item);
    }
  }

  async batchProcess(items: ContentItem[]): Promise<(ContentItem & ProcessedContent)[]> {
    const processed: (ContentItem & ProcessedContent)[] = [];
    const batchSize = 5; // Process in small batches to avoid rate limits
    
    logger.info(`🤖 Processing ${items.length} items with Claude AI...`);

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(async (item, index) => {
        try {
          // Add small delay to avoid overwhelming the API
          await delay(index * 1000);
          return await this.categorizeContent(item);
        } catch (error) {
          logger.error(`Error processing item ${i + index}:`, error);
          return this.getFallbackProcessing(item);
        }
      });

      try {
        const batchResults = await Promise.all(batchPromises);
        processed.push(...batchResults);
        
        if (i + batchSize < items.length) {
          // Pause between batches
          await delay(2000);
        }
      } catch (error) {
        logger.error('Error in batch processing:', error);
        // Add fallback processing for failed batch
        const fallbackResults = batch.map(item => this.getFallbackProcessing(item));
        processed.push(...fallbackResults);
      }
    }

    logger.info(`✅ Completed processing ${processed.length} items`);
    return processed;
  }

  private getContentForAnalysis(item: ContentItem): string {
    const commonFields = item as { title?: string; description?: string; [key: string]: any };
    
    switch (item.type) {
      case 'paper':
        const paper = item as ArxivPaper;
        return paper.abstract || paper.title;
      case 'news':
        const news = item as NewsArticle;
        return (news as any).full_text_content || news.description || news.title;
      case 'video':
        const video = item as YouTubeVideo;
        return video.description || video.title;
      case 'blog':
        const blog = item as BlogPost;
        return (blog as any).full_text_content || blog.description || blog.title;
      default:
        return commonFields.title || '';
    }
  }

  private parseClaudeResponse(response: string): ProcessedContent {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        categories: this.validateCategories(parsed.categories || []),
        importance_score: this.validateImportanceScore(parsed.importance_score || 5),
        keywords: this.validateKeywords(parsed.keywords || []),
        summary: parsed.suggested_short_summary || ''
      };
    } catch (error) {
      logger.error('Error parsing Claude response:', error);
      return this.getDefaultProcessing();
    }
  }

  private validateCategories(categories: any[]): string[] {
    const validCategories = [
      'Research', 'Applications', 'Business', 'Ethics', 
      'Policy', 'Tools', 'Tutorials', 'Hardware', 'Theory', 'Community'
    ];
    
    if (!Array.isArray(categories)) {
      return ['Applications'];
    }
    
    const filtered = categories
      .filter(cat => typeof cat === 'string' && validCategories.includes(cat))
      .slice(0, 3);
    
    return filtered.length > 0 ? filtered : ['Applications'];
  }

  private validateImportanceScore(score: any): number {
    const numScore = parseInt(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      return 5; // Default medium importance
    }
    return numScore;
  }

  private validateKeywords(keywords: any[]): string[] {
    if (!Array.isArray(keywords)) {
      return ['artificial intelligence', 'technology'];
    }
    
    return keywords
      .filter(kw => typeof kw === 'string' && kw.trim().length > 0)
      .map(kw => kw.trim().toLowerCase())
      .slice(0, 5);
  }

  private getFallbackProcessing(item: ContentItem): ContentItem & ProcessedContent {
    return {
      ...item,
      ...this.getDefaultProcessing(),
      summary: this.extractFallbackSummary(item)
    };
  }

  private getDefaultProcessing(): ProcessedContent {
    return {
      categories: ['Applications'],
      importance_score: 5,
      keywords: ['artificial intelligence', 'technology'],
      summary: ''
    };
  }

  private extractFallbackSummary(item: ContentItem): string {
    const content = this.getContentForAnalysis(item);
    return truncateText(content, 150);
  }
}