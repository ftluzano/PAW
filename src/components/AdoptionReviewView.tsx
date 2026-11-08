import React, { useState } from 'react';
import { AdoptionApplication, ApplicationStatus, Animal, AnimalStatus } from '../types.ts';
import { CheckCircle2, Clock, Calendar, XCircle, Search, Filter, AlertCircle, Eye, UserCheck, MessageSquare, X } from 'lucide-react';

interface AdoptionReviewViewProps {
  applications: AdoptionApplication[];
  animals: Animal[];
  onUpdateApplication: (app: AdoptionApplication) => void;
  onUpdateAnimalStatus: (petId: string, newStatus: AnimalStatus, application?: AdoptionApplication) => void;
}

export const AdoptionReviewView: React.FC<AdoptionReviewViewProps> = ({
  applications,
  animals,
  onUpdateApplication,
  onUpdateAnimalStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<AdoptionApplication | null>(null);

  // Review Form inside Modal
  const [staffNotesInput, setStaffNotesInput] = useState('');
  const [meetDateInput, setMeetDateInput] = useState('');

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenReview = (app: AdoptionApplication) => {
    setSelectedApp(app);
    setStaffNotesInput(app.staffNotes || '');
    setMeetDateInput(app.meetAndGreetDate || '');
  };

  const handleDecision = (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;

    const updated: AdoptionApplication = {
      ...selectedApp,
      status: newStatus,
      staffNotes: staffNotesInput,
      meetAndGreetDate: meetDateInput || selectedApp.meetAndGreetDate,
      reviewedDate: new Date().toISOString().split('T')[0],
    };

    onUpdateApplication(updated);

    // If approved or scheduled meet and greet, update animal's workflow status accordingly!
    if (newStatus === 'Approved') {
      onUpdateAnimalStatus(selectedApp.petId, 'Adoption & Follow-up', updated);
    } else if (newStatus === 'Meet & Greet Scheduled' || newStatus === 'Under Review') {
      onUpdateAnimalStatus(selectedApp.petId, 'Review & Match');
    } else if (newStatus === 'Declined') {
      const anotherActiveApplication = applications.some((application) =>
        application.petId === selectedApp.petId &&
        application.id !== selectedApp.id &&
        ['Submitted', 'Under Review', 'Meet & Greet Scheduled'].includes(application.status)
      );
      if (!anotherActiveApplication) {
        onUpdateAnimalStatus(selectedApp.petId, 'Listed for Adoption');
      }
    }

    setSelectedApp(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Scope banner & ethics reminder */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Adoption Application Review Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate prospective adopter questionnaires and schedule meet-and-greet interactions.
          </p>
        </div>

        {/* Human-led decision principle badge from Slide 5 */}
        <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] flex items-center gap-2 max-w-md">
          <UserCheck className="w-4 h-4 shrink-0 text-teal-700" />
          <span>
            <strong>Adoption Policy:</strong> Adoption decisions remain human-led. Staff evaluate household suitability and make all final approvals.
          </span>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applicant or pet name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full no-scrollbar">
          {(['All', 'Submitted', 'Under Review', 'Meet & Greet Scheduled', 'Approved', 'Declined'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Applicant Name</th>
                <th className="p-3.5">Pet Requested</th>
                <th className="p-3.5">Living Situation</th>
                <th className="p-3.5">Submitted</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No applications match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const targetPet = animals.find((a) => a.id === app.petId);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{app.applicantName}</p>
                        <p className="text-[11px] text-slate-500">{app.applicantEmail}</p>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          {targetPet?.photoUrl && (
                            <img
                              src={targetPet.photoUrl}
                              alt={app.petName}
                              className="w-7 h-7 rounded object-cover"
                            />
                          )}
                          <span className="font-semibold text-slate-900">{app.petName}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span>{app.homeType}</span>
                        <span className="text-slate-400"> ({app.ownOrRent})</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 tabular-nums">
                        {app.submissionDate}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.status === 'Meet & Greet Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : app.status === 'Under Review'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : app.status === 'Declined'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md transition-colors"
                        >
                          Review Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW APPLICATION DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>Adoption Review: {selectedApp.applicantName}</span>
                  <span className="text-xs text-teal-400 font-normal">for {selectedApp.petName}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Application ID #{selectedApp.id} · Submitted on {selectedApp.submissionDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              
              {/* Applicant Profile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                    Household & Residence
                  </span>
                  <p><strong>Home Type:</strong> {selectedApp.homeType}</p>
                  <p><strong>Ownership:</strong> {selectedApp.ownOrRent} residence</p>
                  <p><strong>Hours Alone Daily:</strong> {selectedApp.hoursAloneDaily} hours</p>
                  <p><strong>Existing Pets in Home:</strong> {selectedApp.hasOtherPets ? 'Yes' : 'None'}</p>
                  {selectedApp.otherPetsDetails && (
                    <p className="text-slate-500 italic mt-1">"{selectedApp.otherPetsDetails}"</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                    Contact & Background
                  </span>
                  <p><strong>Email:</strong> {selectedApp.applicantEmail}</p>
                  <p><strong>Phone:</strong> {selectedApp.applicantPhone}</p>
                  <p><strong>Experience:</strong> {selectedApp.petExperience}</p>
                </div>
              </div>

              {/* Applicant Motivation Statement */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Adoption Motivation & Care Plan</h4>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white leading-relaxed text-slate-800">
                  {selectedApp.motivation}
                </div>
              </div>

              {/* Staff Notes & Meet & Greet scheduling */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  Staff Review Notes & Schedule
                </h4>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Internal Shelter Evaluation Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={staffNotesInput}
                    onChange={(e) => setStaffNotesInput(e.target.value)}
                    placeholder="Document reference checks, yard fence verification, or specific questions..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Meet & Greet Date/Time (Optional):
                  </label>
                  <input
                    type="text"
                    value={meetDateInput}
                    onChange={(e) => setMeetDateInput(e.target.value)}
                    placeholder="e.g. Saturday 2:00 PM at Main Shelter Lawn"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-2">
                <span className="block font-bold text-slate-800 mb-2">Staff Decision Actions:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecision('Approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Adoption & Begin Follow-up</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('Meet & Greet Scheduled')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Meet & Greet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('Under Review')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Set to Under Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('Declined')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline Application</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
