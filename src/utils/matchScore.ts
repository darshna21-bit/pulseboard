/**
 * Determines whether a single candidate profile skill matches a job tag.
 *
 * Rules:
 * - Both strings are trimmed and lowercased.
 * - If the profile skill is shorter than 3 characters (e.g. "ai", "go", "c", "r"),
 *   an EXACT match is required against the job tag to prevent false-positive
 *   substring matches (e.g. "ai" matching inside "Tailwind CSS", "go" inside "Algorithms").
 * - If the profile skill is 3+ characters long, partial/substring matching is allowed
 *   (exact equality or substring containment like "React" matching "React.js").
 *
 * @param profileSkill - A skill string from the candidate's profile
 * @param jobTag - A technology tag from the job listing
 * @returns boolean indicating if the skill matches the job tag
 */
export function isSkillMatch(profileSkill: string, jobTag: string): boolean {
  const skill = profileSkill.trim().toLowerCase()
  const tag = jobTag.trim().toLowerCase()

  if (!skill || !tag) return false

  // For short strings (< 3 characters), require an exact match
  if (skill.length < 3 || tag.length < 3) {
    return skill === tag
  }

  // For skills and tags with 3+ characters, allow exact match or substring containment
  return skill === tag || tag.includes(skill) || skill.includes(tag)
}

/**
 * Computes a simulated match score between a candidate's profile skills and a job listing's tags.
 *
 * NOTE: This client-side implementation is a simplified heuristic stand-in for real production
 * embedding matching. In a production enterprise system, user resumes/profiles and job descriptions
 * are converted into dense vector embeddings (e.g., 1536-dimensional vectors via OpenAI text-embedding-3
 * or Google Gemini embeddings) and stored in a vector database (such as pgvector, Pinecone, or Qdrant).
 * The backend then executes approximate nearest neighbor (ANN) search using cosine similarity:
 *
 *     cosine_similarity(u, v) = (u · v) / (||u|| * ||v||)
 *
 * Here on the frontend telemetry client:
 * - When no profile skills are entered, each job's baseline random score (55–99%) is preserved.
 * - When profile skills are entered but a job has ZERO matching tags, it is assigned a low non-relevant
 *   score (20–35%) so it honestly fails the default 50% minimum match threshold.
 * - When a job has partial or full overlap (1+ matching tags), its score scales into the 60–99%
 *   range and blends with the baseline score (60/40 weighting) to produce a realistic continuous score.
 *
 * @param profileSkills - Array of skill strings extracted from the user profile
 * @param jobTags - Array of technology/skill tags declared on the job listing
 * @param originalScore - The baseline match score of the job listing (defaults to 75)
 * @returns An integer match percentage clamped between 20 and 99
 */
export function computeMatchScore(
  profileSkills: string[],
  jobTags: string[],
  originalScore: number = 75,
): number {
  const normalizedProfile = profileSkills
    .map((s) => s.trim())
    .filter(Boolean)

  // If no profile skills are provided, fall back to the original baseline score
  if (normalizedProfile.length === 0 || jobTags.length === 0) {
    return Math.min(99, Math.max(55, Math.round(originalScore)))
  }

  // Count matches using isSkillMatch (prevents short-string false positives)
  let matches = 0
  for (const rawTag of jobTags) {
    const isMatch = normalizedProfile.some((skill) => isSkillMatch(skill, rawTag))
    if (isMatch) {
      matches++
    }
  }

  // If there is zero skill overlap, assign a low non-relevant score (20–35%).
  // This honestly indicates irrelevance and ensures the role fails deliberate
  // minimum match thresholds (such as the default 50% filter) rather than
  // falsely inheriting an inflated baseline score.
  if (matches === 0) {
    const lowScore = 20 + Math.round((originalScore / 100) * 15) // maps to 28–35%
    return Math.min(35, Math.max(20, lowScore))
  }

  // Calculate tag overlap fraction (0.0 to 1.0)
  const overlapRatio = matches / jobTags.length

  // Scale overlap to a 60–99 range for partial-to-full matches
  const scaledOverlap = 60 + overlapRatio * (99 - 60)

  // Blend: 60% weight on tag overlap, 40% weight on original score
  const blendedScore = Math.round(0.6 * scaledOverlap + 0.4 * originalScore)

  // Clamp within 55–99 range for matched jobs
  return Math.min(99, Math.max(55, blendedScore))
}
