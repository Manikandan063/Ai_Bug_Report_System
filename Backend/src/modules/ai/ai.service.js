import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

export const generateBugReport = async (bugDescription) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `
    You are an expert QA Tester. Generate a JSON bug report based on the following description.
    Return ONLY a raw valid JSON object without markdown formatting or code blocks.
    
    Bug Description: ${bugDescription}
    
    Required JSON format:
    {
      "testDescription": "string detailing the test scenario",
      "actualResult": "string describing what actually happened",
      "expectedResult": "string describing what should have happened",
      "severity": "High" | "Medium" | "Low",
      "remarks": ""
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    let text = chatCompletion.choices[0]?.message?.content || "";
    const jsonResult = JSON.parse(text);

    // Validate the generated data and clean if necessary
    if (!['High', 'Medium', 'Low'].includes(jsonResult.severity)) {
      jsonResult.severity = 'Medium'; // default
    }
    jsonResult.remarks = '';

    return jsonResult;
  } catch (error) {
    console.error('AI Generation Error (Groq):', error.message);
    console.log('Returning mock bug report to allow testing frontend...');
    
    // Fallback Mock Data if API fails
    return {
      testDescription: "Navigate to the specified module and perform standard user actions to replicate the reported bug.",
      actualResult: "The system did not perform as intended based on the provided bug description: " + bugDescription,
      expectedResult: "The system should function correctly without errors, allowing the user to complete their action seamlessly.",
      severity: "High",
      remarks: ""
    };
  }
};