# Virtual Influencer Studio

This project allows you to create a virtual character and generate daily lifestyle content ideas for their social media channels, powered by AI.

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm` or `yarn`

### 1. Install Dependencies
In your terminal, navigate to the project root and run:
```bash
npm install
```

### 2. Set Up API Key
1.  Create a `.env` file in the project root.
2.  Copy the content from `.env.example` into it.
3.  Replace `<YOUR_API_KEY>` with your Google Gemini API key.

Your `.env` file should contain:
```
VITE_API_KEY="YOUR_API_KEY_HERE"
```

### 3. Start the Development Server
Run the following command:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## ⚠️ Security Notice

This application runs entirely on the client-side, which means your **Google Gemini API key is exposed in the browser**. To protect your key from unauthorized use in a production environment, you **must** add HTTP referrer restrictions to it in the Google Cloud Console.

Follow these steps:
1.  Go to your API key settings in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Select the API key you are using for this project.
3.  Under "Application restrictions", select "Websites".
4.  Click "Add" and enter the domain where you will host your application (e.g., `your-domain.com/*`).
5.  For local development, you can also add `localhost:*/*`.
6.  Save your changes.

This ensures your API key can only be used from your specified domains, preventing others from using it.