
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const getAttendanceInsights = async (store: AppState): Promise<string> => {
  try {
    // Correct initialization as per @google/genai guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare a summary of data for the AI
    const studentCount = store.students.length;
    const attendanceCount = store.attendance.length;
    const recentAbsenteeism = store.attendance
      .filter(a => a.status === 'ABSENT')
      .slice(0, 5)
      .map(a => {
        const student = store.students.find(s => s.id === a.studentId);
        return student ? `${student.name} (${student.className}) on ${a.date}` : null;
      })
      .filter(Boolean);

    const prompt = `
      You are an AI assistant for the "Madam Ji" Attendance Management App.
      Data Summary:
      - Total Students: ${studentCount}
      - Total Attendance Logs: ${attendanceCount}
      - Recent Absentees: ${recentAbsenteeism.join(', ')}
      
      Provide a concise summary (max 100 words) of the attendance health, any worrying patterns of absenteeism, and a motivational tip for the teachers.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // response.text is a property, not a method
    return response.text || "Unable to generate insights at this moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Insights unavailable. Please check your connectivity or API configuration.";
  }
};
