import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Contrib Compass — AI-Powered Contributor Matching",
  description: "Connect open source contributors to the right issues instantly. Auto-triage issues with Groq LLM & Sentence Transformers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#08090f] text-slate-100 antialiased selection:bg-render-cyan/30 selection:text-white">
        {/* Ambient Top Glow Orbs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-render-indigo/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed top-20 right-1/4 w-80 h-80 bg-render-cyan/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <Navbar />
        <main className="flex-1 w-full flex flex-col relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
