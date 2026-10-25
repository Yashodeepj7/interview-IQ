export const metadata = {
  title: "Sign In",
  description:
    "Sign in to InterviewIQ to access hands-free AI voice mock interviews, saved evaluation reports, and interview history.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Sign In — InterviewIQ",
    description: "Access your InterviewIQ candidate account and performance analytics.",
    url: "https://interviewiq-career.vercel.app/login",
  },
};

export default function LoginLayout({ children }) {
  return children;
}
