
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the prefix (e.g., "data:image/png;base64,")
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const solveProblemsFromImages = async (files: File[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Initializing GoogleGenAI inside the function ensures the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = await Promise.all(
    files.map(async (file) => ({
      inlineData: {
        data: await fileToBase64(file),
        mimeType: file.type,
      },
    }))
  );

  const prompt = `
    You are an expert mathematician and LaTeX specialist. 
    Analyze the provided images which contain mathematical or scientific problems.
    
    Tasks:
    1. Identify each unique problem in the images.
    2. Transcription: Extract the problem statement and given data.
    3. Solution: Provide a clear, step-by-step logical solution.
    4. Format: Generate LaTeX code that strictly follows the structure below for EACH problem.

    REQUIRED OUTPUT FORMAT (Vietnamese):
    
    For each problem found (Problem 1, Problem 2, etc.), output the following block:

    \\section*{Câu [n]:}
    
    \\textbf{Dữ kiện:}
    \\begin{itemize}
        \\item [List key information/numbers given in the problem]
        \\item ...
    \\end{itemize}

    \\begin{center}
    \\textbf{\\large Lời giải}
    \\end{center}

    [Step-by-step solution here. Use align* for equations.]

    \\vspace{1em}
    \\noindent \\textbf{Kết luận:} [Final Answer/Conclusion]
    
    ---------------------------------------------
    
    Rules:
    - Replace [n] with the problem number (1, 2, 3...).
    - Keep "Dữ kiện", "Lời giải", "Kết luận" exactly in Vietnamese as shown.
    - "Lời giải" should be centered and slightly larger.
    - Ensure all math is valid LaTeX (use $...$ for inline, $$...$$ or align environments for display).
    - Do not output markdown code blocks (like \`\`\`latex), just the raw LaTeX content.
  `;

  try {
    // Upgraded to gemini-3-pro-preview as it is better suited for complex math and STEM tasks
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.2,
        topP: 0.95,
      }
    });

    // Extract text directly from the .text property as per Gemini API guidelines
    const text = response.text || "";
    // Clean up markdown code block wrappers if present
    return text.replace(/^```latex\n?/, '').replace(/\n?```$/, '').trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process images with AI.");
  }
};
