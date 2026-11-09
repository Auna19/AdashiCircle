import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

export const metadata = {
  title: {
    default: 'AdashiCircle — Save Together, Grow Together',
    template: '%s | AdashiCircle',
  },
  description:
    'AdashiCircle is a digital cooperative savings platform that helps groups save together, track contributions, and manage rotating payouts transparently.',
  keywords: [
    'adashi',
    'cooperative savings',
    'ajo',
    'esusu',
    'group savings',
    'Nigeria',
    'rotating savings',
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
