import React, { useState } from 'react';
import { X, ShieldCheck, Heart, Sparkles, AlertTriangle, Users, FileText, CheckCircle2 } from 'lucide-react';

interface SystemScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemScopeModal: React.FC<SystemScopeModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'scope' | 'workflow' | 'limitations'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                PAW System Architecture & Scope Specification
              </h3>
              <p className="text-xs text-slate-400">
                Official documentation: Introduction • Scope • Limitations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveSection('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeSection === 'overview'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            01. Project Overview
          </button>
          <button
            onClick={() => setActiveSection('scope')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeSection === 'scope'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            02. Scope of System
          </button>
          <button
            onClick={() => setActiveSection('workflow')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeSection === 'workflow'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            03. Users & Workflow
          </button>
          <button
            onClick={() => setActiveSection('limitations')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeSection === 'limitations'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            04. Boundaries & Limitations
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          
          {/* Section 1: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  What is PAW?
                </span>
                <p className="mt-1 text-slate-800 leading-relaxed font-medium">
                  PAW is a web-based Pet Adoption and Care System designed to help animal shelters, rescue groups, and pet welfare organizations manage animal records and adoption activities in one centralized platform.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Main Purpose
                </span>
                <p className="mt-1 text-slate-900 font-semibold text-base leading-snug">
                  "To improve the adoption process while keeping each animal’s health, safety, and care history properly documented—from rescue and intake through adoption and follow-up."
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  The system supports both animal care management and responsible pet adoption.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Centralized Operations
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Eliminates fragmented paperwork across field rescue, medical treatments, and adoption contracts.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Transparent Pet Welfare
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Gives adopters clear visibility into vaccination status, behavior temperament, and special needs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Scope of the System */}
          {activeSection === 'scope' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                As detailed in Slide 02 / What PAW Covers, the system encompasses three core operational domains:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Domain 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
                      1. Animal Records
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                      <li>Register rescued or surrendered animals</li>
                      <li>Store animal details, photos, and current status</li>
                      <li>Maintain medical and care records</li>
                    </ul>
                  </div>
                </div>

                {/* Domain 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                      <Heart className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
                      2. Adoption Process
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                      <li>Display pets available for adoption</li>
                      <li>Allow potential adopters to submit applications</li>
                      <li>Support staff review and application decisions</li>
                    </ul>
                  </div>
                </div>

                {/* Domain 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
                      3. Management & Tracking
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                      <li>Track adoption progress and animal status</li>
                      <li>Record vaccinations, treatments, and care notes</li>
                      <li>Support follow-ups and basic reports</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Users and Workflow */}
          {activeSection === 'workflow' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Shelter / Rescue Staff
                  </span>
                  <p className="text-xs text-slate-600 mt-2">
                    Manage animal profiles, care records, applications, and adoption updates. Responsible for intake documentation and final decision-making.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Potential Adopters
                  </span>
                  <p className="text-xs text-slate-600 mt-2">
                    Browse available pets, submit applications, check application progress, and participate in post-adoption check-ins.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  The 6-Step Basic Workflow
                </h4>
                <div className="space-y-2">
                  {[
                    { step: 1, title: 'Rescue & Intake', desc: 'Rescued from field or surrendered by owner; health check, microchip check, quarantine.' },
                    { step: 2, title: 'Care & Monitoring', desc: 'Vaccinations, medical treatments, temperament & socialization assessments.' },
                    { step: 3, title: 'List for Adoption', desc: 'Profile and photos published for prospective families.' },
                    { step: 4, title: 'Application', desc: 'Adopter completes comprehensive lifestyle, housing, and pet care questionnaire.' },
                    { step: 5, title: 'Review & Match', desc: 'Staff review application, evaluate compatibility, and conduct meet-and-greet.' },
                    { step: 6, title: 'Adoption & Follow-up', desc: 'Contract execution, handover, followed by 30-day, 60-day, and health milestone check-ins.' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white shrink-0">
                        0{item.step}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{item.title}: </span>
                        <span className="text-xs text-slate-600">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Boundaries and Limitations */}
          {activeSection === 'limitations' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Foundational Ethics Principle (Slide 04)</span>
                </div>
                <p className="text-xs font-medium mt-1">
                  "PAW supports the process; it does not replace professional veterinary care or human judgment."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-semibold text-xs text-slate-900">
                    Internet & Device Access
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Users need a suitable device and internet connection to access the web-based system.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-semibold text-xs text-slate-900">
                    Accuracy Depends on Users
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Animal profiles, medical updates, and application details depend on information entered by staff and adopters.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-semibold text-xs text-slate-900">
                    No Automatic Medical Diagnosis
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    The system stores health information but does not replace veterinary examination or professional advice.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-semibold text-xs text-slate-900">
                    Adoption Decisions Remain Human-Led
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    The system can organize and track applications, but staff must evaluate suitability and make final decisions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 md:col-span-2">
                  <h4 className="font-semibold text-xs text-slate-900">
                    Follow-Up Depends on Participation
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Post-adoption updates and reminders are only useful when staff and adopters provide the required information.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 italic">
            PAW: A better-organized path to responsible adoption.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
