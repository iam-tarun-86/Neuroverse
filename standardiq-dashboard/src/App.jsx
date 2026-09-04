import React, { useState } from 'react'
import {
  ShieldCheck,
  Cpu,
  Database,
  FileCheck,
  Lock,
  Sparkles,
  FileText,
  Layers,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  SlidersHorizontal,
  Info,
  Loader2,
  Check
} from 'lucide-react'
import {
  MOCK_STANDARDS_BY_SECTOR,
  DEFAULT_MOCK_RESULTS,
  MOCK_EXTRACTED_REQUIREMENTS
} from './data/mockStandards'

export default function App() {
  const [procurementText, setProcurementText] = useState('')
  const [sector, setSector] = useState('Electrical')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState('parsing')
  const [results, setResults] = useState(null)
  const [extractedData, setExtractedData] = useState(null)

  const samplePrompts = [
    {
      label: 'PVC Cables (Electrical)',
      sector: 'Electrical',
      text: 'Procurement of heavy-duty PVC insulated and sheathed power cables for outdoor industrial distribution, 1.1kV rated voltage, multi-core copper conductor with steel wire armouring.'
    },
    {
      label: 'PPC Cement (Civil)',
      sector: 'Civil/Construction',
      text: 'Supply of Portland Pozzolana Cement (fly ash based) for structural RCC columns and foundation footing in coastal environment requiring sulphate resistance.'
    },
    {
      label: 'Biometric Devices (IT)',
      sector: 'IT/Electronics',
      text: 'Supply of optical fingerprint scanners with STQC certification, Aadhaar-enabled biometric authentication (L1 compliant), USB 2.0 interface, IP54 dust and splash proofing.'
    }
  ]

  const handleRecommend = (e) => {
    if (e) e.preventDefault()
    if (!procurementText.trim() || isProcessing) return

    setIsProcessing(true)
    setResults(null)
    setExtractedData(null)
    setLoadingPhase('parsing')

    // Phase 1: Requirement parsing
    const timer1 = setTimeout(() => {
      setLoadingPhase('retrieval')
    }, 450)

    // Phase 2: Vector retrieval & rule validation
    const timer2 = setTimeout(() => {
      setLoadingPhase('verification')
    }, 850)

    // Phase 3: Finalize after ~1.25s (1-1.5s simulated processing)
    const timer3 = setTimeout(() => {
      const matchedData = MOCK_STANDARDS_BY_SECTOR[sector] || DEFAULT_MOCK_RESULTS
      const sortedResults = [...matchedData].sort((a, b) => b.confidence - a.confidence)
      const parsedReqs = MOCK_EXTRACTED_REQUIREMENTS[sector] || MOCK_EXTRACTED_REQUIREMENTS.Electrical

      setResults(sortedResults)
      setExtractedData(parsedReqs)
      setIsProcessing(false)
    }, 1250)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }

  const loadSample = (sample) => {
    setProcurementText(sample.text)
    setSector(sample.sector)
    setResults(null)
    setExtractedData(null)
  }

  const handleClear = () => {
    setProcurementText('')
    setResults(null)
    setExtractedData(null)
  }

  // Confidence badge color mapping for light enterprise theme (high contrast against light backgrounds)
  const getConfidenceBadge = (score) => {
    if (score > 80) {
      return {
        badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dotStyle: 'bg-emerald-600',
        label: `${score}% Match`,
        tier: 'High Confidence'
      }
    }
    if (score >= 50) {
      return {
        badgeStyle: 'bg-amber-50 text-amber-900 border-amber-300',
        dotStyle: 'bg-amber-600',
        label: `${score}% Match`,
        tier: 'Moderate'
      }
    }
    return {
      badgeStyle: 'bg-rose-50 text-rose-900 border-rose-300',
      dotStyle: 'bg-rose-600',
      label: `${score}% Match`,
      tier: 'Low Confidence'
    }
  }

  // Status tag styling for Active vs Superseded on light background
  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return {
        style: 'bg-teal-50 text-teal-800 border-teal-300',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
      }
    }
    return {
      style: 'bg-rose-50 text-rose-900 border-rose-300',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 antialiased">
      {/* Top Enterprise / Government Air-Gapped Banner */}
      <div className="w-full bg-slate-100 border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-600 flex items-center justify-between tracking-wide">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 tracking-wider">
            AIR-GAPPED
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            100% On-Premise Deployment — Zero Data Egress Guaranteed
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Local Inference: <strong className="text-slate-800 font-semibold">BGE-M3 + QLoRA LLM</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>Corpus: <strong className="text-teal-800 font-mono font-semibold">BIS Curated 2026</strong></span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-18 flex items-center justify-between">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Standard<span className="text-teal-700">IQ</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-teal-50 text-teal-800 border border-teal-200">
                  BIS Procurement AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                AI-Powered Standards Intelligence — <span className="text-teal-800 font-semibold">100% Local</span>
              </p>
            </div>
          </div>

          {/* Header Status Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Database className="w-3.5 h-3.5 text-teal-700" />
              <span className="text-slate-500">Indexed Standards:</span>
              <span className="font-bold text-slate-800 font-mono">500+</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-xs text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
              <span className="font-semibold">System Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area (Clean Enterprise Spacing on 1440px displays) */}
      <main className="flex-1 max-w-6xl xl:max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 flex flex-col gap-7">
        {/* Input Section */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 xl:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
                <FileText className="w-4 h-4 text-teal-700" />
                Procurement Specification Input
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Describe the procurement item, technical requirements, or paste tender clauses to match relevant Indian Standards.
              </p>
            </div>

            {procurementText && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isProcessing}
                className="self-start sm:self-auto text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Input
              </button>
            )}
          </div>

          <form onSubmit={handleRecommend} className="space-y-4">
            {/* Textarea */}
            <div className="relative">
              <textarea
                value={procurementText}
                onChange={(e) => setProcurementText(e.target.value)}
                disabled={isProcessing}
                rows={5}
                placeholder="Describe what you're procuring... e.g. PVC insulated cables for outdoor use, 1.1kV"
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 text-slate-800 placeholder:text-slate-400 rounded-xl p-4 text-sm font-sans resize-y min-h-[140px] leading-relaxed shadow-xs transition-all disabled:opacity-60"
              />
              <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 pointer-events-none font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                {procurementText.length} characters
              </div>
            </div>

            {/* Quick Demo Preset Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Demo Presets:
              </span>
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(sample)}
                  disabled={isProcessing}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-150 active:scale-95 cursor-pointer font-medium disabled:opacity-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Sector Dropdown & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              {/* Sector Selection */}
              <div className="flex items-center gap-3">
                <label htmlFor="sector-select" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Sector:
                </label>
                <div className="relative">
                  <select
                    id="sector-select"
                    value={sector}
                    disabled={isProcessing}
                    onChange={(e) => {
                      setSector(e.target.value)
                      if (results) {
                        setResults(null)
                        setExtractedData(null)
                      }
                    }}
                    className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/15 focus:border-teal-700 cursor-pointer transition-all shadow-xs disabled:opacity-60"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Civil/Construction">Civil/Construction</option>
                    <option value="IT/Electronics">IT/Electronics</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Recommend Button */}
              <button
                type="submit"
                disabled={!procurementText.trim() || isProcessing}
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm ${
                  procurementText.trim() && !isProcessing
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-[0.98]'
                    : isProcessing
                    ? 'bg-slate-800 text-teal-300 border border-slate-700 cursor-wait animate-pulse-glow'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                    <span>Analyzing specification...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Recommend Standards</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Dedicated Loading Processing Panel (Active during simulated 1-1.5s inference) */}
        {isProcessing && (
          <section className="bg-white border border-teal-200 rounded-2xl p-6 sm:p-7 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 shrink-0">
                <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                    Analyzing specification...
                  </h3>
                  <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full self-center sm:self-auto">
                    Local Inference Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {loadingPhase === 'parsing' && 'Extracting technical parameters & detecting ambiguity via Fine-Tuned LLM...'}
                  {loadingPhase === 'retrieval' && 'Generating BGE-M3 dense embeddings and querying ChromaDB vector store...'}
                  {loadingPhase === 'verification' && 'Running rule-based verification against BIS Quality Control Orders (QCO)...'}
                </p>

                {/* Micro Progress Track */}
                <div className="mt-3.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-teal-700 h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width:
                        loadingPhase === 'parsing'
                          ? '35%'
                          : loadingPhase === 'retrieval'
                          ? '70%'
                          : '95%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Extracted Requirements Section (Appears above results upon completion) */}
        {extractedData && !isProcessing && (
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    Extracted Requirements
                  </h3>
                  <p className="text-xs text-slate-500">
                    Structured technical parameters parsed by Local Fine-Tuned LLM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                  <Check className="w-3 h-3 text-teal-700" />
                  4 Parameters Identified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 font-mono">
                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                  1 Incomplete Warning
                </span>
              </div>
            </div>

            {/* Chips / Tags for Structured Fields */}
            <div className="flex flex-wrap items-center gap-2.5">
              {extractedData.fields.map((field, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <span className="text-slate-500 font-medium">{field.label}:</span>
                  <span className="font-bold text-slate-900 font-mono">{field.value}</span>
                </div>
              ))}

              {/* Warning Chip for Incomplete Specification (High contrast on light background) */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{extractedData.missing.label}</span>
              </div>
            </div>

            {/* Subtext explaining the flagged missing requirement */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50/80 px-3.5 py-2.5 rounded-xl border border-amber-200">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950">Requirement Guardrail: </span>
                {extractedData.missing.detail}
              </div>
            </div>
          </section>
        )}

        {/* Results Section (Ranked Result Cards with Staggered Fade-in) */}
        {results && !isProcessing && (
          <section className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between px-1 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                  <Award className="w-4 h-4 text-teal-700" />
                  Applicable Indian Standards (Ranked Recommendations)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by dense semantic match & rule-verified status for sector: <span className="text-teal-800 font-semibold">{sector}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-mono bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-semibold">{results.length} Standards Ranked</span>
              </div>
            </div>

            {/* Ranked Result Cards */}
            <div className="grid grid-cols-1 gap-4">
              {results.map((item, index) => {
                const conf = getConfidenceBadge(item.confidence)
                const statusBadge = getStatusBadge(item.status)

                return (
                  <div
                    key={item.standard_id}
                    style={{ animationDelay: `${index * 130}ms` }}
                    className="relative bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md group shadow-xs animate-fade-in-up"
                  >
                    {/* Top Row: Rank, Standard ID, Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        {/* Numerical Rank Badge */}
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold font-mono border border-slate-200">
                          #{index + 1}
                        </span>

                        {/* Standard ID */}
                        <span className="text-sm sm:text-base font-bold text-slate-900 font-mono tracking-tight group-hover:text-teal-800 transition-colors">
                          {item.standard_id}
                        </span>
                      </div>

                      {/* Badges: Confidence Score + Status Tag */}
                      <div className="flex items-center gap-2.5">
                        {/* Status Tag (Active / Superseded) */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.style}`}
                        >
                          {statusBadge.icon}
                          <span>{item.status}</span>
                        </span>

                        {/* Colored Confidence Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${conf.badgeStyle}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dotStyle}`}></span>
                          <span className="font-mono">{conf.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Standard Title */}
                    <h4 className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed mb-3.5 pl-10">
                      {item.title}
                    </h4>

                    {/* Explanation Text in Smaller Muted Text */}
                    <div className="pl-10 pt-3.5 border-t border-slate-100">
                      <div className="flex items-start gap-2.5">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider shrink-0 mt-0.5 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                          Evidence
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Pipeline Architecture Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-colors flex items-center gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Local Fine-Tuned LLM</div>
              <div className="text-[11px] text-slate-500">Domain-adapted extraction & ambiguity detection</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-colors flex items-center gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">BGE-M3 Dense Retrieval</div>
              <div className="text-[11px] text-slate-500">Semantic vector search over verified BIS corpus</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-colors flex items-center gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Rule-Based Guardrail</div>
              <div className="text-[11px] text-slate-500">Version verification & QCO compliance check</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Dedicated Local Processing Guarantee */}
      <footer className="w-full border-t border-slate-200/90 bg-slate-100/80 py-6 text-xs text-slate-600 mt-auto">
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col items-center gap-4">
          {/* Prominent Footer Note Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="tracking-wide">100% Local Processing • Zero Data Egress • Explainable AI</span>
          </div>

          {/* Copyright & Organization Subtext */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-200 text-slate-500 text-[11px]">
            <p className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">StandardIQ</span> — Smart India Hackathon 2026 • Team Neuroverse
            </p>
            <div className="flex items-center gap-3 text-slate-500">
              <span>Bureau of Indian Standards (BIS) Procurement Compliance</span>
              <span>•</span>
              <span className="text-teal-800 font-mono font-medium">Government-Deployable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
