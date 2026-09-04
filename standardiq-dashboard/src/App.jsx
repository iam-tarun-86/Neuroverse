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
  AlertCircle,
  XCircle,
  Award,
  SlidersHorizontal,
  Info,
  Loader2,
  Check,
  GitFork
} from 'lucide-react'
// MOCK_EXTRACTED_REQUIREMENTS removed — Tier 1 real LLM extraction now used

export default function App() {
  const [procurementText, setProcurementText] = useState('')
  const [sector, setSector] = useState('Electrical')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState('retrieval')
  const [results, setResults] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)
  const [latencyMs, setLatencyMs] = useState(null)
  const [requiresHumanReview, setRequiresHumanReview] = useState(false)
  const [humanReviewReason, setHumanReviewReason] = useState(null)

  const samplePrompts = [
    {
      label: 'PVC Cables (Electrical)',
      sector: 'Electrical',
      text: 'Procurement of heavy-duty PVC insulated and sheathed power cables for outdoor industrial distribution, 1.1kV rated voltage, multi-core copper conductor with steel wire armouring.'
    },
    {
      label: 'Arc Welding Cable (query-10)',
      sector: 'Electrical',
      text: 'Supply of 70 sq.mm extra-flexible annealed copper conductor single core rubber elastomer insulated welding cables for manual metal arc welding machine connection, oil and heat resistant.'
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

  const handleRecommend = async (e) => {
    if (e) e.preventDefault()
    if (!procurementText.trim() || isProcessing) return

    setIsProcessing(true)
    setError(null)
    setResults(null)
    setExtractedData(null)
    setLatencyMs(null)
    setLoadingPhase('retrieval')

    const startTime = performance.now()

    try {
      const response = await fetch('http://127.0.0.1:8000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: procurementText.trim(),
          top_k: 3
        })
      })

      if (!response.ok) {
        const errorDetail = await response.json().catch(() => null)
        throw new Error(
          errorDetail?.detail || `API responded with status ${response.status}`
        )
      }

      const data = await response.json()
      const elapsed = Math.round(performance.now() - startTime)
      setLatencyMs(elapsed)

      // Map real API response into existing result card structure
      const mappedResults = (data.results || []).map((item) => ({
        standard_id: item.standard_id,
        title: item.title,
        confidence: Math.round((item.similarity_score || 0) * 100),
        similarity_score: item.similarity_score,
        status: item.status,
        certification: item.certification,
        sector: item.sector,
        explanation: item.scope_text,
        superseded_warning: item.superseded_warning || false,
        warning_reason: item.warning_reason || null,
        allied_standards: item.allied_standards || null
      }))

      setResults(mappedResults)
      setRequiresHumanReview(data.requires_human_review || false)
      setHumanReviewReason(data.human_review_reason || null)

      // ── Tier 1: Wire real LLM extraction into the UI ──
      // Transform flat extraction fields into the {fields[], missing{}} shape the UI consumes.
      const ext = data.extraction
      if (ext) {
        const fields = []
        if (ext.voltage)     fields.push({ label: 'Voltage',     value: ext.voltage })
        if (ext.material)    fields.push({ label: 'Material',    value: ext.material })
        if (ext.environment) fields.push({ label: 'Environment', value: ext.environment })
        if (ext.application) fields.push({ label: 'Application', value: ext.application })
        if (ext.exclusions && ext.exclusions.length > 0) {
          fields.push({ label: 'Exclusions', value: ext.exclusions.join('; ') })
        }

        const missingList = ext.missing_fields || []
        const missing = missingList.length > 0
          ? {
              label: `Missing: ${missingList.slice(0, 2).join(', ')}${missingList.length > 2 ? ' +' + (missingList.length - 2) + ' more' : ''}`,
              detail: `The following parameters were not found in the query and may be required for precise standard selection: ${missingList.join(', ')}.`
            }
          : null

        setExtractedData({
          fields,
          missing,
          _llmLatencyMs: ext.latency_ms,
        })
      }
    } catch (err) {
      console.error('StandardIQ Recommendation Error:', err)
      setError(
        'Backend not reachable — is the FastAPI server running on port 8000?'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const loadSample = (sample) => {
    setProcurementText(sample.text)
    setSector(sample.sector)
    setResults(null)
    setExtractedData(null)
    setError(null)
    setLatencyMs(null)
    setRequiresHumanReview(false)
    setHumanReviewReason(null)
  }

  const handleClear = () => {
    setProcurementText('')
    setResults(null)
    setExtractedData(null)
    setError(null)
    setLatencyMs(null)
    setRequiresHumanReview(false)
    setHumanReviewReason(null)
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

  // Status tag styling for Active vs Superseded/Withdrawn on light background
  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return {
        style: 'bg-teal-50 text-teal-800 border-teal-300',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
      }
    }
    if (status === 'Withdrawn') {
      return {
        style: 'bg-rose-50 text-rose-900 border-rose-300',
        icon: <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
      }
    }
    return {
      style: 'bg-rose-50 text-rose-900 border-rose-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
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

        {/* Dedicated Loading Processing Panel (Active during real local inference) */}
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
                    Querying Local Standards Engine...
                  </h3>
                  <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full self-center sm:self-auto">
                    Live Local Pipeline
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generating dense vector embeddings with local BGE model and ranking standards from ChromaDB...
                </p>

                {/* Micro Progress Track */}
                <div className="mt-3.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div className="bg-teal-700 h-1.5 rounded-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error Alert State */}
        {error && !isProcessing && (
          <section className="bg-rose-50 border border-rose-300 rounded-2xl p-5 sm:p-6 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-sm sm:text-base font-bold text-rose-950 tracking-tight">
                    Backend Connection Error
                  </h3>
                  <span className="text-[11px] font-mono font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 self-start sm:self-auto">
                    FastAPI Offline
                  </span>
                </div>
                <p className="text-xs text-rose-900 mt-1.5 leading-relaxed font-medium">
                  {error}
                </p>
                <div className="mt-3 pt-3 border-t border-rose-200 flex flex-wrap items-center gap-2 text-[11px] text-rose-700 font-mono">
                  <span>Target: <strong>http://127.0.0.1:8000/recommend</strong></span>
                  <span>•</span>
                  <span>Start Server: <code className="bg-white/80 px-1.5 py-0.5 rounded text-rose-950 font-semibold border border-rose-200">python -m uvicorn app.main:app --port 8000</code></span>
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
                    Structured technical parameters — Local LLM (Qwen3.5-4B, air-gapped)
                    {extractedData._llmLatencyMs != null && (
                      <span className="ml-1.5 font-mono text-slate-400">{Math.round(extractedData._llmLatencyMs)}ms</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                  <Check className="w-3 h-3 text-teal-700" />
                  {extractedData.fields.length} Parameter{extractedData.fields.length !== 1 ? 's' : ''} Identified
                </span>
                {extractedData.missing && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 font-mono">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    Incomplete Spec
                  </span>
                )}
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

              {/* Warning Chip for Incomplete Specification (only when missing_fields present) */}
              {extractedData.missing && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{extractedData.missing.label}</span>
                </div>
              )}
            </div>

            {/* Subtext explaining the flagged missing requirement */}
            {extractedData.missing && (
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50/80 px-3.5 py-2.5 rounded-xl border border-amber-200">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">Requirement Guardrail: </span>
                  {extractedData.missing.detail}
                </div>
              </div>
            )}
          </section>
        )}


        {/* Results Section (Ranked Result Cards with Staggered Fade-in) */}
        {results && !isProcessing && (
          <section className="space-y-4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                  <Award className="w-4 h-4 text-teal-700" />
                  Applicable Indian Standards (Ranked Recommendations)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by dense semantic match & rule-verified status for sector: <span className="text-teal-800 font-semibold">{sector}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="font-semibold text-slate-800">{results.length} Standards Ranked</span>
                </div>
                {latencyMs !== null && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-teal-700 font-bold flex items-center gap-1">
                      <span>⚡</span> {latencyMs}ms
                    </span>
                  </>
                )}
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 text-[11px]">ChromaDB + BGE</span>
              </div>
            </div>

            {/* Human Verification Warning Banner for Low Confidence (<0.72) */}
            {requiresHumanReview && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5 animate-fade-in">
                <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm sm:text-base font-bold text-amber-950 tracking-tight">
                      Recommend Human Verification
                    </h4>
                    <span className="text-[11px] font-mono font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 self-start sm:self-auto">
                      Confidence Guardrail (&lt;72%)
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-1.5 leading-relaxed font-medium">
                    {humanReviewReason ||
                      'The top candidate match has a similarity score below the 72% confidence threshold. Manual engineering verification is recommended before citing in tender documents.'}
                  </p>
                </div>
              </div>
            )}

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

                      {/* Badges: Certification + Confidence Score + Status Tag */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Certification Scheme Tag */}
                        {item.certification && item.certification !== 'None' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                            {item.certification}
                          </span>
                        )}

                        {/* Status Tag (Active / Superseded / Withdrawn) */}
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
                          {item.similarity_score !== undefined && (
                            <span className="text-[10px] text-slate-400 font-mono ml-0.5">
                              ({(item.similarity_score * 100).toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Standard Title */}
                    <h4 className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed mb-3.5 pl-10">
                      {item.title}
                    </h4>

                    {/* Superseded / Withdrawn Compliance Alert Callout */}
                    {item.superseded_warning && (
                      <div className="pl-10 mb-3.5">
                        <div className="flex items-start gap-2.5 text-xs text-rose-900 bg-rose-50/90 border border-rose-300 px-3.5 py-2.5 rounded-xl">
                          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-rose-950">Compliance Alert: </span>
                            {item.warning_reason || 'This standard has been superseded or withdrawn. Do not cite in new procurement specifications.'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Allied & Normative Standards (Rendered exclusively on Rank #1) */}
                    {index === 0 && item.allied_standards && Object.keys(item.allied_standards).length > 0 && (
                      <div className="pl-10 mb-4 animate-fade-in">
                        <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                          {/* Allied Section Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
                                <GitFork className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                  Allied &amp; Normative Standards (Cross-Referenced)
                                </h5>
                                <p className="text-[11px] text-slate-500">
                                  Mandatory test methods, material specifications &amp; safety references
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="text-[10px] font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                                In-Memory Graph (1-Hop)
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                {Object.values(item.allied_standards).reduce((acc, curr) => acc + curr.length, 0)} Linked
                              </span>
                            </div>
                          </div>

                          {/* Grouped Allied Standards by Reference Type */}
                          <div className="space-y-3">
                            {Object.entries(item.allied_standards).map(([refType, stdList]) => {
                              const groupLabel =
                                stdList[0]?.reference_type_label ||
                                refType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

                              return (
                                <div key={refType} className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide font-mono">
                                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                      {groupLabel}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                      ({stdList.length})
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {stdList.map((allied) => (
                                      <div
                                        key={allied.standard_id}
                                        title={`${allied.standard_id}: ${allied.title} (${allied.status})`}
                                        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-teal-500 hover:bg-teal-50/20 transition-all text-xs group/chip cursor-default"
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                            allied.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-500'
                                          }`}
                                          title={`Status: ${allied.status}`}
                                        ></span>
                                        <span className="font-mono font-bold text-slate-900 group-hover/chip:text-teal-800 transition-colors">
                                          {allied.standard_id}
                                        </span>
                                        <span className="text-[11px] text-slate-500 max-w-[180px] sm:max-w-[280px] truncate border-l border-slate-200 pl-2 font-medium">
                                          {allied.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

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
