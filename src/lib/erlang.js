// Erlang C queueing model — the standard formula contact centers use for
// staffing: given offered load and agent count, what fraction of contacts
// wait, and what service level (% answered within target time) results.
//
// Uses the recursive Erlang B formulation to avoid factorial overflow for
// realistic agent counts.

/** Recursive Erlang B (blocking probability). */
export function erlangB(n, a) {
	let b = 1;
	for (let i = 1; i <= n; i++) {
		b = (a * b) / (i + a * b);
	}
	return b;
}

/** Erlang C: probability an arriving contact must wait (all agents busy). */
export function erlangC(n, a) {
	if (n <= a) return 1; // unstable -- queue grows without bound
	const b = erlangB(n, a);
	return b / (1 - (a / n) * (1 - b));
}

/** Offered load in Erlangs (average number of agents busy with no queueing). */
export function offeredLoad(volume, ahtSeconds, intervalSeconds) {
	if (intervalSeconds <= 0) return 0;
	return (volume * ahtSeconds) / intervalSeconds;
}

/** Probability of answering within targetSeconds, given n agents. Returns 0-1. */
export function serviceLevel(n, a, ahtSeconds, targetSeconds) {
	if (n <= a) return 0;
	if (a === 0) return 1;
	const c = erlangC(n, a);
	return 1 - c * Math.exp((-(n - a) * targetSeconds) / ahtSeconds);
}

/** Average speed of answer, in seconds. */
export function averageSpeedOfAnswer(n, a, ahtSeconds) {
	if (n <= a) return Infinity;
	const c = erlangC(n, a);
	return (c * ahtSeconds) / (n - a);
}

export function occupancy(n, a) {
	if (n <= 0) return 0;
	return a / n;
}

/**
 * Minimum agents needed to hit targetServiceLevel (0-1) within
 * targetSeconds, given offered load `a`. Returns null if not achievable
 * within a sane search range.
 */
export function requiredAgents(a, ahtSeconds, targetSeconds, targetServiceLevelFraction) {
	const minN = Math.max(1, Math.floor(a) + 1);
	const maxN = minN + 1000;
	for (let n = minN; n <= maxN; n++) {
		if (serviceLevel(n, a, ahtSeconds, targetSeconds) >= targetServiceLevelFraction) {
			return n;
		}
	}
	return null;
}

/** Inflates on-phone agent count to scheduled FTE, accounting for shrinkage (0-100). */
export function requiredStaffing(agents, shrinkagePct) {
	const shrinkage = Math.min(Math.max(shrinkagePct, 0), 99) / 100;
	return agents / (1 - shrinkage);
}
