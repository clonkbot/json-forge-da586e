import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import OpenAI from "openai";

interface Props {
  onSave: (name: string, content: string) => void;
}

export function JsonGenerator({ onSave }: Props) {
  const [prompt, setPrompt] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("grok_api_key") || "");
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const createGeneration = useMutation(api.generations.create);
  const completeGeneration = useMutation(api.generations.complete);
  const setGenerationError = useMutation(api.generations.setError);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveApiKey = () => {
    localStorage.setItem("grok_api_key", apiKey);
    setShowApiKeyInput(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!apiKey) {
      setShowApiKeyInput(true);
      setError("Please enter your Grok API key first");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedJson("");

    const genId = await createGeneration({ prompt });

    try {
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.x.ai/v1",
        dangerouslyAllowBrowser: true,
      });

      const response = await client.chat.completions.create({
        model: "grok-3-mini-fast",
        messages: [
          {
            role: "system",
            content: `You are a JSON generator assistant specialized in creating JSON files for iPhone apps.
            Generate valid, well-formatted JSON based on the user's description.
            ONLY output the raw JSON, no markdown code blocks, no explanations.
            Ensure the JSON is:
            - Valid and parseable
            - Well-structured for iOS/iPhone app use cases
            - Using appropriate data types
            - Including helpful example data when relevant`
          },
          {
            role: "user",
            content: prompt
          }
        ],
      });

      const result = response.choices[0]?.message?.content || "";

      // Clean up the result - remove markdown code blocks if present
      let cleanedResult = result.trim();
      if (cleanedResult.startsWith("```json")) {
        cleanedResult = cleanedResult.slice(7);
      } else if (cleanedResult.startsWith("```")) {
        cleanedResult = cleanedResult.slice(3);
      }
      if (cleanedResult.endsWith("```")) {
        cleanedResult = cleanedResult.slice(0, -3);
      }
      cleanedResult = cleanedResult.trim();

      // Validate JSON
      try {
        JSON.parse(cleanedResult);
        setGeneratedJson(cleanedResult);
        await completeGeneration({ id: genId, result: cleanedResult });
      } catch {
        throw new Error("Generated content is not valid JSON. Please try again with a clearer prompt.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Generation failed";
      setError(errorMessage);
      await setGenerationError({ id: genId, error: errorMessage });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedJson) return;
    const name = `generated-${Date.now()}.json`;
    onSave(name, generatedJson);
  };

  const handleCopy = async () => {
    if (!generatedJson) return;
    await navigator.clipboard.writeText(generatedJson);
  };

  const handleDownload = () => {
    if (!generatedJson) return;
    const blob = new Blob([generatedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="generator">
      <div className="generator-header">
        <h2>AI JSON Generator</h2>
        <p>Describe the JSON structure you need for your iPhone app</p>
      </div>

      {showApiKeyInput && (
        <div className="api-key-section">
          <div className="api-key-card">
            <h3>🔑 Grok API Key Required</h3>
            <p>Enter your Grok API key to enable AI generation. Get one at <a href="https://x.ai" target="_blank" rel="noopener noreferrer">x.ai</a></p>
            <div className="api-key-input-row">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="xai-xxxxxxxxxxxxxxxx"
                className="api-key-input"
              />
              <button onClick={handleSaveApiKey} className="api-key-save" disabled={!apiKey}>
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="generator-content">
        <div className="prompt-section">
          <label htmlFor="prompt">What JSON do you need?</label>
          <textarea
            ref={textareaRef}
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A configuration file for an iOS app with settings for dark mode, notification preferences, and user profile fields..."
            rows={4}
          />
          <div className="prompt-actions">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="generate-btn"
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  Generate JSON
                </>
              )}
            </button>
            {!showApiKeyInput && (
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="change-key-btn"
              >
                Change API Key
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {generatedJson && (
          <div className="result-section">
            <div className="result-header">
              <h3>Generated JSON</h3>
              <div className="result-actions">
                <button onClick={handleCopy} className="action-btn" title="Copy to clipboard">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button onClick={handleDownload} className="action-btn" title="Download file">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                <button onClick={handleSave} className="save-btn">
                  Save to Files
                </button>
              </div>
            </div>
            <pre className="json-preview">
              <code>{generatedJson}</code>
            </pre>
          </div>
        )}

        <div className="templates-section">
          <h3>Quick Templates</h3>
          <div className="templates-grid">
            {[
              { label: "App Config", prompt: "A configuration file for an iOS app with app version, feature flags, API endpoints, and cache settings" },
              { label: "User Profile", prompt: "A user profile JSON structure with name, avatar URL, email, preferences object, and subscription status" },
              { label: "Product List", prompt: "An array of products for an e-commerce iPhone app with id, name, price, image URLs, and category" },
              { label: "Settings", prompt: "iOS app settings with dark mode toggle, notification preferences, language selection, and privacy options" },
              { label: "API Response", prompt: "A typical REST API response structure with status, data array, pagination info, and error handling" },
              { label: "Localization", prompt: "A localization strings file for iOS with keys for common UI elements like buttons, labels, and error messages" },
            ].map((template) => (
              <button
                key={template.label}
                onClick={() => setPrompt(template.prompt)}
                className="template-btn"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
