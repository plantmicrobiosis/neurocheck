{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import React, \{ useState, useEffect \} from 'react';\
import \{ Calendar, Plus, TrendingUp, Settings, Home, Clock, Moon, Sun, AlertCircle, Download, Bell \} from 'lucide-react';\
\
const ADHDTracker = () => \{\
  const [installPrompt, setInstallPrompt] = useState(null);\
  const [isInstalled, setIsInstalled] = useState(false);\
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);\
\
  // Register service worker\
  useEffect(() => \{\
    if ('serviceWorker' in navigator) \{\
      navigator.serviceWorker.register('/service-worker.js')\
        .then(reg => console.log('Service Worker registered'))\
        .catch(err => console.error('Service Worker registration failed:', err));\
    \}\
\
    // Listen for install prompt\
    window.addEventListener('beforeinstallprompt', (e) => \{\
      e.preventDefault();\
      setInstallPrompt(e);\
    \});\
\
    // Check if already installed\
    if (window.matchMedia('(display-mode: standalone)').matches) \{\
      setIsInstalled(true);\
    \}\
\
    // Check notification permission\
    if ('Notification' in window) \{\
      setNotificationsEnabled(Notification.permission === 'granted');\
    \}\
  \}, []);\
\
  const handleInstallClick = async () => \{\
    if (!installPrompt) return;\
    installPrompt.prompt();\
    const \{ outcome \} = await installPrompt.userChoice;\
    if (outcome === 'accepted') \{\
      setIsInstalled(true);\
    \}\
    setInstallPrompt(null);\
  \};\
\
  const enableNotifications = async () => \{\
    if (!('Notification' in window)) \{\
      alert('Notifications not supported in this browser');\
      return;\
    \}\
\
    const permission = await Notification.requestPermission();\
    setNotificationsEnabled(permission === 'granted');\
    \
    if (permission === 'granted') \{\
      // Schedule daily notifications\
      scheduleNotifications();\
    \}\
  \};\
\
  const scheduleNotifications = () => \{\
    // Note: For real push notifications, you'd use the Push API with a backend\
    // This shows the UI pattern - actual implementation needs service worker push\
    console.log('Notifications would be scheduled here');\
  \};\
  const [view, setView] = useState('home');\
  const [entries, setEntries] = useState([]);\
  const [currentEntry, setCurrentEntry] = useState(null);\
  const [entryType, setEntryType] = useState(null);\
  const [showInsights, setShowInsights] = useState(false);\
  \
  // Load data from storage on mount\
  useEffect(() => \{\
    const stored = window.storage ? null : localStorage.getItem('adhd-tracker-entries');\
    if (stored) \{\
      setEntries(JSON.parse(stored));\
    \}\
    // Check if we should show insights (7+ days of data)\
    if (stored) \{\
      const parsed = JSON.parse(stored);\
      const uniqueDays = new Set(parsed.map(e => new Date(e.timestamp).toDateString())).size;\
      setShowInsights(uniqueDays >= 7);\
    \}\
  \}, []);\
  \
  // Save data to storage whenever entries change\
  useEffect(() => \{\
    if (entries.length > 0) \{\
      localStorage.setItem('adhd-tracker-entries', JSON.stringify(entries));\
      const uniqueDays = new Set(entries.map(e => new Date(e.timestamp).toDateString())).size;\
      setShowInsights(uniqueDays >= 7);\
    \}\
  \}, [entries]);\
\
  const startEntry = (type) => \{\
    setEntryType(type);\
    setCurrentEntry(\{\
      type,\
      timestamp: new Date().toISOString(),\
      data: \{\}\
    \});\
    setView('entry');\
  \};\
\
  const saveEntry = () => \{\
    setEntries([...entries, currentEntry]);\
    setCurrentEntry(null);\
    setEntryType(null);\
    setView('home');\
  \};\
\
  const updateEntryData = (key, value) => \{\
    setCurrentEntry(\{\
      ...currentEntry,\
      data: \{ ...currentEntry.data, [key]: value \}\
    \});\
  \};\
\
  const getEntriesToday = () => \{\
    const today = new Date().toDateString();\
    return entries.filter(e => new Date(e.timestamp).toDateString() === today);\
  \};\
\
  const hasCompletedToday = (type) => \{\
    return getEntriesToday().some(e => e.type === type);\
  \};\
\
  const calculateBaseline = (metric) => \{\
    if (entries.length < 7) return null;\
    const values = entries\
      .filter(e => e.data[metric] !== undefined)\
      .map(e => e.data[metric]);\
    if (values.length === 0) return null;\
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);\
  \};\
\
  const getRecentTrend = (metric, days = 7) => \{\
    const cutoff = new Date();\
    cutoff.setDate(cutoff.getDate() - days);\
    const recentValues = entries\
      .filter(e => new Date(e.timestamp) >= cutoff && e.data[metric] !== undefined)\
      .map(e => e.data[metric]);\
    if (recentValues.length < 2) return null;\
    const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;\
    return avg.toFixed(1);\
  \};\
\
  return (\
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">\
      \{/* Header */\}\
      <div className="bg-white shadow-sm border-b border-slate-200 px-4 py-4 sticky top-0 z-10">\
        <div className="flex justify-between items-center">\
          <div>\
            <h1 className="text-xl font-semibold text-slate-800">Self-Observation</h1>\
            <p className="text-sm text-slate-500 mt-1">Structured longitudinal tracking</p>\
          </div>\
          \{installPrompt && !isInstalled && (\
            <button \
              onClick=\{handleInstallClick\}\
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"\
            >\
              <Download size=\{16\} />\
              Install\
            </button>\
          )\}\
        </div>\
      </div>\
\
      \{/* Main Content */\}\
      <div className="px-4 py-6">\
        \{view === 'home' && <HomeView \
          startEntry=\{startEntry\}\
          hasCompletedToday=\{hasCompletedToday\}\
          entries=\{entries\}\
          showInsights=\{showInsights\}\
          setView=\{setView\}\
        />\}\
        \
        \{view === 'entry' && <EntryView \
          entryType=\{entryType\}\
          currentEntry=\{currentEntry\}\
          updateEntryData=\{updateEntryData\}\
          saveEntry=\{saveEntry\}\
          setView=\{setView\}\
        />\}\
        \
        \{view === 'insights' && <InsightsView \
          entries=\{entries\}\
          calculateBaseline=\{calculateBaseline\}\
          getRecentTrend=\{getRecentTrend\}\
          setView=\{setView\}\
        />\}\
        \
        \{view === 'data' && <DataView \
          entries=\{entries\}\
          setView=\{setView\}\
        />\}\
\
        \{view === 'settings' && <SettingsView \
          notificationsEnabled=\{notificationsEnabled\}\
          enableNotifications=\{enableNotifications\}\
          isInstalled=\{isInstalled\}\
          setView=\{setView\}\
        />\}\
      </div>\
\
      \{/* Bottom Navigation */\}\
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex justify-around shadow-lg">\
        <button \
          onClick=\{() => setView('home')\}\
          className=\{`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors $\{view === 'home' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'\}`\}\
        >\
          <Home size=\{24\} />\
          <span className="text-xs">Home</span>\
        </button>\
        <button \
          onClick=\{() => startEntry('adhoc')\}\
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"\
        >\
          <Plus size=\{24\} />\
          <span className="text-xs">Note</span>\
        </button>\
        <button \
          onClick=\{() => setView('insights')\}\
          className=\{`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors $\{view === 'insights' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'\}`\}\
          disabled=\{!showInsights\}\
        >\
          <TrendingUp size=\{24\} />\
          <span className="text-xs">Insights</span>\
        </button>\
        <button \
          onClick=\{() => setView('data')\}\
          className=\{`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors $\{view === 'data' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'\}`\}\
        >\
          <Calendar size=\{24\} />\
          <span className="text-xs">Data</span>\
        </button>\
        <button \
          onClick=\{() => setView('settings')\}\
          className=\{`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors $\{view === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'\}`\}\
        >\
          <Settings size=\{24\} />\
          <span className="text-xs">Settings</span>\
        </button>\
      </div>\
    </div>\
  );\
\};\
\
const HomeView = (\{ startEntry, hasCompletedToday, entries, showInsights, setView \}) => \{\
  const today = new Date();\
  const greeting = today.getHours() < 12 ? 'Morning' : today.getHours() < 17 ? 'Afternoon' : 'Evening';\
  \
  return (\
    <div className="space-y-6">\
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">\
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">\{greeting\}</h2>\
        <p className="text-slate-600">Ready for your check-in?</p>\
      </div>\
\
      \{/* Check-in Cards */\}\
      <div className="space-y-3">\
        <CheckInCard\
          icon=\{<Sun size=\{24\} />\}\
          title="Morning Check-in"\
          subtitle="Baseline state & context"\
          time="~2 min"\
          completed=\{hasCompletedToday('morning')\}\
          onClick=\{() => startEntry('morning')\}\
          color="amber"\
        />\
        \
        <CheckInCard\
          icon=\{<Clock size=\{24\} />\}\
          title="Midday Ping"\
          subtitle="Quick snapshot"\
          time="~1 min"\
          completed=\{hasCompletedToday('midday')\}\
          onClick=\{() => startEntry('midday')\}\
          color="blue"\
        />\
        \
        <CheckInCard\
          icon=\{<Moon size=\{24\} />\}\
          title="Evening Reflection"\
          subtitle="Day summary & patterns"\
          time="~3 min"\
          completed=\{hasCompletedToday('evening')\}\
          onClick=\{() => startEntry('evening')\}\
          color="indigo"\
        />\
      </div>\
\
      \{/* Quick Stats */\}\
      \{entries.length > 0 && (\
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">\
          <h3 className="font-semibold text-slate-800 mb-4">Quick Stats</h3>\
          <div className="grid grid-cols-2 gap-4">\
            <div>\
              <p className="text-sm text-slate-500">Total Entries</p>\
              <p className="text-2xl font-bold text-slate-800">\{entries.length\}</p>\
            </div>\
            <div>\
              <p className="text-sm text-slate-500">Days Tracked</p>\
              <p className="text-2xl font-bold text-slate-800">\
                \{new Set(entries.map(e => new Date(e.timestamp).toDateString())).size\}\
              </p>\
            </div>\
          </div>\
          \{showInsights && (\
            <button \
              onClick=\{() => setView('insights')\}\
              className="mt-4 w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"\
            >\
              View Patterns & Insights \uc0\u8594 \
            </button>\
          )\}\
        </div>\
      )\}\
    </div>\
  );\
\};\
\
const CheckInCard = (\{ icon, title, subtitle, time, completed, onClick, color \}) => \{\
  const colorClasses = \{\
    amber: 'bg-amber-50 text-amber-600 border-amber-200',\
    blue: 'bg-blue-50 text-blue-600 border-blue-200',\
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',\
  \};\
\
  return (\
    <button\
      onClick=\{onClick\}\
      disabled=\{completed\}\
      className=\{`w-full bg-white rounded-xl p-5 shadow-sm border border-slate-200 text-left hover:shadow-md transition-all $\{completed ? 'opacity-60' : ''\}`\}\
    >\
      <div className="flex items-start gap-4">\
        <div className=\{`p-3 rounded-lg $\{colorClasses[color]\}`\}>\
          \{icon\}\
        </div>\
        <div className="flex-1">\
          <div className="flex justify-between items-start">\
            <h3 className="font-semibold text-slate-800">\{title\}</h3>\
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">\{time\}</span>\
          </div>\
          <p className="text-sm text-slate-600 mt-1">\{subtitle\}</p>\
          \{completed && (\
            <p className="text-xs text-emerald-600 mt-2 font-medium">\uc0\u10003  Completed today</p>\
          )\}\
        </div>\
      </div>\
    </button>\
  );\
\};\
\
const EntryView = (\{ entryType, currentEntry, updateEntryData, saveEntry, setView \}) => \{\
  const [step, setStep] = useState(0);\
  \
  const entryConfig = \{\
    morning: \{\
      title: 'Morning Check-in',\
      steps: ['Sleep & Baseline', 'Cognitive State', 'Affective State', 'Context']\
    \},\
    midday: \{\
      title: 'Midday Ping',\
      steps: ['Quick Snapshot']\
    \},\
    evening: \{\
      title: 'Evening Reflection',\
      steps: ['Day Summary', 'Observations']\
    \},\
    adhoc: \{\
      title: 'Noticing Moment',\
      steps: ['Quick Note']\
    \}\
  \};\
\
  const config = entryConfig[entryType];\
  const isLastStep = step === config.steps.length - 1;\
\
  const handleNext = () => \{\
    if (isLastStep) \{\
      saveEntry();\
    \} else \{\
      setStep(step + 1);\
    \}\
  \};\
\
  return (\
    <div className="space-y-6">\
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">\
        <div className="flex justify-between items-center mb-4">\
          <h2 className="text-xl font-semibold text-slate-800">\{config.title\}</h2>\
          <button \
            onClick=\{() => setView('home')\}\
            className="text-slate-400 hover:text-slate-600"\
          >\
            \uc0\u10005 \
          </button>\
        </div>\
        \
        \{/* Progress indicator */\}\
        <div className="flex gap-2 mb-6">\
          \{config.steps.map((_, idx) => (\
            <div \
              key=\{idx\}\
              className=\{`h-1 flex-1 rounded-full $\{idx <= step ? 'bg-blue-500' : 'bg-slate-200'\}`\}\
            />\
          ))\}\
        </div>\
\
        <h3 className="text-lg font-medium text-slate-700 mb-4">\{config.steps[step]\}</h3>\
\
        \{/* Render appropriate form based on step */\}\
        \{entryType === 'morning' && step === 0 && (\
          <MorningSleepForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
        \{entryType === 'morning' && step === 1 && (\
          <CognitiveForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
        \{entryType === 'morning' && step === 2 && (\
          <AffectiveForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
        \{entryType === 'morning' && step === 3 && (\
          <ContextForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
        \{entryType === 'midday' && (\
          <QuickSnapshotForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
        \{entryType === 'evening' && step === 0 && (\
          <DaySummaryForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
        \{entryType === 'evening' && step === 1 && (\
          <ObservationsForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
        \{entryType === 'adhoc' && (\
          <AdhocForm data=\{currentEntry.data\} updateData=\{updateEntryData\} />\
        )\}\
\
        <div className="flex gap-3 mt-6">\
          \{step > 0 && (\
            <button \
              onClick=\{() => setStep(step - 1)\}\
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"\
            >\
              Back\
            </button>\
          )\}\
          <button \
            onClick=\{handleNext\}\
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"\
          >\
            \{isLastStep ? 'Save Entry' : 'Next'\}\
          </button>\
        </div>\
      </div>\
    </div>\
  );\
\};\
\
const RatingScale = (\{ label, value, onChange, low = "Low", high = "High" \}) => (\
  <div className="mb-6">\
    <label className="block text-sm font-medium text-slate-700 mb-3">\{label\}</label>\
    <div className="space-y-2">\
      <input \
        type="range"\
        min="1"\
        max="10"\
        value=\{value || 5\}\
        onChange=\{(e) => onChange(parseInt(e.target.value))\}\
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"\
      />\
      <div className="flex justify-between text-xs text-slate-500">\
        <span>\{low\}</span>\
        <span className="font-semibold text-slate-700">\{value || 5\}/10</span>\
        <span>\{high\}</span>\
      </div>\
    </div>\
  </div>\
);\
\
const MorningSleepForm = (\{ data, updateData \}) => (\
  <div>\
    <RatingScale \
      label="Sleep Quality"\
      value=\{data.sleepQuality\}\
      onChange=\{(v) => updateData('sleepQuality', v)\}\
      low="Poor"\
      high="Excellent"\
    />\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">Hours Slept</label>\
      <input \
        type="number"\
        step="0.5"\
        value=\{data.sleepHours || ''\}\
        onChange=\{(e) => updateData('sleepHours', parseFloat(e.target.value))\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        placeholder="7.5"\
      />\
    </div>\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">Medication Status</label>\
      <select \
        value=\{data.medStatus || ''\}\
        onChange=\{(e) => updateData('medStatus', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
      >\
        <option value="">Select...</option>\
        <option value="taken">Taken</option>\
        <option value="not-taken">Not taken</option>\
        <option value="skipped">Intentionally skipped</option>\
      </select>\
    </div>\
    \{data.medStatus === 'taken' && (\
      <div className="mb-6">\
        <label className="block text-sm font-medium text-slate-700 mb-2">Time Taken</label>\
        <input \
          type="time"\
          value=\{data.medTime || ''\}\
          onChange=\{(e) => updateData('medTime', e.target.value)\}\
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        />\
      </div>\
    )\}\
  </div>\
);\
\
const CognitiveForm = (\{ data, updateData \}) => (\
  <div>\
    <RatingScale \
      label="Task Initiation Ease"\
      value=\{data.taskInitiation\}\
      onChange=\{(v) => updateData('taskInitiation', v)\}\
      low="Very Difficult"\
      high="Easy"\
    />\
    <RatingScale \
      label="Focus Sustainability"\
      value=\{data.focus\}\
      onChange=\{(v) => updateData('focus', v)\}\
      low="Can't Maintain"\
      high="Sustained"\
    />\
    <RatingScale \
      label="Mental Clarity"\
      value=\{data.clarity\}\
      onChange=\{(v) => updateData('clarity', v)\}\
      low="Foggy/Scattered"\
      high="Clear/Organized"\
    />\
    <RatingScale \
      label="Working Memory Feel"\
      value=\{data.workingMemory\}\
      onChange=\{(v) => updateData('workingMemory', v)\}\
      low="Difficult"\
      high="Fluid"\
    />\
  </div>\
);\
\
const AffectiveForm = (\{ data, updateData \}) => (\
  <div>\
    <RatingScale \
      label="Energy Level"\
      value=\{data.energy\}\
      onChange=\{(v) => updateData('energy', v)\}\
      low="Depleted"\
      high="Energized"\
    />\
    <RatingScale \
      label="Motivation/Drive"\
      value=\{data.motivation\}\
      onChange=\{(v) => updateData('motivation', v)\}\
      low="None"\
      high="Strong"\
    />\
    <RatingScale \
      label="Anxiety/Restlessness"\
      value=\{data.anxiety\}\
      onChange=\{(v) => updateData('anxiety', v)\}\
      low="Calm"\
      high="High Anxiety"\
    />\
    <RatingScale \
      label="Emotional Regulation"\
      value=\{data.emotionalReg\}\
      onChange=\{(v) => updateData('emotionalReg', v)\}\
      low="Reactive"\
      high="Stable"\
    />\
  </div>\
);\
\
const ContextForm = (\{ data, updateData \}) => (\
  <div>\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">Physical State</label>\
      <textarea \
        value=\{data.physicalContext || ''\}\
        onChange=\{(e) => updateData('physicalContext', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        rows="2"\
        placeholder="Exercise, food, caffeine..."\
      />\
    </div>\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">Stressors/Demands</label>\
      <textarea \
        value=\{data.stressors || ''\}\
        onChange=\{(e) => updateData('stressors', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        rows="2"\
        placeholder="What's on your plate today?"\
      />\
    </div>\
  </div>\
);\
\
const QuickSnapshotForm = (\{ data, updateData \}) => (\
  <div>\
    <RatingScale \
      label="Current Focus"\
      value=\{data.focus\}\
      onChange=\{(v) => updateData('focus', v)\}\
    />\
    <RatingScale \
      label="Energy Level"\
      value=\{data.energy\}\
      onChange=\{(v) => updateData('energy', v)\}\
    />\
    <RatingScale \
      label="Anxiety"\
      value=\{data.anxiety\}\
      onChange=\{(v) => updateData('anxiety', v)\}\
    />\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">Quick Note (optional)</label>\
      <textarea \
        value=\{data.note || ''\}\
        onChange=\{(e) => updateData('note', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        rows="2"\
        placeholder="Anything notable right now?"\
      />\
    </div>\
  </div>\
);\
\
const DaySummaryForm = (\{ data, updateData \}) => (\
  <div>\
    <RatingScale \
      label="Overall Day Quality"\
      value=\{data.dayQuality\}\
      onChange=\{(v) => updateData('dayQuality', v)\}\
      low="Challenging"\
      high="Smooth"\
    />\
    <RatingScale \
      label="Productivity Feel"\
      value=\{data.productivity\}\
      onChange=\{(v) => updateData('productivity', v)\}\
      low="Low Output"\
      high="Accomplished"\
    />\
    <RatingScale \
      label="Task Switching Cost"\
      value=\{data.taskSwitching\}\
      onChange=\{(v) => updateData('taskSwitching', v)\}\
      low="Very Difficult"\
      high="Fluid"\
    />\
  </div>\
);\
\
const ObservationsForm = (\{ data, updateData \}) => (\
  <div>\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">What Worked Today?</label>\
      <textarea \
        value=\{data.whatWorked || ''\}\
        onChange=\{(e) => updateData('whatWorked', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        rows="3"\
        placeholder="Strategies, contexts, or factors that helped..."\
      />\
    </div>\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">Challenges/Patterns Noticed</label>\
      <textarea \
        value=\{data.challenges || ''\}\
        onChange=\{(e) => updateData('challenges', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        rows="3"\
        placeholder="Difficulties or patterns you observed..."\
      />\
    </div>\
  </div>\
);\
\
const AdhocForm = (\{ data, updateData \}) => (\
  <div>\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">What Did You Notice?</label>\
      <textarea \
        value=\{data.observation || ''\}\
        onChange=\{(e) => updateData('observation', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        rows="4"\
        placeholder="Describe what felt different or noteworthy..."\
        autoFocus\
      />\
    </div>\
    <div className="mb-6">\
      <label className="block text-sm font-medium text-slate-700 mb-2">Context (optional)</label>\
      <textarea \
        value=\{data.context || ''\}\
        onChange=\{(e) => updateData('context', e.target.value)\}\
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"\
        rows="2"\
        placeholder="What was happening? Any relevant factors?"\
      />\
    </div>\
  </div>\
);\
\
const InsightsView = (\{ entries, calculateBaseline, getRecentTrend, setView \}) => \{\
  const daysTracked = new Set(entries.map(e => new Date(e.timestamp).toDateString())).size;\
  \
  const metrics = [\
    \{ key: 'focus', label: 'Focus', color: 'blue' \},\
    \{ key: 'energy', label: 'Energy', color: 'amber' \},\
    \{ key: 'anxiety', label: 'Anxiety', color: 'rose' \},\
    \{ key: 'motivation', label: 'Motivation', color: 'emerald' \},\
    \{ key: 'clarity', label: 'Mental Clarity', color: 'indigo' \},\
  ];\
\
  return (\
    <div className="space-y-6">\
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">\
        <div className="flex justify-between items-center mb-4">\
          <h2 className="text-xl font-semibold text-slate-800">Patterns & Insights</h2>\
          <button \
            onClick=\{() => setView('home')\}\
            className="text-slate-400 hover:text-slate-600"\
          >\
            \uc0\u10005 \
          </button>\
        </div>\
        \
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">\
          <div className="flex gap-3">\
            <AlertCircle className="text-blue-600 flex-shrink-0" size=\{20\} />\
            <div>\
              <p className="text-sm text-blue-900 font-medium">Patterns Emerging</p>\
              <p className="text-xs text-blue-700 mt-1">\
                You've tracked \{daysTracked\} days. Trends are beginning to appear.\
              </p>\
            </div>\
          </div>\
        </div>\
\
        <h3 className="font-medium text-slate-800 mb-4">Your Baselines</h3>\
        <div className="space-y-4">\
          \{metrics.map(metric => \{\
            const baseline = calculateBaseline(metric.key);\
            const recent = getRecentTrend(metric.key);\
            if (!baseline) return null;\
            \
            const change = recent ? (parseFloat(recent) - parseFloat(baseline)).toFixed(1) : null;\
            \
            return (\
              <div key=\{metric.key\} className="pb-4 border-b border-slate-200 last:border-0">\
                <div className="flex justify-between items-center mb-2">\
                  <span className="text-sm font-medium text-slate-700">\{metric.label\}</span>\
                  <span className="text-lg font-semibold text-slate-800">\{baseline\}/10</span>\
                </div>\
                \{change && (\
                  <div className="text-xs text-slate-600">\
                    Last 7 days: \{recent\}/10 \
                    <span className=\{`ml-2 $\{parseFloat(change) > 0 ? 'text-emerald-600' : 'text-slate-500'\}`\}>\
                      (\{change > 0 ? '+' : ''\}\{change\})\
                    </span>\
                  </div>\
                )\}\
              </div>\
            );\
          \})\}\
        </div>\
      </div>\
\
      \{daysTracked >= 14 && (\
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">\
          <h3 className="font-medium text-slate-800 mb-3">Early Observations</h3>\
          <p className="text-sm text-slate-600 leading-relaxed">\
            More sophisticated pattern detection and correlation analysis will unlock as you continue tracking. \
            Keep logging your daily check-ins to see deeper insights about medication effects, context correlations, \
            and temporal patterns.\
          </p>\
        </div>\
      )\}\
    </div>\
  );\
\};\
\
const DataView = (\{ entries, setView \}) => \{\
  const sortedEntries = [...entries].sort((a, b) => \
    new Date(b.timestamp) - new Date(a.timestamp)\
  );\
\
  const formatDate = (timestamp) => \{\
    const date = new Date(timestamp);\
    return date.toLocaleDateString('en-US', \{ \
      month: 'short', \
      day: 'numeric',\
      hour: '2-digit',\
      minute: '2-digit'\
    \});\
  \};\
\
  const typeLabels = \{\
    morning: 'Morning',\
    midday: 'Midday',\
    evening: 'Evening',\
    adhoc: 'Note'\
  \};\
\
  const typeColors = \{\
    morning: 'bg-amber-100 text-amber-700',\
    midday: 'bg-blue-100 text-blue-700',\
    evening: 'bg-indigo-100 text-indigo-700',\
    adhoc: 'bg-emerald-100 text-emerald-700'\
  \};\
\
  return (\
    <div className="space-y-6">\
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">\
        <div className="flex justify-between items-center mb-4">\
          <h2 className="text-xl font-semibold text-slate-800">Your Data</h2>\
          <button \
            onClick=\{() => setView('home')\}\
            className="text-slate-400 hover:text-slate-600"\
          >\
            \uc0\u10005 \
          </button>\
        </div>\
\
        \{entries.length === 0 ? (\
          <p className="text-slate-500 text-center py-8">No entries yet. Start tracking to see your data here.</p>\
        ) : (\
          <div className="space-y-3">\
            \{sortedEntries.map((entry, idx) => (\
              <div key=\{idx\} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">\
                <div className="flex justify-between items-start mb-2">\
                  <span className=\{`text-xs px-2 py-1 rounded $\{typeColors[entry.type]\}`\}>\
                    \{typeLabels[entry.type]\}\
                  </span>\
                  <span className="text-xs text-slate-500">\{formatDate(entry.timestamp)\}</span>\
                </div>\
                <div className="text-sm text-slate-600 space-y-1">\
                  \{entry.data.focus && <div>Focus: \{entry.data.focus\}/10</div>\}\
                  \{entry.data.energy && <div>Energy: \{entry.data.energy\}/10</div>\}\
                  \{entry.data.anxiety && <div>Anxiety: \{entry.data.anxiety\}/10</div>\}\
                  \{entry.data.observation && (\
                    <div className="mt-2 text-slate-700 italic">"\{entry.data.observation\}"</div>\
                  )\}\
                </div>\
              </div>\
            ))\}\
          </div>\
        )\}\
      </div>\
    </div>\
  );\
\};\
\
const SettingsView = (\{ notificationsEnabled, enableNotifications, isInstalled, setView \}) => \{\
  const exportData = () => \{\
    const data = localStorage.getItem('adhd-tracker-entries');\
    if (!data) \{\
      alert('No data to export');\
      return;\
    \}\
    \
    const blob = new Blob([data], \{ type: 'application/json' \});\
    const url = URL.createObjectURL(blob);\
    const a = document.createElement('a');\
    a.href = url;\
    a.download = `adhd-tracker-data-$\{new Date().toISOString().split('T')[0]\}.json`;\
    a.click();\
    URL.revokeObjectURL(url);\
  \};\
\
  return (\
    <div className="space-y-6">\
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">\
        <div className="flex justify-between items-center mb-6">\
          <h2 className="text-xl font-semibold text-slate-800">Settings</h2>\
          <button \
            onClick=\{() => setView('home')\}\
            className="text-slate-400 hover:text-slate-600"\
          >\
            \uc0\u10005 \
          </button>\
        </div>\
\
        <div className="space-y-6">\
          \{/* Installation Status */\}\
          <div className="pb-6 border-b border-slate-200">\
            <h3 className="font-medium text-slate-800 mb-3">Installation</h3>\
            \{isInstalled ? (\
              <div className="flex items-center gap-2 text-emerald-600">\
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>\
                <span className="text-sm">App installed successfully</span>\
              </div>\
            ) : (\
              <div className="text-sm text-slate-600">\
                <p className="mb-2">Install this app for the best experience:</p>\
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-500">\
                  <li>Works offline</li>\
                  <li>Faster loading</li>\
                  <li>Push notifications</li>\
                  <li>Full-screen experience</li>\
                </ul>\
              </div>\
            )\}\
          </div>\
\
          \{/* Notifications */\}\
          <div className="pb-6 border-b border-slate-200">\
            <h3 className="font-medium text-slate-800 mb-3">Notifications</h3>\
            \{notificationsEnabled ? (\
              <div className="flex items-center gap-2 text-emerald-600">\
                <Bell size=\{16\} />\
                <span className="text-sm">Notifications enabled</span>\
              </div>\
            ) : (\
              <div>\
                <p className="text-sm text-slate-600 mb-3">\
                  Get reminded for your daily check-ins\
                </p>\
                <button \
                  onClick=\{enableNotifications\}\
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"\
                >\
                  Enable Notifications\
                </button>\
              </div>\
            )\}\
          </div>\
\
          \{/* Data Export */\}\
          <div className="pb-6 border-b border-slate-200">\
            <h3 className="font-medium text-slate-800 mb-3">Data Management</h3>\
            <p className="text-sm text-slate-600 mb-3">\
              Export your data for backup or external analysis\
            </p>\
            <button \
              onClick=\{exportData\}\
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200"\
            >\
              <Download size=\{16\} />\
              Export Data (JSON)\
            </button>\
          </div>\
\
          \{/* About */\}\
          <div>\
            <h3 className="font-medium text-slate-800 mb-2">About</h3>\
            <p className="text-sm text-slate-600">\
              Research-style self-observation protocol for tracking cognition and affect patterns.\
            </p>\
            <p className="text-xs text-slate-500 mt-2">\
              Version 1.0.0\
            </p>\
          </div>\
        </div>\
      </div>\
    </div>\
  );\
\};\
\
export default ADHDTracker;}