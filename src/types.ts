export type UserRole = 'admin' | 'staff' | 'adopter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatarUrl?: string;
}

export type AnimalStatus =
  | 'Rescue & Intake'
  | 'Care & Monitoring'
  | 'Listed for Adoption'
  | 'Application'
  | 'Review & Match'
  | 'Adoption & Follow-up';

export type IntakeType = 'Rescued' | 'Surrendered';
export type Species = 'Dog' | 'Cat' | 'Other';
export type Gender = 'Male' | 'Female';
export type AgeCategory = 'Puppy/Kitten' | 'Young' | 'Adult' | 'Senior';
export type PetSize = 'Small' | 'Medium' | 'Large';

export type HealthConditionStatus =
  | 'Healthy / Stable'
  | 'Under Active Monitoring'
  | 'In Medical Isolation'
  | 'Recovering';

export interface MedicalHistoryRecord {
  id: string;
  conditionName: string;
  diagnosedDate: string;
  preExistingAtIntake: boolean;
  status: 'Resolved' | 'Ongoing Management' | 'Chronic';
  notes: string;
  attendingVet?: string;
}

export interface IllnessIncident {
  id: string;
  dateReported: string;
  diagnosis: string;
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  status: 'Active Monitoring' | 'Under Treatment' | 'Recovering' | 'Resolved / Cleared';
  isolationWard: boolean;
  treatmentPlan: string;
  resolvedDate?: string;
  prescribedBy: string;
}

export interface DailyHealthCheck {
  id: string;
  date: string;
  time: string;
  temperatureF: number;
  appetite: 'Normal' | 'Fair' | 'Poor' | 'Refused Food';
  energyLevel: 'Alert & Active' | 'Normal' | 'Lethargic' | 'Depressed';
  stoolQuality: 'Normal' | 'Soft' | 'Diarrhea' | 'Not Observed';
  medicationsAdministered: boolean;
  caregiverNotes: string;
  recordedBy: string;
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  administeredDate: string;
  nextDueDate: string;
  administeredBy: string;
  batchNumber?: string;
}

export interface TreatmentRecord {
  id: string;
  treatmentName: string;
  date: string;
  instructions: string;
  administeredBy: string;
  status: 'Completed' | 'Ongoing' | 'Scheduled';
}

export interface CareNote {
  id: string;
  date: string;
  author: string;
  category: 'Behavior' | 'Feeding' | 'Medical' | 'General';
  text: string;
}

export interface Animal {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;
  ageCategory: AgeCategory;
  gender: Gender;
  weightLbs: number;
  size: PetSize;
  intakeType: IntakeType;
  intakeDate: string;
  intakeLocation: string;
  intakeNotes: string;
  photoUrl: string;
  status: AnimalStatus;
  healthStatus: HealthConditionStatus;
  quarantineWard?: string;
  story: string;
  temperament: string[];
  neuteredSpayed: boolean;
  microchipId: string;
  medicalHistory: MedicalHistoryRecord[];
  illnessIncidents: IllnessIncident[];
  dailyHealthChecks: DailyHealthCheck[];
  vaccinations: VaccinationRecord[];
  treatments: TreatmentRecord[];
  careNotes: CareNote[];
  adopterName?: string;
  adopterEmail?: string;
  adoptionDate?: string;
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Meet & Greet Scheduled'
  | 'Approved'
  | 'Declined';

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  homeType: 'House with yard' | 'Apartment' | 'Condo' | 'Townhouse' | 'Rural/Farm';
  ownOrRent: 'Own' | 'Rent';
  hasOtherPets: boolean;
  otherPetsDetails?: string;
  hoursAloneDaily: number;
  petExperience: string;
  motivation: string;
  status: ApplicationStatus;
  staffNotes?: string;
  submissionDate: string;
  reviewedDate?: string;
  meetAndGreetDate?: string;
}

export interface FollowUpCheckIn {
  id: string;
  petId: string;
  petName: string;
  adopterName: string;
  adopterEmail: string;
  adoptionDate: string;
  milestoneTitle: '30-Day Transition Check-in' | '60-Day Wellness Review' | '6-Month Health & Care Follow-up';
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  completedDate?: string;
  healthConfirmed?: boolean;
  vetCheckDone?: boolean;
  adjustmentRating?: number; // 1-5
  notes?: string;
  photoUrl?: string;
}
