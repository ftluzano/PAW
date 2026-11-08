import React from 'react';
import { AnimalStatus } from '../types.ts';
import { ChevronRight } from 'lucide-react';

interface WorkflowPipelineBarProps {
  selectedStatus: AnimalStatus | 'All';
  onSelectStatus: (status: AnimalStatus | 'All') => void;
  statusCounts: Record<AnimalStatus, number>;
}

export const WORKFLOW_STAGES: {
  id: AnimalStatus;
  stepNumber: number;
  label: string;
  summary: string;
}[] = [
  {
    id: 'Rescue & Intake',
    stepNumber: 1,
    label: 'Rescue & Intake',
    summary: 'Animal intake, initial quarantine & scanning',
  },
  {
    id: 'Care & Monitoring',
    stepNumber: 2,
    label: 'Care & Monitoring',
    summary: 'Vaccinations, treatments & behavior assessment',
  },
  {
    id: 'Listed for Adoption',
    stepNumber: 3,
    label: 'List for Adoption',
    summary: 'Public showcase & profile published',
  },
  {
    id: 'Application',
    stepNumber: 4,
    label: 'Application',
    summary: 'Adopter questionnaire submitted',
  },
  {
    id: 'Review & Match',
    stepNumber: 5,
    label: 'Review & Match',
    summary: 'Staff evaluation & meet and greet',
  },
  {
    id: 'Adoption & Follow-up',
    stepNumber: 6,
    label: 'Adoption & Follow-up',
    summary: 'Contract signed, 30/60-day care check-ins',
  },
];

export const WorkflowPipelineBar: React.FC<WorkflowPipelineBarProps> = ({
  selectedStatus,
  onSelectStatus,
  statusCounts,
}) => {
  const totalAnimals = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System Workflow:
            </span>
            <span className="text-xs text-slate-600">
              From rescue intake through adoption and post-placement follow-up
            </span>
          </div>

          <button
            onClick={() => onSelectStatus('All')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedStatus === 'All'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Show All ({totalAnimals})
          </button>
        </div>

        {/* 6-step workflow breadcrumbs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {WORKFLOW_STAGES.map((stage) => {
            const isSelected = selectedStatus === stage.id;
            const count = statusCounts[stage.id] || 0;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStatus(isSelected ? 'All' : stage.id)}
                className={`group relative p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 font-mono">
                    0{stage.stepNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      count > 0
                        ? isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                  {stage.label}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {stage.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
