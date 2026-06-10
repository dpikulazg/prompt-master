import { Injectable, signal } from '@angular/core';

export interface Suggestion {
  label: string;
  text: string;
  description?: string;
  next?: Suggestion[];
}

export interface AIAgent {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptPattern: string;
  guidance: {
    general: string[];
    context: string;
    task: string;
    constraints: string;
    presets: {
      context: Suggestion[];
      task: Suggestion[];
      constraints: Suggestion[];
    };
  };
}

export interface Persona {
  id: string;
  name: string;
  icon: string;
  contextPrefix: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  personas = signal<Persona[]>([
    { 
      id: 'senior-dev', 
      name: 'Senior Developer', 
      icon: 'terminal', 
      contextPrefix: 'Act as a Senior Software Engineer with a strong background in clean code, design patterns, and scalable systems. Provide robust, clean, and well-structured code.',
      description: 'Specializes in clean, maintainable code, robust software architecture, and complex problem-solving.'
    },
    { 
      id: 'architect', 
      name: 'Solutions Architect', 
      icon: 'account_tree', 
      contextPrefix: 'Act as a Solutions Architect specializing in system architecture, scalability, and long-term maintainability. Focus on structural boundaries, integration patterns, and architectural trade-offs.',
      description: 'Focuses on enterprise-level system design, scalability, integration patterns, and architectural alignment.'
    },
    { 
      id: 'croatian-lead', 
      name: 'Croatian Technical Lead', 
      icon: 'flag', 
      contextPrefix: 'Razmišljaj i strukturiraj problem na hrvatskom jeziku (conduct reasoning in Croatian), ali sve programske naredbe i tehničku dokumentaciju piši isključivo na engleskom jeziku (deliver code and documentation in English). Izbjegavaj suvišna objašnjenja i zadrži visoku razinu profesionalnosti.',
      description: 'Specijaliziran za izravnu tehničku komunikaciju, pragmatično rješavanje problema i učinkovitu isporuku.'
    },
    { 
      id: 'creative', 
      name: 'Creative Technologist', 
      icon: 'palette', 
      contextPrefix: 'Act as a Creative Technologist and UI/UX expert. Focus on innovative user experiences, responsive layouts, fluent micro-animations, and modern visual design principles.',
      description: 'Specializes in modern visual design, fluid interactive experiences, and accessible UI/UX patterns.'
    }
  ]);

  agents = signal<AIAgent[]>([
    {
      id: 'copilot',
      name: 'GitHub Copilot',
      icon: 'code',
      description: 'Optimized for code generation and technical documentation.',
      promptPattern: 'Context: [Project Type]\nTask: [Specific Action]\nConstraints: [Language/Framework]\nOutput: [Format]',
      guidance: {
        general: [
          'Be specific about the framework version.',
          'Provide context about the existing file structure.',
          'Use "Step-by-step" for complex logic.'
        ],
        context: 'Describe your tech stack, versions, and the specific file you are working in.',
        task: 'State exactly what the code should do. Use verbs like "Create", "Refactor", or "Fix".',
        constraints: 'Mention coding standards, library preferences (e.g. "Use Signals"), and performance needs.',
        presets: {
          context: [
            { label: '.NET 10 Stack', text: '.NET 10 Web API with EF Core', description: 'Sets up a modern .NET backend with database access.', next: [
              { label: 'Clean Arch', text: ' following Clean Architecture principles', description: 'Organizes the project into layers for better maintainability.' },
              { label: 'CQRS', text: ' using MediatR for CQRS pattern', description: 'Separates read and write operations using command-query responsibility segregation.' }
            ]},
            { label: 'Angular App', text: 'Angular 18 standalone app with Tailwind CSS 4', description: 'Initializes a modern Angular frontend with cutting-edge styling.', next: [
              { label: 'State Mgmt', text: ' using Signals for reactive state', description: 'Implements fine-grained reactivity using Angular Signals.' },
              { label: 'SSR', text: ' with Server-Side Rendering enabled', description: 'Optimizes for SEO and faster initial page loads.' }
            ]}
          ],
          task: [
            { label: 'Create Component', text: 'Create a reusable modal component', description: 'Generates a popup dialog that can be used across the app.', next: [
              { label: 'with Animation', text: ' including smooth entry/exit animations', description: 'Adds professional transitions for a better user experience.' },
              { label: 'with Validation', text: ' with built-in form validation', description: 'Ensures user input is correct before submission.' }
            ]},
            { label: 'Refactor Logic', text: 'Refactor this service to use a more functional approach', description: 'Improves code quality by adopting functional programming patterns.', next: [
              { label: 'DRY', text: ' ensuring the code is DRY and modular', description: 'Removes duplication and improves code structure.' }
            ]}
          ],
          constraints: [
            { label: 'Response Template', text: 'Use structure: 1. Summary of changes, 2. Code block, 3. Step-by-step explanation', description: 'Standardizes the AI response format for clarity.' },
            { label: 'Clean Code', text: 'Follow SOLID principles and clean code standards', description: 'Ensures the generated code follows industry-recognized best practices.' },
            { label: 'Performance', text: 'Optimize for low latency and minimal bundle size', description: 'Prioritizes execution speed and resource efficiency.' }
          ]
        }
      }
    },
    {
      id: 'claude',
      name: 'Claude (Anthropic)',
      icon: 'psychology',
      description: 'Excellent for reasoning, long-form content, and nuanced instructions.',
      promptPattern: 'I want you to act as [Role].\nHere is the context: [Context].\nYour task is: [Task].\nPlease follow these rules: [Rules].',
      guidance: {
        general: [
          'Use XML tags for structured data.',
          'Ask Claude to "think step-by-step" inside <thinking> tags.',
          'Provide clear examples of desired output.'
        ],
        context: 'Give Claude a persona (e.g. "Senior Architect") and detailed background info.',
        task: 'Define the goal clearly. Claude handles complex multi-step instructions very well.',
        constraints: 'Set the tone, length, and specific "negative constraints" (what NOT to do).',
        presets: {
          context: [
            { label: '.NET 8 API', text: 'ASP.NET Core 8 API with Entity Framework Core', next: [
              { label: 'DDD', text: ' applying Domain-Driven Design patterns' }
            ]},
            { label: 'Documentation', text: 'A technical documentation project for a complex API', next: [
              { label: 'Public facing', text: ' intended for external developers' }
            ]}
          ],
          task: [
            { label: 'Analyze Logic', text: 'Analyze the following logic and suggest improvements', next: [
              { label: 'Step-by-step', text: ' providing a step-by-step breakdown' }
            ]},
            { label: 'Write Guide', text: 'Write a comprehensive getting started guide', next: [
              { label: 'with Examples', text: ' including clear code examples' }
            ]}
          ],
          constraints: [
            { label: 'Croatian Reasoning', text: 'Razmišljaj na hrvatskom, odgovaraj na engleskom (Reason in Croatian, answer in English)' },
            { label: 'XML Output', text: 'Format the output using XML tags for clarity' },
            { label: 'Thinking', text: 'Include a <thinking> section for your reasoning' }
          ]
        }
      }
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT (OpenAI)',
      icon: 'chat',
      description: 'Versatile for general tasks, creative writing, and brainstorming.',
      promptPattern: 'Role: [Role]\nObjective: [Goal]\nTone: [Style]\nFormat: [Output Type]',
      guidance: {
        general: [
          'Use "Act as a..." to set the persona.',
          'Provide constraints on length or complexity.',
          'Iterate by asking for refinements.'
        ],
        context: 'Explain the "Who, What, Where" of the situation.',
        task: 'What is the immediate outcome you need? Be direct.',
        constraints: 'Specify the desired format (Markdown, JSON, Table) and reading level.',
        presets: {
          context: [
            { label: 'Blog Post', text: 'Writing a blog post about AI trends in 2024' },
            { label: 'Email Draft', text: 'Drafting a professional email to a client' }
          ],
          task: [
            { label: 'Summarize', text: 'Summarize the following text into 3 bullet points' },
            { label: 'Brainstorm', text: 'Brainstorm 5 creative ideas for a marketing campaign' }
          ],
          constraints: [
            { label: 'Tone: Friendly', text: 'Use a friendly and conversational tone' },
            { label: 'Format: Table', text: 'Present the information in a clear table' }
          ]
        }
      }
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: 'auto_awesome',
      description: 'Powerful multimodal capabilities and deep Google integration.',
      promptPattern: 'System Instruction: [Role/Tone]\nUser Input: [Task]\nTools: [Search/Maps/etc.]',
      guidance: {
        general: [
          'Leverage grounding for real-time info.',
          'Use clear headings in your prompt.',
          'Specify if you need JSON output.'
        ],
        context: 'Mention if Gemini should use its built-in tools like Google Search or Maps.',
        task: 'Describe the reasoning process you want Gemini to follow.',
        constraints: 'Define the response modality (Text, Audio, Image) if applicable.',
        presets: {
          context: [
            { label: 'Real-time Info', text: 'Using Google Search to find the latest news on...' },
            { label: 'Location based', text: 'Finding local businesses using Google Maps' }
          ],
          task: [
            { label: 'Explain Concept', text: 'Explain the following concept to a 5-year old' },
            { label: 'Generate Image', text: 'Generate a high-quality image of...' }
          ],
          constraints: [
            { label: 'JSON Schema', text: 'Return the response in a strict JSON format' },
            { label: 'Grounding', text: 'Always cite your sources using web links' }
          ]
        }
      }
    },
    {
      id: 'cursor',
      name: 'Cursor AI',
      icon: 'terminal',
      description: 'IDE-integrated agent for codebase-wide refactoring and features.',
      promptPattern: 'Reference: @file @folder\nInstruction: [Change Request]\nStyle: [Coding Standards]',
      guidance: {
        general: [
          'Use @ symbols to reference specific files.',
          'Explain the "Why" behind the change.',
          'Ask for minimal diffs if preferred.'
        ],
        context: 'Reference the specific files (@) that are relevant to the change.',
        task: 'Describe the feature or bug fix. Mention if it should be a new file or edit.',
        constraints: 'Enforce project-specific patterns or linting rules.',
        presets: {
          context: [
            { label: 'Current File', text: 'In the current file (@file)' },
            { label: 'Full Project', text: 'Across the entire project (@folder)' }
          ],
          task: [
            { label: 'Fix Bug', text: 'Fix the bug where the user cannot log in' },
            { label: 'Add Feature', text: 'Add a new feature for dark mode toggle' }
          ],
          constraints: [
            { label: 'Minimal Diff', text: 'Keep the changes as minimal as possible' },
            { label: 'No Comments', text: 'Do not add any comments to the code' }
          ]
        }
      }
    }
  ]);

  selectedAgent = signal<AIAgent | null>(null);
}
