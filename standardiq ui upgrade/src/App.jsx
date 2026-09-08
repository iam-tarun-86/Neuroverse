import React, { useState, useEffect } from 'react'
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
  GitFork,
  Search,
  Copy,
  Building2,
  Scale,
  FileSpreadsheet,
  BookOpen,
  User,
  KeyRound,
  LogIn,
  LogOut,
  ArrowLeft,
  UserCheck,
  Shield,
  UserPlus,
  Users,
  Trash2,
  Clock,
  Mail,
  LockKeyhole
} from 'lucide-react'

// Indian State Emblem (Lion Capital of Ashoka) SVG
function AshokaEmblem({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="22" r="16" stroke="#b45309" strokeWidth="2.5" fill="#fef3c7" />
      <path d="M40 22 C40 16 60 16 60 22 C60 28 40 28 40 22" fill="#b45309" />
      <circle cx="34" cy="26" r="8" stroke="#b45309" strokeWidth="2" fill="#fde68a" />
      <circle cx="66" cy="26" r="8" stroke="#b45309" strokeWidth="2" fill="#fde68a" />
      <rect x="25" y="44" width="50" height="12" rx="3" fill="#b45309" />
      <circle cx="50" cy="50" r="5" stroke="#1e3a8a" strokeWidth="1.5" fill="#ffffff" />
      <line x1="50" y1="45" x2="50" y2="55" stroke="#1e3a8a" strokeWidth="1" />
      <line x1="45" y1="50" x2="55" y2="50" stroke="#1e3a8a" strokeWidth="1" />
      <path d="M20 58 L80 58 L86 76 L14 76 Z" fill="#92400e" />
      <rect x="16" y="78" width="68" height="6" rx="1.5" fill="#78350f" />
      <rect x="10" y="88" width="80" height="16" rx="3" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="50" y="99" textAnchor="middle" fill="#78350f" fontSize="7.5" fontWeight="bold" fontFamily="serif">सत्यमेव जयते</text>
      <text x="50" y="114" textAnchor="middle" fill="#1e3a8a" fontSize="6.5" fontWeight="bold">GOVT. OF INDIA</text>
    </svg>
  )
}

// BIS Manak Symbol SVG
function BISLogo({ className = "w-9 h-9" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="90" rx="16" fill="#1e3a8a" stroke="#d97706" strokeWidth="3" />
      <circle cx="50" cy="50" r="32" stroke="#ffffff" strokeWidth="3.5" />
      <path d="M50 24 L50 76 M24 50 L76 50 M32 32 L68 68 M32 68 L68 32" stroke="#fbbf24" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="10" fill="#dc2626" />
      <text x="50" y="54" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">BIS</text>
      <text x="50" y="92" textAnchor="middle" fill="#fbbf24" fontSize="6.5" fontWeight="bold">मानक: पथप्रदर्शक:</text>
    </svg>
  )
}

// Default initial user data
const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Directorate Administrator',
    email: 'admin@gmail.com',
    password: 'admin@123',
    role: 'Admin',
    status: 'approved',
    createdAt: '2026-09-01'
  },
  {
    id: 'usr-1',
    name: 'Shri Rajesh Sharma',
    email: 'officer@gov.in',
    password: 'officer@123',
    role: 'Procurement Officer',
    status: 'approved',
    createdAt: '2026-09-03'
  }
]

// Default initial waitlist requests
const INITIAL_WAITLIST = [
  {
    id: 'req-1',
    name: 'Er. Vikram Malhotra',
    email: 'vikram.malhotra@cpwd.gov.in',
    password: 'vikram@password',
    role: 'Procurement Engineer (CPWD)',
    status: 'pending',
    requestedAt: '2026-09-07 15:45'
  }
]

const API_BASE = 'http://127.0.0.1:8000/api'
const authChannel = typeof window !== 'undefined' && window.BroadcastChannel ? new BroadcastChannel('standardiq_auth_sync') : null

export default function App() {
  // Navigation State: 'home' | 'auth' | 'dashboard' | 'admin-users'
  const [currentPage, setCurrentPage] = useState('home')
  const [authMode, setAuthMode] = useState('signin') // 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState('recommender') // recommender | registry | tender | about

  // User Accounts Database (stored in localStorage with backend sync)
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('manak_ai_users_db')
      return saved ? JSON.parse(saved) : INITIAL_USERS
    } catch {
      return INITIAL_USERS
    }
  })

  // Pending Waitlist Requests (stored in localStorage with backend sync)
  const [waitlistRequests, setWaitlistRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('manak_ai_waitlist_db')
      return saved ? JSON.parse(saved) : INITIAL_WAITLIST
    } catch {
      return INITIAL_WAITLIST
    }
  })

  // Active User Session (stored in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('manak_ai_session_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Admin role check
  const isAdmin = currentUser?.email?.toLowerCase() === 'admin@gmail.com' || currentUser?.role === 'Admin'

  // Count pending waitlist requests
  const pendingRequestsCount = waitlistRequests.filter(r => r.status === 'pending').length

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('manak_ai_users_db', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('manak_ai_waitlist_db', JSON.stringify(waitlistRequests))
  }, [waitlistRequests])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('manak_ai_session_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('manak_ai_session_user')
    }
  }, [currentUser])

  // Centralized function to fetch fresh users and waitlist from FastAPI backend
  const fetchRemoteData = async () => {
    try {
      const [waitlistRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/waitlist`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/admin/users`).then(r => r.ok ? r.json() : null).catch(() => null)
      ])
      if (waitlistRes && Array.isArray(waitlistRes.waitlist)) {
        setWaitlistRequests(waitlistRes.waitlist)
      }
      if (usersRes && Array.isArray(usersRes.users)) {
        setUsers(usersRes.users)
      }
    } catch {
      // Offline fallback: continue using cached state
    }
  }

  // Initial load and cross-tab/multi-window synchronization
  useEffect(() => {
    fetchRemoteData()

    if (authChannel) {
      authChannel.onmessage = (event) => {
        if (event.data?.type === 'AUTH_SYNC' || event.data?.type === 'NEW_SIGNUP') {
          fetchRemoteData()
        }
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'manak_ai_waitlist_db' && e.newValue) {
        try { setWaitlistRequests(JSON.parse(e.newValue)) } catch {}
      }
      if (e.key === 'manak_ai_users_db' && e.newValue) {
        try { setUsers(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Poll backend every 3 seconds for instant updates when admin is logged in
  useEffect(() => {
    if (!isAdmin) return
    const pollInterval = setInterval(() => {
      fetchRemoteData()
    }, 3000)
    return () => clearInterval(pollInterval)
  }, [isAdmin])


  // Sign In Form State (Only Email & Password)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState(null)
  const [loginSuccessNotice, setLoginSuccessNotice] = useState(null)

  // Sign Up Form State
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupRole, setSignupRole] = useState('Procurement Officer')
  const [signupError, setSignupError] = useState(null)
  const [signupSubmitted, setSignupSubmitted] = useState(false)

  // Admin Direct Add User Form State
  const [adminNewName, setAdminNewName] = useState('')
  const [adminNewEmail, setAdminNewEmail] = useState('')
  const [adminNewPassword, setAdminNewPassword] = useState('')
  const [adminNewRole, setAdminNewRole] = useState('Procurement Officer')
  const [adminActionNotice, setAdminActionNotice] = useState(null)

  // Recommender Engine State
  const [procurementText, setProcurementText] = useState('')
  const [sector, setSector] = useState('Electrical')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)
  const [latencyMs, setLatencyMs] = useState(null)
  const [requiresHumanReview, setRequiresHumanReview] = useState(false)
  const [humanReviewReason, setHumanReviewReason] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [registrySearch, setRegistrySearch] = useState('')

  // Standardized Sample Prompts
  const samplePrompts = [
    {
      label: '⚡ PVC Power Cables (IS 1554 / IS 694)',
      sector: 'Electrical',
      tenderRef: 'GeM/2026/B/881290 - CPWD Electrification',
      text: 'Procurement of heavy-duty PVC insulated and sheathed power cables for outdoor industrial distribution, 1.1kV rated voltage, multi-core copper conductor with steel wire armouring.'
    },
    {
      label: '🔥 Arc Welding Rubber Cables (IS 9857)',
      sector: 'Electrical',
      tenderRef: 'BHEL/WELD/2026/04 - Heavy Electricals',
      text: 'Supply of 70 sq.mm extra-flexible annealed copper conductor single core rubber elastomer insulated welding cables for manual metal arc welding machine connection, oil and heat resistant.'
    },
    {
      label: '🏗️ PPC Portland Pozzolana Cement (IS 1489)',
      sector: 'Civil/Construction',
      tenderRef: 'NHAI/HIGHWAY/STRUCT/2026 - Bridge Piers',
      text: 'Supply of Portland Pozzolana Cement (fly ash based) for structural RCC columns and foundation footing in coastal environment requiring sulphate resistance.'
    },
    {
      label: '🔐 Aadhaar Biometric L1 Scanners (IS 13252 / STQC)',
      sector: 'IT/Electronics',
      tenderRef: 'UIDAI/AUTH/DEV/2026 - National ID Project',
      text: 'Supply of optical fingerprint scanners with STQC certification, Aadhaar-enabled biometric authentication (L1 compliant), USB 2.0 interface, IP54 dust and splash proofing.'
    },
    {
      label: '💧 UPVC Water Supply Pipes (IS 4985)',
      sector: 'Civil/Construction',
      tenderRef: 'Jal Jeevan Mission / Rural Water Supply 2026',
      text: 'Supply of unplasticized polyvinyl chloride (uPVC) pipes for potable water supplies, Class 3 (0.6 MPa), plain ended with solvent cement jointing.'
    }
  ]

  // Curated Standards Registry Table Data
  const standardsRegistry = [
    { id: 'IS 694 : 2010', title: 'PVC Insulated Cables for Working Voltages up to and including 1100 V', sector: 'Electrical', status: 'Active', cert: 'ISI Mark Mandatory', qco: 'QCO S.O. 2023/110', gazette: 'Gazette 2010-04-15' },
    { id: 'IS 1554 (Part 1) : 1988', title: 'PVC Insulated (Heavy Duty) Electric Cables - For Working Voltages up to 1100 V', sector: 'Electrical', status: 'Active', cert: 'ISI Mark Mandatory', qco: 'QCO S.O. 2023/110', gazette: 'Gazette 1988-12-20' },
    { id: 'IS 7098 (Part 1) : 1988', title: 'Crosslinked Polyethylene (XLPE) Insulated PVC Sheathed Cables up to 1100 V', sector: 'Electrical', status: 'Active', cert: 'ISI Mark Mandatory', qco: 'QCO S.O. 2023/110', gazette: 'Gazette 1988-09-12' },
    { id: 'IS 9857 : 1990', title: 'Welding Cables - Specification (Rubber Elastomer Insulated)', sector: 'Electrical', status: 'Active', cert: 'ISI Mark Mandatory', qco: 'QCO S.O. 2022/450', gazette: 'Gazette 1990-06-30' },
    { id: 'IS 1489 (Part 1) : 2015', title: 'Portland Pozzolana Cement - Fly Ash Based', sector: 'Civil/Construction', status: 'Active', cert: 'ISI Mark Mandatory', qco: 'Cement QCO 2024', gazette: 'Gazette 2015-08-01' },
    { id: 'IS 269 : 2015', title: 'Ordinary Portland Cement (33, 43 and 53 Grades) - Specification', sector: 'Civil/Construction', status: 'Active', cert: 'ISI Mark Mandatory', qco: 'Cement QCO 2024', gazette: 'Gazette 2015-05-18' },
    { id: 'IS 4985 : 2021', title: 'Unplasticized PVC Pipes for Potable Water Supplies - Specification', sector: 'Civil/Construction', status: 'Active', cert: 'ISI Mark Mandatory', qco: 'Pipes QCO 2023', gazette: 'Gazette 2021-11-10' },
    { id: 'IS 13252 (Part 1) : 2010', title: 'Information Technology Equipment - Safety - General Requirements', sector: 'IT/Electronics', status: 'Active', cert: 'Compulsory Registration (CRS)', qco: 'MeitY CRO 2021', gazette: 'Gazette 2010-10-05' },
    { id: 'IS 1554 (Part 2) : 1988', title: 'PVC Insulated Electric Cables for Working Voltages from 3.3 kV up to 11 kV', sector: 'Electrical', status: 'Superseded', cert: 'Replaced by IS 7098 Pt 2', qco: 'Withdrawn Notice 2019', gazette: 'Gazette 1988-12-20' },
    { id: 'IS 434 (Part 1) : 1964', title: 'Rubber Insulated Cables - Withdrawn Specification', sector: 'Electrical', status: 'Withdrawn', cert: 'Withdrawn', qco: 'Superseded by IS 9968', gazette: 'Gazette 1964-01-01' }
  ]

  // Handle Login: checks active users and waitlist (Backend first with offline fallback)
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError(null)

    const email = loginEmail.trim().toLowerCase()
    const password = loginPassword.trim()

    if (!email || !password) {
      setLoginError('Please enter both Email ID and Password.')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        const user = data.user
        setCurrentUser(user)
        setLoginError(null)

        // Refresh remote waitlist & user database
        await fetchRemoteData()

        // If admin logged in, check if there are pending requests
        const isUserAdmin = user.email?.toLowerCase() === 'admin@gmail.com' || user.role === 'Admin'
        if (isUserAdmin) {
          try {
            const waitlistRes = await fetch(`${API_BASE}/admin/waitlist`).then(r => r.json())
            const pending = (waitlistRes?.waitlist || []).filter(r => r.status === 'pending')
            if (pending.length > 0) {
              // Direct Admin to User Management tab to review the pending requests immediately!
              setCurrentPage('admin-users')
              return
            }
          } catch {}
        }
        setCurrentPage('dashboard')
        return
      } else {
        const err = await res.json().catch(() => null)
        if (err?.detail) {
          setLoginError(err.detail)
          return
        }
      }
    } catch {
      // Backend unavailable; proceed with offline local database check
    }

    // Offline Local DB Check
    const waitlisted = waitlistRequests.find(r => r.email.toLowerCase() === email)
    if (waitlisted && waitlisted.status === 'pending') {
      setLoginError(
        'Your registration request has been submitted and is currently on the waitlist awaiting approval from the Administrator (admin@gmail.com). You will be able to log in once your request is approved.'
      )
      return
    }

    if (waitlisted && waitlisted.status === 'rejected') {
      setLoginError('Your registration request was reviewed and rejected by the Administrator.')
      return
    }

    const matchedUser = users.find(
      u => u.email.toLowerCase() === email && u.password === password
    )

    if (matchedUser) {
      if (matchedUser.status !== 'approved') {
        setLoginError('This account is inactive or pending verification.')
        return
      }
      setCurrentUser(matchedUser)
      setLoginError(null)
      const isUserAdmin = matchedUser.email?.toLowerCase() === 'admin@gmail.com' || matchedUser.role === 'Admin'
      const pending = waitlistRequests.filter(r => r.status === 'pending')
      if (isUserAdmin && pending.length > 0) {
        setCurrentPage('admin-users')
      } else {
        setCurrentPage('dashboard')
      }
      return
    }

    setLoginError('Invalid Email ID or Password. Please check your credentials.')
  }

  // Handle Sign Up: registers user on waitlist (Backend first with offline fallback)
  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setSignupError(null)

    const name = signupName.trim()
    const email = signupEmail.trim().toLowerCase()
    const password = signupPassword.trim()
    const confirm = signupConfirmPassword.trim()

    if (!name || !email || !password) {
      setSignupError('Please fill in all required fields.')
      return
    }

    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters in length.')
      return
    }

    if (password !== confirm) {
      setSignupError('Passwords do not match. Please re-enter.')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: signupRole })
      })

      if (res.ok) {
        const data = await res.json()
        setSignupSubmitted(true)
        await fetchRemoteData()
        authChannel?.postMessage({ type: 'NEW_SIGNUP', email })
        return
      } else {
        const err = await res.json().catch(() => null)
        if (err?.detail) {
          setSignupError(err.detail)
          return
        }
      }
    } catch {
      // Backend offline fallback
    }

    // Local check
    if (users.some(u => u.email.toLowerCase() === email)) {
      setSignupError('An account with this Email ID already exists. Please sign in.')
      return
    }

    if (waitlistRequests.some(r => r.email.toLowerCase() === email && r.status === 'pending')) {
      setSignupError('A sign-up request for this Email is already pending on the admin waitlist.')
      return
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      name,
      email,
      password,
      role: signupRole,
      status: 'pending',
      requestedAt: new Date().toLocaleString()
    }

    setWaitlistRequests(prev => [newRequest, ...prev])
    setSignupSubmitted(true)
    authChannel?.postMessage({ type: 'NEW_SIGNUP', email })
  }

  // Admin Action: Approve / Permit a waitlisted user
  const handleApproveUser = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      if (res.ok) {
        const data = await res.json()
        await fetchRemoteData()
        authChannel?.postMessage({ type: 'AUTH_SYNC' })
        setAdminActionNotice(data.message)
        setTimeout(() => setAdminActionNotice(null), 4000)
        return
      }
    } catch {}

    // Local fallback
    const req = waitlistRequests.find(r => r.id === requestId)
    if (!req) return

    const newUser = {
      id: `usr-${Date.now()}`,
      name: req.name,
      email: req.email,
      password: req.password,
      role: req.role,
      status: 'approved',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setUsers(prev => [...prev, newUser])
    setWaitlistRequests(prev => prev.filter(r => r.id !== requestId))
    authChannel?.postMessage({ type: 'AUTH_SYNC' })
    setAdminActionNotice(`Approved registration for ${req.name} (${req.email}). User can now log in.`)
    setTimeout(() => setAdminActionNotice(null), 4000)
  }

  // Admin Action: Reject a waitlisted request
  const handleRejectUser = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      if (res.ok) {
        await fetchRemoteData()
        authChannel?.postMessage({ type: 'AUTH_SYNC' })
        setAdminActionNotice('Registration request rejected.')
        setTimeout(() => setAdminActionNotice(null), 4000)
        return
      }
    } catch {}

    const req = waitlistRequests.find(r => r.id === requestId)
    setWaitlistRequests(prev => prev.filter(r => r.id !== requestId))
    authChannel?.postMessage({ type: 'AUTH_SYNC' })
    setAdminActionNotice(`Rejected request for ${req ? req.name : 'user'}.`)
    setTimeout(() => setAdminActionNotice(null), 4000)
  }

  // Admin Action: Delete / Remove an existing user
  const handleRemoveUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId)
    if (userToDelete?.email === 'admin@gmail.com') {
      alert('The primary System Administrator account cannot be deleted.')
      return
    }

    if (window.confirm(`Are you sure you want to remove user "${userToDelete?.name}" (${userToDelete?.email})?`)) {
      try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          await fetchRemoteData()
          authChannel?.postMessage({ type: 'AUTH_SYNC' })
          setAdminActionNotice(`Removed user ${userToDelete?.name} from active database.`)
          setTimeout(() => setAdminActionNotice(null), 4000)
          return
        }
      } catch {}

      setUsers(prev => prev.filter(u => u.id !== userId))
      authChannel?.postMessage({ type: 'AUTH_SYNC' })
      setAdminActionNotice(`Removed user ${userToDelete?.name} from active database.`)
      setTimeout(() => setAdminActionNotice(null), 4000)
    }
  }

  // Admin Action: Directly add a user (bypasses waitlist)
  const handleAdminAddUser = async (e) => {
    e.preventDefault()
    if (!adminNewName.trim() || !adminNewEmail.trim() || !adminNewPassword.trim()) {
      alert('Please fill in all fields to create a user.')
      return
    }

    const email = adminNewEmail.trim().toLowerCase()
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminNewName.trim(),
          email,
          password: adminNewPassword.trim(),
          role: adminNewRole
        })
      })

      if (res.ok) {
        await fetchRemoteData()
        authChannel?.postMessage({ type: 'AUTH_SYNC' })
        setAdminNewName('')
        setAdminNewEmail('')
        setAdminNewPassword('')
        setAdminActionNotice(`User "${adminNewName.trim()}" successfully created and activated.`)
        setTimeout(() => setAdminActionNotice(null), 4000)
        return
      } else {
        const err = await res.json().catch(() => null)
        if (err?.detail) {
          alert(err.detail)
          return
        }
      }
    } catch {}

    if (users.some(u => u.email.toLowerCase() === email)) {
      alert('A user with this Email ID already exists.')
      return
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: adminNewName.trim(),
      email,
      password: adminNewPassword.trim(),
      role: adminNewRole,
      status: 'approved',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setUsers(prev => [...prev, newUser])
    setAdminNewName('')
    setAdminNewEmail('')
    setAdminNewPassword('')
    authChannel?.postMessage({ type: 'AUTH_SYNC' })
    setAdminActionNotice(`User "${newUser.name}" successfully created and activated.`)
    setTimeout(() => setAdminActionNotice(null), 4000)
  }

  // Logout
  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage('home')
  }

  // Recommendation engine handler
  const handleRecommend = async (e) => {
    if (e) e.preventDefault()
    if (!procurementText.trim() || isProcessing) return

    setIsProcessing(true)
    setError(null)
    setResults(null)
    setExtractedData(null)
    setLatencyMs(null)

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

      const ext = data.extraction
      if (ext) {
        const fields = []
        if (ext.voltage) fields.push({ label: 'Voltage Rating', value: ext.voltage })
        if (ext.material) fields.push({ label: 'Conductor / Material', value: ext.material })
        if (ext.environment) fields.push({ label: 'Operational Environment', value: ext.environment })
        if (ext.application) fields.push({ label: 'End-Use Application', value: ext.application })
        if (ext.exclusions && ext.exclusions.length > 0) {
          fields.push({ label: 'Exclusion Criteria', value: ext.exclusions.join('; ') })
        }

        const missingList = ext.missing_fields || []
        const missing = missingList.length > 0
          ? {
              label: `Unspecified Parameters: ${missingList.slice(0, 2).join(', ')}${missingList.length > 2 ? ' +' + (missingList.length - 2) + ' more' : ''}`,
              detail: `The procurement specification lacks explicit values for: ${missingList.join(', ')}. While recommendations are provided, specify these parameters for strict GFR Rule 144(xi) compliance.`
            }
          : null

        setExtractedData({
          fields,
          missing,
          _llmLatencyMs: ext.latency_ms,
        })
      }
    } catch (err) {
      console.error('ManakAI Recommendation Error:', err)
      setError(
        'Bureau of Indian Standards (BIS) Local Inference Service not reachable on 127.0.0.1:8000. Ensure the air-gapped backend server is running.'
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

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const filteredRegistry = standardsRegistry.filter((item) => {
    const q = registrySearch.toLowerCase()
    return (
      item.id.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.sector.toLowerCase().includes(q) ||
      item.cert.toLowerCase().includes(q)
    )
  })

  // Confidence badge color mapping
  const getConfidenceBadge = (score) => {
    if (score > 80) {
      return {
        badgeStyle: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
        dotStyle: 'bg-emerald-600',
        label: `${score}% Match`,
        tier: 'High Statutory Match'
      }
    }
    if (score >= 50) {
      return {
        badgeStyle: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
        dotStyle: 'bg-amber-600',
        label: `${score}% Match`,
        tier: 'Moderate Alignment'
      }
    }
    return {
      badgeStyle: 'bg-rose-50 text-rose-900 border-rose-300 font-semibold',
      dotStyle: 'bg-rose-600',
      label: `${score}% Match`,
      tier: 'Low Similarity'
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return {
        style: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
      }
    }
    if (status === 'Withdrawn') {
      return {
        style: 'bg-rose-50 text-rose-900 border-rose-300',
        icon: <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
      }
    }
    return {
      style: 'bg-amber-50 text-amber-900 border-amber-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950 antialiased">
      {/* 🇮🇳 National Tricolor Bar on Top */}
      <div className="gov-tricolor-bar" />

      {/* 🏛️ Topmost Official Government Bar */}
      <div className="w-full bg-[#0b1f3a] text-slate-200 px-3 sm:px-6 lg:px-8 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#1e3a8a]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="text-[#ff9933] font-bold">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold tracking-wide">Government of India</span>
          </div>
          <span className="hidden md:inline-block text-slate-500">•</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
            <Scale className="w-3 h-3" /> Problem Statement #108
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-mono font-semibold">NIC / MeitY On-Premise Air-Gapped</span>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-slate-400">Language:</span>
            <span className="text-white font-semibold cursor-pointer hover:underline">English</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 cursor-pointer hover:underline">हिन्दी</span>
          </div>
        </div>
      </div>

      {/* 🏛️ Main Ministry & Bureau of Indian Standards Official Header */}
      <header className="bg-white border-b-2 border-amber-600 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Ministry Emblem & Title */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3.5 text-center md:text-left cursor-pointer group"
          >
            <AshokaEmblem className="w-12 h-14 shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform" />
            <div className="border-l-2 border-slate-200 pl-3.5">
              <div className="text-[13px] font-bold text-[#b45309] leading-tight tracking-wide">
                उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#0b1f3a] tracking-tight leading-snug group-hover:text-[#1e3a8a] transition-colors">
                Ministry of Consumer Affairs, Food &amp; Public Distribution
              </h1>
              <div className="text-xs font-semibold text-slate-600 flex flex-wrap items-center gap-2 mt-0.5">
                <span>Department of Consumer Affairs</span>
                <span className="text-slate-300">•</span>
                <span className="text-[#1e3a8a] font-bold">Bureau of Indian Standards (BIS)</span>
              </div>
            </div>
          </div>

          {/* Right Side: BIS Seal & Auth Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-gradient-to-r from-slate-50 to-amber-50/50 p-2 rounded-xl border border-amber-200/80 shadow-2xs">
              <BISLogo className="w-10 h-10 shrink-0" />
              <div className="text-right">
                <div className="text-xs font-extrabold text-[#0b1f3a] uppercase tracking-wider flex items-center justify-end gap-1">
                  <span>मानक-AI</span>
                  <span className="text-[9px] bg-[#1e3a8a] text-white px-1.5 py-0.2 rounded font-mono">v2.6</span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  BIS Standards Recommendation Engine
                </div>
                <div className="text-[9px] text-emerald-800 font-bold flex items-center justify-end gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  GFR 2017 Rule 144(xi) Compliant
                </div>
              </div>
            </div>

            {/* Auth Button / Profile Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 p-1.5 rounded-xl shadow-2xs">
                <div className="text-right pl-2 hidden md:block">
                  <div className="text-xs font-bold text-[#0b1f3a] flex items-center justify-end gap-1.5">
                    {isAdmin && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium font-mono">{currentUser.email}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out of session"
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('auth')
                  setAuthMode('signin')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b1f3a] hover:bg-[#1e3a8a] text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* 🌐 Government Portal Navigation Menu Bar */}
        <nav className="bg-[#0b1f3a] text-white border-t border-[#1e3a8a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-1">
            <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrentPage('home')}
                className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  currentPage === 'home'
                    ? 'bg-[#1e3a8a] text-amber-300 border-b-2 border-amber-400 font-bold shadow-xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('dashboard')
                  setActiveTab('recommender')
                }}
                className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  currentPage === 'dashboard' && activeTab === 'recommender'
                    ? 'bg-[#1e3a8a] text-amber-300 border-b-2 border-amber-400 font-bold shadow-xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Standards Recommender</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('dashboard')
                  setActiveTab('registry')
                }}
                className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  currentPage === 'dashboard' && activeTab === 'registry'
                    ? 'bg-[#1e3a8a] text-amber-300 border-b-2 border-amber-400 font-bold shadow-xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>BIS Standards &amp; QCO Registry</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('dashboard')
                  setActiveTab('tender')
                }}
                className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  currentPage === 'dashboard' && activeTab === 'tender'
                    ? 'bg-[#1e3a8a] text-amber-300 border-b-2 border-amber-400 font-bold shadow-xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                <span>GeM / GFR Tender Generator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('dashboard')
                  setActiveTab('about')
                }}
                className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  currentPage === 'dashboard' && activeTab === 'about'
                    ? 'bg-[#1e3a8a] text-amber-300 border-b-2 border-amber-400 font-bold shadow-xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                <span>PS #108 Architecture</span>
              </button>

              {/* Special Admin User Management Tab (visible only when logged in as admin) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setCurrentPage('admin-users')}
                  className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                    currentPage === 'admin-users'
                      ? 'bg-amber-600 text-white border-b-2 border-amber-300 font-bold shadow-xs'
                      : 'text-amber-300 hover:bg-amber-900/50 hover:text-white font-bold'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>User Management (Admin)</span>
                  {pendingRequestsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-mono font-bold animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-2 text-[11px] text-amber-200/90 font-mono pr-2">
              <span>National Procurement Portal</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">100% On-Premise Air-Gapped</span>
            </div>
          </div>
        </nav>

        {/* 📢 Official Government Gazette News Ticker */}
        <div className="bg-amber-50 border-b border-amber-200/90 text-amber-950 px-4 py-1.5 text-xs flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 font-bold text-red-700 uppercase tracking-wider shrink-0 bg-red-100 border border-red-300 px-2 py-0.5 rounded text-[10px]">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            Gazette Alert
          </div>
          <div className="overflow-hidden relative w-full font-medium text-[11.5px] text-slate-700">
            <div className="animate-ticker">
              <span className="mr-8">
                📜 <strong>Mandatory Compliance:</strong> In accordance with General Financial Rules (GFR 2017) Rule 144(xi) and BIS Act 2016, all public procurement tenders on GeM must cite valid Indian Standards (IS) with Quality Control Orders (QCO).
              </span>
              <span className="mr-8">
                ⚡ <strong>Air-Gapped AI Engine:</strong> Local Fine-Tuned QLoRA LLM + BGE-M3 Dense Semantic Search + Version Guardrails active for 100% on-premise government deployment with zero data leakage.
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. PORTAL HOME PAGE                                       */}
      {/* ========================================================= */}
      {currentPage === 'home' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10 animate-fade-in">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-[#0b1f3a] via-[#112d4e] to-[#1e3a8a] text-white rounded-3xl p-8 sm:p-12 shadow-xl border-b-8 border-amber-500 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
              <AshokaEmblem className="w-96 h-96" />
            </div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Problem Statement ID: 108 &bull; Smart India Hackathon</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                AI-Powered Recommendation Engine for Identifying Applicable Indian Standards
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
                Official statutory AI system developed for the <strong>Ministry of Consumer Affairs, Food &amp; Public Distribution</strong> and <strong>Bureau of Indian Standards (BIS)</strong>. Empowers public procurement officers across GeM, Indian Railways, CPWD, and Defence to automatically identify, verify, and cross-reference mandatory Indian Standards with zero cloud data egress.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('dashboard')
                    setActiveTab('recommender')
                  }}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Launch Standards Recommender</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!currentUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage('auth')
                      setAuthMode('signin')
                    }}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm transition-all border border-white/30 flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Officer Sign In / Sign Up</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage('dashboard')
                      setActiveTab('registry')
                    }}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm transition-all border border-white/30 flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span>Explore BIS Standards Registry</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Key Statistics Bar */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#0b1f3a] font-mono">500+</div>
              <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">BIS Standards Indexed</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ETD, CED, LITD, MED, CHD</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">100%</div>
              <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Air-Gapped &amp; On-Premise</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zero Cloud Dependency / NIC Safe</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1e3a8a] font-mono">&lt; 300ms</div>
              <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Dense Vector Retrieval</div>
              <div className="text-[11px] text-slate-400 mt-0.5">BGE-M3 + ChromaDB Core</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">1-Hop</div>
              <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Normative Graph Linking</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Testing &amp; Material Cross-References</div>
            </div>
          </section>

          {/* Quick Admin Access Hint Box */}
          <section className="bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-300 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl border border-amber-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#0b1f3a]">Administrative Access &amp; User Approval Portal: </span>
                <span className="text-slate-600">Admin credentials: </span>
                <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-[#0b1f3a] border border-slate-300">admin@gmail.com</code>
                <span className="text-slate-500 mx-1">/</span>
                <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-[#0b1f3a] border border-slate-300">admin@123</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentPage('auth')
                setAuthMode('signin')
                fillCredentials('admin@gmail.com', 'admin@123')
              }}
              className="px-4 py-2 bg-[#0b1f3a] text-amber-300 hover:bg-[#1e3a8a] rounded-xl font-bold cursor-pointer transition-all shadow-xs shrink-0"
            >
              Sign In as Admin
            </button>
          </section>
        </main>
      )}

      {/* ========================================================= */}
      {/* 2. AUTHENTICATION (SIGN IN / SIGN UP) PAGE                 */}
      {/* ========================================================= */}
      {currentPage === 'auth' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="bg-[#0b1f3a] text-white p-6 text-center relative border-b-4 border-amber-500">
              <AshokaEmblem className="w-12 h-14 mx-auto mb-2" />
              <h2 className="text-lg font-bold">Government Standards Portal Access</h2>
              <p className="text-xs text-amber-200 mt-0.5">
                Ministry of Consumer Affairs &bull; Bureau of Indian Standards
              </p>

              {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
              <div className="mt-4 flex rounded-xl bg-slate-900/60 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin')
                    setLoginError(null)
                    setSignupSubmitted(false)
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup')
                    setSignupError(null)
                    setSignupSubmitted(false)
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign Up (Request Access)
                </button>
              </div>
            </div>

            {/* --- SIGN IN MODE --- */}
            {authMode === 'signin' && (
              <div className="p-6 space-y-4">
                {/* Admin Quick Credentials Pill */}
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-950 flex items-center justify-between">
                    <span>👑 Main Admin Credentials:</span>
                    <button
                      type="button"
                      onClick={() => fillCredentials('admin@gmail.com', 'admin@123')}
                      className="text-[11px] text-[#1e3a8a] font-bold hover:underline cursor-pointer"
                    >
                      Fill Admin
                    </button>
                  </div>
                  <div className="font-mono text-slate-700 text-[11px]">
                    Email: <strong>admin@gmail.com</strong> | Password: <strong>admin@123</strong>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email ID:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. admin@gmail.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1e3a8a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password:
                    </label>
                    <div className="relative">
                      <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#0b1f3a] hover:bg-[#1e3a8a] text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2 text-xs text-slate-500">
                  New officer or contractor?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup')
                      setSignupSubmitted(false)
                    }}
                    className="font-bold text-[#1e3a8a] hover:underline cursor-pointer"
                  >
                    Request an account (Sign Up)
                  </button>
                </div>
              </div>
            )}

            {/* --- SIGN UP MODE (Awaits Admin Permit) --- */}
            {authMode === 'signup' && (
              <div className="p-6 space-y-4">
                {signupSubmitted ? (
                  <div className="text-center space-y-4 py-4 animate-fade-in">
                    <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300">
                      <Clock className="w-8 h-8" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-[#0b1f3a]">
                        Account Request Placed on Waitlist!
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                        Your registration for <strong className="text-slate-900">{signupEmail}</strong> has been received and added to the administrative queue.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 text-left space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span>Awaiting Administrator Approval:</span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed">
                        In compliance with government procurement security policies, an administrator (<code className="font-bold">admin@gmail.com</code>) must permit your request before you can sign in.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin')
                        setLoginEmail(signupEmail)
                        setLoginPassword('')
                        setSignupSubmitted(false)
                      }}
                      className="px-6 py-2.5 bg-[#0b1f3a] text-amber-300 hover:bg-[#1e3a8a] rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                    <div className="text-xs text-slate-500 pb-1">
                      Create an account request. Upon submission, the request will be placed on the waitlist for <strong className="text-slate-800">admin@gmail.com</strong> approval.
                    </div>

                    {signupError && (
                      <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{signupError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name:
                      </label>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Er. Sanjay Verma"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1e3a8a]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email ID:
                      </label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="sanjay.verma@gov.in"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1e3a8a]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Requested Role:
                      </label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1e3a8a]"
                      >
                        <option>Procurement Officer</option>
                        <option>Technical Auditor</option>
                        <option>BIS Standards Engineer</option>
                        <option>Tender Bid Evaluator</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Password:
                        </label>
                        <input
                          type="password"
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Confirm:
                        </label>
                        <input
                          type="password"
                          required
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          placeholder="Re-enter"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-[#0b1f3a] hover:bg-[#1e3a8a] text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Submit Sign-Up Request</span>
                      </button>
                    </div>

                    <div className="text-center pt-2 text-xs text-slate-500">
                      Already approved?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="font-bold text-[#1e3a8a] hover:underline cursor-pointer"
                      >
                        Sign In here
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* 3. ADMIN USER MANAGEMENT & WAITLIST CONTROL PANEL         */}
      {/* ========================================================= */}
      {currentPage === 'admin-users' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-fade-in">
          {/* Admin Header */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrator Control Center
              </div>
              <h2 className="text-xl font-black text-[#0b1f3a]">
                User Management &amp; Waitlist Approvals
              </h2>
              <p className="text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">admin@gmail.com</strong> &bull; Authorize new user registrations, manage active officers, or create direct accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage('dashboard')}
              className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Engine Dashboard</span>
            </button>
          </div>

          {/* Action Notice Toast */}
          {adminActionNotice && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-xs animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{adminActionNotice}</span>
            </div>
          )}

          {/* SECTION 1: Pending Waitlist Requests */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0b1f3a]">
                    Pending Registration Requests (Waitlist)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Users who signed up and are waiting for your permit to activate their login.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold font-mono self-start sm:self-auto">
                {pendingRequestsCount} Pending Request{pendingRequestsCount !== 1 ? 's' : ''}
              </span>
            </div>

            {waitlistRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No users currently on the waitlist. New sign-up submissions will appear here for your approval.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0b1f3a] text-white font-mono uppercase tracking-wider text-[11px]">
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email ID</th>
                      <th className="p-3">Requested Role</th>
                      <th className="p-3">Requested Time</th>
                      <th className="p-3 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {waitlistRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-3 font-bold text-[#0b1f3a]">{req.name}</td>
                        <td className="p-3 font-mono text-slate-700">{req.email}</td>
                        <td className="p-3 text-slate-600">{req.role}</td>
                        <td className="p-3 text-slate-500 text-[11px] font-mono">{req.requestedAt}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleApproveUser(req.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Permit &amp; Create</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectUser(req.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-bold transition-all border border-slate-300 hover:border-rose-300 cursor-pointer inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* SECTION 2 & 3: Active Users & Direct Add User */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Users Table (2 Cols) */}
            <section className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-xl border border-blue-200">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0b1f3a]">
                    Active System Users ({users.length})
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-mono uppercase tracking-wider text-[11px] border-b border-slate-300">
                      <th className="p-3">User</th>
                      <th className="p-3">Email ID</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {users.map((u) => {
                      const isMainAdmin = u.email === 'admin@gmail.com'
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                            {isMainAdmin && <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-600">{u.email}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px] border border-slate-200 font-medium">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isMainAdmin ? (
                              <span className="text-[11px] text-slate-400 font-mono italic">Primary Admin</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(u.id)}
                                title="Remove User from system"
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Direct Add User Form (1 Col) */}
            <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0b1f3a]">
                  Direct Add User (Bypass Waitlist)
                </h3>
              </div>

              <form onSubmit={handleAdminAddUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Officer Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={adminNewName}
                    onChange={(e) => setAdminNewName(e.target.value)}
                    placeholder="e.g. Dr. K. Ramesh"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email ID:
                  </label>
                  <input
                    type="email"
                    required
                    value={adminNewEmail}
                    onChange={(e) => setAdminNewEmail(e.target.value)}
                    placeholder="k.ramesh@bis.gov.in"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password:
                  </label>
                  <input
                    type="password"
                    required
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="Temporary password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role:
                  </label>
                  <select
                    value={adminNewRole}
                    onChange={(e) => setAdminNewRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1e3a8a]"
                  >
                    <option>Procurement Officer</option>
                    <option>Technical Auditor</option>
                    <option>BIS Standards Engineer</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Create &amp; Activate User</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* 4. DASHBOARD & RECOMMENDATION ENGINE                      */}
      {/* ========================================================= */}
      {currentPage === 'dashboard' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
          {/* User Welcome Pill if Logged In */}
          {currentUser && (
            <div className="bg-white border border-slate-300 p-3 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#0b1f3a]">{currentUser.name}</span>
                  <span className="text-slate-400 mx-1.5">&bull;</span>
                  <span className="text-slate-600 font-medium">{currentUser.role} ({currentUser.email})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                <span>Session Active: GFR Rule 144(xi) Verifier</span>
              </div>
            </div>
          )}

          {/* TAB 1: AI STANDARDS RECOMMENDER */}
          {activeTab === 'recommender' && (
            <div className="space-y-6">
              {/* Problem Statement Banner */}
              <div className="bg-gradient-to-r from-[#0b1f3a] via-[#112d4e] to-[#1e3a8a] text-white rounded-2xl p-6 shadow-md border-b-4 border-amber-500 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
                      <span>Problem Statement ID: 108</span>
                      <span className="text-amber-200">|</span>
                      <span>Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      AI-Powered Recommendation Engine for Identifying Applicable Indian Standards
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                      Automated extraction of technical parameters from public procurement specifications, semantic alignment with Bureau of Indian Standards (BIS) corpus, version verification, and normative dependency mapping.
                    </p>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                    <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-center">
                      <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">Target Corpus</div>
                      <div className="text-lg font-bold font-mono text-white">500+ Indian Standards</div>
                    </div>
                    <div className="text-[10px] text-emerald-300 font-mono font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Air-Gapped ChromaDB + BGE-M3
                    </div>
                  </div>
                </div>
              </div>

              {/* Procurement Specification Input Form */}
              <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-[#0b1f3a] flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-[#1e3a8a]" />
                      Procurement Specification / Tender Requirement Input
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter technical parameters, item descriptions, or paste tender clauses from GeM/CPWD/Railways to match mandatory Indian Standards.
                    </p>
                  </div>

                  {procurementText && (
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={isProcessing}
                      className="self-start sm:self-auto text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Input
                    </button>
                  )}
                </div>

                <form onSubmit={handleRecommend} className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={procurementText}
                      onChange={(e) => setProcurementText(e.target.value)}
                      disabled={isProcessing}
                      rows={5}
                      placeholder="Enter or paste procurement specification (e.g., 'Procurement of heavy-duty PVC insulated power cables for outdoor industrial distribution, 1.1kV rated voltage, multi-core copper conductor with steel wire armouring')..."
                      className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-[#1e3a8a] focus:ring-3 focus:ring-[#1e3a8a]/10 text-slate-900 placeholder:text-slate-400 rounded-xl p-4 text-sm font-sans resize-y min-h-[140px] leading-relaxed shadow-inner transition-all disabled:opacity-60"
                    />
                    <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 pointer-events-none font-mono bg-white px-2 py-0.5 rounded border border-slate-300">
                      {procurementText.length} characters
                    </div>
                  </div>

                  {/* Quick Demo Presets */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Official Procurement Query Templates (Demo Benchmarks):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {samplePrompts.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => loadSample(sample)}
                          disabled={isProcessing}
                          className="text-left text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-400 text-slate-800 transition-all duration-150 cursor-pointer disabled:opacity-50 group shadow-2xs"
                        >
                          <div className="font-bold text-[#0b1f3a] group-hover:text-[#1e3a8a] flex items-center justify-between">
                            <span>{sample.label}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#1e3a8a] transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{sample.tenderRef}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <label htmlFor="sector-select" className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider">
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
                          className="appearance-none bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 text-xs sm:text-sm font-semibold rounded-xl pl-3.5 pr-9 py-2.5 focus:outline-none focus:border-[#1e3a8a] cursor-pointer transition-all shadow-xs disabled:opacity-60"
                        >
                          <option value="Electrical">⚡ Electrical Engineering (ETD)</option>
                          <option value="Civil/Construction">🏗️ Civil Engineering &amp; Construction (CED)</option>
                          <option value="IT/Electronics">💻 Electronics &amp; Information Technology (LITD)</option>
                          <option value="Mechanical">⚙️ Mechanical Engineering (MED)</option>
                          <option value="Chemical">🧪 Chemicals &amp; Materials (CHD)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!procurementText.trim() || isProcessing}
                      className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
                        procurementText.trim() && !isProcessing
                          ? 'bg-[#0b1f3a] hover:bg-[#1e3a8a] text-amber-300 hover:text-white cursor-pointer active:scale-[0.98]'
                          : isProcessing
                          ? 'bg-[#112d4e] text-amber-300 border border-amber-500/50 cursor-wait animate-pulse-glow'
                          : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Querying BIS Intelligence Engine...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Identify Applicable Indian Standards</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* Live Inference Loading Banner */}
              {isProcessing && (
                <section className="bg-white border-2 border-[#1e3a8a] rounded-2xl p-6 shadow-md animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0b1f3a] text-amber-400 shrink-0 shadow-sm">
                      <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                      </span>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h3 className="text-base font-bold text-[#0b1f3a] tracking-tight">
                          Analyzing Specification via 4-Tier On-Premise Engine...
                        </h3>
                        <span className="text-xs font-mono font-semibold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full self-center sm:self-auto">
                          Air-Gapped Pipeline Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Executing LLM Parameter Extraction (Tier 1) → BGE-M3 Dense Retrieval (Tier 2) → Rule-based Version Verification (Tier 3) → Normative Graph Resolution (Tier 4)...
                      </p>

                      <div className="mt-3.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-300">
                        <div className="bg-gradient-to-r from-amber-500 to-[#1e3a8a] h-2 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Error State */}
              {error && !isProcessing && (
                <section className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-sm animate-fade-in">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className="text-sm sm:text-base font-bold text-rose-950">
                          BIS Local Engine Service Notice
                        </h3>
                        <span className="text-[11px] font-mono font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                          Connection Required
                        </span>
                      </div>
                      <p className="text-xs text-rose-900 mt-1.5 leading-relaxed font-medium">
                        {error}
                      </p>
                      <div className="mt-3 pt-3 border-t border-rose-200 flex flex-wrap items-center gap-2 text-[11px] text-rose-800 font-mono">
                        <span>Server Endpoint: <strong>http://127.0.0.1:8000/recommend</strong></span>
                        <span>•</span>
                        <span>Start Command: <code className="bg-white px-2 py-0.5 rounded text-rose-950 font-bold border border-rose-300">python -m uvicorn app.main:app --port 8000</code></span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Tier 1: Extracted Parameters */}
              {extractedData && !isProcessing && (
                <section className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm animate-fade-in-up">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#1e3a8a]">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#0b1f3a] flex items-center gap-2">
                          <span>Extracted Technical Requirements (Tier 1 AI)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.2 rounded font-mono font-bold">
                            Validated
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Domain-adapted extraction via fine-tuned model (air-gapped)
                          {extractedData._llmLatencyMs != null && (
                            <span className="ml-1.5 font-mono text-slate-400">({Math.round(extractedData._llmLatencyMs)}ms)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#1e3a8a] border border-blue-200 font-mono">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {extractedData.fields.length} Parameters Identified
                      </span>
                      {extractedData.missing && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 font-mono">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          Incomplete Tender Clause
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {extractedData.fields.map((field, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-300 text-slate-800 shadow-2xs hover:border-[#1e3a8a] transition-colors"
                      >
                        <span className="text-slate-500 font-semibold">{field.label}:</span>
                        <span className="font-bold text-[#0b1f3a] font-mono">{field.value}</span>
                      </div>
                    ))}

                    {extractedData.missing && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100/80 border border-amber-300 text-amber-950">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{extractedData.missing.label}</span>
                      </div>
                    )}
                  </div>

                  {extractedData.missing && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-start gap-2.5 text-xs text-amber-950 bg-amber-50/90 px-4 py-3 rounded-xl border border-amber-300">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-950">Procurement Officer Guardrail: </span>
                        {extractedData.missing.detail}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Results Section */}
              {results && !isProcessing && (
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 animate-fade-in">
                    <div>
                      <h3 className="text-base font-extrabold text-[#0b1f3a] flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        Applicable Indian Standards (Statutory Recommendations)
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Statutory BIS standards ranked for sector: <strong className="text-[#1e3a8a]">{sector}</strong> • Aligned with GFR 2017 &amp; BIS Act 2016
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 font-mono bg-white border border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs self-start sm:self-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span className="font-bold text-slate-900">{results.length} Standards Matched</span>
                      </div>
                      {latencyMs !== null && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <span>⚡</span> {latencyMs}ms Total Latency
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {requiresHumanReview && (
                    <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5 animate-fade-in">
                      <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-sm sm:text-base font-bold text-amber-950">
                            Mandatory Human Engineering Review Required
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 self-start sm:self-auto">
                            Statutory Confidence Guardrail (&lt;72%)
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 mt-1.5 leading-relaxed font-medium">
                          {humanReviewReason ||
                            'The top candidate match has a similarity score below the 72% confidence threshold. Manual verification by the competent technical authority is recommended prior to tender release.'}
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
                          style={{ animationDelay: `${index * 120}ms` }}
                          className="relative bg-white border-2 border-slate-200 hover:border-[#1e3a8a] rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-lg shadow-sm animate-fade-in-up"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0b1f3a] text-amber-300 text-xs font-black font-mono shadow-2xs">
                                #{index + 1}
                              </span>
                              <span className="text-base sm:text-lg font-black text-[#0b1f3a] font-mono tracking-tight">
                                {item.standard_id}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {item.certification && item.certification !== 'None' && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 font-mono">
                                  🛡️ {item.certification}
                                </span>
                              )}

                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.style}`}>
                                {statusBadge.icon}
                                <span>{item.status}</span>
                              </span>

                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${conf.badgeStyle}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${conf.dotStyle}`}></span>
                                <span className="font-mono">{conf.label}</span>
                                {item.similarity_score !== undefined && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    ({(item.similarity_score * 100).toFixed(1)}%)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-3.5 pl-11">
                            {item.title}
                          </h4>

                          {item.superseded_warning && (
                            <div className="pl-11 mb-3.5">
                              <div className="flex items-start gap-2.5 text-xs text-rose-950 bg-rose-50 border-2 border-rose-300 px-4 py-3 rounded-xl">
                                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-rose-950">Statutory Gazette Alert: </span>
                                  {item.warning_reason || 'This standard has been superseded or withdrawn by the Bureau of Indian Standards. Do not cite in fresh tenders.'}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 1-Hop Allied Standards */}
                          {index === 0 && item.allied_standards && Object.keys(item.allied_standards).length > 0 && (
                            <div className="pl-11 mb-4 animate-fade-in">
                              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 shadow-2xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#1e3a8a]">
                                      <GitFork className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#0b1f3a]">
                                        Allied &amp; Normative Indian Standards (Cross-Referenced)
                                      </h5>
                                      <p className="text-[11px] text-slate-500">
                                        Mandatory testing methods, material specifications &amp; safety standards cited within {item.standard_id}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                                    In-Memory Knowledge Graph (1-Hop)
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  {Object.entries(item.allied_standards).map(([refType, stdList]) => {
                                    const groupLabel =
                                      stdList[0]?.reference_type_label ||
                                      refType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

                                    return (
                                      <div key={refType} className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a]"></span>
                                            {groupLabel}
                                          </span>
                                          <span className="text-[10px] font-mono text-slate-500">({stdList.length})</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                          {stdList.map((allied) => (
                                            <div
                                              key={allied.standard_id}
                                              title={`${allied.standard_id}: ${allied.title} (${allied.status})`}
                                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 shadow-2xs hover:border-[#1e3a8a] transition-all text-xs"
                                            >
                                              <span
                                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                  allied.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-500'
                                                }`}
                                              ></span>
                                              <span className="font-mono font-bold text-[#0b1f3a]">{allied.standard_id}</span>
                                              <span className="text-[11px] text-slate-600 max-w-[200px] sm:max-w-[320px] truncate border-l border-slate-200 pl-2 font-medium">
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

                          <div className="pl-11 pt-3.5 border-t border-slate-200">
                            <div className="flex items-start gap-2.5">
                              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider shrink-0 mt-0.5 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-mono">
                                Statutory Scope
                              </span>
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {item.explanation}
                              </p>
                            </div>
                          </div>

                          <div className="pl-11 pt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(`Standard: ${item.standard_id} - ${item.title}\nCompliance: ${item.certification || 'Mandatory Indian Standard'}\nRef: BIS Act 2016`, item.standard_id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer transition-colors"
                            >
                              {copiedId === item.standard_id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-bold">Copied Clause!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Copy BIS Tender Clause</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 2: BIS STANDARDS & QCO REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#1e3a8a]" />
                      Bureau of Indian Standards (BIS) Indexed Standards &amp; QCO Registry
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Search official Indian Standards indexed in the local vector database with Quality Control Orders (QCO) and Gazette references.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="Search by IS code, title, sector..."
                      className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e3a8a]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-300">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0b1f3a] text-white font-mono uppercase tracking-wider text-[11px]">
                        <th className="p-3">Standard ID</th>
                        <th className="p-3">Standard Title</th>
                        <th className="p-3">Sector</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Certification Scheme</th>
                        <th className="p-3">QCO Notification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-sans">
                      {filteredRegistry.map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 font-bold font-mono text-[#0b1f3a]">{item.id}</td>
                          <td className="p-3 text-slate-800 font-medium max-w-xs">{item.title}</td>
                          <td className="p-3 text-slate-600 font-mono">{item.sector}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">{item.cert}</td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{item.qco}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GeM & GFR 2017 TENDER CLAUSE GENERATOR */}
          {activeTab === 'tender' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="pb-4 mb-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#1e3a8a]" />
                    GeM &amp; GFR 2017 Rule 144(xi) Tender Clause Generator
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate standardized legal tender specifications citing Bureau of Indian Standards (BIS) codes and mandatory testing protocols.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Procurement Item Description:
                      </label>
                      <input
                        type="text"
                        defaultValue="Heavy-Duty PVC Insulated Power Cables (1.1 kV)"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Applicable Primary Indian Standard:
                      </label>
                      <input
                        type="text"
                        defaultValue="IS 1554 (Part 1) : 1988"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mandatory Quality Certification Scheme:
                      </label>
                      <select className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-semibold">
                        <option>ISI Mark Certification (Mandatory under QCO)</option>
                        <option>Compulsory Registration Scheme (CRS - MeitY)</option>
                        <option>BIS Certificate of Conformity (CoC)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-[#0b1f3a] uppercase font-mono">
                          Official Tender Clause Preview
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                          GFR Compliant
                        </span>
                      </div>
                      <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed p-2 bg-white rounded-lg border border-slate-200">
{`"The supplied items must strictly comply with Bureau of Indian Standards (BIS) specification IS 1554 (Part 1) : 1988 (including all latest amendments). Bidders must possess a valid BIS Standard Mark (ISI Mark) license issued under Scheme-I of Schedule-II of BIS (Conformity Assessment) Regulations, 2018 in compliance with Quality Control Order (QCO) S.O. 2023/110. All raw material conductors and testing protocols must satisfy IS 8130 and IS 10810."`}
                      </pre>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`The supplied items must strictly comply with Bureau of Indian Standards (BIS) specification IS 1554 (Part 1) : 1988 (including all latest amendments). Bidders must possess a valid BIS Standard Mark (ISI Mark) license issued under Scheme-I of Schedule-II of BIS (Conformity Assessment) Regulations, 2018 in compliance with Quality Control Order (QCO) S.O. 2023/110. All raw material conductors and testing protocols must satisfy IS 8130 and IS 10810.`, 'tender-clause')}
                        className="px-4 py-2 bg-[#0b1f3a] text-amber-300 hover:bg-[#1e3a8a] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedId === 'tender-clause' ? 'Copied Clause!' : 'Copy Official Tender Clause'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROBLEM STATEMENT #108 ARCHITECTURE */}
          {activeTab === 'about' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="pb-4 mb-4 border-b border-slate-200">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Problem Statement 108 Technical Architecture
                  </div>
                  <h3 className="text-xl font-black text-[#0b1f3a]">
                    Ministry of Consumer Affairs, Food &amp; Public Distribution — BIS Solution Blueprint
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    100% Air-gapped, on-premise AI pipeline engineered for high-security public procurement workflows with zero external API dependencies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1e3a8a] flex items-center justify-center font-bold text-xs font-mono">
                      T1
                    </div>
                    <h4 className="text-xs font-bold text-[#0b1f3a]">LLM Parameter Extractor</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Domain fine-tuned Qwen 4B (QLoRA) parses specifications into structured JSON (Voltage, Material, Environment, Application, Exclusions).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                      T2
                    </div>
                    <h4 className="text-xs font-bold text-[#0b1f3a]">BGE-M3 Dense Retrieval</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Dense semantic embedding search across 500+ curated Indian Standards in on-premise ChromaDB vector storage.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs font-mono">
                      T3
                    </div>
                    <h4 className="text-xs font-bold text-[#0b1f3a]">Rule Guardrail &amp; Versioning</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Deterministic verification of Active vs. Superseded/Withdrawn Gazette status and QCO mandatory compliance rules.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs font-mono">
                      T4
                    </div>
                    <h4 className="text-xs font-bold text-[#0b1f3a]">Normative Knowledge Graph</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      1-Hop in-memory cross-reference graph linking parent standards with mandatory testing, material, and safety codes.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                    <span className="font-semibold">
                      Statutory Compliance: GFR 2017 Rule 144(xi), BIS Act 2016, MeitY Guidelines for Air-Gapped AI Systems.
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-600 bg-white px-3 py-1 rounded-lg border border-amber-300 shrink-0">
                    Team Neuroverse • PS #108
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* 🏛️ Official Government Portal Footer */}
      <footer className="w-full border-t-2 border-slate-300 bg-[#0b1f3a] text-slate-300 pt-8 pb-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-700 text-slate-300">
            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] mb-2 font-mono">
                Ministry Portals
              </div>
              <ul className="space-y-1 text-slate-300 text-[11.5px]">
                <li className="hover:text-amber-300 cursor-pointer">Ministry of Consumer Affairs</li>
                <li className="hover:text-amber-300 cursor-pointer">Department of Consumer Affairs</li>
                <li className="hover:text-amber-300 cursor-pointer">National Test House (NTH)</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] mb-2 font-mono">
                Standards &amp; Quality
              </div>
              <ul className="space-y-1 text-slate-300 text-[11.5px]">
                <li className="hover:text-amber-300 cursor-pointer">Bureau of Indian Standards (BIS)</li>
                <li className="hover:text-amber-300 cursor-pointer">e-BIS Portal (manakonline.in)</li>
                <li className="hover:text-amber-300 cursor-pointer">Quality Control Orders (QCO)</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] mb-2 font-mono">
                Public Procurement
              </div>
              <ul className="space-y-1 text-slate-300 text-[11.5px]">
                <li className="hover:text-amber-300 cursor-pointer">Government e-Marketplace (GeM)</li>
                <li className="hover:text-amber-300 cursor-pointer">Central Public Procurement Portal</li>
                <li className="hover:text-amber-300 cursor-pointer">General Financial Rules (GFR 2017)</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] mb-2 font-mono">
                National Initiatives
              </div>
              <ul className="space-y-1 text-slate-300 text-[11.5px]">
                <li className="hover:text-amber-300 cursor-pointer">Digital India (digitalindia.gov.in)</li>
                <li className="hover:text-amber-300 cursor-pointer">National Portal of India (india.gov.in)</li>
                <li className="hover:text-amber-300 cursor-pointer">Make in India</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <AshokaEmblem className="w-7 h-9 shrink-0" />
              <div>
                <p className="text-slate-300 font-semibold">
                  Problem Statement 108: AI-Powered Recommendation Engine for Identifying Applicable Indian Standards
                </p>
                <p className="text-slate-400">
                  Developed for Ministry of Consumer Affairs, Food &amp; Public Distribution • Smart India Hackathon • Team Neuroverse
                </p>
              </div>
            </div>

            <div className="text-center md:text-right space-y-0.5">
              <div className="text-slate-300 font-medium">
                Designed compliant with Guidelines for Indian Government Websites (GIGW)
              </div>
              <div className="text-amber-400 font-mono text-[10px]">
                Air-Gapped &bull; Zero Cloud Egress &bull; Local Inference
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
