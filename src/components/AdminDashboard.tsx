import React, { useState } from 'react';
import { Animal, AnimalStatus, AdoptionApplication, FollowUpCheckIn, User } from '../types.ts';
import { Download, FileText, HeartPulse, PawPrint, Pencil, ShieldAlert, Trash2, Upload, X } from 'lucide-react';
import { WORKFLOW_STAGES } from './WorkflowPipelineBar.tsx';

interface AdminDashboardProps {
  user: User;
  animals: Animal[];
  applications: AdoptionApplication[];
  followUps: FollowUpCheckIn[];
  onUpdateAnimal: (animal: Animal) => Promise<void>;
  onCreateAnimal: (animal: Animal) => Promise<void>;
  onClearPosts: () => Promise<void>;
  onClearAll: () => Promise<void>;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 3_400_000;

async function encodePetPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image must be 10 MB or smaller.');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image could not be processed.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
  if (dataUrl.length > MAX_DATA_URL_LENGTH) throw new Error('Compressed image is too large. Choose a smaller image.');
  return dataUrl;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  animals,
  applications,
  followUps,
  onUpdateAnimal,
  onCreateAnimal,
  onClearPosts,
  onClearAll,
  activeTab,
  onSelectTab,
}) => {
  const [postDraft, setPostDraft] = useState<Animal | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postError, setPostError] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isClearingPosts, setIsClearingPosts] = useState(false);
  const stageCounts = animals.reduce((counts, animal) => {
    counts[animal.status] = (counts[animal.status] || 0) + 1;
    return counts;
  }, {} as Record<AnimalStatus, number>);
  const pendingApplications = applications.filter((application) =>
    ['Submitted', 'Under Review', 'Meet & Greet Scheduled'].includes(application.status)
  );
  const dueFollowUps = followUps.filter((followUp) =>
    followUp.status === 'Pending' || followUp.status === 'Overdue'
  );
  const careAlerts = animals.filter((animal) =>
    animal.healthStatus === 'In Medical Isolation' || animal.healthStatus === 'Under Active Monitoring'
  );
  const publicPosts = animals.filter((animal) =>
    ['Listed for Adoption', 'Application', 'Review & Match'].includes(animal.status)
  );

  const clearPublicPosts = async () => {
    if (!window.confirm(`Permanently remove all ${publicPosts.length} public pet posts for every user? Medical records and applications will remain.`)) return;
    setIsClearingPosts(true);
    setPostError('');
    try {
      await onClearPosts();
    } catch (error) {
      setPostError(error instanceof Error ? error.message : 'Could not clear public posts.');
    } finally {
      setIsClearingPosts(false);
    }
  };

  const clearAllRecords = async () => {
    if (!window.confirm('Permanently remove all animal records, applications, follow-ups, and public posts for every user?')) return;
    setIsClearingPosts(true);
    setPostError('');
    try {
      await onClearAll();
    } catch (error) {
      setPostError(error instanceof Error ? error.message : 'Could not clear all records.');
    } finally {
      setIsClearingPosts(false);
    }
  };

  const createPostDraft = (): Animal => ({
    id: `paw-${Date.now()}`,
    name: '', species: 'Dog', breed: '', age: '1 year', ageCategory: 'Young', gender: 'Female',
    weightLbs: 20, size: 'Medium', intakeType: 'Rescued', intakeDate: new Date().toISOString().split('T')[0],
    intakeLocation: 'PAW adoption program', intakeNotes: '', photoUrl: '', status: 'Listed for Adoption',
    healthStatus: 'Healthy / Stable', story: '', temperament: [], neuteredSpayed: false, microchipId: '',
    medicalHistory: [], illnessIncidents: [], dailyHealthChecks: [], vaccinations: [], treatments: [], careNotes: [],
  });

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      organization: user.organization || 'PAW demo workspace',
      totals: {
        animals: animals.length,
        applications: applications.length,
        pendingApplications: pendingApplications.length,
        dueFollowUps: dueFollowUps.length,
        careAlerts: careAlerts.length,
      },
      workflow: WORKFLOW_STAGES.map((stage) => ({
        stage: stage.id,
        count: stageCounts[stage.id] || 0,
      })),
    };
    const reportUrl = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const downloadLink = document.createElement('a');
    downloadLink.href = reportUrl;
    downloadLink.download = `paw-admin-report-${new Date().toISOString().slice(0, 10)}.json`;
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(reportUrl), 1000);
  };

  const isReportsView = activeTab === 'admin-reports';
  const isPostsView = activeTab === 'admin-posts';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Administrator</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {isPostsView ? 'Pet posts' : isReportsView ? 'Organization reports' : 'Workspace overview'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.organization || 'PAW workspace'} <span aria-hidden="true">·</span> {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={exportReport}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Export report
        </button>
      </div>

      <div className="flex gap-1 border-b border-slate-200" role="tablist" aria-label="Admin views">
        {[
          { id: 'admin-dashboard', label: 'Overview' },
          { id: 'admin-posts', label: 'Pet Posts' },
          { id: 'admin-reports', label: 'Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!isPostsView && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Animal records', value: animals.length, icon: PawPrint, color: 'text-teal-700 bg-teal-50' },
          { label: 'Applications in review', value: pendingApplications.length, icon: FileText, color: 'text-amber-700 bg-amber-50' },
          { label: 'Follow-ups due', value: dueFollowUps.length, icon: HeartPulse, color: 'text-rose-700 bg-rose-50' },
          { label: 'Care alerts', value: careAlerts.length, icon: ShieldAlert, color: 'text-orange-700 bg-orange-50' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <section key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${metric.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{metric.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{metric.label}</p>
            </section>
          );
        })}
      </div>}

      {isPostsView ? (
        <section className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setPostError('');
                setIsCreatingPost(true);
                setPostDraft(createPostDraft());
              }}
              className="mr-2 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800"
            >
              <Upload className="h-3.5 w-3.5" />
              Add pet post
            </button>
            <button
              type="button"
              disabled={isClearingPosts || publicPosts.length === 0}
              onClick={() => void clearPublicPosts()}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isClearingPosts ? 'Clearing…' : 'Clear all public posts'}
            </button>
          </div>
          {postError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">{postError}</p>}
          {publicPosts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="font-semibold text-slate-800">No pet posts available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publicPosts.map((animal) => (
                <article key={animal.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <img src={animal.photoUrl} alt={animal.name} className="h-44 w-full bg-slate-100 object-cover" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-slate-900">{animal.name}</h2>
                        <p className="text-xs text-slate-500">{animal.species} · {animal.breed}</p>
                      </div>
                      <span className="rounded bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-800">
                        {animal.status}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{animal.story}</p>
                    <button
                      type="button"
                      onClick={() => { setIsCreatingPost(false); setPostDraft(animal); }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit post details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : isReportsView ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isClearingPosts || (animals.length === 0 && applications.length === 0 && followUps.length === 0)}
              onClick={() => void clearAllRecords()}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isClearingPosts ? 'Clearing…' : 'Clear All Records'}
            </button>
          </div>
          {postError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">{postError}</p>}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">Workflow report</h2>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {WORKFLOW_STAGES.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-600">{stage.label}</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">{stageCounts[stage.id] || 0}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">The report downloads as a JSON snapshot of the current demo workspace.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Animal workflow</h2>
              <span className="text-xs text-slate-500">{animals.length} total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {WORKFLOW_STAGES.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-slate-600">{stage.label}</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">{stageCounts[stage.id] || 0}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Application queue</h2>
              <span className="text-xs text-slate-500">{pendingApplications.length} open</span>
            </div>
            {pendingApplications.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No applications need review.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingApplications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{application.applicantName}</p>
                      <p className="text-xs text-slate-500">For {application.petName}</p>
                    </div>
                    <span className="shrink-0 rounded bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">
                      {application.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {postDraft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSavingPost(true);
              setPostError('');
              try {
                if (!postDraft.photoUrl) throw new Error('Upload a pet image before saving this post.');
                if (isCreatingPost) await onCreateAnimal(postDraft);
                else await onUpdateAnimal(postDraft);
                setPostDraft(null);
                setIsCreatingPost(false);
              } catch (error) {
                setPostError(error instanceof Error ? error.message : 'Could not save this post.');
              } finally {
                setIsSavingPost(false);
              }
            }}
            className="my-2 flex min-h-0 w-full max-w-xl max-h-[calc(100dvh-1rem)] flex-col space-y-3 overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:my-4 sm:max-h-[90vh] sm:space-y-4 sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-post-title"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 id="edit-post-title" className="font-bold text-slate-900">{isCreatingPost ? 'Add pet post' : 'Edit pet post'}</h2>
                <p className="text-xs text-slate-500">Changes update the adopter listing.</p>
              </div>
              <button type="button" onClick={() => { setPostDraft(null); setIsCreatingPost(false); }} aria-label="Close editor" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {postError && (
              <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">
                {postError}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Name
                <input required value={postDraft.name} onChange={(event) => setPostDraft({ ...postDraft, name: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Breed
                <input required value={postDraft.breed} onChange={(event) => setPostDraft({ ...postDraft, breed: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Age
                <input required value={postDraft.age} onChange={(event) => setPostDraft({ ...postDraft, age: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Age category
                <select value={postDraft.ageCategory} onChange={(event) => setPostDraft({ ...postDraft, ageCategory: event.target.value as Animal['ageCategory'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900">
                  <option value="Puppy/Kitten">Puppy/Kitten</option>
                  <option value="Young">Young</option>
                  <option value="Adult">Adult</option>
                  <option value="Senior">Senior</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Species
                <select value={postDraft.species} onChange={(event) => setPostDraft({ ...postDraft, species: event.target.value as Animal['species'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900">
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Gender
                <select value={postDraft.gender} onChange={(event) => setPostDraft({ ...postDraft, gender: event.target.value as Animal['gender'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Weight (lbs)
                <input required type="number" min="0" step="0.1" value={postDraft.weightLbs} onChange={(event) => setPostDraft({ ...postDraft, weightLbs: Number(event.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700">
                Size
                <select value={postDraft.size} onChange={(event) => setPostDraft({ ...postDraft, size: event.target.value as Animal['size'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900">
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">Pet photo</span>
              <img src={postDraft.photoUrl} alt={`${postDraft.name} post preview`} className="h-32 w-full rounded-lg bg-slate-100 object-cover" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Upload className="h-3.5 w-3.5" />
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = '';
                    if (!file) return;
                    setPostError('');
                    try {
                      const photoUrl = await encodePetPhoto(file);
                      setPostDraft((current) => current ? { ...current, photoUrl } : current);
                    } catch (error) {
                      setPostError(error instanceof Error ? error.message : 'Could not read this image.');
                    }
                  }}
                />
              </label>
              <p className="text-[11px] text-slate-500">Compressed image stored in Turso. Max 10 MB upload.</p>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={postDraft.neuteredSpayed} onChange={(event) => setPostDraft({ ...postDraft, neuteredSpayed: event.target.checked })} className="rounded border-slate-300 text-teal-700 focus:ring-teal-600" />
              Spayed / neutered
            </label>

            <label className="block space-y-1 text-xs font-semibold text-slate-700">
              Public description
              <textarea required rows={3} value={postDraft.story} onChange={(event) => setPostDraft({ ...postDraft, story: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
            </label>

            <label className="block space-y-1 text-xs font-semibold text-slate-700">
              Temperament (comma-separated)
              <input
                value={postDraft.temperament.join(', ')}
                onChange={(event) => setPostDraft({
                  ...postDraft,
                  temperament: event.target.value.split(',').map((trait) => trait.trim()).filter(Boolean),
                })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"
              />
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
              <button type="button" disabled={isSavingPost} onClick={() => { setPostDraft(null); setIsCreatingPost(false); }} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={isSavingPost} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">{isSavingPost ? 'Saving…' : isCreatingPost ? 'Publish post' : 'Save changes'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};