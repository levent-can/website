// Pure scoring logic for the QA Calculator — no DOM access, so it's easy to
// reason about and reuse (e.g. if this ever grows unit tests).

/**
 * @typedef {'unscored' | 'pass' | 'fail' | 'na'} AttributeStatus
 * @typedef {'normal' | 'failSection' | 'failAll'} AttributeTier
 * @typedef {{ id: string, name: string, tier: AttributeTier, status: AttributeStatus }} Attribute
 * @typedef {{ id: string, name: string, weight: number, attributes: Attribute[] }} Category
 */

/**
 * A category's own score, before the overall fail-all cap. A failed
 * fail-section attribute in this category caps just this category's score
 * (the rest of the evaluation is unaffected) -- that's the whole point of
 * the fail-section tier vs. fail-all.
 * @param {Category} category
 * @param {number} sectionCeiling
 */
export function scoreCategory(category, sectionCeiling = 0) {
	const applicable = category.attributes.filter(
		(a) => a.status === 'pass' || a.status === 'fail'
	);
	if (applicable.length === 0) return null;
	const passed = applicable.filter((a) => a.status === 'pass').length;
	const rawScore = (passed / applicable.length) * 100;

	const sectionFail = category.attributes.some(
		(a) => a.tier === 'failSection' && a.status === 'fail'
	);
	return sectionFail ? Math.min(rawScore, sectionCeiling) : rawScore;
}

/**
 * @param {Category[]} categories
 * @param {{ failAllCeiling?: number, failSectionCeiling?: number }} [options]
 */
export function scoreOverall(categories, options = {}) {
	const { failAllCeiling = 0, failSectionCeiling = 0 } = options;

	const scored = categories
		.map((c) => ({ category: c, score: scoreCategory(c, failSectionCeiling) }))
		.filter((c) => c.score !== null);

	const weightUsed = scored.reduce((sum, c) => sum + (Number(c.category.weight) || 0), 0);
	const rawOverall =
		weightUsed > 0
			? scored.reduce((sum, c) => sum + c.score * (Number(c.category.weight) || 0), 0) / weightUsed
			: null;

	const failAllAttrs = [];
	const failSectionAttrs = []; // { attrName, categoryName }
	for (const c of categories) {
		for (const a of c.attributes) {
			if (a.status !== 'fail') continue;
			if (a.tier === 'failAll') failAllAttrs.push(a.name);
			else if (a.tier === 'failSection') failSectionAttrs.push({ attrName: a.name, categoryName: c.name });
		}
	}

	return {
		categoryScores: scored.map((c) => ({ id: c.category.id, score: c.score })),
		weightUsed,
		rawOverall,
		overall: failAllAttrs.length > 0 && rawOverall !== null ? Math.min(rawOverall, failAllCeiling) : rawOverall,
		failAllAttrs,
		failSectionAttrs,
	};
}

let idCounter = 0;
export function nextId(prefix) {
	idCounter += 1;
	return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** @returns {Category[]} */
export function presetCustomerService() {
	return [
		cat('Greeting & Opening', 10, [
			attr('Proper greeting used', 'normal'),
			attr('Verified customer identity', 'failAll'),
		]),
		cat('Issue Handling', 40, [
			attr('Accurately identified the issue', 'normal'),
			attr('Provided correct resolution or information', 'failSection'),
			attr('Set correct expectations', 'normal'),
		]),
		cat('Communication & Soft Skills', 25, [
			attr('Active listening demonstrated', 'normal'),
			attr('Empathy shown', 'normal'),
			attr('Clear, professional language', 'normal'),
		]),
		cat('Compliance', 15, [
			attr('Required disclosures given', 'failAll'),
			attr('Data privacy followed', 'failAll'),
		]),
		cat('Closing', 10, [
			attr('Summarized resolution', 'normal'),
			attr('Proper closing, thanked customer', 'normal'),
		]),
	];
}

/** @returns {Category[]} */
export function presetSales() {
	return [
		cat('Opening & Rapport', 10, [attr('Professional greeting', 'normal'), attr('Built rapport', 'normal')]),
		cat('Needs Discovery', 20, [
			attr('Asked qualifying questions', 'normal'),
			attr('Identified customer needs', 'normal'),
		]),
		cat('Pitch & Objection Handling', 30, [
			attr('Presented a relevant offer', 'normal'),
			attr('Handled objections effectively', 'failSection'),
		]),
		cat('Compliance & Accuracy', 25, [
			attr('Accurate pricing/terms communicated', 'failAll'),
			attr('Required disclosures given', 'failAll'),
		]),
		cat('Closing', 15, [
			attr('Attempted or achieved close', 'normal'),
			attr('Confirmed next steps', 'normal'),
		]),
	];
}

/** @returns {Category[]} */
export function presetBlank() {
	return [cat('Category 1', 100, [attr('Attribute 1', 'normal')])];
}

function cat(name, weight, attributes) {
	return { id: nextId('cat'), name, weight, attributes };
}
function attr(name, tier) {
	return { id: nextId('attr'), name, tier, status: 'unscored' };
}
