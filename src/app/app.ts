import { ChangeDetectionStrategy, Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PromptService, AIAgent, Persona, Suggestion } from './prompt.service';
import { TranslationService, Language } from './translation.service';
import { FormsModule } from '@angular/forms';
import { GoogleGenAI } from "@google/genai";

export interface SavedPrompt {
  id: string;
  agentId: string;
  personaId: string | null;
  context: string;
  task: string;
  constraints: string;
  generatedPrompt: string;
  timestamp: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  promptService = inject(PromptService);
  translationService = inject(TranslationService);
  private platformId = inject(PLATFORM_ID);
  
  step = signal(1);
  userContext = signal('');
  userTask = signal('');
  userConstraints = signal('');
  generatedPrompt = signal('');
  isGenerating = signal(false);
  showToast = signal(false);
  focusedField = signal<string | null>(null);
  
  selectedPersona = signal<Persona | null>(null);
  activeDropdown = signal<string | null>(null);
  currentSuggestions = signal<Suggestion[] | null>(null);
  aiPredictions = signal<Suggestion[]>([]);
  isPredicting = signal(false);
 
  showSettings = signal(false);
  isTesting = signal(false);
  currentTab = signal<'generator' | 'cheatsheet' | 'saved'>('generator');

  isLoading = computed(() => this.isGenerating() || this.isTesting() || this.isPredicting());

  savedPrompts = signal<SavedPrompt[]>([]);

  cheatsheetData = [
    { id: 'copilot', icon: 'code', tips: ['Use descriptive comments', 'Open relevant files', 'Provide context in the same file'] },
    { id: 'claude', icon: 'psychology', tips: ['Use XML tags for structure', 'Be explicit about roles', 'Provide long context'] },
    { id: 'chatgpt', icon: 'chat', tips: ['Use Chain of Thought', 'Assign a persona', 'Iterate on results'] },
    { id: 'perplexity', icon: 'search', tips: ['Ask for sources', 'Specify time range', 'Use for research'] },
    { id: 'gemini', icon: 'auto_awesome', tips: ['Use multimodal inputs', 'Large context window', 'Google Search grounding'] }
  ];

  constructor() {
    this.loadFromLocalStorage();
  }

  getAgentIcon(agentId: string): string {
    return this.promptService.agents().find(a => a.id === agentId)?.icon || 'help';
  }

  private loadFromLocalStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('ai_prompt_master_saved');
    if (saved) {
      try {
        this.savedPrompts.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved prompts', e);
      }
    }
  }

  private saveToLocalStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('ai_prompt_master_saved', JSON.stringify(this.savedPrompts()));
  }

  saveCurrentPrompt() {
    const agent = this.promptService.selectedAgent();
    if (!agent || !this.generatedPrompt()) return;

    const newPrompt: SavedPrompt = {
      id: isPlatformBrowser(this.platformId) ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      agentId: agent.id,
      personaId: this.selectedPersona()?.id || null,
      context: this.userContext(),
      task: this.userTask(),
      constraints: this.userConstraints(),
      generatedPrompt: this.generatedPrompt(),
      timestamp: Date.now()
    };

    this.savedPrompts.set([newPrompt, ...this.savedPrompts()]);
    this.saveToLocalStorage();
    
    // Show success toast
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }

  deleteSavedPrompt(id: string) {
    this.savedPrompts.set(this.savedPrompts().filter(p => p.id !== id));
    this.saveToLocalStorage();
  }

  loadSavedPrompt(saved: SavedPrompt) {
    const agent = this.promptService.agents().find(a => a.id === saved.agentId);
    if (!agent) return;

    this.promptService.selectedAgent.set(agent);
    this.userContext.set(saved.context);
    this.userTask.set(saved.task);
    this.userConstraints.set(saved.constraints);
    this.generatedPrompt.set(saved.generatedPrompt);
    
    const persona = this.promptService.personas().find(p => p.id === saved.personaId);
    this.selectedPersona.set(persona || null);

    this.currentTab.set('generator');
    this.step.set(3);
  }

  setTab(tab: 'generator' | 'cheatsheet' | 'saved') {
    this.currentTab.set(tab);
    if (tab !== 'generator') {
      this.showSettings.set(false);
    }
  }

  // Agent API Status
  agentStatus = signal<Record<string, { status: 'active' | 'inactive' | 'error', endpoint: string }>>({
    'copilot': { status: 'active', endpoint: 'https://api.github.com' },
    'claude': { status: 'inactive', endpoint: 'https://api.anthropic.com' },
    'gemini': { status: 'active', endpoint: 'https://generativelanguage.googleapis.com' },
    'chatgpt': { status: 'active', endpoint: 'https://api.openai.com' },
    'cursor': { status: 'error', endpoint: 'https://api.cursor.com' }
  });

  toggleSettings() {
    this.showSettings.set(!this.showSettings());
  }

  async testAgentApi(agentId: string) {
    this.isTesting.set(true);
    try {
      const status = this.agentStatus()[agentId];
      if (!status) return;
      
      // Simulate a real API check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const current = this.agentStatus();
      // Randomly simulate success or error for the demo
      const newStatus: 'active' | 'error' = Math.random() > 0.2 ? 'active' : 'error';
      
      this.agentStatus.set({
        ...current,
        [agentId]: { ...current[agentId], status: newStatus }
      });
    } finally {
      this.isTesting.set(false);
    }
  }

  generateMasterPrompt() {
    const systemPrompt = `
# AI Prompt Master - System Instruction
You are a world-class Prompt Engineer. Your goal is to help users build "working" prompts for specific AI agents like GitHub Copilot, Claude, and Gemini.

## Core Logic:
1. **Persona Selection**: Prepend a professional role (e.g., Senior Dev, Architect) to the context.
2. **Chained Suggestions**: Use a hierarchical preset system to build context, tasks, and constraints step-by-step.
3. **Agent Optimization**: Each agent has a specific 'Prompt Pattern'. You must fill this pattern with the user's inputs.
4. **Croatian Reasoning**: If the "Croatian Lead" persona is active, reason in Croatian but output code/docs in English.

## Output Structure:
- Summary of changes
- Code block
- Step-by-step explanation

## User Inputs:
- Context: [User's project background]
- Task: [Specific action to perform]
- Constraints: [Coding standards, libraries, performance]

Your mission is to transform these inputs into a master prompt that "just works" for the target agent.
    `;
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(systemPrompt.trim());
    }
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }

  selectAgent(agent: AIAgent) {
    this.promptService.selectedAgent.set(agent);
    this.step.set(2);
  }

  selectPersona(persona: Persona) {
    const currentPersona = this.selectedPersona();
    let context = this.userContext();

    // If clicking the same persona, toggle it off
    if (currentPersona?.id === persona.id) {
      if (context.startsWith(persona.contextPrefix)) {
        context = context.substring(persona.contextPrefix.length).trim();
      } else {
        context = context.replace(persona.contextPrefix, '').trim();
      }
      this.userContext.set(context);
      this.selectedPersona.set(null);
      return;
    }

    // If switching from another persona, remove the old one first
    if (currentPersona) {
      if (context.startsWith(currentPersona.contextPrefix)) {
        context = context.substring(currentPersona.contextPrefix.length).trim();
      } else {
        context = context.replace(currentPersona.contextPrefix, '').trim();
      }
    }

    // Ensure the new prefix is at the start
    if (!context.startsWith(persona.contextPrefix)) {
      context = context.replace(persona.contextPrefix, '').trim();
      context = (persona.contextPrefix + ' ' + context).trim();
    }

    this.userContext.set(context);
    this.selectedPersona.set(persona);
  }

  clearField(field: 'context' | 'task' | 'constraints') {
    if (field === 'context') {
      this.userContext.set('');
      this.selectedPersona.set(null);
    } else if (field === 'task') {
      this.userTask.set('');
    } else if (field === 'constraints') {
      this.userConstraints.set('');
    }
  }

  toggleDropdown(field: string) {
    if (this.activeDropdown() === field) {
      this.activeDropdown.set(null);
      this.currentSuggestions.set(null);
      this.aiPredictions.set([]);
    } else {
      this.activeDropdown.set(field);
      this.aiPredictions.set([]);
      const agent = this.promptService.selectedAgent();
      if (agent) {
        const presets = agent.guidance.presets;
        let suggestions: Suggestion[] = [];
        if (field === 'context') suggestions = [...presets.context];
        if (field === 'task') suggestions = [...presets.task];
        if (field === 'constraints') suggestions = [...presets.constraints];

        // Dynamic Filtering/Reordering based on Persona
        const persona = this.selectedPersona();
        if (persona && suggestions.length > 0) {
          const prefix = persona.contextPrefix.toLowerCase();
          
          // Prioritize suggestions that match keywords in the persona's prefix
          suggestions.sort((a, b) => {
            const aMatch = this.checkMatch(a.text, prefix);
            const bMatch = this.checkMatch(b.text, prefix);
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
          });
        }

        this.currentSuggestions.set(suggestions);
        this.fetchAiPredictions(field);
      }
    }
  }

  async fetchAiPredictions(field: string) {
    const agent = this.promptService.selectedAgent();
    if (!agent || !isPlatformBrowser(this.platformId)) return;

    this.isPredicting.set(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || 'empty' });
      const persona = this.selectedPersona();
      const context = this.userContext();
      const task = this.userTask();
      
      const prompt = `
        Based on the current context, predict 3 highly relevant ${field} presets for a prompt engineering tool.
        Target Agent: ${agent.name}
        Active Persona: ${persona?.name || 'None'}
        Current Context: ${context || 'Empty'}
        Current Task: ${task || 'Empty'}

        Return ONLY a JSON array of objects with "label", "text", and "description" properties. 
        The "label" should be a short, catchy title (max 20 chars).
        The "text" should be the actual snippet to append to the ${field} field.
        The "description" should be a brief explanation of the purpose and context of this preset (max 60 chars).
        Example: [{"label": "React Hooks", "text": " using React Hooks and functional components", "description": "Prioritizes modern React patterns for cleaner code."}]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt
      });

      // Remove markdown blocks if presents
      let jsonStr = (response.text || '[]').trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      
      const predictions = JSON.parse(jsonStr.trim());
      this.aiPredictions.set(predictions);
    } catch (error) {
      console.warn('AI Prediction failed, likely due to API constraints in dev environment:', error);
    } finally {
      this.isPredicting.set(false);
    }
  }

  private checkMatch(text: string, prefix: string): boolean {
    const keywords = ['.net', 'angular', 'react', 'node', 'python', 'sql', 'java', 'typescript', 'javascript'];
    const lowerText = text.toLowerCase();
    
    return keywords.some(kw => prefix.includes(kw) && lowerText.includes(kw));
  }

  applySuggestion(field: string, suggestion: Suggestion) {
    if (field === 'context') {
      this.userContext.set(this.userContext() + suggestion.text);
    } else if (field === 'task') {
      this.userTask.set(this.userTask() + suggestion.text);
    } else if (field === 'constraints') {
      this.userConstraints.set(this.userConstraints() + suggestion.text);
    }
    
    if (suggestion.next) {
      this.currentSuggestions.set(suggestion.next);
    } else {
      this.activeDropdown.set(null);
      this.currentSuggestions.set(null);
    }
  }

  cancelDropdown() {
    this.activeDropdown.set(null);
    this.currentSuggestions.set(null);
  }

  reset() {
    this.promptService.selectedAgent.set(null);
    this.selectedPersona.set(null);
    this.step.set(1);
    this.showSettings.set(false);
    this.generatedPrompt.set('');
    this.userContext.set('');
    this.userTask.set('');
    this.userConstraints.set('');
  }

  async generateFinalPrompt() {
    const agent = this.promptService.selectedAgent();
    if (!agent) return;

    this.isGenerating.set(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert Prompt Engineer. 
        The user wants to create a prompt for ${agent.name}.
        Agent Description: ${agent.description}
        Agent Preferred Pattern: ${agent.promptPattern}
        
        User Context: ${this.userContext()}
        User Task: ${this.userTask()}
        User Constraints: ${this.userConstraints()}
        
        Generate a highly effective, "working" prompt that follows the agent's best practices. 
        Only return the final prompt text, no explanations.`,
      });

      const response = await model;
      this.generatedPrompt.set(response.text || '');
      this.step.set(3);
    } catch (error) {
      console.warn('Generation failed, using fallback manual pattern', error);
      // Fallback manual generation
      const manual = agent.promptPattern
        .replace('[Project Type]', this.userContext() || 'General Project')
        .replace('[Context]', this.userContext() || 'General Context')
        .replace('[Task]', this.userTask() || 'Perform task')
        .replace('[Specific Action]', this.userTask() || 'Perform action')
        .replace('[Constraints]', this.userConstraints() || 'None')
        .replace('[Rules]', this.userConstraints() || 'Follow best practices')
        .replace('[Role]', 'Expert Assistant')
        .replace('[Format]', 'Markdown')
        .replace('[Style]', 'Professional')
        .replace('[Goal]', this.userTask())
        .replace('[Output Type]', 'Text')
        .replace('[System Instruction]', 'You are a helpful assistant')
        .replace('[User Input]', this.userTask());
      
      this.generatedPrompt.set(manual);
      this.step.set(3);
    } finally {
      this.isGenerating.set(false);
    }
  }

  copyToClipboard() {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(this.generatedPrompt());
    }
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }

  setFocus(field: string | null) {
    this.focusedField.set(field);
  }

  setLanguage(lang: Language) {
    this.translationService.setLanguage(lang);
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
