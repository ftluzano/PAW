import React, { useState } from 'react';
import { Animal, IllnessIncident, DailyHealthCheck, MedicalHistoryRecord } from '../types.ts';
import { Stethoscope, AlertTriangle, Activity, Thermometer, ShieldCheck, Plus, CheckCircle2, HeartPulse, Filter, Clock, Search, X, Check } from 'lucide-react';

interface InCareHealthMonitoringProps {
  animals: Animal[];
  onUpdateAnimal: (updatedAnimal: Animal) => void;
}

export const InCareHealthMonitoring: React.FC<InCareHealthMonitoringProps> = ({
  animals,
  onUpdateAnimal,
}) => {
  // Animals currently under shelter custody (not yet adopted)
  const inCareAnimals = animals.filter((a) => a.status !== 'Adoption & Follow-up');

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activeTab, setActiveTab] = useState<'daily-checks' | 'active-illnesses' | 'history'>('daily-checks');
  const [healthFilter, setHealthFilter] = useState<'All' | 'Under Active Monitoring' | 'In Medical Isolation' | 'Healthy / Stable'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showLogIllnessModal, setShowLogIllnessModal] = useState(false);
  const [showDailyCheckModal, setShowDailyCheckModal] = useState(false);
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);

  // Form State: Log New Illness
  const [illnessDiagnosis, setIllnessDiagnosis] = useState('');
  const [illnessSymptoms, setIllnessSymptoms] = useState('');
  const [illnessSeverity, setIllnessSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');
  const [illnessIsolation, setIllnessIsolation] = useState(true);
  const [illnessWard, setIllnessWard] = useState('Medical Quarantine Bay 2');
  const [illnessTreatmentPlan, setIllnessTreatmentPlan] = useState('');
  const [illnessPrescriber, setIllnessPrescriber] = useState('Dr. Helen Vance, DVM');

  // Form State: Daily Vitals Check
  const [vitalTemp, setVitalTemp] = useState(101.5);
  const [vitalAppetite, setVitalAppetite] = useState<'Normal' | 'Fair' | 'Poor' | 'Refused Food'>('Normal');
  const [vitalEnergy, setVitalEnergy] = useState<'Alert & Active' | 'Normal' | 'Lethargic' | 'Depressed'>('Normal');
  const [vitalStool, setVitalStool] = useState<'Normal' | 'Soft' | 'Diarrhea' | 'Not Observed'>('Normal');
  const [vitalMedsGiven, setVitalMedsGiven] = useState(true);
  const [vitalNotes, setVitalNotes] = useState('');
  const [vitalStaff, setVitalStaff] = useState('Sarah Martinez, Shelter Lead');

  // Form State: Prior Medical History Record
  const [historyCondition, setHistoryCondition] = useState('');
  const [historyDiagnosedDate, setHistoryDiagnosedDate] = useState('');
  const [historyStatus, setHistoryStatus] = useState<'Resolved' | 'Ongoing Management' | 'Chronic'>('Resolved');
  const [historyNotes, setHistoryNotes] = useState('');
  const [historyVet, setHistoryVet] = useState('Dr. Helen Vance, DVM');

  // Filter animals
  const filteredInCareAnimals = inCareAnimals.filter((animal) => {
    const matchesFilter = healthFilter === 'All' || animal.healthStatus === healthFilter;
    const matchesSearch =
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.microchipId.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Handler: Log Illness Incident for an Animal
  const handleLogIllnessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal || !illnessDiagnosis) return;

    const newIllness: IllnessIncident = {
      id: `ill-${Date.now()}`,
      dateReported: new Date().toISOString().split('T')[0],
      diagnosis: illnessDiagnosis,
      symptoms: illnessSymptoms ? illnessSymptoms.split(',').map((s) => s.trim()) : ['Observation logged'],
      severity: illnessSeverity,
      status: 'Under Treatment',
      isolationWard: illnessIsolation,
      treatmentPlan: illnessTreatmentPlan || 'Prescription protocol initiated.',
      prescribedBy: illnessPrescriber,
    };

    const updatedAnimal: Animal = {
      ...selectedAnimal,
      healthStatus: illnessIsolation ? 'In Medical Isolation' : 'Under Active Monitoring',
      quarantineWard: illnessIsolation ? illnessWard : selectedAnimal.quarantineWard,
      illnessIncidents: [newIllness, ...selectedAnimal.illnessIncidents],
    };

    onUpdateAnimal(updatedAnimal);
    setSelectedAnimal(updatedAnimal);
    setShowLogIllnessModal(false);
    // Reset
    setIllnessDiagnosis('');
    setIllnessSymptoms('');
    setIllnessTreatmentPlan('');
  };

  // Handler: Log Daily Health & Vitals Check
  const handleDailyCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    const newCheck: DailyHealthCheck = {
      id: `dh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      temperatureF: Number(vitalTemp),
      appetite: vitalAppetite,
      energyLevel: vitalEnergy,
      stoolQuality: vitalStool,
      medicationsAdministered: vitalMedsGiven,
      caregiverNotes: vitalNotes || 'Daily clinical monitoring completed.',
      recordedBy: vitalStaff,
    };

    const updatedAnimal: Animal = {
      ...selectedAnimal,
      dailyHealthChecks: [newCheck, ...selectedAnimal.dailyHealthChecks],
    };

    onUpdateAnimal(updatedAnimal);
    setSelectedAnimal(updatedAnimal);
    setShowDailyCheckModal(false);
    setVitalNotes('');
  };

  // Handler: Add Pre-existing / Prior Medical History
  const handleAddHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal || !historyCondition) return;

    const newHistory: MedicalHistoryRecord = {
      id: `mh-${Date.now()}`,
      conditionName: historyCondition,
      diagnosedDate: historyDiagnosedDate || new Date().toISOString().split('T')[0],
      preExistingAtIntake: true,
      status: historyStatus,
      notes: historyNotes || 'Documented at animal intake intake assessment.',
      attendingVet: historyVet,
    };

    const updatedAnimal: Animal = {
      ...selectedAnimal,
      medicalHistory: [newHistory, ...selectedAnimal.medicalHistory],
    };

    onUpdateAnimal(updatedAnimal);
    setSelectedAnimal(updatedAnimal);
    setShowAddHistoryModal(false);
    setHistoryCondition('');
    setHistoryNotes('');
  };

  // Handler: Clear / Resolve Active Illness
  const handleResolveIllness = (illnessId: string) => {
    if (!selectedAnimal) return;

    const updatedIncidents = selectedAnimal.illnessIncidents.map((ill) =>
      ill.id === illnessId
        ? {
            ...ill,
            status: 'Resolved / Cleared' as const,
            resolvedDate: new Date().toISOString().split('T')[0],
          }
        : ill
    );

    // If no remaining active illnesses, return status to Healthy / Stable
    const hasRemainingActive = updatedIncidents.some(
      (ill) => ill.status === 'Active Monitoring' || ill.status === 'Under Treatment'
    );

    const updatedAnimal: Animal = {
      ...selectedAnimal,
      illnessIncidents: updatedIncidents,
      healthStatus: hasRemainingActive ? 'Under Active Monitoring' : 'Healthy / Stable',
      quarantineWard: hasRemainingActive ? selectedAnimal.quarantineWard : undefined,
    };

    onUpdateAnimal(updatedAnimal);
    setSelectedAnimal(updatedAnimal);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Overview Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>In-Care Clinical & Illness Monitoring System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time medical tracking for rescued animals prior to adoption: record sickness episodes, prior conditions, and daily recovery vitals.
          </p>
        </div>

        {/* Clinical Statistics Summary */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Animals Under Custody
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {inCareAnimals.length}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              In Medical Observation
            </span>
            <span className="text-lg font-bold text-amber-600 font-mono tabular-nums">
              {inCareAnimals.filter((a) => a.healthStatus !== 'Healthy / Stable').length}
            </span>
          </div>
        </div>
      </div>

      {/* Control bar: search, health filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient by name, microchip, or breed..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
          {(['All', 'Under Active Monitoring', 'In Medical Isolation', 'Healthy / Stable'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setHealthFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  healthFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Grid: Patients currently in shelter care */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInCareAnimals.map((animal) => {
          const activeIllnesses = animal.illnessIncidents.filter((i) => i.status !== 'Resolved / Cleared');
          const latestCheck = animal.dailyHealthChecks[0];

          return (
            <div
              key={animal.id}
              className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-sm ${
                animal.healthStatus === 'In Medical Isolation'
                  ? 'border-amber-400 ring-1 ring-amber-400/40'
                  : animal.healthStatus === 'Under Active Monitoring'
                  ? 'border-teal-400 ring-1 ring-teal-400/40'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Patient Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={animal.photoUrl}
                      alt={animal.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{animal.name}</span>
                        <span className="text-[11px] font-mono font-medium text-slate-400">
                          #{animal.id}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {animal.species} · {animal.breed} ({animal.weightLbs} lbs)
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      animal.healthStatus === 'In Medical Isolation'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : animal.healthStatus === 'Under Active Monitoring'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {animal.healthStatus}
                  </span>
                </div>

                {/* Status & Clinical summary */}
                <div className="p-4 space-y-3 text-xs">
                  
                  {/* Quarantine / Ward info if isolated */}
                  {animal.quarantineWard && (
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Assigned to: {animal.quarantineWard}</span>
                    </div>
                  )}

                  {/* Active Sickness Incidents */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Active Medical Incidents ({activeIllnesses.length})
                    </span>
                    {activeIllnesses.length === 0 ? (
                      <p className="text-slate-500 text-[11px] italic">
                        No active illness episodes reported. Patient vitals stable.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {activeIllnesses.map((ill) => (
                          <div
                            key={ill.id}
                            className="p-2 rounded-lg bg-rose-50/60 border border-rose-100 flex items-start justify-between text-[11px]"
                          >
                            <div>
                              <p className="font-bold text-rose-900">{ill.diagnosis}</p>
                              <p className="text-rose-700 text-[10px]">{ill.symptoms.join(', ')}</p>
                            </div>
                            <span className="font-semibold px-1.5 py-0.2 rounded bg-white text-rose-800 text-[9px] border border-rose-200">
                              {ill.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pre-existing / Past Medical History */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Documented Medical History ({animal.medicalHistory.length})
                    </span>
                    {animal.medicalHistory.length === 0 ? (
                      <p className="text-slate-400 text-[11px]">No pre-existing conditions on intake record.</p>
                    ) : (
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        {animal.medicalHistory.slice(0, 2).map((hist) => (
                          <p key={hist.id} className="truncate">
                            • <strong>{hist.conditionName}</strong> ({hist.status})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Latest Daily Vitals Check */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Latest Vital Signs Check
                    </span>
                    {latestCheck ? (
                      <div className="flex items-center justify-between text-[11px] text-slate-700">
                        <span className="flex items-center gap-1 font-mono">
                          <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                          {latestCheck.temperatureF}°F
                        </span>
                        <span>Appetite: <strong>{latestCheck.appetite}</strong></span>
                        <span>Energy: <strong>{latestCheck.energyLevel}</strong></span>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px]">No daily check logged today.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Detail CTAs */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => setSelectedAnimal(animal)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Open Clinical Patient Chart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CLINICAL PATIENT CHART MODAL */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAnimal.photoUrl}
                  alt={selectedAnimal.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span>Clinical Chart: {selectedAnimal.name}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        selectedAnimal.healthStatus === 'In Medical Isolation'
                          ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                          : selectedAnimal.healthStatus === 'Under Active Monitoring'
                          ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                          : 'bg-teal-900/80 text-teal-200 border border-teal-700'
                      }`}
                    >
                      {selectedAnimal.healthStatus}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedAnimal.species} · {selectedAnimal.breed} · Weight: {selectedAnimal.weightLbs} lbs · Intake: {selectedAnimal.intakeDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnimal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Clinical Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDailyCheckModal(true)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Daily Vitals / Health Check</span>
                </button>

                <button
                  onClick={() => setShowLogIllnessModal(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md shadow-xs flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Illness / Sickness Incident</span>
                </button>

                <button
                  onClick={() => setShowAddHistoryModal(true)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pre-existing Condition</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Microchip: #{selectedAnimal.microchipId}
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-white text-xs">
              <button
                onClick={() => setActiveTab('daily-checks')}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'daily-checks'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                <span>Daily Vitals & Caregiver Checks ({selectedAnimal.dailyHealthChecks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('active-illnesses')}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'active-illnesses'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Illness Incidents ({selectedAnimal.illnessIncidents.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Medical History & Past Conditions ({selectedAnimal.medicalHistory.length})</span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              
              {/* TAB 1: DAILY HEALTH CHECKS */}
              {activeTab === 'daily-checks' && (
                <div className="space-y-4">
                  {selectedAnimal.dailyHealthChecks.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-700">No daily health checks recorded yet.</p>
                      <p className="text-slate-500 mt-1">
                        Click "Log Daily Vitals / Health Check" above to record temperature, appetite, and stool condition.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Temperature</th>
                            <th className="p-3">Appetite</th>
                            <th className="p-3">Energy Level</th>
                            <th className="p-3">Stool Quality</th>
                            <th className="p-3">Medications</th>
                            <th className="p-3">Caregiver Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedAnimal.dailyHealthChecks.map((check) => (
                            <tr key={check.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono text-slate-800">
                                {check.date} <span className="text-slate-400 text-[10px]">{check.time}</span>
                              </td>
                              <td className="p-3 font-mono font-bold">
                                <span
                                  className={
                                    check.temperatureF > 102.8
                                      ? 'text-rose-600'
                                      : check.temperatureF < 100.2
                                      ? 'text-blue-600'
                                      : 'text-slate-900'
                                  }
                                >
                                  {check.temperatureF}°F
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    check.appetite === 'Normal'
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : 'bg-amber-50 text-amber-800'
                                  }`}
                                >
                                  {check.appetite}
                                </span>
                              </td>
                              <td className="p-3 text-slate-700">{check.energyLevel}</td>
                              <td className="p-3 text-slate-700">{check.stoolQuality}</td>
                              <td className="p-3">
                                {check.medicationsAdministered ? (
                                  <span className="text-emerald-700 font-medium">✓ Given</span>
                                ) : (
                                  <span className="text-slate-400">None</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-600 max-w-xs">
                                <p className="line-clamp-2">{check.caregiverNotes}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">By: {check.recordedBy}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVE & PAST ILLNESS INCIDENTS */}
              {activeTab === 'active-illnesses' && (
                <div className="space-y-4">
                  {selectedAnimal.illnessIncidents.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-700">No illness incidents recorded while in care.</p>
                      <p className="text-slate-500 mt-1">
                        If the animal develops fever, coughing, or symptoms during shelter stay, report it here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedAnimal.illnessIncidents.map((incident) => (
                        <div
                          key={incident.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{incident.diagnosis}</h4>
                                <span
                                  className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                    incident.status === 'Resolved / Cleared'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {incident.status}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                                  Severity: {incident.severity}
                                </span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Reported on {incident.dateReported} · Prescribing Clinician: {incident.prescribedBy}
                              </p>
                            </div>

                            {incident.status !== 'Resolved / Cleared' && (
                              <button
                                onClick={() => handleResolveIllness(incident.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Sign-off & Mark Resolved</span>
                              </button>
                            )}
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <p><strong>Observed Symptoms:</strong> {incident.symptoms.join(', ')}</p>
                            <p><strong>Treatment Protocol:</strong> {incident.treatmentPlan}</p>
                            {incident.isolationWard && (
                              <p className="text-amber-800">
                                <strong>Isolation Requirement:</strong> Strict medical quarantine assigned.
                              </p>
                            )}
                            {incident.resolvedDate && (
                              <p className="text-emerald-700">
                                <strong>Clinical Clearance Date:</strong> {incident.resolvedDate}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEDICAL HISTORY & PRE-EXISTING CONDITIONS */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {selectedAnimal.medicalHistory.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-700">No pre-existing conditions on intake record.</p>
                      <p className="text-slate-500 mt-1">
                        Use "Add Pre-existing Condition" to document prior illnesses or chronic ailments identified at intake.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedAnimal.medicalHistory.map((hist) => (
                        <div
                          key={hist.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{hist.conditionName}</h4>
                              <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {hist.status}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs mt-1 leading-relaxed">{hist.notes}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1">
                              Diagnosed: {hist.diagnosedDate} · Attending DVM: {hist.attendingVet || 'Shelter Veterinary Team'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAnimal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800"
              >
                Close Patient Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 1: REPORT NEW ILLNESS / SICKNESS INCIDENT */}
      {showLogIllnessModal && selectedAnimal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Report Sickness Incident: {selectedAnimal.name}
                </h3>
                <p className="text-xs text-slate-500">Document in-care illness episode and isolation requirements</p>
              </div>
              <button onClick={() => setShowLogIllnessModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogIllnessSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diagnosis / Sickness Condition
                </label>
                <input
                  type="text"
                  required
                  value={illnessDiagnosis}
                  onChange={(e) => setIllnessDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Gastroenteritis, Canine Infectious Tracheobronchitis, Allergic Dermatitis"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observed Symptoms (comma separated)
                </label>
                <input
                  type="text"
                  value={illnessSymptoms}
                  onChange={(e) => setIllnessSymptoms(e.target.value)}
                  placeholder="e.g. Fever 103°F, coughing, lethargy, reduced appetite"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity Rating</label>
                  <select
                    value={illnessSeverity}
                    onChange={(e) => setIllnessSeverity(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prescribing Clinician</label>
                  <input
                    type="text"
                    value={illnessPrescriber}
                    onChange={(e) => setIllnessPrescriber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 font-semibold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={illnessIsolation}
                    onChange={(e) => setIllnessIsolation(e.target.checked)}
                    className="rounded border-amber-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Transfer patient to Medical Quarantine / Isolation Ward</span>
                </label>

                {illnessIsolation && (
                  <input
                    type="text"
                    value={illnessWard}
                    onChange={(e) => setIllnessWard(e.target.value)}
                    placeholder="Quarantine Bay or Room name"
                    className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white text-slate-900"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Veterinary Treatment & Prescription Plan
                </label>
                <textarea
                  rows={2}
                  value={illnessTreatmentPlan}
                  onChange={(e) => setIllnessTreatmentPlan(e.target.value)}
                  placeholder="Medication name, dosage, frequency, dietary modifications..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogIllnessModal(false)}
                  className="px-4 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Incident to Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: LOG DAILY VITALS & CAREGIVER CHECK */}
      {showDailyCheckModal && selectedAnimal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Daily Vitals Check: {selectedAnimal.name}
                </h3>
                <p className="text-xs text-slate-500">Record clinical status and caregiver observation</p>
              </div>
              <button onClick={() => setShowDailyCheckModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDailyCheckSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={vitalTemp}
                    onChange={(e) => setVitalTemp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Normal canine/feline: 100.5°F–102.5°F</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Appetite</label>
                  <select
                    value={vitalAppetite}
                    onChange={(e) => setVitalAppetite(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Normal">Normal (Eats full ration)</option>
                    <option value="Fair">Fair (Partial intake)</option>
                    <option value="Poor">Poor (Minimal interest)</option>
                    <option value="Refused Food">Refused Food</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Energy / Demeanor</label>
                  <select
                    value={vitalEnergy}
                    onChange={(e) => setVitalEnergy(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Alert & Active">Alert & Active</option>
                    <option value="Normal">Normal</option>
                    <option value="Lethargic">Lethargic</option>
                    <option value="Depressed">Depressed / Recumbent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stool Consistency</label>
                  <select
                    value={vitalStool}
                    onChange={(e) => setVitalStool(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Normal">Normal (Formed)</option>
                    <option value="Soft">Soft (Loose)</option>
                    <option value="Diarrhea">Diarrhea</option>
                    <option value="Not Observed">Not Observed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={vitalMedsGiven}
                    onChange={(e) => setVitalMedsGiven(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Scheduled medications and supplements administered</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Caregiver Clinical Notes</label>
                <textarea
                  rows={2}
                  value={vitalNotes}
                  onChange={(e) => setVitalNotes(e.target.value)}
                  placeholder="Behavior during exam, hydration skin tent, response to feed..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Logged By</label>
                <input
                  type="text"
                  value={vitalStaff}
                  onChange={(e) => setVitalStaff(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDailyCheckModal(false)}
                  className="px-4 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Vitals Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: ADD PRE-EXISTING MEDICAL CONDITION */}
      {showAddHistoryModal && selectedAnimal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Add Medical History: {selectedAnimal.name}
                </h3>
                <p className="text-xs text-slate-500">Document pre-existing illness or chronic health background</p>
              </div>
              <button onClick={() => setShowAddHistoryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHistorySubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Condition Name / Prior Illness
                </label>
                <input
                  type="text"
                  required
                  value={historyCondition}
                  onChange={(e) => setHistoryCondition(e.target.value)}
                  placeholder="e.g. Healed Pelvic Fracture, Chronic Otitis, Ehrlichiosis History"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diagnosis Date</label>
                  <input
                    type="date"
                    value={historyDiagnosedDate}
                    onChange={(e) => setHistoryDiagnosedDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Status</label>
                  <select
                    value={historyStatus}
                    onChange={(e) => setHistoryStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Resolved">Resolved (No active intervention)</option>
                    <option value="Ongoing Management">Ongoing Management (Diet/Routine)</option>
                    <option value="Chronic">Chronic (Lifelong condition)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Findings</label>
                <textarea
                  rows={2}
                  value={historyNotes}
                  onChange={(e) => setHistoryNotes(e.target.value)}
                  placeholder="Relevant X-ray findings, bloodwork history, or special considerations..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Veterinarian</label>
                <input
                  type="text"
                  value={historyVet}
                  onChange={(e) => setHistoryVet(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddHistoryModal(false)}
                  className="px-4 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save to History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
