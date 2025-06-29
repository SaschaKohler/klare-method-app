// src/services/KModuleAIService.ts
// KLARE Schritt K - AI Mock Service
// Simuliert Claude API für Meta-Modell der Sprache und Klarheits-Coaching

export interface UserContext {
  name: string;
  mainChallenge: string;
  reflectionExperience: 'Anfänger' | 'Fortgeschritten' | 'Experte';
  currentLifeAreas: string[];
}

export interface AICoachResponse {
  type: 'welcome' | 'analysis' | 'guidance' | 'feedback';
  message: string;
  exercises?: string[];
  nextSteps?: string[];
  encouragement?: string;
}

export interface MetaModelAnalysis {
  type: 'feedback';
  message: string;
  identifiedPatterns: string[];
  suggestedQuestions: string[];
  levelAssessment: number;
  nextSteps: string[];
  encouragement: string;
}

export class KModuleAIService {
  private language: string;

  constructor(language: string = 'de') {
    this.language = language;
  }

  /**
   * Startet eine K-Session mit personalisiertem Coaching
   */
  async startKSession(userContext: UserContext, moduleId: string): Promise<AICoachResponse> {
    await this.simulateApiDelay();

    const responses = {
      'k-intro': this.generateKIntroWelcome(userContext),
      'k-meta-model': this.generateMetaModelWelcome(userContext),
    };

    return responses[moduleId] || this.generateGenericKWelcome(userContext);
  }

  /**
   * Analysiert User-Aussage mit Meta-Modell
   */
  async analyzeMetaModel(
    userStatement: string,
    currentLevel: number,
    challenge: string
  ): Promise<MetaModelAnalysis> {
    await this.simulateApiDelay();

    const analysis = this.performMetaModelAnalysis(userStatement, currentLevel);
    const feedback = this.generateLevelAppropriateFeedback(analysis, currentLevel);

    return {
      type: 'feedback',
      message: feedback.message,
      identifiedPatterns: analysis.patterns,
      suggestedQuestions: analysis.questions,
      levelAssessment: this.assessUserLevel(analysis, currentLevel),
      nextSteps: feedback.nextSteps,
      encouragement: feedback.encouragement,
    };
  }

  /**
   * Generiert personalisierte Coaching-Nachrichten
   */
  async generatePersonalizedCoaching(
    context: string,
    userProgress: any
  ): Promise<AICoachResponse> {
    await this.simulateApiDelay();

    return {
      type: 'guidance',
      message: this.generateContextualGuidance(context, userProgress),
      exercises: this.suggestNextExercises(userProgress),
      encouragement: this.generateEncouragement(userProgress),
    };
  }

  // ========================================
  // Private Methods - Mock AI Responses
  // ========================================

  private generateKIntroWelcome(context: UserContext): AICoachResponse {
    const welcomeMessages = [
      `Hallo ${context.name}! Schön, dass du dich für mehr Klarheit in deinem Leben entschieden hast. `,
      `Willkommen ${context.name}! Der erste Schritt zur Veränderung ist, klar zu sehen, wo man steht. `,
      `Hi ${context.name}! Klarheit ist der Schlüssel zu allem - lass uns gemeinsam deinen Weg erhellen. `,
    ];

    const challengeResponses = {
      'Klarheit in der Kommunikation': 'Kommunikation ist die Brücke zwischen Menschen. Wenn wir präziser sprechen, verstehen wir uns besser.',
      'Lebensentscheidungen': 'Große Entscheidungen werden leichter, wenn wir zuerst Klarheit über unsere Werte und Ziele haben.',
      'Berufliche Orientierung': 'Berufliche Klarheit beginnt mit dem Verstehen deiner wahren Stärken und Interessen.',
    };

    const baseMessage = this.getRandomElement(welcomeMessages);
    const challengeMessage = challengeResponses[context.mainChallenge] || 
      'Jede Herausforderung wird lösbar, wenn wir sie klar definieren und verstehen.';

    return {
      type: 'welcome',
      message: `${baseMessage}${challengeMessage} 

In diesem Modul lernst du, bewusster wahrzunehmen und präziser zu kommunizieren. Wir starten mit einer sanften Standortbestimmung.`,
      encouragement: 'Du machst bereits den wichtigsten Schritt: Du bist hier und bereit zu wachsen! 🌱',
    };
  }

  private generateMetaModelWelcome(context: UserContext): AICoachResponse {
    return {
      type: 'welcome',
      message: `Perfekt ${context.name}! Jetzt tauchen wir ein in das Meta-Modell der Sprache - eines der mächtigsten Werkzeuge für klare Kommunikation UND bewusstes Denken.

Das Meta-Modell hilft dir dabei:
• Unpräzise Aussagen zu erkennen (außen UND innen)
• Die richtigen Fragen zu stellen  
• Missverständnisse zu vermeiden
• Klarheit in Gespräche zu bringen

**Wichtige Erkenntnis:** Die Sprache im Außen ist das Denken im Inneren. Wenn wir lernen, die Sprache anderer zu hinterfragen, werden wir automatisch bewusster für unsere eigenen Denkprozesse und deren Unzulänglichkeiten.

Wir starten mit Level 1: Universalquantoren wie "alle", "nie", "immer" erkennen - sowohl bei anderen als auch bei dir selbst.`,
      exercises: [
        'Achte heute bewusst auf Wörter wie "alle", "nie", "immer" in Gesprächen UND in deinen eigenen Gedanken',
        'Stelle dir die Frage: "Stimmt das wirklich IMMER?" - auch bei deinen eigenen Überzeugungen',
        'Übe sanftes Nachfragen: "Alle? Gibt es da Ausnahmen?" - bei anderen und dir selbst',
      ],
      encouragement: 'Das Meta-Modell ist wie ein Muskel für dein Bewusstsein - je mehr du es übst, desto klarer wird dein Denken! 💪',
    };
  }

  private generateGenericKWelcome(context: UserContext): AICoachResponse {
    return {
      type: 'welcome',
      message: `Willkommen ${context.name} zu diesem wichtigen Schritt auf deinem Weg zu mehr Klarheit! 

Klarheit ist das Fundament für alle positiven Veränderungen. Wenn wir klar sehen, können wir klar handeln.`,
      encouragement: 'Du bist genau richtig hier! 🎯',
    };
  }

  private performMetaModelAnalysis(statement: string, level: number) {
    const analysis = {
      patterns: [] as string[],
      questions: [] as string[],
      violations: [] as string[],
    };

    // Level 1: Universalquantoren
    if (this.containsUniversalQuantifiers(statement)) {
      analysis.patterns.push('Universalquantoren gefunden');
      analysis.questions.push('Alle? Gibt es da wirklich keine Ausnahmen?');
      analysis.violations.push('Universalquantoren wie "alle", "nie", "immer"');
    }

    // Level 2: Ursache-Wirkung
    if (this.containsCausalConnections(statement)) {
      analysis.patterns.push('Ursache-Wirkung-Verknüpfung');
      analysis.questions.push('Wie genau führt das eine zum anderen?');
      analysis.violations.push('Vereinfachte Ursache-Wirkung-Annahme');
    }

    // Level 3: Tilgungen
    if (this.containsDeletions(statement)) {
      analysis.patterns.push('Getilgte Informationen');
      analysis.questions.push('Wer genau? Was genau? Wann genau?');
      analysis.violations.push('Fehlende spezifische Informationen');
    }

    // Level 4: Vorannahmen
    if (this.containsPresuppositions(statement)) {
      analysis.patterns.push('Versteckte Vorannahmen');
      analysis.questions.push('Was nimmst du dabei als gegeben an?');
      analysis.violations.push('Unausgesprochene Annahmen');
    }

    return analysis;
  }

  private generateLevelAppropriateFeedback(analysis: any, level: number) {
    if (analysis.patterns.length === 0) {
      return {
        message: 'Interessant! Diese Aussage ist bereits sehr präzise formuliert. Das zeigt, dass du schon ein gutes Gespür für klare Kommunikation entwickelst.\n\n💭 Selbstreflexion: Achte auch darauf, wie präzise deine inneren Gedanken sind - oft denken wir klarer als wir sprechen.',
        nextSteps: ['keep_practicing'],
        encouragement: 'Weiter so! Präzise Kommunikation wird für dich zur Gewohnheit. 👏',
      };
    }

    const patternCount = analysis.patterns.length;
    let message = `Großartig! Ich erkenne ${patternCount} Meta-Modell-Muster in deiner Aussage:\n\n`;
    
    analysis.patterns.forEach((pattern, index) => {
      message += `${index + 1}. ${pattern}\n`;
    });

    message += `\nHier sind hilfreiche Fragen, die zu mehr Klarheit führen:\n`;
    analysis.questions.forEach((question, index) => {
      message += `• ${question}\n`;
    });

    // Selbstreflexions-Element hinzufügen
    message += `\n🧠 **Bewusstseins-Check**: Falls das deine eigene Aussage war - erkennst du dieses Denkmuster auch in anderen Bereichen deines Lebens? Die Sprache spiegelt oft unsere tieferen Überzeugungen wider.`;

    const nextSteps = patternCount >= 2 ? ['level_up', 'practice_more'] : ['practice_current_level'];
    const encouragement = patternCount >= 3 
      ? 'Wow! Du entwickelst bereits ein sehr scharfes Auge für Sprach- UND Denkmuster! 🎯'
      : 'Du machst tolle Fortschritte! Jede Analyse macht dich nicht nur kommunikativ, sondern auch geistig präziser. 📈';

    return { message, nextSteps, encouragement };
  }

  private assessUserLevel(analysis: any, currentLevel: number): number {
    const patternCount = analysis.patterns.length;
    
    if (patternCount >= 3 && currentLevel < 5) {
      return currentLevel + 1;
    }
    
    return currentLevel;
  }

  // ========================================
  // Pattern Recognition Methods
  // ========================================

  private containsUniversalQuantifiers(statement: string): boolean {
    const quantifiers = ['alle', 'jeder', 'niemand', 'nie', 'niemals', 'immer', 'ständig', 'jedes mal'];
    return quantifiers.some(q => statement.toLowerCase().includes(q));
  }

  private containsCausalConnections(statement: string): boolean {
    const causalWords = ['weil', 'deshalb', 'dadurch', 'führt zu', 'verursacht', 'macht mich', 'macht dass'];
    return causalWords.some(c => statement.toLowerCase().includes(c));
  }

  private containsDeletions(statement: string): boolean {
    // Einfache Heuristik für getilgte Referenzen
    const vagueness = ['man', 'sie', 'es', 'das', 'sowas', 'die leute', 'manche'];
    return vagueness.some(v => statement.toLowerCase().includes(v)) ||
           statement.length < 20; // Sehr kurze Aussagen oft unvollständig
  }

  private containsPresuppositions(statement: string): boolean {
    const presuppositionWords = ['schon wieder', 'endlich', 'sogar', 'nur', 'bereits', 'noch immer'];
    return presuppositionWords.some(p => statement.toLowerCase().includes(p));
  }

  // ========================================
  // Helper Methods
  // ========================================

  private generateContextualGuidance(context: string, progress: any): string {
    const guidanceTemplates = [
      'Basierend auf deinem Fortschritt schlage ich vor...',
      'Deine Entwicklung zeigt, dass du bereit bist für...',
      'Der nächste logische Schritt wäre...',
    ];

    return this.getRandomElement(guidanceTemplates) + ' [Spezifische Anleitung basierend auf Kontext]';
  }

  private suggestNextExercises(progress: any): string[] {
    return [
      'Führe heute 3 Meta-Modell-Analysen durch',
      'Achte bewusst auf deine eigene Sprache',
      'Stelle präzisierende Fragen in einem Gespräch',
    ];
  }

  private generateEncouragement(progress: any): string {
    const encouragements = [
      'Du machst fantastische Fortschritte! 🌟',
      'Deine Klarheit wächst mit jedem Tag! 🚀',
      'Weiter so - du bist auf dem richtigen Weg! 💫',
      'Ich bin beeindruckt von deiner Entwicklung! ⭐',
    ];

    return this.getRandomElement(encouragements);
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private async simulateApiDelay(): Promise<void> {
    // Simuliert API-Aufruf mit realistischer Latenz
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export default KModuleAIService;
