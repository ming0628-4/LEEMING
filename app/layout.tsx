import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LEEMING - Personal Digital Archive",
    template: "%s - LEEMING",
  },
  description:
    "A maintained personal digital archive for collecting, organizing, retrieving and maintaining useful resources.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${sans.variable} ${mono.variable}`}>
        <header className="site-header">
          <div className="shell nav">
            <Link className="brand" href="/">
              LEE<span>MING</span>
            </Link>
            <SiteNav />
          </div>
        </header>
        {children}
        <footer>
          <div className="shell footer-inner">
            <strong>LEEMING</strong>
            <p>Collect · Organize · Retrieve · Maintain</p>
            <span>Built for the future me.</span>
            <Link href="/admin">管理入口</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
