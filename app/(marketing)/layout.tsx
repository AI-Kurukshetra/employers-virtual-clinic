import AnnouncementBar from '@/components/marketing/AnnouncementBar'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      <AnnouncementBar />
      <div className="pt-9">
        <Navbar />
      </div>
      {children}
      <Footer />
    </div>
  )
}
