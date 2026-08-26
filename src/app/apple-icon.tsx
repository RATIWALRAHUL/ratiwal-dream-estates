import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Apple Touch Icon generation for Ratiwal Dream Estates
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #051426 0%, #0c2340 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "22%",
          border: "2px solid rgba(8, 127, 195, 0.4)",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="160 70 125 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Architectural House Roof & Vertical Pillar Lines */}
          <g fill="none" stroke="#087fc3" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
            {/* Roof Peak */}
            <path d="M 172 135 L 222 84 L 273 135" />
            
            {/* Vertical Pillar Lines */}
            <line x1="183" y1="145" x2="183" y2="175" />
            <line x1="202" y1="114" x2="202" y2="202" />
            <line x1="222" y1="94" x2="222" y2="242" />
            <line x1="242" y1="76" x2="242" y2="210" />
            <line x1="262" y1="145" x2="262" y2="175" />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
