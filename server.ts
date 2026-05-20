import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const RESUME_REVIEW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    categories: {
      type: Type.OBJECT,
      properties: {
        objective: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  improvement: { type: Type.STRING }
                },
                required: ["sentence", "improvement"]
              }
            }
          },
          required: ["title", "score", "suggestions"]
        },
        jobDescription: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  improvement: { type: Type.STRING }
                },
                required: ["sentence", "improvement"]
              }
            }
          },
          required: ["title", "score", "suggestions"]
        },
        sideProjects: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  improvement: { type: Type.STRING }
                },
                required: ["sentence", "improvement"]
              }
            }
          },
          required: ["title", "score", "suggestions"]
        },
        formatting: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  improvement: { type: Type.STRING }
                },
                required: ["sentence", "improvement"]
              }
            }
          },
          required: ["title", "score", "suggestions"]
        },
        language: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  improvement: { type: Type.STRING }
                },
                required: ["sentence", "improvement"]
              }
            }
          },
          required: ["title", "score", "suggestions"]
        }
      },
      required: ["objective", "jobDescription", "sideProjects", "formatting", "language"]
    }
  },
  required: ["overallScore", "summary", "categories"]
};

app.post("/api/review", async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: "Missing resume or job description text." });
  }

  try {
    const prompt = `
      You are an expert resume reviewer and tech career coach.
      Analyse the following Resume against the Job Description.
      
      ## Constraints:
      1. Use the XYZ Formula for all bullet point improvements: "Accomplished [X] as measured by [Y], by doing [Z]".
      2. The primary audience for the initial review is a tech recruiter (non-technical).
      3. The secondary audience is an engineering manager (technical).
      4. Frame suggestions to accentuate how the candidate adds value to the organisation.
      5. Use Australian English spellings (e.g., "analysing", "organisation", "optimising").
      6. Provide a score out of 100 for each category and an overall score.
      
      ## Resume Text:
      ${resumeText}
      
      ## Job Description:
      ${jobDescription}
      
      ## Categories to review:
      - objective: Evaluate the summary/objective statement.
      - jobDescription: How well the resume aligns with the specific JD requirements.
      - sideProjects: Quality and relevance of side projects.
      - formatting: Layout, readability, and consistency.
      - language: Tone, grammar, and impact of the language used.
      
      Return the analysis in JSON format matching the requested schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_REVIEW_SCHEMA as any,
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to analyse resume. Please try again." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
