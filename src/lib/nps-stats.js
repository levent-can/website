// Pure NPS statistics — no DOM access.
//
// NPS's margin of error isn't a simple proportion's margin of error: it's the
// variance of a *difference* of two categories (promoters, detractors) drawn
// from a three-category multinomial (promoters/passives/detractors). That
// gives:
//   Var(p_hat - d_hat) = [p(1-p) + d(1-d) + 2pd] / N
// which is the standard formula CX research firms (Qualtrics, Retently, etc.)
// publish for NPS confidence intervals.

export const Z_SCORES = { 90: 1.645, 95: 1.96, 99: 2.576 };

export function computeNps(promoters, passives, detractors) {
	const total = promoters + passives + detractors;
	if (total <= 0) return null;
	return ((promoters - detractors) / total) * 100;
}

/** Margin of error in NPS points (+/-), at the given confidence level. */
export function marginOfError(promoters, passives, detractors, confidence = 95) {
	const total = promoters + passives + detractors;
	if (total <= 0) return null;
	const p = promoters / total;
	const d = detractors / total;
	const variance = p * (1 - p) + d * (1 - d) + 2 * p * d;
	const se = Math.sqrt(variance / total);
	const z = Z_SCORES[confidence] ?? Z_SCORES[95];
	return z * se * 100;
}

/**
 * Responses needed to reach a target margin of error, given an assumed
 * promoter/detractor split (as shares of total, 0-1).
 */
export function requiredSampleSize(promoterShare, detractorShare, targetMoE, confidence = 95) {
	if (!(targetMoE > 0)) return null;
	const p = Math.min(Math.max(promoterShare, 0), 1);
	const d = Math.min(Math.max(detractorShare, 0), 1 - p);
	const variance = p * (1 - p) + d * (1 - d) + 2 * p * d;
	const z = Z_SCORES[confidence] ?? Z_SCORES[95];
	return Math.ceil((z * z * variance * 10000) / (targetMoE * targetMoE));
}

export function reliability(moe) {
	if (moe === null) return null;
	if (moe <= 5) return { label: 'High confidence', tone: 'good' };
	if (moe <= 10) return { label: 'Moderate confidence', tone: 'warn' };
	return { label: 'Low confidence — treat with caution', tone: 'bad' };
}
