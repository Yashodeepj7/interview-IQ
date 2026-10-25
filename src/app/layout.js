import { Geist, Geist_Mono, Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://interviewiq-career.vercel.app"),
  title: {
    default: "InterviewIQ — AI Mock Interview & ATS Resume Analyzer",
    template: "%s | InterviewIQ",
  },
  description:
    "Ace your next technical or behavioral interview with hands-free AI voice mock interviews, instant STAR method evaluations, and deep ATS resume audits. Practice smarter, land your dream career.",
  keywords: [
    "AI Mock Interview",
    "AI Interview Preparation",
    "Voice AI Interviewer",
    "ATS Resume Analyzer",
    "Tech Interview Practice",
    "STAR Method Feedback",
    "Behavioral Interview Questions",
    "System Design Practice",
    "Software Engineer Interview Prep",
    "Coding Interview Simulator",
    "Career Coaching AI",
    "InterviewIQ",
  ],
  authors: [{ name: "InterviewIQ", url: "https://interviewiq-career.vercel.app" }],
  creator: "InterviewIQ",
  publisher: "InterviewIQ",
  alternates: {
    canonical: "https://interviewiq-career.vercel.app",
  },
  openGraph: {
    title: "InterviewIQ — AI Mock Interview & ATS Resume Analyzer",
    description:
      "Practice real-time technical and behavioral interviews with our hands-free AI voice interviewer, STAR method evaluation, and ATS resume intelligence.",
    url: "https://interviewiq-career.vercel.app",
    siteName: "InterviewIQ",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InterviewIQ — AI-Powered Mock Interview & Career Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewIQ — AI Mock Interview & ATS Resume Analyzer",
    description:
      "Practice real-time technical and behavioral interviews with our hands-free AI voice interviewer, STAR method evaluation, and ATS resume intelligence.",
    images: ["/og-image.png"],
    creator: "@InterviewIQ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "InterviewIQ",
  url: "https://interviewiq-career.vercel.app",
  description:
    "AI-powered voice mock interview simulator, real-time STAR evaluation engine, and ATS resume competency analyzer.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1420",
    bestRating: "5",
    worstRating: "1",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--bg-base)] text-[var(--foreground)] selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200 transition-colors duration-200"
      >
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('interviewiq-theme');if(s==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
