export default function manifest() {
  return {
    name: "InterviewIQ — AI Mock Interview & Resume Analyzer",
    short_name: "InterviewIQ",
    description:
      "Practice hands-free AI voice mock interviews with real-time STAR evaluation and analyze your resume for ATS compliance.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
