import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LedgerProvider } from "@/context/LedgerContext";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ledger Pro | Advanced Cash Flow",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-orange-200 selection:text-orange-900 dark:selection:bg-orange-900/50 dark:selection:text-orange-100`}>
        
        {/* ThemeProvider wraps everything to enable dark/light/system mode */}
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <div id="print-section" className="hidden"></div>

          <LedgerProvider>
            {/* AppShell handles the layout UI and state */}
            <AppShell>
              {children}
            </AppShell>
            
            {/* Note: I added theme="system" to sonner so your toasts match the dark mode */}
            <Toaster richColors position="bottom-right" theme="system" />
          </LedgerProvider>
        </ThemeProvider>
        
      </body>
    </html>
  );
}