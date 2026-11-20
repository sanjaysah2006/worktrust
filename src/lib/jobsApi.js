import { supabase } from './supabase'

/* =====================================================================
   JOBS
   ===================================================================== */

// All open jobs, newest first. Used by BrowseJobs.
export async function fetchOpenJobs() {
  return supabase
    .from('jobs')
    .select('*, client:profiles(full_name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
}

// A single job with the client's name attached. Used by JobDetails.
export async function fetchJobById(jobId) {
  return supabase
    .from('jobs')
    .select(
      // hires.job_id is UNIQUE, so this embeds as a single object (or
      // null), not an array.
      '*, client:profiles(full_name, email), hire:hires(id, escrow_status, escrow_id, freelancer_id)'
    )
    .eq('id', jobId)
    .single()
}

// All jobs posted by one client, newest first. Used by ClientDashboard.
export async function fetchJobsByClient(clientId) {
  return supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
}

// Used by CreateJob (create mode).
export async function createJob({ clientId, title, description, budget }) {
  return supabase
    .from('jobs')
    .insert({
      client_id: clientId,
      title,
      description,
      budget,
    })
    .select()
    .single()
}

// Used by CreateJob (edit mode).
export async function updateJob(jobId, { title, description, budget }) {
  return supabase
    .from('jobs')
    .update({ title, description, budget })
    .eq('id', jobId)
    .select()
    .single()
}

// Cancels a job. Only allowed by the UI while the job is still "open".
export async function closeJob(jobId) {
  return supabase
    .from('jobs')
    .update({ status: 'cancelled' })
    .eq('id', jobId)
    .select()
    .single()
}

/* =====================================================================
   APPLICATIONS
   ===================================================================== */

// All applications submitted by one freelancer, with the related job
// attached. Used by FreelancerDashboard.
export async function fetchApplicationsByFreelancer(freelancerId) {
  return supabase
    .from('applications')
    .select(
      // The phase5 migration adds a UNIQUE constraint on
      // hires.application_id, so this embeds as a single object (or
      // null) rather than an array.
      '*, job:jobs(id, title, status, budget), hire:hires(id, escrow_status, escrow_id)'
    )
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false })
}

// All applications received for one job, with the applicant's profile
// attached. Used by JobApplications (client view).
export async function fetchApplicationsForJob(jobId) {
  return supabase
    .from('applications')
    .select('*, freelancer:profiles(full_name, email)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true })
}

// Checks whether the current freelancer already applied to a job.
// Returns { data: null } (no error) when there is no existing application.
export async function fetchMyApplicationForJob(jobId, freelancerId) {
  return supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .eq('freelancer_id', freelancerId)
    .maybeSingle()
}

// Used by JobDetails (freelancer applying).
export async function createApplication({
  jobId,
  freelancerId,
  coverLetter,
  proposedAmount,
}) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      freelancer_id: freelancerId,
      cover_letter: coverLetter,
      proposed_amount: proposedAmount,
    })
    .select()
    .single()

  if (error && error.code === '23505') {
    // Unique constraint on (job_id, freelancer_id). Can happen if the
    // same application was already submitted in another tab.
    return {
      data: null,
      error: { message: 'You have already applied to this job.' },
    }
  }

  return { data, error }
}

// Used by JobApplications (client rejecting one applicant).
export async function rejectApplication(applicationId) {
  return supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)
    .select()
    .single()
}

/* =====================================================================
   HIRING
   =====================================================================
   Hiring touches three tables (hires, jobs, applications). It is done
   as a sequence of requests rather than a single database transaction,
   but it is still safe against a job being filled twice: the UNIQUE
   constraint on hires.job_id means the database itself will reject a
   second hire for the same job, even if two clients somehow tried to
   hire at the exact same moment.
   ===================================================================== */

export async function hireFreelancer({
  jobId,
  applicationId,
  clientId,
  freelancerId,
  amount,
}) {
  // Step 1: create the hire record. This is the operation that is
  // protected by the unique constraint on hires.job_id.
  const { data: hire, error: hireError } = await supabase
    .from('hires')
    .insert({
      job_id: jobId,
      application_id: applicationId,
      client_id: clientId,
      freelancer_id: freelancerId,
      amount,
    })
    .select()
    .single()

  if (hireError) {
    if (hireError.code === '23505') {
      return {
        data: null,
        error: {
          message:
            'This job has already been filled by another freelancer.',
        },
      }
    }
    return { data: null, error: hireError }
  }

  // Step 2: mark the job as hired so it drops out of "open" listings.
  const { error: jobError } = await supabase
    .from('jobs')
    .update({ status: 'hired' })
    .eq('id', jobId)

  if (jobError) {
    return { data: hire, error: jobError }
  }

  // Step 3: mark the chosen application as accepted.
  const { error: acceptError } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (acceptError) {
    return { data: hire, error: acceptError }
  }

  // Step 4: automatically reject every other pending application for
  // this job, since only one freelancer can be hired.
  const { error: rejectError } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .neq('id', applicationId)

  if (rejectError) {
    return { data: hire, error: rejectError }
  }

  return { data: hire, error: null }
}
