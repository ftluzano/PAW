import React from 'react';
import { Animal, AnimalStatus } from '../types.ts';
import { WORKFLOW_STAGES } from './WorkflowPipelineBar.tsx';
import { ArrowRight, ChevronRight, Stethoscope } from 'lucide-react';

interface PipelineBoardProps {
  animals: Animal[];
  onMoveStage: (animalId: string, nextStatus: AnimalStatus) => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  animals,
  onMoveStage,
  onSelectAnimal,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Adoption Pipeline Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage progression tracker from Rescue & Intake through Adoption & Follow-up.
          </p>
        </div>
      </div>

      {/* 6 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 min-h-[500px]">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const stageAnimals = animals.filter((a) => a.status === stage.id);
          const nextStage = idx < WORKFLOW_STAGES.length - 1 ? WORKFLOW_STAGES[idx + 1].id : null;

          return (
            <div
              key={stage.id}
              className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">0{stage.stepNumber}</span>
                    <h3 className="font-bold text-xs text-slate-800 line-clamp-1">{stage.label}</h3>
                  </div>
                  <span className="px-1.5 py-0.2 rounded font-mono text-[11px] font-bold bg-white text-slate-700 border border-slate-200">
                    {stageAnimals.length}
                  </span>
                </div>

                {/* Animals in this stage */}
                <div className="space-y-2.5">
                  {stageAnimals.length === 0 ? (
                    <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 text-slate-400 text-[11px]">
                      Empty stage
                    </div>
                  ) : (
                    stageAnimals.map((animal) => (
                      <div
                        key={animal.id}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={animal.photoUrl}
                            alt={animal.name}
                            className="w-9 h-9 rounded-md object-cover border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-slate-900 truncate">{animal.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {animal.breed} · {animal.weightLbs} lbs
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="font-semibold text-teal-700">{animal.intakeType}</span>
                          <span
                            className={`font-semibold px-1 rounded text-[9px] ${
                              animal.healthStatus === 'In Medical Isolation'
                                ? 'bg-rose-100 text-rose-700'
                                : animal.healthStatus === 'Under Active Monitoring'
                                ? 'bg-amber-100 text-amber-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {animal.healthStatus}
                          </span>
                        </div>

                        {/* Stage Progression Action */}
                        <div className="pt-1 flex items-center gap-1">
                          <button
                            onClick={() => onSelectAnimal(animal)}
                            title="Manage Medical Records"
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
                          >
                            <Stethoscope className="w-3 h-3" />
                          </button>

                          {nextStage && (
                            <button
                              onClick={() => onMoveStage(animal.id, nextStage)}
                              className="flex-1 py-1 px-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
