import React, { useState } from 'react';
import { Animal, FollowUpCheckIn, AdoptionApplication } from '../types.ts';
import { Sparkles, Calendar, ShieldCheck, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, RefreshCw, HeartHandshake, Syringe } from 'lucide-react';

interface CareAndFollowUpsViewProps {
  animals: Animal[];
  followUps: FollowUpCheckIn[];
  applications: AdoptionApplication[];
  onCompleteFollowUp: (id: string, notes: string) => void;
}

export const CareAndFollowUpsView: React.FC<CareAndFollowUpsViewProps> = ({
  animals,
  followUps,
  applications,
  onCompleteFollowUp,
}) => {
  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [reportExported, setReportExported] = useState(false);

  // Filtered follow ups
  const filteredFollowUps = followUps.filter((fup) => {
    if (selectedMilestoneFilter === 'All') return true;
    return fup.status === selectedMilestoneFilter;
  });

  // Calculate stats for Basic Reports (Slide 3: "Support follow-ups and basic reports")
  const totalAnimals = animals.length;
  const rescuedCount = animals.filter((a) => a.intakeType === 'Rescued').length;
  const surrenderedCount = animals.filter((a) => a.intakeType === 'Surrendered').length;

  const dogCount = animals.filter((a) => a.species === 'Dog').length;
  const catCount = animals.filter((a) => a.species === 'Cat').length;

  const adoptedCount = animals.filter((a) => a.status === 'Adoption & Follow-up').length;
  const inCareCount = animals.filter((a) => a.status === 'Care & Monitoring' || a.status === 'Rescue & Intake').length;
  const listedCount = animals.filter((a) => a.status === 'Listed for Adoption' || a.status === 'Application' || a.status === 'Review & Match').length;

  const vaccinatedCount = animals.filter((a) => a.vaccinations.length > 0).length;
  const vaccinationRate = totalAnimals > 0 ? Math.round((vaccinatedCount / totalAnimals) * 100) : 100;

  // Collect upcoming vaccinations
  const allVaccinations = animals.flatMap((a) =>
    a.vaccinations.map((v) => ({
      ...v,
      petName: a.name,
      petSpecies: a.species,
      petId: a.id,
    }))
  );

  const handleExportSummary = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      system: 'PAW Pet Adoption & Care System',
      metrics: {
        totalAnimals,
        rescuedCount,
        surrenderedCount,
        adoptedCount,
        inCareCount,
        listedCount,
        vaccinationComplianceRate: `${vaccinationRate}%`,
        activeApplicationsCount: applications.length,
        followUpsPendingCount: followUps.filter((f) => f.status === 'Pending').length,
      },
      animalsList: animals.map((a) => ({
        id: a.id,
        name: a.name,
        species: a.species,
        intakeType: a.intakeType,
        status: a.status,
        vaccineCount: a.vaccinations.length,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paw_audit_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setReportExported(true);
    setTimeout(() => setReportExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Scope Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Post-Adoption Follow-ups & Care Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Post-adoption health check-ins, vaccination renewal alerts, and shelter operational metrics.
          </p>
        </div>

        <button
          onClick={handleExportSummary}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{reportExported ? 'Report Exported!' : 'Export Basic Audit Report'}</span>
        </button>
      </div>

      {/* KPI Stat Cards (Tabular figures font-mono as required by design skill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Intake Recorded
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalAnimals}
            </span>
            <span className="text-xs text-slate-500">
              ({rescuedCount} rescued · {surrenderedCount} surrendered)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Adoptions & Follow-up
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-teal-600 font-mono tabular-nums">
              {adoptedCount}
            </span>
            <span className="text-xs text-slate-500">
              active alumni homes
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Currently In Shelter Care
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {inCareCount}
            </span>
            <span className="text-xs text-slate-500">
              receiving daily care
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Vaccination Compliance
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {vaccinationRate}%
            </span>
            <span className="text-xs text-slate-500">
              documented status
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-column breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Post-Adoption Follow-ups Tracking (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-teal-600" />
                  Post-Adoption Follow-Up Log
                </h3>
                <p className="text-xs text-slate-500">
                  30-day, 60-day, and 6-month post-adoption health and integration checkpoints
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['All', 'Pending', 'Completed'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setSelectedMilestoneFilter(fil)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      selectedMilestoneFilter === fil ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {fil}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredFollowUps.map((fup) => (
                <div
                  key={fup.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/40 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{fup.milestoneTitle}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Animal: <strong>{fup.petName}</strong> · Adopter: {fup.adopterName} ({fup.adopterEmail})
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

                  <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                    <span>Due Date: <strong className="font-mono">{fup.dueDate}</strong></span>
                    {fup.completedDate && (
                      <span>Completed: <strong className="font-mono">{fup.completedDate}</strong></span>
                    )}
                  </div>

                  {fup.notes && (
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed">
                      "{fup.notes}"
                    </div>
                  )}

                  {fup.status === 'Pending' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() =>
                          onCompleteFollowUp(
                            fup.id,
                            'Staff coordinator phoned adopter. Pet is thriving, veterinary records confirmed.'
                          )
                        }
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md text-xs shadow-sm"
                      >
                        Log Staff Verification Check
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Vaccinations Booster Tracker & Species Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Vaccination Booster Schedule */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Syringe className="w-4 h-4 text-rose-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Vaccine Booster Tracking</h3>
                <p className="text-[11px] text-slate-500">Upcoming renewals on record</p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {allVaccinations.map((vac) => (
                <div
                  key={vac.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{vac.petName} ({vac.petSpecies})</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">{vac.vaccineName}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Admin: {vac.administeredDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Next Due</span>
                    <span className="font-mono text-xs font-bold text-teal-700">{vac.nextDueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Metrics Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Species & Intake Distribution</h3>

            {/* Species Ratio */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Canine vs Feline</span>
                <span className="font-mono">{dogCount} Dogs / {catCount} Cats</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 flex overflow-hidden">
                <div
                  className="bg-teal-600 h-full"
                  style={{ width: `${totalAnimals > 0 ? (dogCount / totalAnimals) * 100 : 50}%` }}
                />
                <div
                  className="bg-rose-400 h-full"
                  style={{ width: `${totalAnimals > 0 ? (catCount / totalAnimals) * 100 : 50}%` }}
                />
              </div>
            </div>

            {/* Intake Source */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Rescued vs Surrendered</span>
                <span className="font-mono">{rescuedCount} Rescued / {surrenderedCount} Surrendered</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 flex overflow-hidden">
                <div
                  className="bg-slate-900 h-full"
                  style={{ width: `${totalAnimals > 0 ? (rescuedCount / totalAnimals) * 100 : 50}%` }}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${totalAnimals > 0 ? (surrenderedCount / totalAnimals) * 100 : 50}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
