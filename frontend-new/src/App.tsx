import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Home } from "@/pages/Home"
import { Jobs } from "@/pages/Jobs"
import { JobDetail } from "@/pages/JobDetail"
import { Escrow } from "@/pages/Escrow"
import { Auth } from "@/pages/Auth"
import { Talent } from "@/pages/Talent"
import { HowItWorks } from "@/pages/HowItWorks"
import { Messages } from "@/pages/Messages"
import { WalletContextProvider } from "@/context/WalletContextProvider"
import { AuthProvider } from "@/context/AuthContext"
import { PostJob } from "@/pages/client/PostJob"
import { ManageJobs } from "@/pages/client/ManageJobs"
import { ClientDashboard } from "@/pages/client/Dashboard"
import { JobProposals } from "@/pages/client/JobProposals"
import { Contracts } from "@/pages/client/Contracts"
import { ContractDetail } from "@/pages/client/ContractDetail"
import { FreelancerDashboard } from "@/pages/freelancer/Dashboard"
import { MyProposals } from "@/pages/freelancer/MyProposals"
import { ActiveContracts } from "@/pages/freelancer/ActiveContracts"
import { FreelancerContractDetail } from "@/pages/freelancer/ContractDetail"
import { EditProfile } from "@/pages/freelancer/EditProfile"
import { EditProfile as ClientEditProfile } from "@/pages/client/EditProfile"
import { FreelancerProfile } from "@/pages/FreelancerProfile"
import { Onboarding } from "@/pages/Onboarding"

function App() {
  console.log("App.tsx: Rendering...");
  return (
    <Router>
      <WalletContextProvider>
        <AuthProvider>
          <ErrorBoundary>
          <div className="min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Navbar /><main><Home /></main><Footer /></>} />
              <Route path="/jobs" element={<><Navbar /><main><Jobs /></main><Footer /></>} />
              <Route path="/offers" element={<><Navbar /><main><Jobs /></main><Footer /></>} />
              <Route path="/jobs/:id" element={<><Navbar /><main><JobDetail /></main><Footer /></>} />
              <Route path="/offers/:id" element={<><Navbar /><main><JobDetail /></main><Footer /></>} />
              <Route path="/talent" element={<><Navbar /><main><Talent /></main><Footer /></>} />
              <Route path="/gigs" element={<><Navbar /><main><Talent /></main><Footer /></>} />
              <Route path="/talent/:id" element={<><Navbar /><main><FreelancerProfile /></main><Footer /></>} />
              <Route path="/freelancer/:id" element={<><Navbar /><main><FreelancerProfile /></main><Footer /></>} />
              <Route path="/profile/:id" element={<><Navbar /><main><FreelancerProfile /></main><Footer /></>} />
              <Route path="/how-it-works" element={<><Navbar /><main><HowItWorks /></main><Footer /></>} />
              <Route path="/escrow" element={<><Navbar /><main><Escrow /></main><Footer /></>} />
              <Route path="/auth/*" element={<Auth />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <><Navbar /><main><Onboarding /></main></>
                </ProtectedRoute>
              } />

              {/* Protected Routes - Any authenticated user */}
              <Route path="/messages" element={
                <ProtectedRoute>
                  <><Navbar /><main><Messages /></main><Footer /></>
                </ProtectedRoute>
              } />

              {/* Client Dashboard Routes - Client only */}
              <Route path="/client/dashboard" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/client/post-job" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <PostJob />
                </ProtectedRoute>
              } />
              <Route path="/client/jobs" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ManageJobs />
                </ProtectedRoute>
              } />
              <Route path="/client/jobs/:id/proposals" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <JobProposals />
                </ProtectedRoute>
              } />
              <Route path="/client/contracts" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <Contracts />
                </ProtectedRoute>
              } />
              <Route path="/client/contracts/:id" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ContractDetail />
                </ProtectedRoute>
              } />
              <Route path="/client/profile" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientEditProfile />
                </ProtectedRoute>
              } />

              {/* Freelancer Dashboard Routes - Freelancer only */}
              <Route path="/freelancer/dashboard" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/freelancer/proposals" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <MyProposals />
                </ProtectedRoute>
              } />
              <Route path="/freelancer/contracts" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <ActiveContracts />
                </ProtectedRoute>
              } />
              <Route path="/freelancer/contracts/:id" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerContractDetail />
                </ProtectedRoute>
              } />
              <Route path="/freelancer/profile" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <EditProfile />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          </ErrorBoundary>
        </AuthProvider>
      </WalletContextProvider>
    </Router>
  )
}

export default App
