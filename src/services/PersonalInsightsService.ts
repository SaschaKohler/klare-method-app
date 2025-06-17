// src/services/PersonalInsightsService.ts
import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";
import AIService from "./AIService";

// Types
type PersonalInsight = Database["public"]["Tables"]["personal_insights"]["Row"];
type LifeWheelSnapshot = Database["public"]["Tables"]["life_wheel_snapshots"]["Row"];

export interface InsightAnalysis {
  patterns: string[];
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
  confidence: number;
}

export interface InsightFilter {
  type?: PersonalInsight["insight_type"];
  source?: PersonalInsight["source"];
  relatedAreas?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  acknowledged?: boolean;
  minRating?: number;
}

export interface InsightStats {
  total: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  acknowledged: number;
  avgRating: number;
  recentCount: number; // Last 30 days
}

/**
 * Service für Personal Insights Management
 * Erweitert AIService um spezifische Insight-Funktionalität
 */
export class PersonalInsightsService {
  
  // =============================================================================
  // INSIGHT RETRIEVAL & FILTERING
  // =============================================================================
  
  /**
   * Holt Insights mit erweiterten Filteroptionen
   */
  static async getInsights(
    userId: string, 
    filter?: InsightFilter
  ): Promise<PersonalInsight[]> {
    try {
      let query = supabase
        .from("personal_insights")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true);
      
      // Apply filters
      if (filter?.type) {
        query = query.eq("insight_type", filter.type);
      }
      
      if (filter?.source) {
        query = query.eq("source", filter.source);
      }
      
      if (filter?.relatedAreas && filter.relatedAreas.length > 0) {
        query = query.overlaps("related_areas", filter.relatedAreas);
      }
      
      if (filter?.dateRange) {
        query = query
          .gte("created_at", filter.dateRange.from)
          .lte("created_at", filter.dateRange.to);
      }
      
      if (filter?.acknowledged !== undefined) {
        query = query.eq("user_acknowledged", filter.acknowledged);
      }
      
      if (filter?.minRating) {
        query = query.gte("user_rating", filter.minRating);
      }
      
      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching insights:", error);
        throw new Error("Failed to fetch insights");
      }
      
      return data || [];
      
    } catch (error) {
      console.error("PersonalInsightsService.getInsights error:", error);
      throw error;
    }
  }
  
  /**
   * Holt Insight-Statistiken für Dashboard
   */
  static async getInsightStats(userId: string): Promise<InsightStats> {
    try {
      const { data: allInsights, error } = await supabase
        .from("personal_insights")
        .select("insight_type, source, user_acknowledged, user_rating, created_at")
        .eq("user_id", userId)
        .eq("is_active", true);
      
      if (error) {
        throw new Error("Failed to fetch insight stats");
      }
      
      const insights = allInsights || [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Calculate statistics
      const byType: Record<string, number> = {};
      const bySource: Record<string, number> = {};
      let acknowledgedCount = 0;
      let totalRating = 0;
      let ratedCount = 0;
      let recentCount = 0;
      
      insights.forEach(insight => {
        // Count by type
        byType[insight.insight_type] = (byType[insight.insight_type] || 0) + 1;
        
        // Count by source
        bySource[insight.source] = (bySource[insight.source] || 0) + 1;
        
        // Count acknowledged
        if (insight.user_acknowledged) {
          acknowledgedCount++;
        }
        
        // Average rating
        if (insight.user_rating) {
          totalRating += insight.user_rating;
          ratedCount++;
        }
        
        // Recent count
        if (new Date(insight.created_at!) > thirtyDaysAgo) {
          recentCount++;
        }
      });
      
      return {
        total: insights.length,
        byType,
        bySource,
        acknowledged: acknowledgedCount,
        avgRating: ratedCount > 0 ? totalRating / ratedCount : 0,
        recentCount
      };
      
    } catch (error) {
      console.error("PersonalInsightsService.getInsightStats error:", error);
      throw error;
    }
  }
  
  // =============================================================================
  // INSIGHT ACTIONS
  // =============================================================================
  
  /**
   * Markiert Insight als gelesen/bestätigt
   */
  static async acknowledgeInsight(
    insightId: string, 
    acknowledged: boolean = true
  ): Promise<PersonalInsight> {
    try {
      const { data, error } = await supabase
        .from("personal_insights")
        .update({ 
          user_acknowledged: acknowledged,
          updated_at: new Date().toISOString()
        })
        .eq("id", insightId)
        .select()
        .single();
      
      if (error) {
        throw new Error("Failed to acknowledge insight");
      }
      
      return data;
      
    } catch (error) {
      console.error("PersonalInsightsService.acknowledgeInsight error:", error);
      throw error;
    }
  }
  
  /**
   * Bewertet ein Insight
   */
  static async rateInsight(
    insightId: string, 
    rating: number,
    notes?: string
  ): Promise<PersonalInsight> {
    try {
      if (rating < 1 || rating > 10) {
        throw new Error("Rating must be between 1 and 10");
      }
      
      const updateData: any = {
        user_rating: rating,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.user_notes = notes;
      }
      
      const { data, error } = await supabase
        .from("personal_insights")
        .update(updateData)
        .eq("id", insightId)
        .select()
        .single();
      
      if (error) {
        throw new Error("Failed to rate insight");
      }
      
      return data;
      
    } catch (error) {
      console.error("PersonalInsightsService.rateInsight error:", error);
      throw error;
    }
  }
  
  /**
   * Archiviert ein Insight (soft delete)
   */
  static async archiveInsight(insightId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("personal_insights")
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", insightId);
      
      if (error) {
        throw new Error("Failed to archive insight");
      }
      
    } catch (error) {
      console.error("PersonalInsightsService.archiveInsight error:", error);
      throw error;
    }
  }
  
  // =============================================================================
  // INSIGHT GENERATION & ANALYSIS
  // =============================================================================
  
  /**
   * Generiert neue Insights basierend auf aktuellen Daten
   */
  static async generateInsightsFromCurrentData(userId: string): Promise<PersonalInsight[]> {
    try {
      console.log(`[PersonalInsightsService] Generating insights for user ${userId}`);
      
      // Get current user context
      const context = await this.analyzeUserData(userId);
      
      // Use AI to generate insights
      const aiInsights = await AIService.generateInsights(userId);
      
      console.log(`[PersonalInsightsService] Generated ${aiInsights.length} new insights`);
      
      return aiInsights;
      
    } catch (error) {
      console.error("PersonalInsightsService.generateInsightsFromCurrentData error:", error);
      throw error;
    }
  }
  
  /**
   * Analysiert User-Daten für Insight-Generierung
   */
  private static async analyzeUserData(userId: string): Promise<InsightAnalysis> {
    try {
      // Get life wheel snapshots for trend analysis
      const { data: snapshots } = await supabase
        .from("life_wheel_snapshots")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      
      // Get existing insights to avoid duplication
      const existingInsights = await this.getInsights(userId, {
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          to: new Date().toISOString()
        }
      });
      
      // Analyze patterns (simplified implementation)
      const patterns: string[] = [];
      const strengths: string[] = [];
      const growthAreas: string[] = [];
      const recommendations: string[] = [];
      
      if (snapshots && snapshots.length > 1) {
        // Compare recent snapshots
        const latest = snapshots[0];
        const previous = snapshots[1];
        
        // This would be much more sophisticated in a real implementation
        patterns.push("Regelmäßige Selbstreflexion erkennbar");
        
        if (latest.insights && latest.insights.length > 0) {
          strengths.push("Hohe Selbstreflexionsfähigkeit");
        }
        
        if (latest.priority_areas && latest.priority_areas.length > 0) {
          growthAreas.push(...latest.priority_areas);
        }
        
        recommendations.push("Fokussiere dich auf 1-2 Hauptbereiche für nachhaltigen Fortschritt");
      }
      
      return {
        patterns,
        strengths,
        growthAreas,
        recommendations,
        confidence: 0.7 // Would be calculated based on data quality
      };
      
    } catch (error) {
      console.error("PersonalInsightsService.analyzeUserData error:", error);
      return {
        patterns: [],
        strengths: [],
        growthAreas: [],
        recommendations: [],
        confidence: 0
      };
    }
  }
  
  /**
   * Analysiert Insight-Trends über Zeit
   */
  static async getInsightTrends(
    userId: string, 
    days: number = 90
  ): Promise<{
    timeline: { date: string; count: number; types: Record<string, number> }[];
    mostCommonType: string;
    averageConfidence: number;
    acknowledgmentRate: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const insights = await this.getInsights(userId, {
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString()
        }
      });
      
      // Group by date
      const timeline: Record<string, { count: number; types: Record<string, number> }> = {};
      const typeCounts: Record<string, number> = {};
      let totalConfidence = 0;
      let confidenceCount = 0;
      let acknowledgedCount = 0;
      
      insights.forEach(insight => {
        const date = new Date(insight.created_at!).toISOString().split('T')[0];
        
        if (!timeline[date]) {
          timeline[date] = { count: 0, types: {} };
        }
        
        timeline[date].count++;
        timeline[date].types[insight.insight_type] = 
          (timeline[date].types[insight.insight_type] || 0) + 1;
        
        typeCounts[insight.insight_type] = (typeCounts[insight.insight_type] || 0) + 1;
        
        if (insight.confidence_score) {
          totalConfidence += insight.confidence_score;
          confidenceCount++;
        }
        
        if (insight.user_acknowledged) {
          acknowledgedCount++;
        }
      });
      
      // Find most common type
      const mostCommonType = Object.entries(typeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'pattern';
      
      // Convert timeline to array
      const timelineArray = Object.entries(timeline)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      return {
        timeline: timelineArray,
        mostCommonType,
        averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
        acknowledgmentRate: insights.length > 0 ? acknowledgedCount / insights.length : 0
      };
      
    } catch (error) {
      console.error("PersonalInsightsService.getInsightTrends error:", error);
      throw error;
    }
  }
  
  // =============================================================================
  // INSIGHT RECOMMENDATIONS
  // =============================================================================
  
  /**
   * Empfiehlt nächste Schritte basierend auf Insights
   */
  static async getActionRecommendations(userId: string): Promise<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    resources: string[];
  }> {
    try {
      // Get recent high-confidence insights
      const recentInsights = await this.getInsights(userId, {
        dateRange: {
          from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Last 14 days
          to: new Date().toISOString()
        }
      });
      
      const highConfidenceInsights = recentInsights.filter(
        insight => (insight.confidence_score || 0) > 0.7
      );
      
      // This would be much more sophisticated with AI analysis
      const immediate: string[] = [];
      const shortTerm: string[] = [];
      const longTerm: string[] = [];
      const resources: string[] = [];
      
      highConfidenceInsights.forEach(insight => {
        switch (insight.insight_type) {
          case 'pattern':
            immediate.push(`Reflektiere über das erkannte Muster: ${insight.title}`);
            break;
          case 'resistance':
            immediate.push(`Adressiere den Widerstand in: ${insight.related_areas?.join(', ')}`);
            shortTerm.push('Entwickle Strategien zur Überwindung von Widerständen');
            break;
          case 'growth':
            shortTerm.push(`Setze konkrete Schritte um für: ${insight.title}`);
            longTerm.push('Vertiefe deine Entwicklung in diesem Bereich');
            break;
          case 'breakthrough':
            immediate.push(`Nutze den Durchbruch: ${insight.title}`);
            resources.push('Dokumentiere deine Erfolgsstrategien');
            break;
        }
      });
      
      // Add general recommendations if no specific insights
      if (immediate.length === 0) {
        immediate.push('Nimm dir 10 Minuten für eine Selbstreflexion');
      }
      
      if (shortTerm.length === 0) {
        shortTerm.push('Plane konkrete Schritte für deine wichtigsten Lebensbereiche');
      }
      
      if (longTerm.length === 0) {
        longTerm.push('Entwickle eine langfristige Vision für dein Wachstum');
      }
      
      return {
        immediate,
        shortTerm,
        longTerm,
        resources
      };
      
    } catch (error) {
      console.error("PersonalInsightsService.getActionRecommendations error:", error);
      return {
        immediate: ['Nimm dir Zeit für Selbstreflexion'],
        shortTerm: ['Plane deine nächsten Schritte'],
        longTerm: ['Entwickle deine langfristige Vision'],
        resources: ['Nutze die verfügbaren KLARE-Methode Module']
      };
    }
  }
}

export default PersonalInsightsService;
