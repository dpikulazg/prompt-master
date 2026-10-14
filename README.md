# **🧠 Prompt Builder Guide**

## **🚀 Key Features**

* **AI Step-by-Step promp builder:** Detailed logic composition.  

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
