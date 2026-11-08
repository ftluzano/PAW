import React, { useState } from 'react';
import { Animal, AdoptionApplication, FollowUpCheckIn, User, Species } from '../types.ts';
import { Heart, Search, ShieldCheck, CheckCircle2, AlertCircle, Calendar, Clock, Home, X, Sparkles, Send, PawPrint, Eye, FileText, Stethoscope } from 'lucide-react';

interface AdopterPortalProps {
  user: User;
  animals: Animal[];
  applications: AdoptionApplication[];
  followUps: FollowUpCheckIn[];
  onSubmitApplication: (app: AdoptionApplication) => void;
  onSubmitFollowUpCheckIn: (checkInId: string, notes: string, rating: number, vetDone: boolean) => void;
  activeSubTab?: string;
  onNavigate: (tab: string) => void;
}

export const AdopterPortal: React.FC<AdopterPortalProps> = ({
  user,
  animals,
  applications,
  followUps,
  onSubmitApplication,
  onSubmitFollowUpCheckIn,
  activeSubTab = 'browse',
  onNavigate,
}) => {
  const subTab = (activeSubTab || 'browse') as 'browse' | 'my-applications' | 'follow-up' | 'care-guide';
  const navigateToSubTab = (tab: 'browse' | 'my-applications' | 'follow-up' | 'care-guide') => {
    onNavigate(tab === 'follow-up' ? 'adopter-followup' : tab);
  };

  // Browse filters
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'All'>('All');
  const [selectedPetForDetail, setSelectedPetForDetail] = useState<Animal | null>(null);
  const [selectedPetForApply, setSelectedPetForApply] = useState<Animal | null>(null);

  // Application Form States
  const [homeType, setHomeType] = useState<'House with yard' | 'Apartment' | 'Condo' | 'Townhouse' | 'Rural/Farm'>('House with yard');
  const [ownOrRent, setOwnOrRent] = useState<'Own' | 'Rent'>('Own');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [otherPetsDetails, setOtherPetsDetails] = useState('');
  const [hoursAloneDaily, setHoursAloneDaily] = useState(4);
  const [petExperience, setPetExperience] = useState('Experienced with rescue pets for 8+ years.');
  const [motivation, setMotivation] = useState('We are excited to provide a warm, loving, lifelong home with plenty of attention and exercise.');
  const [applicantPhone, setApplicantPhone] = useState('(555) 234-8901');
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Follow-up check-in state
  const [checkInId, setCheckInId] = useState('');
  const [checkInRating, setCheckInRating] = useState(5);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInVetDone, setCheckInVetDone] = useState(true);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Pets available for public browsing (Listed for Adoption, Application, or Review & Match)
  const availablePets = animals.filter(
    (a) => a.status === 'Listed for Adoption' || a.status === 'Application' || a.status === 'Review & Match'
  );

  const filteredPets = availablePets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = speciesFilter === 'All' || pet.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  // User's own applications
  const myApplications = applications.filter(
    (app) => app.applicantId === user.id || app.applicantEmail.toLowerCase() === user.email.toLowerCase()
  );
  const myFollowUps = followUps.filter((followUp) => followUp.adopterEmail.toLowerCase() === user.email.toLowerCase());
  const activeFollowUps = myFollowUps.filter((followUp) => followUp.status === 'Pending' || followUp.status === 'Overdue');
  const activeFollowUp = activeFollowUps.find((followUp) => followUp.id === checkInId) || activeFollowUps[0];

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetForApply) return;

    const newApp: AdoptionApplication = {
      id: `app-${Date.now().toString().slice(-4)}`,
      petId: selectedPetForApply.id,
      petName: selectedPetForApply.name,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      applicantPhone: applicantPhone,
      homeType: homeType,
      ownOrRent: ownOrRent,
      hasOtherPets: hasOtherPets,
      otherPetsDetails: hasOtherPets ? otherPetsDetails : undefined,
      hoursAloneDaily: Number(hoursAloneDaily),
      petExperience: petExperience,
      motivation: motivation,
      status: 'Submitted',
      submissionDate: new Date().toISOString().split('T')[0],
    };

    onSubmitApplication(newApp);
    setApplicationSuccess(true);
    setTimeout(() => {
      setSelectedPetForApply(null);
      setApplicationSuccess(false);
      navigateToSubTab('my-applications');
    }, 1200);
  };

  const handleFollowUpSubmit = (e: React.FormEvent, checkInId: string) => {
    e.preventDefault();
    onSubmitFollowUpCheckIn(checkInId, checkInNotes, checkInRating, checkInVetDone);
    setCheckInSuccess(true);
    setTimeout(() => {
      setCheckInSuccess(false);
      setCheckInNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* VIEW 1: BROWSE AVAILABLE PETS */}
      {subTab === 'browse' && (
        <div className="space-y-6">
          
          {/* Search & Species filter bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by pet name, breed, traits..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['All', 'Dog', 'Cat'] as const).map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSpeciesFilter(sp)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    speciesFilter === sp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/85 text-white backdrop-blur-sm">
                        {pet.species}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-800/80 text-teal-200 backdrop-blur-sm">
                        {pet.ageCategory}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/95 text-slate-800 shadow-sm">
                        {pet.status}
                      </span>
                    </div>
                  </div>

                  {/* Pet Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{pet.name}</h3>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">{pet.weightLbs} lbs</span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">{pet.breed}</p>

                    {/* Unboxed metadata with separators (frontend-design §1.A) */}
                    <div className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5">
                      <span>{pet.age}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pet.gender}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pet.size} size</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {pet.story}
                    </p>

                    {/* Health & Medical Transparency */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span className={`flex items-center gap-1 ${pet.vaccinations.length > 0 && pet.vaccinations.every((vaccine) => vaccine.nextDueDate >= new Date().toISOString().slice(0, 10)) ? 'text-teal-700' : 'text-amber-700'}`}>
                        {pet.vaccinations.length > 0 && pet.vaccinations.every((vaccine) => vaccine.nextDueDate >= new Date().toISOString().slice(0, 10))
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                          : <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                        {pet.vaccinations.length === 0
                          ? 'Vaccine record pending'
                          : pet.vaccinations.every((vaccine) => vaccine.nextDueDate >= new Date().toISOString().slice(0, 10))
                          ? 'Vaccines current'
                          : 'Booster due'}
                      </span>
                      <span className="text-slate-500">
                        {pet.neuteredSpayed ? 'Spayed/Neutered' : 'Surgery Arranged'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Buttons */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedPetForDetail(pet)}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => setSelectedPetForApply(pet)}
                    className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Apply to Adopt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: MY APPLICATIONS TRACKER */}
      {subTab === 'my-applications' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Your Adoption Applications</h3>
            <p className="text-xs text-slate-500 mt-1">
              Track real-time progress as shelter staff review your application and schedule meet-and-greets.
            </p>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">No applications submitted yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Browse our available companions and submit an application to start your adoption journey!
              </p>
              <button
                onClick={() => navigateToSubTab('browse')}
                className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700"
              >
                Browse Pets
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <span>Application for {app.petName}</span>
                        <span className="text-xs text-slate-400 font-mono">(ID: #{app.id})</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submitted on {app.submissionDate} · Applicant: {app.applicantName}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : app.status === 'Meet & Greet Scheduled'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : app.status === 'Under Review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* 4-Stage Visual Timeline */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
                    {[
                      { label: 'Submitted', done: true },
                      {
                        label: 'Under Review',
                        done:
                          app.status === 'Under Review' ||
                          app.status === 'Meet & Greet Scheduled' ||
                          app.status === 'Approved',
                      },
                      {
                        label: 'Meet & Greet',
                        done: app.status === 'Meet & Greet Scheduled' || app.status === 'Approved',
                      },
                      { label: 'Approved', done: app.status === 'Approved' },
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            step.done ? 'bg-teal-600' : 'bg-slate-200'
                          }`}
                        />
                        <p className={`text-[11px] font-semibold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Staff Notes / Feedback */}
                  {app.staffNotes && (
                    <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs text-teal-900">
                      <strong>Shelter Coordinator Update:</strong> {app.staffNotes}
                    </div>
                  )}

                  {app.meetAndGreetDate && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        <strong>Meet & Greet Scheduled:</strong> {app.meetAndGreetDate}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: POST-ADOPTION CARE HUB */}
      {subTab === 'follow-up' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Post-Adoption Follow-up & Care Hub</h3>
            <p className="text-xs text-slate-500 mt-1">
              Transition monitoring and wellness reviews for adopted companions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              <strong>Care Follow-up Notice:</strong> Post-adoption updates and reminders rely on mutual communication between shelter staff and adopters to ensure long-term animal safety and health.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active Check-In Milestones */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Scheduled Follow-up Milestones
              </h4>

              {myFollowUps.map((fup) => (
                <div key={fup.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{fup.milestoneTitle}</p>
                      <p className="text-xs text-slate-500">
                        Companion: {fup.petName} · Due: {fup.dueDate}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fup.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {fup.status}
                    </span>
                  </div>

                  {fup.status === 'Completed' && fup.notes && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900 mb-0.5">Submitted Update:</p>
                      <p className="leading-relaxed">{fup.notes}</p>
                      <div className="mt-2 text-[11px] text-teal-700 flex items-center gap-2">
                        <span>Veterinary Exam Confirmed: Yes</span>
                        <span>·</span>
                        <span>Rating: {fup.adjustmentRating || 5}/5 Paws</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Check-In Submission Form */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Submit Transition Check-in Update
              </h4>

              {activeFollowUp ? (
                <>
              {checkInSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Check-in notes saved and forwarded to the shelter medical records team!</span>
                </div>
              )}

              <form
                onSubmit={(e) => handleFollowUpSubmit(e, activeFollowUp.id)}
                className="space-y-3 text-xs"
              >
                {activeFollowUps.length > 1 && (
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700" htmlFor="follow-up-select">
                      Check-in
                    </label>
                    <select
                      id="follow-up-select"
                      value={activeFollowUp.id}
                      onChange={(e) => setCheckInId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                    >
                      {activeFollowUps.map((followUp) => (
                        <option key={followUp.id} value={followUp.id}>
                          {followUp.petName} · {followUp.milestoneTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pet Adjustment Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCheckInRating(num)}
                        className={`w-9 h-9 rounded-lg border font-bold transition-all ${
                          checkInRating >= num
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {num}★
                      </button>
                    ))}
                    <span className="text-slate-500 text-xs ml-2">
                      ({checkInRating === 5 ? 'Thriving & Happy' : 'Adjusting'})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    First Veterinary Check-in Status
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkInVetDone}
                      onChange={(e) => setCheckInVetDone(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-700">
                      Post-adoption vet wellness exam completed or scheduled
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Adjustment Notes & Behavior Updates
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    placeholder="How is your pet eating, sleeping, and bonding? Any questions for our care team?"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Follow-up Check-in</span>
                </button>
              </form>
                </>
              ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  No follow-up check-in is due for your account.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: RESPONSIBLE ADOPTION GUIDE */}
      {subTab === 'care-guide' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900">The PAW Responsible Adoption Standard</h3>
            <p className="text-xs text-slate-500 mt-1">
              From rescue to loving forever home: what every pet parent needs to know.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">The 3-3-3 Rule</h4>
              <p className="leading-relaxed">
                <strong>3 Days:</strong> Pet may feel overwhelmed, decompressing from shelter environment.
              </p>
              <p className="leading-relaxed">
                <strong>3 Weeks:</strong> Starting to settle in, feeling safe, showing real personality.
              </p>
              <p className="leading-relaxed">
                <strong>3 Months:</strong> Complete trust established, routine familiarized, true family bond.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Medical Diligence</h4>
              <p className="leading-relaxed">
                While PAW maintains full shelter records, schedule an initial visit with your local licensed veterinarian within 14 days of adoption.
              </p>
              <p className="leading-relaxed text-slate-500">
                Keep vaccines up to date and administer monthly heartworm/flea prevention.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Lifelong Commitment</h4>
              <p className="leading-relaxed">
                Adopting a pet is a 10-15+ year journey. PAW provides ongoing follow-ups, advice, and shelter alumni check-ins throughout your companion's life.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW DETAILED PET PROFILE */}
      {selectedPetForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="relative h-64 w-full bg-slate-900">
              <img
                src={selectedPetForDetail.photoUrl}
                alt={selectedPetForDetail.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPetForDetail(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedPetForDetail.name}</h3>
                  <p className="text-slate-600 text-xs">{selectedPetForDetail.breed}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-900 font-bold text-sm">
                    {selectedPetForDetail.weightLbs} lbs
                  </span>
                  <p className="text-[11px] text-slate-400">{selectedPetForDetail.gender} · {selectedPetForDetail.age}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Rescue Journey & Personality</h4>
                <p className="leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedPetForDetail.story}
                </p>
              </div>

              {/* Medical transparency */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
                <h4 className="font-bold text-teal-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  Medical Record Transparency
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-teal-900">
                  <p>✓ Microchip registered (#{selectedPetForDetail.microchipId.slice(-6)})</p>
                  <p>✓ {selectedPetForDetail.neuteredSpayed ? 'Spayed / Neutered' : 'Surgery Arranged'}</p>
                  <p>✓ Vaccinations verified ({selectedPetForDetail.vaccinations.length} on file)</p>
                  <p>✓ Preventive deworming completed</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedPetForDetail(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const pet = selectedPetForDetail;
                    setSelectedPetForDetail(null);
                    setSelectedPetForApply(pet);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Proceed to Adoption Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT ADOPTION APPLICATION */}
      {selectedPetForApply && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Adoption Application for {selectedPetForApply.name}</h3>
                <p className="text-xs text-slate-400">Step 4 in the PAW Adoption Workflow</p>
              </div>
              <button
                onClick={() => setSelectedPetForApply(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {applicationSuccess ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-600">
                    Your application for {selectedPetForApply.name} has been sent to the shelter review team.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[11px]">
                    <strong>PAW Human-Led Adoption Review:</strong> Shelter staff will review your housing arrangements, schedule, and experience to ensure the best lifelong match for both you and {selectedPetForApply.name}.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        disabled
                        value={user.name}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Housing Type</label>
                      <select
                        value={homeType}
                        onChange={(e) => setHomeType(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                      >
                        <option value="House with yard">House with fenced yard</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Condo">Condo</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Rural/Farm">Rural / Farm property</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Home Ownership</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOwnOrRent('Own')}
                          className={`w-1/2 py-1.5 rounded-lg border font-semibold ${
                            ownOrRent === 'Own' ? 'bg-teal-50 border-teal-600 text-teal-800' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          Own Home
                        </button>
                        <button
                          type="button"
                          onClick={() => setOwnOrRent('Rent')}
                          className={`w-1/2 py-1.5 rounded-lg border font-semibold ${
                            ownOrRent === 'Rent' ? 'bg-teal-50 border-teal-600 text-teal-800' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          Rent (Permitted)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Estimated Hours Pet Will Be Home Alone Daily
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={16}
                      value={hoursAloneDaily}
                      onChange={(e) => setHoursAloneDaily(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Are There Other Pets Currently in the Household?
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="hasPets"
                          checked={hasOtherPets}
                          onChange={() => setHasOtherPets(true)}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="hasPets"
                          checked={!hasOtherPets}
                          onChange={() => setHasOtherPets(false)}
                        />
                        <span>No</span>
                      </label>
                    </div>
                    {hasOtherPets && (
                      <input
                        type="text"
                        value={otherPetsDetails}
                        onChange={(e) => setOtherPetsDetails(e.target.value)}
                        placeholder="Please list species, age, and temperament of your other pets..."
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pet Care Experience
                    </label>
                    <textarea
                      rows={2}
                      value={petExperience}
                      onChange={(e) => setPetExperience(e.target.value)}
                      placeholder="Briefly describe your history caring for animals..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Why are you excited to adopt {selectedPetForApply.name}?
                    </label>
                    <textarea
                      rows={2}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Share your lifestyle, family routine, or goals..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPetForApply(null)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                    >
                      Submit Adoption Application
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
