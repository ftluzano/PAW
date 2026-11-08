/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from '@firebase/auth';
import { User, Animal, AdoptionApplication, FollowUpCheckIn, AnimalStatus } from './types.ts';
import { INITIAL_ANIMALS, INITIAL_APPLICATIONS, INITIAL_FOLLOW_UPS } from './data/initialData.ts';
import { AuthScreen } from './components/AuthScreen.tsx';
import { Header } from './components/Header.tsx';
import { WorkflowPipelineBar } from './components/WorkflowPipelineBar.tsx';
import { AnimalRecordsView } from './components/AnimalRecordsView.tsx';
import { AdoptionReviewView } from './components/AdoptionReviewView.tsx';
import { AdopterPortal } from './components/AdopterPortal.tsx';
import { CareAndFollowUpsView } from './components/CareAndFollowUpsView.tsx';
import { InCareHealthMonitoring } from './components/InCareHealthMonitoring.tsx';
import { PipelineBoard } from './components/PipelineBoard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Heart, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo.tsx';
import { firebaseAuth, resolveFirebaseUser } from './firebase.ts';

type PublicPetPost = Pick<Animal,
  'id' | 'name' | 'species' | 'breed' | 'age' | 'ageCategory' | 'gender' |
  'weightLbs' | 'size' | 'photoUrl' | 'story' | 'temperament' | 'neuteredSpayed'
>;

type PublicPetPostUpdate = {
  type: 'pet-post-updated';
  post: PublicPetPost;
} | {
  type: 'pet-posts-cleared';
};

const PUBLIC_POST_CHANNEL = 'paw-public-pet-posts';
const PUBLIC_POST_STATUSES = new Set<AnimalStatus>(['Listed for Adoption', 'Application', 'Review & Match']);

const toPublicPetPost = (animal: Animal): PublicPetPost => ({
  id: animal.id,
  name: animal.name,
  species: animal.species,
  breed: animal.breed,
  age: animal.age,
  ageCategory: animal.ageCategory,
  gender: animal.gender,
  weightLbs: animal.weightLbs,
  size: animal.size,
  photoUrl: animal.photoUrl,
  story: animal.story,
  temperament: [...animal.temperament],
  neuteredSpayed: animal.neuteredSpayed,
});

const fromPublicPetPost = (post: PublicPetPost): Animal => ({
  ...post,
  intakeType: 'Rescued',
  intakeDate: new Date().toISOString().split('T')[0],
  intakeLocation: 'PAW adoption program',
  intakeNotes: '',
  status: 'Listed for Adoption',
  healthStatus: 'Healthy / Stable',
  microchipId: '',
  medicalHistory: [],
  illnessIncidents: [],
  dailyHealthChecks: [],
  vaccinations: [],
  treatments: [],
  careNotes: [],
});

async function authorizedPostRequest(method: 'POST' | 'DELETE', body?: Record<string, unknown>) {
  const firebaseUser = firebaseAuth?.currentUser;
  if (!firebaseUser) throw new Error('Your admin session expired. Sign in again.');
  const response = await fetch('/api/pet-posts', {
    method,
    headers: {
      Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(result.error || 'Turso could not save the pet records.');
  return result;
}

async function applicationRequest(method: 'GET' | 'POST' | 'DELETE', body?: Record<string, unknown>) {
  const firebaseUser = firebaseAuth?.currentUser;
  if (!firebaseUser) throw new Error('Your sign-in session expired. Sign in again.');
  const response = await fetch('/api/adoption-applications', {
    method,
    headers: {
      Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({})) as { error?: string; applications?: AdoptionApplication[] };
  if (!response.ok) throw new Error(result.error || 'Could not save the adoption application.');
  return result;
}

export default function App() {
  // Authentication state - Starts on AuthScreen before entering mainscreen
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(Boolean(firebaseAuth));

  // Application Data States
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [applications, setApplications] = useState<AdoptionApplication[]>(INITIAL_APPLICATIONS);
  const [followUps, setFollowUps] = useState<FollowUpCheckIn[]>(INITIAL_FOLLOW_UPS);

  // Navigation and Filter States
  const [activeTab, setActiveTab] = useState<string>('records');
  const [selectedWorkflowStatus, setSelectedWorkflowStatus] = useState<AnimalStatus | 'All'>('All');
  const [selectedAnimalForCare, setSelectedAnimalForCare] = useState<Animal | null>(null);
  const postUpdateChannel = useRef<BroadcastChannel | null>(null);
  const postEtag = useRef('');

  useEffect(() => {
    if (!firebaseAuth) return;

    let activeRequest = 0;
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (firebaseUser) => {
        const requestId = ++activeRequest;
        if (!firebaseUser) {
          setCurrentUser(null);
          setIsAuthInitializing(false);
          return;
        }

        void resolveFirebaseUser(firebaseUser, true).then((user) => {
          if (requestId !== activeRequest) return;
          setCurrentUser(user);
          setActiveTab(user.role === 'admin' ? 'admin-dashboard' : user.role === 'staff' ? 'records' : 'browse');
        }).catch(() => {
          if (requestId === activeRequest) setCurrentUser(null);
        }).finally(() => {
          if (requestId === activeRequest) setIsAuthInitializing(false);
        });
      },
      () => {
        setCurrentUser(null);
        setIsAuthInitializing(false);
      }
    );

    return () => {
      activeRequest += 1;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(PUBLIC_POST_CHANNEL);
    postUpdateChannel.current = channel;
    const handlePostUpdate = (event: MessageEvent<PublicPetPostUpdate>) => {
      if (event.data?.type === 'pet-posts-cleared') {
        setAnimals((prev) => prev.filter((animal) => !PUBLIC_POST_STATUSES.has(animal.status)));
      } else if (event.data?.type === 'pet-post-updated' && event.data.post?.id) {
        const updatedPost = event.data.post;
        setAnimals((prev) => prev.some((animal) => animal.id === updatedPost.id)
          ? prev.map((animal) => animal.id === updatedPost.id ? { ...animal, ...updatedPost } : animal)
          : [fromPublicPetPost(updatedPost), ...prev]);
      }
    };

    channel.addEventListener('message', handlePostUpdate);
    return () => {
      channel.removeEventListener('message', handlePostUpdate);
      channel.close();
      postUpdateChannel.current = null;
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    let requestInFlight = false;

    const pollPublicPosts = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const response = await fetch('/api/pet-posts', {
          cache: 'no-store',
          headers: postEtag.current ? { 'If-None-Match': postEtag.current } : {},
        });
        if (response.status === 304) return;
        if (!response.ok) return;
        postEtag.current = response.headers.get('ETag') || '';
        let result = await response.json() as { initialized: boolean; posts: PublicPetPost[] };

        if (!result.initialized && currentUser.role === 'admin') {
          await authorizedPostRequest('POST', {
            action: 'initialize',
            posts: animals.filter((animal) => PUBLIC_POST_STATUSES.has(animal.status)).map(toPublicPetPost),
          });
          const initializedResponse = await fetch('/api/pet-posts', {
            cache: 'no-store',
            headers: postEtag.current ? { 'If-None-Match': postEtag.current } : {},
          });
          if (!initializedResponse.ok) return;
          postEtag.current = initializedResponse.headers.get('ETag') || '';
          result = await initializedResponse.json() as { initialized: boolean; posts: PublicPetPost[] };
        }

        if (!active || !result.initialized) return;
        const postsById = new Map(result.posts.map((post) => [post.id, post]));
        setAnimals((previous) => {
          const knownPostIds = new Set<string>();
          const merged = previous.flatMap((animal) => {
            if (!PUBLIC_POST_STATUSES.has(animal.status)) return [animal];
            const post = postsById.get(animal.id);
            if (!post) return [];
            knownPostIds.add(post.id);
            return [{ ...animal, ...post }];
          });
          return [...merged, ...result.posts.filter((post) => !knownPostIds.has(post.id)).map(fromPublicPetPost)];
        });
      } catch {
        // Keep the last available local view during brief network or database outages.
      } finally {
        requestInFlight = false;
      }
    };

    void pollPublicPosts();
    const pollTimer = window.setInterval(() => void pollPublicPosts(), 3000);
    return () => {
      active = false;
      window.clearInterval(pollTimer);
    };
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    let active = true;
    let requestInFlight = false;
    const loadApplications = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const result = await applicationRequest('GET');
        if (active && Array.isArray(result.applications)) {
          setApplications(result.applications);
        }
      } catch {
        // Keep the demo applications visible if Turso is briefly unavailable.
      } finally {
        requestInFlight = false;
      }
    };
    void loadApplications();
    const applicationPollTimer = window.setInterval(() => void loadApplications(), 3000);
    return () => {
      active = false;
      window.clearInterval(applicationPollTimer);
    };
  }, [currentUser?.id, currentUser?.role]);

  // Handle Authentication
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthInitializing(false);
    // Set appropriate initial tab based on role
    if (user.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else if (user.role === 'staff') {
      setActiveTab('records');
    } else {
      setActiveTab('browse');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedWorkflowStatus('All');
    if (firebaseAuth) void signOut(firebaseAuth);
  };

  // Animal Data Handlers
  const handleAddAnimal = (newAnimal: Animal) => {
    setAnimals((prev) => [newAnimal, ...prev]);
  };

  const handleUpdateAnimal = (updatedAnimal: Animal) => {
    setAnimals((prev) => prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a)));
    setSelectedAnimalForCare((current) => current?.id === updatedAnimal.id ? updatedAnimal : current);
  };

  const handleUpdateAnimalPost = async (updatedAnimal: Animal) => {
    const post = toPublicPetPost(updatedAnimal);
    await authorizedPostRequest('POST', { action: 'upsert', post });
    handleUpdateAnimal(updatedAnimal);
    postUpdateChannel.current?.postMessage({ type: 'pet-post-updated', post });
  };

  const handleCreateAnimalPost = async (newAnimal: Animal) => {
    const post = toPublicPetPost(newAnimal);
    await authorizedPostRequest('POST', { action: 'upsert', post });
    setAnimals((previous) => [newAnimal, ...previous]);
    postUpdateChannel.current?.postMessage({ type: 'pet-post-updated', post });
  };

  const handleClearPublicPosts = async () => {
    await authorizedPostRequest('DELETE');
    setAnimals((previous) => previous.filter((animal) => !PUBLIC_POST_STATUSES.has(animal.status)));
    postUpdateChannel.current?.postMessage({ type: 'pet-posts-cleared' });
  };

  const handleClearAllRecords = async () => {
    await authorizedPostRequest('DELETE');
    await applicationRequest('DELETE');
    setAnimals([]);
    setApplications([]);
    setFollowUps([]);
    postUpdateChannel.current?.postMessage({ type: 'pet-posts-cleared' });
  };

  const handleMoveAnimalStage = (animalId: string, nextStatus: AnimalStatus) => {
    setAnimals((prev) =>
      prev.map((a) => (a.id === animalId ? { ...a, status: nextStatus } : a))
    );
  };

  const handleUpdateAnimalStatus = (
    petId: string,
    newStatus: AnimalStatus,
    approvedApplication?: AdoptionApplication
  ) => {
    const adoptionDate = new Date().toISOString().split('T')[0];
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === petId) {
          return {
            ...a,
            status: newStatus,
            adopterName: newStatus === 'Adoption & Follow-up' ? approvedApplication?.applicantName || a.adopterName : a.adopterName,
            adopterEmail: newStatus === 'Adoption & Follow-up' ? approvedApplication?.applicantEmail || a.adopterEmail : a.adopterEmail,
            adoptionDate: newStatus === 'Adoption & Follow-up' ? adoptionDate : a.adoptionDate,
          };
        }
        return a;
      })
    );

    if (newStatus === 'Adoption & Follow-up' && approvedApplication) {
      const createDueDate = (days: number) => {
        const dueDate = new Date(`${adoptionDate}T00:00:00Z`);
        dueDate.setUTCDate(dueDate.getUTCDate() + days);
        return dueDate.toISOString().split('T')[0];
      };
      const milestones = [
        { days: 30, title: '30-Day Transition Check-in' as const },
        { days: 60, title: '60-Day Wellness Review' as const },
      ];
      setFollowUps((prev) => {
        const newFollowUps = milestones
          .map(({ days, title }) => ({
            id: `fup-${approvedApplication.id}-${days}`,
            petId,
            petName: approvedApplication.petName,
            adopterName: approvedApplication.applicantName,
            adopterEmail: approvedApplication.applicantEmail,
            adoptionDate,
            milestoneTitle: title,
            dueDate: createDueDate(days),
            status: 'Pending' as const,
          }))
          .filter((newFollowUp) => !prev.some((followUp) => followUp.id === newFollowUp.id));
        return [...prev, ...newFollowUps];
      });
    }
  };

  // Applications Handlers
  const handleUpdateApplication = async (updatedApp: AdoptionApplication) => {
    await applicationRequest('POST', { action: 'upsert', application: updatedApp });
    setApplications((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
  };

  const handleSubmitNewApplication = async (newApp: AdoptionApplication) => {
    await applicationRequest('POST', { action: 'submit', application: newApp });
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

  if (isAuthInitializing) {
    return (
      <div className="auth-screen min-h-screen flex flex-col items-center justify-center gap-5">
        <BrandLogo size="large" />
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
      </div>
    );
  }

  // IF NOT AUTHENTICATED: Show AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // IF AUTHENTICATED: Show Main Screen
  const isStaff = currentUser.role === 'staff';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Bar Contract (3 zones) */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Slide 4 Basic Workflow Bar (Clickable 6-stage filter) */}
      {isStaff && (
        <WorkflowPipelineBar
          selectedStatus={selectedWorkflowStatus}
          onSelectStatus={(status) => {
            setSelectedWorkflowStatus(status);
            if (status !== 'All' && activeTab !== 'records' && activeTab !== 'pipeline') {
              setActiveTab('records');
            }
          }}
          statusCounts={statusCounts}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div key={`${currentUser.role}-${activeTab}`} className="app-content">

        {isAdmin && (
          <AdminDashboard
            user={currentUser}
            animals={animals}
            applications={applications}
            followUps={followUps}
            onUpdateAnimal={handleUpdateAnimalPost}
            onCreateAnimal={handleCreateAnimalPost}
            onClearPosts={handleClearPublicPosts}
            onClearAll={handleClearAllRecords}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />
        )}
        
        {/* SHELTER / RESCUE STAFF VIEWS */}
        {isStaff && (
          <>
            {activeTab === 'records' && (
              <AnimalRecordsView
                animals={animals}
                onAddAnimal={handleAddAnimal}
                onUpdateAnimal={handleUpdateAnimal}
                selectedStatusFilter={selectedWorkflowStatus}
                initialSelectedAnimal={selectedAnimalForCare}
                onClearInitialSelection={() => setSelectedAnimalForCare(null)}
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
        {currentUser.role === 'adopter' && (
          <AdopterPortal
            user={currentUser}
            animals={animals}
            applications={applications}
            followUps={followUps}
            onSubmitApplication={handleSubmitNewApplication}
            onSubmitFollowUpCheckIn={handleSubmitAdopterCheckIn}
            onNavigate={setActiveTab}
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
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo tone="light" />
          </div>

        </div>
      </footer>
    </div>
  );
}
