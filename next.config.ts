import type { NextConfig } from "next";

const getApiConnectSource = () => {
  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseURL) {
    return null;
  }

  try {
    return new URL(apiBaseURL).origin;
  } catch {
    return null;
  }
};

const apiConnectSource = getApiConnectSource();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              ["connect-src 'self'", apiConnectSource]
                .filter(Boolean)
                .join(" "),
              "font-src 'self'",
              "img-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
