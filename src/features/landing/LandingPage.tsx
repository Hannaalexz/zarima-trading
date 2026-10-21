import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Handshake,
  Leaf,
  Boxes,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  Send,
  Building2,
  Users,
  Compass,
  Award,
  Clock,
  Sparkles,
  X,
  ExternalLink,
  ChevronDown,
  Navigation,
} from 'lucide-react'
import { useAuth } from '@/data/authContext'
import { useToast } from '@/hooks/useToast'

interface ServiceModalData {
  title: string
  subtitle: string
  image: string
  description: string
  highlights: string[]
  specs: { label: string; value: string }[]
}

export const LandingPage: React.FC = () => {
  const { toast } = useToast()
  const { isAuthenticated, currentUser, loginAs } = useAuth()

  // Service Modal state
  const [activeModal, setActiveModal] = useState<ServiceModalData | null>(null)

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // Contact Form State
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactService, setContactService] = useState('Cement Sales')
  const [contactMessage, setContactMessage] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    toast({
      title: 'Subscription Confirmed',
      description: `Thank you! ${newsletterEmail} has been added to our corporate updates list.`,
      type: 'success',
    })
    setNewsletterEmail('')
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName || !contactPhone) {
      toast({
        title: 'Validation Error',
        description: 'Please provide your full name and phone number.',
        type: 'error',
      })
      return
    }
    toast({
      title: 'Inquiry Submitted Successfully',
      description: `Thank you, ${contactName}. Our commercial dispatch team will reach you at ${contactPhone} shortly.`,
      type: 'success',
    })
    setContactName('')
    setContactPhone('')
    setContactEmail('')
    setContactMessage('')
  }

  const serviceModals: Record<string, ServiceModalData> = {
    cement_sales: {
      title: 'Cement Sales & Wholesale Allocation',
      subtitle: 'High-strength structural cement directly from leading manufacturing plants',
      image: '/images/card_cement_sales.jpg',
      description:
        'Zarima Trading PLC provides guaranteed bulk and bagged cement allocations for residential, commercial, and national infrastructure projects across Ethiopia. We partner directly with premier manufacturers including Dangote, Derba MIDROC, Mugher, and Habesha Cement.',
      highlights: [
        'Guaranteed daily allocations from major national factories',
        'OPC 42.5R/N for high-strength foundations & structural slabs',
        'PPC 32.5R/N for general construction, plastering, and masonry',
        'Quality certification tested for compression strength & setting time',
      ],
      specs: [
        { label: 'Grades Available', value: 'OPC 42.5N / PPC 32.5R' },
        { label: 'Packaging', value: '50kg Bags (Palletized) & Bulk Silo Tankers' },
        { label: 'Min Wholesale Order', value: '100 Quintals (Depot uplift or delivery)' },
        { label: 'Stock Locations', value: 'Kality Central Yard, Adama, Mojo & Hawassa' },
      ],
    },
    cement_delivery: {
      title: 'Bulk & Bagged Cement Delivery',
      subtitle: 'Direct-to-site pneumatic discharge and scheduled project dispatch',
      image: '/images/card_cement_delivery.jpg',
      description:
        'Our specialized bulk tanker fleet and flatbed carriers deliver cement directly to your batching plant or job site with zero downtime. Equipped with high-pressure discharge compressors for seamless silo uplift.',
      highlights: [
        'Dedicated bulk pneumatic tankers with onboard compressor discharge',
        'Direct factory-to-site delivery preventing double-handling costs',
        'GPS-tracked dispatch manifests with live transit monitoring',
        'Round-the-clock priority delivery scheduling for critical pours',
      ],
      specs: [
        { label: 'Tanker Capacity', value: '30 to 45 Metric Tons per trip' },
        { label: 'Discharge Method', value: 'High-pressure pneumatic blowers' },
        { label: 'Dispatch Lead Time', value: 'Same-day or next-day scheduled transit' },
        { label: 'Service Radius', value: 'Addis Ababa & all regional construction corridors' },
      ],
    },
    truck_transportation: {
      title: 'Commercial Truck Transportation & Freight',
      subtitle: 'Dependable logistics for construction materials and third-party freight',
      image: '/images/truck_transportation.jpg',
      description:
        'Beyond cement, Zarima Trading PLC operates heavy-duty long-haul transport corridors for dry bulk cargo, steel rebar, aggregate, machinery, and external freight across all major Ethiopian trade corridors including Addis–Djibouti.',
      highlights: [
        'Multi-axle heavy trailers, flatbeds, and high-sided haulers',
        'Third-party cargo transport for contractors and industrial clients',
        'Strict preventive fleet maintenance and certified experienced drivers',
        'Comprehensive transit insurance coverage on all commercial loads',
      ],
      specs: [
        { label: 'Fleet Types', value: 'Mercedes-Benz Actros, Sinotruk HOWO & Flatbeds' },
        { label: 'Payload Capacity', value: 'Up to 50 Tons per hauler' },
        { label: 'Coverage', value: 'Nationwide & Djibouti Port Trade Corridor' },
        { label: 'Cargo Accepted', value: 'Cement, rebar, pipes, machinery & dry freight' },
      ],
    },
  }

  return (
    <div className="min-h-screen bg-[#0D151D] text-slate-100 flex flex-col justify-between selection:bg-[#FF6B00] selection:text-white font-sans">
      {/* ----------------------------------------------------------------- */}
      {/* 1. TOP HEADER / BRAND NAVIGATION BAR                              */}
      {/* ----------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full bg-[#0D151D]/95 backdrop-blur-md border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3.5 group focus:outline-none">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#0A1324] border border-[#FF6B00]/40 shadow-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
              <img
                src="/images/zarima_logo.jpg"
                alt="Zarima Trading PLC Official Logo"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="flex flex-col tracking-tight leading-none">
              <span className="font-black tracking-wider text-xl text-white font-sans">
                ZARIMA
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#FF6B00] uppercase mt-1">
                TRADING PLC
              </span>
            </div>
          </Link>

          {/* Navigation Links (Matching Mockup) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#home"
              className="relative text-white font-semibold py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#FF6B00] after:rounded-full"
            >
              Home
            </a>
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">
              About Us
            </a>
            <a href="#products" className="text-slate-300 hover:text-white transition-colors">
              Products &amp; Services
            </a>
            <a href="#fleet" className="text-slate-300 hover:text-white transition-colors">
              Our Fleet
            </a>
            <a href="#gallery" className="text-slate-300 hover:text-white transition-colors">
              Gallery
            </a>
            <a href="#contact" className="text-slate-300 hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Staff Portal CTA Button */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#E65A00] hover:to-[#FF6B00] text-white font-bold text-sm shadow-md hover:shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 group"
            >
              <span>Staff Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* 2. HERO SECTION (Cinematic Tanker & Mountain Backdrop)            */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="home"
        className="relative min-h-[620px] lg:min-h-[700px] flex items-center bg-[#0D151D] bg-cover bg-no-repeat bg-right lg:bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(13, 21, 29, 0.96) 0%, rgba(13, 21, 29, 0.90) 35%, rgba(13, 21, 29, 0.50) 70%, rgba(13, 21, 29, 0.15) 100%), url('/images/hero_truck_mockup.jpg')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
          <div className="max-w-2xl space-y-6">
            
            {/* Tagline Badge */}
            <div className="text-xs sm:text-sm font-black tracking-[0.22em] text-[#FF6B00] uppercase">
              BUILDING A STRONGER TOMORROW
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Quality Cement.<br />
              <span className="text-[#FF6B00]">Reliable Delivery.</span><br />
              Every Time.
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Zarima Trading PLC supplies high-quality cement and provides efficient truck transportation services for your construction and logistics needs.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#E65A00] hover:to-[#FF6B00] text-white font-bold text-sm shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 group"
              >
                <span>Explore Our Cement</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#fleet"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#16212D]/80 hover:bg-[#1E2D3D] text-white border border-white/20 font-bold text-sm backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>Our Truck Services</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 3. TRUST / 4 PILLARS RIBBON (High-Quality Cement, Transport...)   */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-white text-slate-900 border-y border-slate-200 shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            
            {/* Pillar 1 */}
            <div className="flex items-center gap-4 py-6 px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0">
                <ShieldCheck className="w-7 h-7 text-[#0D151D]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  High-Quality Cement
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trusted for strong foundations
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-center gap-4 py-6 px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0">
                <Truck className="w-7 h-7 text-[#0D151D]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Reliable Transport
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  On time, every time
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-center gap-4 py-6 px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0">
                <Handshake className="w-7 h-7 text-[#0D151D]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Professional Service
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your goals, our priority
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-center gap-4 py-6 px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0">
                <Leaf className="w-7 h-7 text-[#0D151D]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Sustainable Future
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Building responsibly
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 4. PRODUCTS & SERVICES SECTION (Everything You Need...)           */}
      {/* ----------------------------------------------------------------- */}
      <section id="products" className="py-20 md:py-28 bg-[#F8FAFC] text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column (Headline + Intro + Button) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase">
                OUR PRODUCTS &amp; SERVICES
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Everything You Need for Your Construction and Logistics
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We provide premium cement for all types of construction projects and a dependable fleet of trucks for your transportation needs — whether it's our cement or your cargo.
              </p>
              <div className="pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#E65A00] hover:to-[#FF6B00] text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 group"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right Column: 3 Signature Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Card 1: Cement Sales */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 flex flex-col justify-between group transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src="/images/card_cement_sales.jpg"
                    alt="Cement Sales palletized bags in warehouse"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg border border-[#FF6B00] text-[#FF6B00] flex items-center justify-center mb-4 bg-orange-50/50">
                      <Package className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                      Cement Sales
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      Premium quality cement for residential, commercial and industrial projects.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(serviceModals.cement_sales)}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] group/btn focus:outline-none"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Card 2: Cement Delivery */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 flex flex-col justify-between group transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src="/images/card_cement_delivery.jpg"
                    alt="Bulk cement delivery tanker on road"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg border border-[#FF6B00] text-[#FF6B00] flex items-center justify-center mb-4 bg-orange-50/50">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                      Cement Delivery
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      Fast, safe and reliable delivery of our cement to your site.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(serviceModals.cement_delivery)}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] group/btn focus:outline-none"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Card 3: Truck Transportation */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 flex flex-col justify-between group transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src="/images/truck_transportation.jpg"
                    alt="Heavy freight transport truck on highway at sunset"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg border border-[#FF6B00] text-[#FF6B00] flex items-center justify-center mb-4 bg-orange-50/50">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                      Truck Transportation
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      Our fleet is also available for transporting other goods and materials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(serviceModals.truck_transportation)}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] group/btn focus:outline-none"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 5. WHY CHOOSE US SECTION (Split View with Engineer + KPIs)        */}
      {/* ----------------------------------------------------------------- */}
      <section id="about" className="bg-[#0B141E] text-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Construction Engineer Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src="/images/why_choose_engineer.jpg"
                  alt="Zarima engineer in hardhat and branded vest overseeing operations"
                  className="w-full h-[450px] sm:h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B141E] via-transparent to-transparent opacity-60" />
                
                {/* Floating Official Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#0D151D]/90 backdrop-blur-md border border-[#FF6B00]/40 shadow-xl flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0A1324] border border-[#FF6B00]/40 p-0.5 flex-shrink-0">
                    <img
                      src="/images/zarima_logo.jpg"
                      alt="Zarima Trading Official Logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Zarima Quality Standard</div>
                    <div className="text-[11px] text-[#FF6B00] font-bold">100% Certified Structural Material</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Why Choose Zarima + Stats */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-3">
                <div className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase">
                  &mdash; WHY CHOOSE US
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  Why Choose Zarima Trading PLC?
                </h2>
              </div>

              {/* 5 Bullet Points with Orange Checkmarks */}
              <div className="space-y-4">
                {[
                  'Premium quality cement products',
                  'Modern and well-maintained truck fleet',
                  'On-time and reliable delivery',
                  'Competitive pricing',
                  'Experienced and professional team',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 fill-[#FF6B00] text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-slate-200">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* 4 Stats Grid (Matching Mockup Right Side) */}
              <div className="pt-4 grid grid-cols-2 gap-6 border-t border-white/10">
                
                {/* Stat 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#FF6B00]">
                      50+
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Trucks &amp; Trailers
                    </div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#FF6B00]">
                      100%
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Quality Cement
                    </div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#FF6B00]">
                      Nationwide
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Delivery Coverage
                    </div>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#FF6B00]">
                      Trusted by
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Many Clients
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 6. OUR FLEET & REGIONAL DEPOTS                                    */}
      {/* ----------------------------------------------------------------- */}
      <section id="fleet" className="py-20 md:py-24 bg-[#0F1B27] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase">
              MODERN HEAVY TRANSPORT CORRIDOR
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Engineered Fleet Ready for Any Haul
            </h2>
            <p className="text-sm text-slate-400">
              Operating pneumatic bulk cement tankers and heavy multi-axle trailers with real-time GPS tracking across Ethiopia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6B00]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Pneumatic Bulk Tankers</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Customized for direct discharge into concrete batching plants and construction silos with minimum material loss.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-[#FF6B00]">
                Capacity: 30 - 45 Metric Tons
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6B00]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Flatbed Multi-Axle Trailers</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Tarped and secured for palletized bagged cement, steel rebar, and dry bulk construction freight.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-[#FF6B00]">
                Payload: Up to 50 Metric Tons
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6B00]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">4 Strategic Depot Yards</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Rapid staging and buffer stock yards in Kality (Addis Ababa), Adama corridor, Mojo logistics hub, and Hawassa.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-[#FF6B00]">
                Buffer: 12,000+ Quintals Ready Stock
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 7. GALLERY SECTION (Visual Field Demonstrations)                  */}
      {/* ----------------------------------------------------------------- */}
      <section id="gallery" className="py-20 bg-[#0D151D] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase">
                OPERATIONAL SHOWCASE
              </div>
              <h2 className="text-3xl font-black text-white mt-2">
                Zarima in Action
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              From high-capacity warehouse depots to cross-country freight lines, our infrastructure powers national development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative rounded-2xl overflow-hidden group h-64 border border-white/10">
              <img
                src="/images/hero_tanker.jpg"
                alt="Bulk cement tanker at production silo plant"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D151D] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-bold text-white">
                Silo Plant Direct Loading
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden group h-64 border border-white/10">
              <img
                src="/images/card_cement_sales.jpg"
                alt="Palletized bagged cement in storage warehouse"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D151D] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-bold text-white">
                Depot Staging &amp; Quality Stacking
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden group h-64 border border-white/10">
              <img
                src="/images/card_cement_delivery.jpg"
                alt="Cement tanker transit in regional corridor"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D151D] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-bold text-white">
                Regional Highway Haulage
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden group h-64 border border-white/10">
              <img
                src="/images/truck_transportation.jpg"
                alt="Heavy freight trailer on highway at sunset"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D151D] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-bold text-white">
                Corridor Freight Logistics
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 8. CONTACT & COMMERCIAL DESK SECTION                              */}
      {/* ----------------------------------------------------------------- */}
      <section id="contact" className="py-20 md:py-24 bg-[#0B121A] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase">
                GET IN TOUCH
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Connect with Our Commercial Desk
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you require bulk cement allocations, project delivery schedules, or third-party freight transport, our team is ready to assist you.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Direct Telephone</div>
                    <div className="text-sm font-bold text-white font-mono">+251 11 123 4567 / +251 91 123 4567</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Corporate Email</div>
                    <div className="text-sm font-bold text-white">info@zarimatrading.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Main Office &amp; Central Depot</div>
                    <div className="text-sm font-bold text-white">Kality Industrial Zone, Addis Ababa, Ethiopia</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl bg-[#0F1A26] border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Send an Inquiry</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Fill out the details below and our commercial officer will respond promptly.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Dawit Haile"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0A121A] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="e.g. +251 91 234 5678"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0A121A] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. dawit@construct.et"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0A121A] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Service Required
                      </label>
                      <select
                        value={contactService}
                        onChange={(e) => setContactService(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0A121A] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF6B00]"
                      >
                        <option value="Cement Sales">Cement Sales (OPC / PPC)</option>
                        <option value="Cement Delivery">Bulk Silo &amp; Site Delivery</option>
                        <option value="Truck Transportation">Truck Freight &amp; Cargo Transport</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Message / Project Location
                    </label>
                    <textarea
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please specify quintals required, project location or freight details..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0A121A] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#E65A00] hover:to-[#FF6B00] text-white font-bold text-sm shadow-md hover:shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Send Commercial Inquiry
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 9. FOOTER (Matching Mockup with Logo, Quick Links, Staff Portal)  */}
      {/* ----------------------------------------------------------------- */}
      <footer className="bg-[#070D14] text-slate-300 pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            
            {/* Col 1: Official Logo + Slogan (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-3.5 group">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0A1324] border border-[#FF6B00]/40 shadow-sm flex-shrink-0 group-hover:border-[#FF6B00] transition-colors p-0.5">
                  <img
                    src="/images/zarima_logo.jpg"
                    alt="Zarima Trading PLC Official Logo"
                    className="w-full h-full object-cover object-center rounded-lg"
                  />
                </div>
                <div className="flex flex-col tracking-tight leading-none">
                  <span className="font-black tracking-wider text-xl text-white font-sans">
                    ZARIMA
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#FF6B00] uppercase mt-1">
                    TRADING PLC
                  </span>
                </div>
              </Link>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Stronger Materials. Greater Possibilities.
              </p>
              <div className="pt-2 text-xs text-slate-400 leading-relaxed">
                Premier Ethiopian distributor of factory-grade structural cement and heavy freight hauler.
              </div>
            </div>

            {/* Col 2: Quick Links (2.5 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-sm font-bold text-white">Quick Links</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a href="#home" className="hover:text-[#FF6B00] transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-[#FF6B00] transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#products" className="hover:text-[#FF6B00] transition-colors">
                    Products &amp; Services
                  </a>
                </li>
                <li>
                  <a href="#fleet" className="hover:text-[#FF6B00] transition-colors">
                    Our Fleet
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-[#FF6B00] transition-colors">
                    Contact
                  </a>
                </li>
                <li className="pt-1.5">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white font-bold text-[11px] transition-colors"
                  >
                    <span>Staff Portal</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact Us (2.5 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-sm font-bold text-white">Contact Us</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                  <span className="font-mono">+251 11 123 4567</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                  <span>info@zarimatrading.com</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  <span>Kality Industrial Zone, Addis Ababa, Ethiopia</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Stay Updated (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-sm font-bold text-white">Stay Updated</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get the latest updates on our products, services and projects.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="pt-1">
                <div className="flex items-center bg-[#131F2D] rounded-xl border border-white/10 overflow-hidden focus-within:border-[#FF6B00]">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2.5 bg-[#FF6B00] hover:bg-[#E65A00] text-white flex items-center justify-center transition-colors flex-shrink-0"
                    title="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Bottom Copyright & Socials */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              &copy; 2026 Zarima Trading PLC. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="hover:text-[#FF6B00] transition-colors cursor-pointer">
                Facebook
              </span>
              <span>&bull;</span>
              <span className="hover:text-[#FF6B00] transition-colors cursor-pointer">
                LinkedIn
              </span>
              <span>&bull;</span>
              <span className="hover:text-[#FF6B00] transition-colors cursor-pointer">
                YouTube
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* ----------------------------------------------------------------- */}
      {/* 10. INTERACTIVE SERVICE DETAIL MODAL                               */}
      {/* ----------------------------------------------------------------- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0D1824] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Image Header */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden flex-shrink-0">
              <img
                src={activeModal.image}
                alt={activeModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1824] via-[#0D1824]/40 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest">
                  Service Specifications
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {activeModal.title}
                </h3>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p className="text-slate-300 font-medium">
                {activeModal.description}
              </p>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 text-[#FF6B00]">
                  Core Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeModal.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 text-[#FF6B00]">
                  Technical &amp; Operational Specs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModal.specs.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#09111A] border border-white/5">
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                        {s.label}
                      </div>
                      <div className="text-xs font-bold text-white mt-1">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-white/10 bg-[#09111A] flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
              <a
                href="#contact"
                onClick={() => setActiveModal(null)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <span>Request Allocation / Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
