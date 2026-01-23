import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Home } from "@/pages/Home"
import { Jobs } from "@/pages/Jobs"
import { JobDetail } from "@/pages/JobDetail"
import { Escrow } from "@/pages/Escrow"
import { Auth } from "@/pages/Auth"
import { Talent } from "@/pages/Talent"
import { HowItWorks } from "@/pages/HowItWorks"
import { Messages } from "@/pages/Messages"
import { WalletContextProvider } from "@/context/WalletContextProvider"
import { PostJob } from "@/pages/client/PostJob"
import { ManageJobs } from "@/pages/client/ManageJobs"
import { ClientDashboard } from "@/pages/client/Dashboard"
import { FreelancerDashboard } from "@/pages/freelancer/Dashboard"
import { MyProposals } from "@/pages/freelancer/MyProposals"
import { ActiveContracts } from "@/pages/freelancer/ActiveContracts"
import { FreelancerProfile } from "@/pages/FreelancerProfile"

function App() {
  console.log("App.tsx: Rendering...");
  return (
    <Router>
      <WalletContextProvider>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
          <Routes>
            <Route path="/" element={<><Navbar /><main><Home /></main><Footer /></>} />
            <Route path="/jobs" element={<><Navbar /><main><Jobs /></main><Footer /></>} />
            <Route path="/jobs/:id" element={<><Navbar /><main><JobDetail /></main><Footer /></>} />
            <Route path="/talent" element={<><Navbar /><main><Talent /></main><Footer /></>} />
            <Route path="/talent/:id" element={<><Navbar /><main><FreelancerProfile /></main><Footer /></>} />
            <Route path="/how-it-works" element={<><Navbar /><main><HowItWorks /></main><Footer /></>} />
            <Route path="/escrow" element={<><Navbar /><main><Escrow /></main><Footer /></>} />
            <Route path="/messages" element={<><Navbar /><main><Messages /></main><Footer /></>} />
            <Route path="/auth/*" element={<Auth />} />

            {/* Client Dashboard Routes */}
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/post-job" element={<PostJob />} />
            <Route path="/client/jobs" element={<ManageJobs />} />

            {/* Freelancer Dashboard Routes */}
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/freelancer/proposals" element={<MyProposals />} />
            <Route path="/freelancer/contracts" element={<ActiveContracts />} />
          </Routes>
        </div>
      </WalletContextProvider>
    </Router>
  )
}

export default App
