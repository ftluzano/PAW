import React, { useState } from 'react';
import {
  Animal,
  AnimalStatus,
  IntakeType,
  Species,
  VaccinationRecord,
  TreatmentRecord,
  CareNote,
  IllnessIncident,
  MedicalHistoryRecord,
  DailyHealthCheck,
} from '../types.ts';
import {
  Plus,
  Search,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Check,
  AlertCircle,
  AlertTriangle,
  X,
  Stethoscope,
  Activity,
  Thermometer,
} from 'lucide-react';

interface AnimalRecordsViewProps {
  animals: Animal[];
  onAddAnimal: (animal: Animal) => void;
  onUpdateAnimal: (animal: Animal) => void;
  selectedStatusFilter: AnimalStatus | 'All';
}

export const AnimalRecordsView: React.FC<AnimalRecordsViewProps> = ({
  animals,
  onAddAnimal,
  onUpdateAnimal,
  selectedStatusFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'All'>('All');
  const [intakeFilter, setIntakeFilter] = useState<IntakeType | 'All'>('All');

  // Modals
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [selectedAnimalForCare, setSelectedAnimalForCare] = useState<Animal | null>(null);

  // New Intake Form State
  const [intakeName, setIntakeName] = useState('');
  const [intakeSpecies, setIntakeSpecies] = useState<Species>('Dog');
  const [intakeBreed, setIntakeBreed] = useState('');
  const [intakeAge, setIntakeAge] = useState('');
  const [intakeAgeCategory, setIntakeAgeCategory] = useState<'Puppy/Kitten' | 'Young' | 'Adult' | 'Senior'>('Young');
  const [intakeGender, setIntakeGender] = useState<'Male' | 'Female'>('Male');
  const [intakeWeight, setIntakeWeight] = useState(25);
  const [intakeType, setIntakeType] = useState<IntakeType>('Rescued');
  const [intakeLocation, setIntakeLocation] = useState('');
  const [intakeNotes, setIntakeNotes] = useState('');
  const [intakeStory, setIntakeStory] = useState('');
  const [intakePhoto, setIntakePhoto] = useState('/src/assets/images/paw_dog_golden_mix_1794111872445.jpg');

  // Medical form states inside care modal
  const [activeCareTab, setActiveCareTab] = useState<'overview' | 'illness' | 'history' | 'vaccines' | 'treatments' | 'notes'>('illness');
  
  // Sickness Incident logging inside modal
  const [newIllnessDiagnosis, setNewIllnessDiagnosis] = useState('');
  const [newIllnessSymptoms, setNewIllnessSymptoms] = useState('');
  const [newIllnessSeverity, setNewIllnessSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');
  const [newIllnessIsolation, setNewIllnessIsolation] = useState(false);
  const [newIllnessWard, setNewIllnessWard] = useState('Medical Quarantine Bay 1');
  const [newIllnessTreatment, setNewIllnessTreatment] = useState('');
  const [newIllnessPrescriber, setNewIllnessPrescriber] = useState('Dr. Helen Vance, DVM');

  // Prior Medical History logging inside modal
  const [newHistoryCondition, setNewHistoryCondition] = useState('');
  const [newHistoryDate, setNewHistoryDate] = useState('');
  const [newHistoryStatus, setNewHistoryStatus] = useState<'Resolved' | 'Ongoing Management' | 'Chronic'>('Resolved');
  const [newHistoryNotes, setNewHistoryNotes] = useState('');

  // Daily Vitals logging inside modal
  const [newVitalTemp, setNewVitalTemp] = useState(101.5);
  const [newVitalAppetite, setNewVitalAppetite] = useState<'Normal' | 'Fair' | 'Poor' | 'Refused Food'>('Normal');
  const [newVitalEnergy, setNewVitalEnergy] = useState<'Alert & Active' | 'Normal' | 'Lethargic' | 'Depressed'>('Normal');
  const [newVitalStool, setNewVitalStool] = useState<'Normal' | 'Soft' | 'Diarrhea' | 'Not Observed'>('Normal');
  const [newVitalNotes, setNewVitalNotes] = useState('');

  // Vaccine & Treatment form states
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDue, setNewVaccineDue] = useState('');
  const [newVaccineDoctor, setNewVaccineDoctor] = useState('Dr. Helen Vance, DVM');

  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [newTreatmentNotes, setNewTreatmentNotes] = useState('');
  const [newTreatmentDoctor, setNewTreatmentDoctor] = useState('Dr. Helen Vance, DVM');

  const [newNoteCategory, setNewNoteCategory] = useState<'Behavior' | 'Feeding' | 'Medical' | 'General'>('Medical');
  const [newNoteText, setNewNoteText] = useState('');

  // Filtered animals
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.microchipId.includes(searchTerm);
    const matchesSpecies = speciesFilter === 'All' || animal.species === speciesFilter;
    const matchesIntake = intakeFilter === 'All' || animal.intakeType === intakeFilter;
    const matchesStatus = selectedStatusFilter === 'All' || animal.status === selectedStatusFilter;

    return matchesSearch && matchesSpecies && matchesIntake && matchesStatus;
  });

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnimal: Animal = {
      id: `paw-${Date.now().toString().slice(-4)}`,
      name: intakeName || 'New Intake',
      species: intakeSpecies,
      breed: intakeBreed || 'Mixed Breed',
      age: intakeAge || '1 year',
      ageCategory: intakeAgeCategory,
      gender: intakeGender,
      weightLbs: Number(intakeWeight) || 20,
      size: Number(intakeWeight) < 20 ? 'Small' : Number(intakeWeight) < 55 ? 'Medium' : 'Large',
      intakeType: intakeType,
      intakeDate: new Date().toISOString().split('T')[0],
      intakeLocation: intakeLocation || 'Intake center check-in',
      intakeNotes: intakeNotes || 'Initial health exam pending.',
      photoUrl: intakePhoto,
      status: 'Rescue & Intake',
      healthStatus: 'Under Active Monitoring',
      story: intakeStory || `${intakeName} was admitted to our shelter custody and is currently under clinical observation.`,
      temperament: ['Alert', 'Friendly'],
      neuteredSpayed: false,
      microchipId: `98514100${Math.floor(1000000 + Math.random() * 9000000)}`,
      medicalHistory: [],
      illnessIncidents: [],
      dailyHealthChecks: [
        {
          id: `dh-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          temperatureF: 101.5,
          appetite: 'Normal',
          energyLevel: 'Normal',
          stoolQuality: 'Normal',
          medicationsAdministered: true,
          caregiverNotes: 'Intake admission vitals logged. Hydration normal.',
          recordedBy: 'Intake Staff',
        },
      ],
      vaccinations: [
        {
          id: `v-${Date.now()}`,
          vaccineName: intakeSpecies === 'Dog' ? 'Core DHPP 1st Dose' : 'FVRCP Initial Dose',
          administeredDate: new Date().toISOString().split('T')[0],
          nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          administeredBy: 'Intake Staff Nurse',
        },
      ],
      treatments: [
        {
          id: `t-${Date.now()}`,
          treatmentName: 'Intake Deworming & Parasite Screening',
          date: new Date().toISOString().split('T')[0],
          instructions: 'Initial broad-spectrum deworming administered.',
          administeredBy: 'Care Team',
          status: 'Completed',
        },
      ],
      careNotes: [
        {
          id: `c-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: 'Intake Desk',
          category: 'General',
          text: `Intake registered under ${intakeType} status. Placed in observation ward.`,
        },
      ],
    };

    onAddAnimal(newAnimal);
    setShowIntakeModal(false);
    setIntakeName('');
    setIntakeBreed('');
    setIntakeLocation('');
    setIntakeNotes('');
    setIntakeStory('');
  };

  // Add Sickness Incident
  const handleAddIllnessIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForCare || !newIllnessDiagnosis) return;

    const newIllness: IllnessIncident = {
      id: `ill-${Date.now()}`,
      dateReported: new Date().toISOString().split('T')[0],
      diagnosis: newIllnessDiagnosis,
      symptoms: newIllnessSymptoms ? newIllnessSymptoms.split(',').map((s) => s.trim()) : ['Symptoms observed'],
      severity: newIllnessSeverity,
      status: 'Under Treatment',
      isolationWard: newIllnessIsolation,
      treatmentPlan: newIllnessTreatment || 'Prescribed protocol initiated.',
      prescribedBy: newIllnessPrescriber,
    };

    const updated: Animal = {
      ...selectedAnimalForCare,
      healthStatus: newIllnessIsolation ? 'In Medical Isolation' : 'Under Active Monitoring',
      quarantineWard: newIllnessIsolation ? newIllnessWard : selectedAnimalForCare.quarantineWard,
      illnessIncidents: [newIllness, ...selectedAnimalForCare.illnessIncidents],
    };

    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
    setNewIllnessDiagnosis('');
    setNewIllnessSymptoms('');
    setNewIllnessTreatment('');
  };

  // Resolve Sickness Incident
  const handleResolveIncident = (incidentId: string) => {
    if (!selectedAnimalForCare) return;

    const updatedIncidents = selectedAnimalForCare.illnessIncidents.map((inc) =>
      inc.id === incidentId
        ? {
            ...inc,
            status: 'Resolved / Cleared' as const,
            resolvedDate: new Date().toISOString().split('T')[0],
          }
        : inc
    );

    const hasActive = updatedIncidents.some(
      (inc) => inc.status === 'Active Monitoring' || inc.status === 'Under Treatment'
    );

    const updated: Animal = {
      ...selectedAnimalForCare,
      illnessIncidents: updatedIncidents,
      healthStatus: hasActive ? 'Under Active Monitoring' : 'Healthy / Stable',
      quarantineWard: hasActive ? selectedAnimalForCare.quarantineWard : undefined,
    };

    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
  };

  // Add Medical History Record
  const handleAddMedicalHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForCare || !newHistoryCondition) return;

    const newHistory: MedicalHistoryRecord = {
      id: `mh-${Date.now()}`,
      conditionName: newHistoryCondition,
      diagnosedDate: newHistoryDate || new Date().toISOString().split('T')[0],
      preExistingAtIntake: true,
      status: newHistoryStatus,
      notes: newHistoryNotes || 'Documented at admission examination.',
      attendingVet: 'Dr. Helen Vance, DVM',
    };

    const updated: Animal = {
      ...selectedAnimalForCare,
      medicalHistory: [newHistory, ...selectedAnimalForCare.medicalHistory],
    };

    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
    setNewHistoryCondition('');
    setNewHistoryNotes('');
  };

  // Add Daily Health Check
  const handleAddDailyHealthCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForCare) return;

    const newCheck: DailyHealthCheck = {
      id: `dh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      temperatureF: Number(newVitalTemp),
      appetite: newVitalAppetite,
      energyLevel: newVitalEnergy,
      stoolQuality: newVitalStool,
      medicationsAdministered: true,
      caregiverNotes: newVitalNotes || 'Daily clinical vitals check completed.',
      recordedBy: 'Clinical Staff',
    };

    const updated: Animal = {
      ...selectedAnimalForCare,
      dailyHealthChecks: [newCheck, ...selectedAnimalForCare.dailyHealthChecks],
    };

    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
    setNewVitalNotes('');
  };

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForCare || !newVaccineName) return;

    const newVac: VaccinationRecord = {
      id: `v-${Date.now()}`,
      vaccineName: newVaccineName,
      administeredDate: new Date().toISOString().split('T')[0],
      nextDueDate: newVaccineDue || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      administeredBy: newVaccineDoctor,
    };

    const updated = {
      ...selectedAnimalForCare,
      vaccinations: [newVac, ...selectedAnimalForCare.vaccinations],
    };
    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
    setNewVaccineName('');
    setNewVaccineDue('');
  };

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForCare || !newTreatmentName) return;

    const newTr: TreatmentRecord = {
      id: `t-${Date.now()}`,
      treatmentName: newTreatmentName,
      date: new Date().toISOString().split('T')[0],
      instructions: newTreatmentNotes || 'Administered per protocol.',
      administeredBy: newTreatmentDoctor,
      status: 'Completed',
    };

    const updated = {
      ...selectedAnimalForCare,
      treatments: [newTr, ...selectedAnimalForCare.treatments],
    };
    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
    setNewTreatmentName('');
    setNewTreatmentNotes('');
  };

  const handleAddCareNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForCare || !newNoteText) return;

    const newNote: CareNote = {
      id: `c-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: 'Clinical Staff',
      category: newNoteCategory,
      text: newNoteText,
    };

    const updated = {
      ...selectedAnimalForCare,
      careNotes: [newNote, ...selectedAnimalForCare.careNotes],
    };
    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
    setNewNoteText('');
  };

  const handleStatusChange = (newStatus: AnimalStatus) => {
    if (!selectedAnimalForCare) return;
    const updated = {
      ...selectedAnimalForCare,
      status: newStatus,
    };
    onUpdateAnimal(updated);
    setSelectedAnimalForCare(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, breed, or microchip ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Dog', 'Cat'] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => setSpeciesFilter(sp)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  speciesFilter === sp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Rescued', 'Surrendered'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setIntakeFilter(type)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  intakeFilter === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowIntakeModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Animal Intake</span>
        </button>
      </div>

      {/* Animal Records Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No animal records found</p>
          <p className="text-xs text-slate-500 mt-1">Adjust your search parameters or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnimals.map((animal) => {
            const activeIllnesses = animal.illnessIncidents.filter((i) => i.status !== 'Resolved / Cleared');

            return (
              <div
                key={animal.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={animal.photoUrl}
                      alt={animal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-900/85 text-white backdrop-blur-sm">
                        {animal.intakeType}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-900/85 text-teal-200 backdrop-blur-sm">
                        {animal.species}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm ${
                          animal.healthStatus === 'In Medical Isolation'
                            ? 'bg-rose-900/90 text-rose-100 border border-rose-700'
                            : animal.healthStatus === 'Under Active Monitoring'
                            ? 'bg-amber-900/90 text-amber-100 border border-amber-700'
                            : 'bg-emerald-900/90 text-emerald-100 border border-emerald-700'
                        }`}
                      >
                        {animal.healthStatus}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <div className="bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center justify-between">
                        <span>Workflow Stage:</span>
                        <span className="text-teal-300">{animal.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900">{animal.name}</h3>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          {animal.weightLbs} lbs
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{animal.breed}</p>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5">
                      <span>{animal.age}</span>
                      <span aria-hidden="true">·</span>
                      <span>{animal.gender}</span>
                      <span aria-hidden="true">·</span>
                      <span>{animal.size} size</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">Chip: {animal.microchipId.slice(-6)}</span>
                    </div>

                    {/* Active In-Care Sickness Alert */}
                    {activeIllnesses.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[11px]">Active Clinical Treatment:</p>
                          <p className="text-[11px] leading-tight">
                            {activeIllnesses[0].diagnosis} ({activeIllnesses[0].severity})
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pre-existing History Badge */}
                    {animal.medicalHistory.length > 0 && (
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">Documented History:</span>{' '}
                        <span>{animal.medicalHistory.map((h) => h.conditionName).join(', ')}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {animal.story}
                    </p>

                    {/* Medical Summary */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>{animal.vaccinations.length} Vaccines on file</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                        <span>{animal.neuteredSpayed ? 'Sterilized' : 'Intact'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => setSelectedAnimalForCare(animal)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                    <span>Open Clinical Care & Medical Record</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: REGISTER INTAKE */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Register Animal Intake</h3>
                <p className="text-xs text-slate-400">Record intake origin, physical profile, and health condition</p>
              </div>
              <button onClick={() => setShowIntakeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intake Source</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIntakeType('Rescued')}
                    className={`p-2.5 rounded-lg border text-left font-semibold ${
                      intakeType === 'Rescued'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Rescued Animal (Field / Stray / Abandoned)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntakeType('Surrendered')}
                    className={`p-2.5 rounded-lg border text-left font-semibold ${
                      intakeType === 'Surrendered'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Surrendered Animal (Owner Relinquishment)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Animal Name</label>
                  <input
                    type="text"
                    required
                    value={intakeName}
                    onChange={(e) => setIntakeName(e.target.value)}
                    placeholder="e.g. Copper"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Species</label>
                  <select
                    value={intakeSpecies}
                    onChange={(e) => {
                      const sp = e.target.value as Species;
                      setIntakeSpecies(sp);
                      if (sp === 'Dog') {
                        setIntakePhoto('/src/assets/images/paw_dog_golden_mix_1794111872445.jpg');
                      } else {
                        setIntakePhoto('/src/assets/images/paw_cat_calico_rescue_1794111872748.jpg');
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Breed Description</label>
                  <input
                    type="text"
                    value={intakeBreed}
                    onChange={(e) => setIntakeBreed(e.target.value)}
                    placeholder="e.g. Labrador / Hound Mix"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age & Category</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={intakeAge}
                      onChange={(e) => setIntakeAge(e.target.value)}
                      placeholder="e.g. 1.5 years"
                      className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                    />
                    <select
                      value={intakeAgeCategory}
                      onChange={(e) => setIntakeAgeCategory(e.target.value as any)}
                      className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="Puppy/Kitten">Puppy/Kitten</option>
                      <option value="Young">Young</option>
                      <option value="Adult">Adult</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender & Weight (lbs)</label>
                  <div className="flex gap-2">
                    <select
                      value={intakeGender}
                      onChange={(e) => setIntakeGender(e.target.value as any)}
                      className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <input
                      type="number"
                      value={intakeWeight}
                      onChange={(e) => setIntakeWeight(Number(e.target.value))}
                      className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intake Location / Source</label>
                  <input
                    type="text"
                    value={intakeLocation}
                    onChange={(e) => setIntakeLocation(e.target.value)}
                    placeholder="e.g. Found near Route 9 crossing"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Health Findings & Intake Observations
                </label>
                <textarea
                  rows={2}
                  value={intakeNotes}
                  onChange={(e) => setIntakeNotes(e.target.value)}
                  placeholder="Note body condition score, hydration status, coat condition, or any signs of injury/illness..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bio / Narrative
                </label>
                <textarea
                  rows={2}
                  value={intakeStory}
                  onChange={(e) => setIntakeStory(e.target.value)}
                  placeholder="Demeanor, habits, and background information..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Animal Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLINICAL CARE & MEDICAL MANAGEMENT */}
      {selectedAnimalForCare && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAnimalForCare.photoUrl}
                  alt={selectedAnimalForCare.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span>Clinical File: {selectedAnimalForCare.name}</span>
                    <span className="text-xs text-teal-400 font-mono">
                      (ID: {selectedAnimalForCare.id})
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        selectedAnimalForCare.healthStatus === 'In Medical Isolation'
                          ? 'bg-rose-900 text-rose-200 border border-rose-700'
                          : selectedAnimalForCare.healthStatus === 'Under Active Monitoring'
                          ? 'bg-amber-900 text-amber-200 border border-amber-700'
                          : 'bg-teal-900 text-teal-200 border border-teal-700'
                      }`}
                    >
                      {selectedAnimalForCare.healthStatus}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedAnimalForCare.breed} · Microchip #{selectedAnimalForCare.microchipId} · Weight: {selectedAnimalForCare.weightLbs} lbs
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnimalForCare(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Stage Progression */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Workflow Stage:</span>
                <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedAnimalForCare.status}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500 text-[11px] mr-1">Move to:</span>
                {(
                  [
                    'Rescue & Intake',
                    'Care & Monitoring',
                    'Listed for Adoption',
                    'Application',
                    'Review & Match',
                    'Adoption & Follow-up',
                  ] as AnimalStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    disabled={selectedAnimalForCare.status === st}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      selectedAnimalForCare.status === st
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs overflow-x-auto">
              <button
                onClick={() => setActiveCareTab('illness')}
                className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeCareTab === 'illness'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Illness & In-Care Sickness ({selectedAnimalForCare.illnessIncidents.length})</span>
              </button>

              <button
                onClick={() => setActiveCareTab('history')}
                className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeCareTab === 'history'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prior Medical History ({selectedAnimalForCare.medicalHistory.length})</span>
              </button>

              <button
                onClick={() => setActiveCareTab('vaccines')}
                className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeCareTab === 'vaccines'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Vaccinations ({selectedAnimalForCare.vaccinations.length})</span>
              </button>

              <button
                onClick={() => setActiveCareTab('treatments')}
                className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeCareTab === 'treatments'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Treatments ({selectedAnimalForCare.treatments.length})</span>
              </button>

              <button
                onClick={() => setActiveCareTab('notes')}
                className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeCareTab === 'notes'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Care Notes ({selectedAnimalForCare.careNotes.length})</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              
              {/* TAB 1: IN-CARE SICKNESS & ILLNESS LOG (Directly addressing user feedback) */}
              {activeCareTab === 'illness' && (
                <div className="space-y-5">
                  
                  {/* Log Sickness Episode Form */}
                  <form
                    onSubmit={handleAddIllnessIncident}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Record Illness / Sickness Incident While Under Care
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Condition / Sickness Diagnosis
                        </label>
                        <input
                          type="text"
                          required
                          value={newIllnessDiagnosis}
                          onChange={(e) => setNewIllnessDiagnosis(e.target.value)}
                          placeholder="e.g. Canine Infectious Respiratory Disease, Gastroenteritis"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                        <select
                          value={newIllnessSeverity}
                          onChange={(e) => setNewIllnessSeverity(e.target.value as any)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
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
                          value={newIllnessPrescriber}
                          onChange={(e) => setNewIllnessPrescriber(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Observed Clinical Symptoms
                        </label>
                        <input
                          type="text"
                          value={newIllnessSymptoms}
                          onChange={(e) => setNewIllnessSymptoms(e.target.value)}
                          placeholder="e.g. Persistent dry cough, clear nasal discharge, rectal temp 103.1°F"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Veterinary Treatment Protocol & Prescription
                        </label>
                        <input
                          type="text"
                          value={newIllnessTreatment}
                          onChange={(e) => setNewIllnessTreatment(e.target.value)}
                          placeholder="e.g. Doxycycline 100mg PO BID x 10 days; maintain strict hydration"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={newIllnessIsolation}
                          onChange={(e) => setNewIllnessIsolation(e.target.checked)}
                          className="rounded border-slate-300 text-teal-600"
                        />
                        <span>Place in medical isolation quarantine</span>
                      </label>

                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
                      >
                        Log Illness Episode
                      </button>
                    </div>
                  </form>

                  {/* Sickness Incident History List */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold text-slate-900 text-xs">
                      Documented In-Care Illness Incidents ({selectedAnimalForCare.illnessIncidents.length})
                    </h4>

                    {selectedAnimalForCare.illnessIncidents.length === 0 ? (
                      <p className="text-slate-400 italic">No sickness incidents recorded while in shelter custody.</p>
                    ) : (
                      selectedAnimalForCare.illnessIncidents.map((inc) => (
                        <div
                          key={inc.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">{inc.diagnosis}</h5>
                                <span
                                  className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                    inc.status === 'Resolved / Cleared'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {inc.status}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  Severity: {inc.severity}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                                Reported: {inc.dateReported} · Attending: {inc.prescribedBy}
                              </p>
                            </div>

                            {inc.status !== 'Resolved / Cleared' && (
                              <button
                                onClick={() => handleResolveIncident(inc.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Mark Cleared</span>
                              </button>
                            )}
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                            <p><strong>Symptoms:</strong> {inc.symptoms.join(', ')}</p>
                            <p><strong>Treatment:</strong> {inc.treatmentPlan}</p>
                            {inc.resolvedDate && (
                              <p className="text-emerald-700 font-medium">
                                Clinical Clearance Date: {inc.resolvedDate}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRIOR MEDICAL HISTORY */}
              {activeCareTab === 'history' && (
                <div className="space-y-5">
                  <form
                    onSubmit={handleAddMedicalHistory}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <h4 className="font-bold text-slate-900 text-xs">
                      Document Pre-existing Condition / Prior Medical History
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Condition Name</label>
                        <input
                          type="text"
                          required
                          value={newHistoryCondition}
                          onChange={(e) => setNewHistoryCondition(e.target.value)}
                          placeholder="e.g. Past Pelvic Fracture, Chronic Otitis"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Diagnosis Date</label>
                        <input
                          type="date"
                          value={newHistoryDate}
                          onChange={(e) => setNewHistoryDate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Status</label>
                        <select
                          value={newHistoryStatus}
                          onChange={(e) => setNewHistoryStatus(e.target.value as any)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        >
                          <option value="Resolved">Resolved</option>
                          <option value="Ongoing Management">Ongoing Management</option>
                          <option value="Chronic">Chronic</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block font-semibold text-slate-700 mb-1">Clinical Findings & Notes</label>
                        <input
                          type="text"
                          value={newHistoryNotes}
                          onChange={(e) => setNewHistoryNotes(e.target.value)}
                          placeholder="Radiograph notes, past treatments, physical examination details..."
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                      >
                        Add to Medical History
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {selectedAnimalForCare.medicalHistory.map((hist) => (
                      <div key={hist.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900">{hist.conditionName}</h5>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {hist.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{hist.notes}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          Diagnosed: {hist.diagnosedDate} · Vet: {hist.attendingVet || 'Clinical Team'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: VACCINATIONS */}
              {activeCareTab === 'vaccines' && (
                <div className="space-y-5">
                  <form onSubmit={handleAddVaccine} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">Record New Vaccination</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Vaccine Name</label>
                        <input
                          type="text"
                          required
                          value={newVaccineName}
                          onChange={(e) => setNewVaccineName(e.target.value)}
                          placeholder="e.g. Rabies Booster (Canine)"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Next Due Date</label>
                        <input
                          type="date"
                          value={newVaccineDue}
                          onChange={(e) => setNewVaccineDue(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Administering DVM / Tech</label>
                        <input
                          type="text"
                          value={newVaccineDoctor}
                          onChange={(e) => setNewVaccineDoctor(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                      >
                        Log Vaccination
                      </button>
                    </div>
                  </form>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-3">Vaccine</th>
                          <th className="p-3">Administered</th>
                          <th className="p-3">Next Due</th>
                          <th className="p-3">Administered By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedAnimalForCare.vaccinations.map((vac) => (
                          <tr key={vac.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900">{vac.vaccineName}</td>
                            <td className="p-3 font-mono text-slate-600">{vac.administeredDate}</td>
                            <td className="p-3 font-mono font-medium text-teal-700">{vac.nextDueDate}</td>
                            <td className="p-3 text-slate-600">{vac.administeredBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TREATMENTS */}
              {activeCareTab === 'treatments' && (
                <div className="space-y-5">
                  <form onSubmit={handleAddTreatment} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">Record Clinical Treatment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Treatment / Procedure</label>
                        <input
                          type="text"
                          required
                          value={newTreatmentName}
                          onChange={(e) => setNewTreatmentName(e.target.value)}
                          placeholder="e.g. Oral NexGard Tick Chews"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Veterinarian / Clinician</label>
                        <input
                          type="text"
                          value={newTreatmentDoctor}
                          onChange={(e) => setNewTreatmentDoctor(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 font-medium mb-1">Dosage & Instructions</label>
                        <input
                          type="text"
                          value={newTreatmentNotes}
                          onChange={(e) => setNewTreatmentNotes(e.target.value)}
                          placeholder="e.g. 1 chewable tablet administered with morning meal."
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                      >
                        Log Treatment Record
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {selectedAnimalForCare.treatments.map((tr) => (
                      <div key={tr.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{tr.treatmentName}</p>
                          <p className="text-slate-600 text-xs mt-0.5">{tr.instructions}</p>
                          <p className="text-[11px] text-slate-400 mt-1 font-mono">
                            Administered by {tr.administeredBy} on {tr.date}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tr.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: DAILY CARE NOTES */}
              {activeCareTab === 'notes' && (
                <div className="space-y-5">
                  <form onSubmit={handleAddCareNote} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">Add Daily Caregiver Observation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Category</label>
                        <select
                          value={newNoteCategory}
                          onChange={(e) => setNewNoteCategory(e.target.value as any)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="Behavior">Behavior</option>
                          <option value="Feeding">Feeding</option>
                          <option value="Medical">Medical</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-slate-600 font-medium mb-1">Observation Details</label>
                        <input
                          type="text"
                          required
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="e.g. Responded well to leash walk in yard, good appetite."
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                      >
                        Save Care Note
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {selectedAnimalForCare.careNotes.map((note) => (
                      <div key={note.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-700">{note.category}</span>
                          <span className="font-mono">{note.date} · {note.author}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAnimalForCare(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800"
              >
                Close Records Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
