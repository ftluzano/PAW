/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Animal, AdoptionApplication, FollowUpCheckIn, AnimalStatus, UserRole } from './types.ts';
import { INITIAL_ANIMALS, INITIAL_APPLICATIONS, INITIAL_FOLLOW_UPS, INITIAL_STAFF_USER, INITIAL_ADOPTER_USER } from './data/initialData.ts';
import { AuthScreen } from './components/AuthScreen.tsx';
import { Header } from './components/Header.tsx';
import { WorkflowPipelineBar } from './components/WorkflowPipelineBar.tsx';
import { AnimalRecordsView } from './components/AnimalRecordsView.tsx';
import { AdoptionReviewView } from './components/AdoptionReviewView.tsx';
import { AdopterPortal } from './components/AdopterPortal.tsx';
import { CareAndFollowUpsView } from './components/CareAndFollowUpsView.tsx';
import { InCareHealthMonitoring } from './components/InCareHealthMonitoring.tsx';
import { PipelineBoard } from './components/PipelineBoard.tsx';
import { SystemScopeModal } from './components/SystemScopeModal.tsx';
import { Info, Heart, ShieldCheck, PawPrint } from 'lucide-react';

export default function App() {
  // Authentication state - Starts on AuthScreen before entering mainscreen
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Application Data States
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [applications, setApplications] = useState<AdoptionApplication[]>(INITIAL_APPLICATIONS);
  const [followUps, setFollowUps] = useState<FollowUpCheckIn[]>(INITIAL_FOLLOW_UPS);

  // Navigation and Filter States
  const [activeTab, setActiveTab] = useState<string>('records');
  const [selectedWorkflowStatus, setSelectedWorkflowStatus] = useState<AnimalStatus | 'All'>('All');
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [selectedAnimalForCare, setSelectedAnimalForCare] = useState<Animal | null>(null);

  // Handle Authentication
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Set appropriate initial tab based on role
    if (user.role === 'staff') {
      setActiveTab('records');
    } else {
      setActiveTab('browse');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedWorkflowStatus('All');
  };

  const handleRoleToggle = () => {
    if (!currentUser) return;
    const newRole: UserRole = currentUser.role === 'staff' ? 'adopter' : 'staff';
    const updatedUser: User = {
      ...currentUser,
      role: newRole,
      name: newRole === 'staff' ? 'Sarah Martinez (Staff Mode)' : 'Franklin Luzano (Adopter Mode)',
      organization: newRole === 'staff' ? 'Hope Haven Animal Welfare' : undefined,
    };
    setCurrentUser(updatedUser);
    setActiveTab(newRole === 'staff' ? 'records' : 'browse');
  };

  // Animal Data Handlers
  const handleAddAnimal = (newAnimal: Animal) => {
    setAnimals((prev) => [newAnimal, ...prev]);
  };

  const handleUpdateAnimal = (updatedAnimal: Animal) => {
    setAnimals((prev) => prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a)));
  };

  const handleMoveAnimalStage = (animalId: string, nextStatus: AnimalStatus) => {
    setAnimals((prev) =>
      prev.map((a) => (a.id === animalId ? { ...a, status: nextStatus } : a))
    );
  };

  const handleUpdateAnimalStatus = (petId: string, newStatus: AnimalStatus) => {
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === petId) {
          return {
            ...a,
            status: newStatus,
            adopterName: newStatus === 'Adoption & Follow-up' ? 'Approved Adopter' : a.adopterName,
            adoptionDate: newStatus === 'Adoption & Follow-up' ? new Date().toISOString().split('T')[0] : a.adoptionDate,
          };
        }
        return a;
      })
    );
  };

  // Applications Handlers
  const handleUpdateApplication = (updatedApp: AdoptionApplication) => {
    setApplications((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
  };

  const handleSubmitNewApplication = (newApp: AdoptionApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    // Also move animal status to 'Application' if not already in later stage
    setAnimals((prev) =>
      prev.map((a) => (a.id === newApp.petId && a.status === 'Listed for Adoption' ? { ...a, status: 'Application' } : a))
    );
  };

  // Follow-up Handlers
  const handleCompleteFollowUp = (id: string, notes: string) => {
    setFollowUps((prev) =>
      prev.map((fup) =>
        fup.id === id
          ? {
              ...fup,
              status: 'Completed',
              completedDate: new Date().toISOString().split('T')[0],
              notes: notes,
            }
          : fup
      )
    );
  };

  const handleSubmitAdopterCheckIn = (
    checkInId: string,
    notes: string,
    rating: number,
    vetDone: boolean
  ) => {
    setFollowUps((prev) =>
      prev.map((fup) =>
        fup.id === checkInId
          ? {
              ...fup,
              status: 'Completed',
              completedDate: new Date().toISOString().split('T')[0],
              healthConfirmed: true,
              vetCheckDone: vetDone,
              adjustmentRating: rating,
              notes: notes,
            }
          : fup
      )
    );
  };

  // Calculate animal counts per status for the 6-stage workflow bar
  const statusCounts = animals.reduce((acc, animal) => {
    acc[animal.status] = (acc[animal.status] || 0) + 1;
    return acc;
  }, {} as Record<AnimalStatus, number>);

  // IF NOT AUTHENTICATED: Show AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // IF AUTHENTICATED: Show Main Screen
  const isStaff = currentUser.role === 'staff';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Bar Contract (3 zones) */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRoleToggle={handleRoleToggle}
        onOpenScopeModal={() => setIsScopeModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Slide 4 Basic Workflow Bar (Clickable 6-stage filter) */}
      <WorkflowPipelineBar
        selectedStatus={selectedWorkflowStatus}
        onSelectStatus={(status) => {
          setSelectedWorkflowStatus(status);
          if (status !== 'All' && isStaff && activeTab !== 'records' && activeTab !== 'pipeline') {
            setActiveTab('records');
          }
        }}
        statusCounts={statusCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* SHELTER / RESCUE STAFF VIEWS */}
        {isStaff && (
          <>
            {activeTab === 'records' && (
              <AnimalRecordsView
                animals={animals}
                onAddAnimal={handleAddAnimal}
                onUpdateAnimal={handleUpdateAnimal}
                selectedStatusFilter={selectedWorkflowStatus}
              />
            )}

            {activeTab === 'clinical' && (
              <InCareHealthMonitoring
                animals={animals}
                onUpdateAnimal={handleUpdateAnimal}
              />
            )}

            {activeTab === 'pipeline' && (
              <PipelineBoard
                animals={animals}
                onMoveStage={handleMoveAnimalStage}
                onSelectAnimal={(animal) => {
                  setSelectedAnimalForCare(animal);
                  setActiveTab('records');
                }}
              />
            )}

            {activeTab === 'applications' && (
              <AdoptionReviewView
                applications={applications}
                animals={animals}
                onUpdateApplication={handleUpdateApplication}
                onUpdateAnimalStatus={handleUpdateAnimalStatus}
              />
            )}

            {(activeTab === 'followups' || activeTab === 'reports') && (
              <CareAndFollowUpsView
                animals={animals}
                followUps={followUps}
                applications={applications}
                onCompleteFollowUp={handleCompleteFollowUp}
              />
            )}
          </>
        )}

        {/* POTENTIAL ADOPTER VIEWS */}
        {!isStaff && (
          <AdopterPortal
            user={currentUser}
            animals={animals}
            applications={applications}
            followUps={followUps}
            onSubmitApplication={handleSubmitNewApplication}
            onSubmitFollowUpCheckIn={handleSubmitAdopterCheckIn}
            activeSubTab={
              activeTab === 'browse'
                ? 'browse'
                : activeTab === 'my-applications'
                ? 'my-applications'
                : activeTab === 'adopter-followup'
                ? 'follow-up'
                : 'care-guide'
            }
          />
        )}
      </main>

      {/* Quiet, anti-slop footer (§1.B) */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <PawPrint className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-700">PAW Pet Adoption & Care System</span>
            <span aria-hidden="true">·</span>
            <span>Helping every animal move toward a safe, loving home.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsScopeModalOpen(true)}
              className="hover:text-teal-700 transition-colors"
            >
              System Scope & Limitations
            </button>
            <span aria-hidden="true">·</span>
            <span>Ethical Human-Led Care</span>
          </div>
        </div>
      </footer>

      {/* System Scope & Limitations Modal (From the attached PDF document) */}
      <SystemScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
      />
    </div>
  );
}
