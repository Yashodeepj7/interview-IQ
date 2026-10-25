import { ImageResponse } from "next/og";

export const alt = "InterviewIQ — AI Mock Interview & ATS Resume Analyzer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          padding: "70px 80px",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            IQ
          </div>
          <span style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            InterviewIQ
          </span>
          <span
            style={{
              marginLeft: "12px",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#a5b4fc",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            AI Career Intelligence
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "58px",
              fontWeight: "900",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              color: "#ffffff",
              maxWidth: "1000px",
              margin: 0,
            }}
          >
            Master Your Next Interview with Hands-Free AI Voice
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "900px",
              margin: 0,
            }}
          >
            Real-time spoken interview simulations, STAR method evaluation, and ATS resume intelligence.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <span style={{ fontSize: "17px", color: "#cbd5e1" }}>🎙️ Hands-Free AI Voice</span>
            <span style={{ fontSize: "17px", color: "#cbd5e1" }}>⭐ STAR Rubric Scoring</span>
            <span style={{ fontSize: "17px", color: "#cbd5e1" }}>📄 ATS Resume Audit</span>
          </div>
          <span style={{ fontSize: "18px", color: "#818cf8", fontWeight: "700" }}>
            interviewiq-career.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
