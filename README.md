# **🧠 Psychometric Mastery Guide**

An advanced AI-powered psychometric and aptitude test preparation web application built with **React**, **Tailwind CSS**, and **Google Gemini 3 Flash API**.

## **🚀 Key Features**

* **Practice Modules:** Quantitative, Abstract Reasoning, Spatial Visualization, Verbal Logic, and Code Logic.  
* **AI Step-by-Step Explainer:** Detailed logic decomposition using Gemini 3 Flash.  
* **Company Test Intel:** Real-time web-grounded research (Google Search) on test formats for McKinsey, Google, Optiver, Amazon, Citadel, Deloitte, etc.  
* **Multimodal Visual Solver:** Upload image screenshots of matrix puzzles or spatial shapes to receive step-by-step visual solutions.  
* **Structured AI Diagnostics:** Generates a structured JSON diagnostic profile (Percentiles, Archetypes, Strengths/Weaknesses).  
* **Timed Simulator:** Exam mode under time pressure.  
* **AI Mentor Chat:** Instant interactive Q\&A for test strategies and interview preparation.

## **🛠️ Quick Start (Local Development)**

### **Prerequisites**

* [Node.js](https://nodejs.org/) (version 18+ recommended)  
* npm or yarn

### **Installation**

1. Create a project folder and copy the generated files into it:  
   mkdir psychometric-guide  
   cd psychometric-guide

2. Install dependencies:  
   npm install

3. Start the development server:  
   npm run dev

4. Open http://localhost:3000 in your browser.

## **🌐 Deploying to Production**

### **Option 1: Vercel (Recommended)**

1. Push this project to GitHub.  
2. Import the repository into [Vercel](https://vercel.com).  
3. Vercel automatically detects **Vite** and builds the app using npm run build.

### **Option 2: Netlify**

1. Connect your repository to [Netlify](https://netlify.com).  
2. Set Build Command to npm run build and Publish Directory to dist.

### **Option 3: GitHub Pages**

1. Install gh-pages:  
   npm install \--save-dev gh-pages

2. Add build script and deploy:  
   npm run build  
   npx gh-pages \-d dist

## **🔑 API Key Configuration**

The app allows users to input their own **Gemini API Key** directly in the top header bar, storing it safely in localStorage in the browser. You can obtain a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
