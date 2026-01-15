'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  HardHat,
  CheckCircle2,
  Clock,
  Shield,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  Building2,
  Sparkles,
  FileText,
  Star,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { LeadForm } from '@/components/forms/lead-form'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function LandingPage() {
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-safety rounded-lg flex items-center justify-center">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-slate-100">
                  Garden State
                </span>
                <span className="hidden sm:inline font-heading font-bold text-lg text-safety ml-1">
                  Cleaning
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Button
                variant="industrial"
                size="sm"
                onClick={() => setBidModalOpen(true)}
              >
                Get a Bid
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 grid-overlay" />
          <div className="absolute inset-0 noise-overlay" />

          {/* Geometric Accents */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-safety/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-safety/5 rounded-full blur-[120px]" />

          {/* Diagonal Lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.03]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="diagonalLines"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20"
                  stroke="#ea580c"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalLines)" />
          </svg>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safety/10 border border-safety/20 mb-8"
            >
              <Shield className="w-4 h-4 text-safety" />
              <span className="text-sm font-medium text-safety">
                The Super-Verified Clean
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-100 leading-tight mb-6"
            >
              Don't Let a Bad Clean
              <br />
              <span className="text-gradient-orange">Delay Your CO</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8"
            >
              Post-construction cleaning by a former Super who speaks your language.
              <br className="hidden sm:block" />
              No more explaining what "ready for paint" means. No more failed inspections from dust in mechanical rooms.
            </motion.p>

            {/* Trust Badge */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-10"
            >
              <HardHat className="w-4 h-4 text-safety" />
              <span>
                Managed by a former Super. We know what "Ready for Paint" means.
              </span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="industrial"
                size="xl"
                onClick={scrollToForm}
                className="group"
              >
                Request a Site Walk
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => setBidModalOpen(true)}
              >
                <FileText className="mr-2 w-5 h-5" />
                Upload Plans for Bid
              </Button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-slate-600"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Every Phase, Done Right
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From drywall dust to final polish – we handle it all with the
              precision your timeline demands.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Rough Clean',
                description:
                  'Heavy debris, drywall dust, and construction waste removal. Protects MEP systems from contamination.',
                includes: ['Debris removal', 'Dust control', 'Floor sweeping', 'MEP protection'],
                icon: Building2,
                color: 'from-orange-500/20 to-orange-600/5',
              },
              {
                title: 'Final Clean',
                description:
                  'Inspection-ready finish. All surfaces, windows, and fixtures cleaned to municipal standards.',
                includes: ['Window washing', 'Floor scrubbing', 'Fixture detailing', 'Paint splatter removal'],
                icon: Sparkles,
                color: 'from-cyan-500/20 to-cyan-600/5',
              },
              {
                title: 'Punch List',
                description:
                  'Detail work and corrections. Addresses inspector comments and prepares for CO approval.',
                includes: ['Touch-ups', 'Detail cleaning', 'Inspector notes', 'CO prep'],
                icon: CheckCircle2,
                color: 'from-green-500/20 to-green-600/5',
              },
              {
                title: 'Turnover',
                description:
                  'Move-in ready white-glove clean. Removes construction residue, ensures tenant-ready presentation.',
                includes: ['Deep clean', 'Dust removal', 'Odor elimination', 'Final walkthrough'],
                icon: Star,
                color: 'from-purple-500/20 to-purple-600/5',
              },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group card-industrial p-6 hover:scale-[1.02] transition-all duration-300"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4',
                    service.color
                  )}
                >
                  <service.icon className="w-6 h-6 text-slate-200" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-100 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4">{service.description}</p>
                <div className="space-y-1">
                  {service.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-safety flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Health & Safety Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-6">
                Construction Dust Isn't Just Unsightly—
                <span className="text-gradient-orange"> It's Hazardous</span>
              </h2>
              <div className="space-y-4 text-slate-400">
                <p>
                  Drywall particulates, silica dust, paint fumes, adhesive residue—post-construction sites are filled with airborne contaminants that can delay occupancy and pose health risks.
                </p>
                <p>
                  Unlike residential cleaners, we understand proper dust containment, ventilation requirements, and the difference between "looks clean" and "tests clean."
                </p>
                <p className="font-medium text-slate-300">
                  Our process removes hazardous particulates before they settle into HVAC systems, compromise indoor air quality, or trigger inspector flags.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Silica Dust', danger: 'OSHA hazard' },
                { label: 'VOCs & Fumes', danger: 'Air quality risk' },
                { label: 'Metal Shavings', danger: 'Injury risk' },
                { label: 'Chemical Residue', danger: 'Contamination' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="card-industrial p-6 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 mb-1">
                    {item.label}
                  </h4>
                  <p className="text-xs text-red-400">{item.danger}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Dave Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image/Visual */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 overflow-hidden">
                {/* Placeholder for Dave's image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-safety/20 flex items-center justify-center">
                      <HardHat className="w-16 h-16 text-safety" />
                    </div>
                    <div className="font-heading text-2xl font-bold text-slate-100">
                      Dave
                    </div>
                    <div className="text-slate-400">Founder & Former Super</div>
                  </div>
                </div>

                {/* Decorative grid */}
                <div className="absolute inset-0 grid-overlay opacity-50" />
              </div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -right-6 bg-slate-900 border border-slate-700/50 rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-safety/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-safety" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-2xl text-slate-100">
                      NJIT
                    </div>
                    <div className="text-sm text-slate-400">
                      Engineering Grad
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safety/10 border border-safety/20 mb-6">
                <span className="text-sm font-medium text-safety">
                  About Dave
                </span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-6">
                A Super Who Knows
                <br />
                <span className="text-gradient-orange">What Clean Means</span>
              </h2>

              <div className="space-y-4 text-slate-400 mb-8">
                <p>
                  After years running construction sites as a Superintendent, I
                  saw the same problem over and over: cleaning crews that didn't
                  understand the job. They'd miss corners, leave debris in
                  mechanical rooms, and cost projects valuable time.
                </p>
                <p>
                  I built Garden State Cleaning to fix that. As an NJIT
                  Engineering grad and former Super, I know exactly what
                  inspectors look for. I know the difference between "Rough
                  Clean" and "Final Clean." I know that a missed window track
                  can delay your CO.
                </p>
                <p className="font-medium text-slate-300">
                  When we clean a site, it's Super-Verified – because I've been
                  the one signing off on the other side.
                </p>
              </div>

              <div className="flex flex-wrap gap-6">
                {[
                  { label: 'Years in Construction', value: '10+' },
                  { label: 'Projects Completed', value: '200+' },
                  { label: 'Inspection Pass Rate', value: '99%' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-heading text-3xl font-bold text-safety">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Why GCs Choose Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: '24-Hour Response',
                description:
                  "Schedule slipped? Inspector coming tomorrow? We mobilize same-day for rush jobs. Your timeline is our priority.",
              },
              {
                icon: Shield,
                title: 'Fully Insured & Bonded',
                description:
                  '$2M general liability coverage. Workers comp included. Zero risk to your project or certificate of occupancy.',
              },
              {
                icon: CheckCircle2,
                title: 'Inspection Pass Guarantee',
                description:
                  "If your site doesn't pass inspection due to cleanliness, we return immediately at no charge. That's our promise.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-safety/10 border border-safety/20 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-safety" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Estimates Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Transparent Pricing Estimates
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every project is unique, but here's what you can expect. Final pricing depends on site conditions, timeline, and specific requirements.
            </p>
          </motion.div>

          {/* Pricing Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-slate-800 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Square Footage
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Rough Clean
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Final Clean
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Punch/Turnover
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      { range: '1,000 - 2,500 sq ft', rough: '2 crew, 3-4 hrs', final: '2 crew, 4-6 hrs', punch: '1-2 crew, 2-3 hrs' },
                      { range: '2,500 - 5,000 sq ft', rough: '3 crew, 4-6 hrs', final: '3 crew, 6-8 hrs', punch: '2 crew, 3-4 hrs' },
                      { range: '5,000 - 10,000 sq ft', rough: '4 crew, 6-8 hrs', final: '4 crew, 8-10 hrs', punch: '2-3 crew, 4-6 hrs' },
                      { range: '10,000+ sq ft', rough: 'Custom quote', final: 'Custom quote', punch: 'Custom quote' },
                    ].map((row, i) => (
                      <tr key={i} className="bg-slate-900/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                          {row.range}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {row.rough}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {row.final}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {row.punch}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Pricing Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 grid md:grid-cols-3 gap-6"
          >
            <div className="card-industrial p-6">
              <h4 className="font-semibold text-slate-100 mb-2">What's Included</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• All equipment & supplies</li>
                <li>• Waste removal & disposal</li>
                <li>• Site photos for your records</li>
                <li>• Inspection-ready guarantee</li>
              </ul>
            </div>
            <div className="card-industrial p-6">
              <h4 className="font-semibold text-slate-100 mb-2">Rush Service Available</h4>
              <p className="text-sm text-slate-400">
                Need it done faster? We can mobilize same-day for emergency cleans. Contact us for rush pricing.
              </p>
            </div>
            <div className="card-industrial p-6">
              <h4 className="font-semibold text-slate-100 mb-2">Volume Discounts</h4>
              <p className="text-sm text-slate-400">
                Multiple units or ongoing projects? Ask about our preferred GC rates and package pricing.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section
        ref={formRef}
        id="contact"
        className="py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
        <div className="absolute inset-0 grid-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-6">
                Get Your CO Faster
                <br />
                <span className="text-gradient-orange">With a Super-Verified Clean</span>
              </h2>

              <p className="text-slate-400 mb-8">
                Request a free site walk and transparent quote. Dave personally reviews every project—no sales reps, no runarounds. If your site is in Northern NJ and you need it done right, we'll be there.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-safety" />
                  </div>
                  <span>Serving Northern New Jersey</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-safety" />
                  </div>
                  <a
                    href="mailto:gardenstatecleaningdave@gmail.com"
                    className="hover:text-safety transition-colors"
                  >
                    gardenstatecleaningdave@gmail.com
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-industrial p-8"
            >
              <LeadForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-safety rounded-lg flex items-center justify-center">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-slate-100">
                  Garden State Cleaning
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Garden State Cleaning. All rights
              reserved.
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Link href="/login" className="hover:text-slate-300">
                Team Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Bid Modal */}
      <Dialog open={bidModalOpen} onOpenChange={setBidModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Get a Bid for Your Project
            </DialogTitle>
            <DialogDescription>
              Tell us about your project and we'll get back to you with a
              competitive quote.
            </DialogDescription>
          </DialogHeader>
          <LeadForm onSuccess={() => setBidModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
