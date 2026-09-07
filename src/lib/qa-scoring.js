// Pure scoring logic for the QA Calculator — no DOM access, so it's easy to
// reason about and reuse (e.g. if this ever grows unit tests).

/**
 * @typedef {'unscored' | 'pass' | 'fail' | 'na'} AttributeStatus
 * @typedef {{ id: string, name: string, critical: boolean, status: AttributeStatus }} Attribute
 * @typedef {{ id: string, name: string, weight: number, attributes: Attribute[] }} Category
 */

/** @param {Category} category */
export function scoreCategory(category) {
	const applicable = category.attributes.filter(
		(a) => a.status === 'pass' || a.status === 'fail'
	);
	if (applicable.length === 0) return null;
	const passed = applicable.filter((a) => a.status === 'pass').length;
	return (passed / applicable.length) * 100;
}

/**
 * @param {Category[]} categories
 * @param {number} criticalCeiling score cap applied when a critical attribute fails
 */
export function scoreOverall(categories, criticalCeiling = 0) {
	const scored = categories
		.map((c) => ({ category: c, score: scoreCategory(c) }))
		.filter((c) => c.score !== null);

	const weightUsed = scored.reduce((sum, c) => sum + (Number(c.category.weight) || 0), 0);
	const overall =
		weightUsed > 0
			? scored.reduce((sum, c) => sum + c.score * (Number(c.category.weight) || 0), 0) / weightUsed
			: null;

	const criticalFail = categories.some((c) =>
		c.attributes.some((a) => a.critical && a.status === 'fail')
	);

	return {
		categoryScores: scored.map((c) => ({ id: c.category.id, score: c.score })),
		weightUsed,
		rawOverall: overall,
		overall: criticalFail && overall !== null ? Math.min(overall, criticalCeiling) : overall,
		criticalFail,
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
			attr('Proper greeting used', false),
			attr('Verified customer identity', true),
		]),
		cat('Issue Handling', 40, [
			attr('Accurately identified the issue', false),
			attr('Provided correct resolution or information', true),
			attr('Set correct expectations', false),
		]),
		cat('Communication & Soft Skills', 25, [
			attr('Active listening demonstrated', false),
			attr('Empathy shown', false),
			attr('Clear, professional language', false),
		]),
		cat('Compliance', 15, [
			attr('Required disclosures given', true),
			attr('Data privacy followed', true),
		]),
		cat('Closing', 10, [
			attr('Summarized resolution', false),
			attr('Proper closing, thanked customer', false),
		]),
	];
}

/** @returns {Category[]} */
export function presetSales() {
	return [
		cat('Opening & Rapport', 10, [attr('Professional greeting', false), attr('Built rapport', false)]),
		cat('Needs Discovery', 20, [
			attr('Asked qualifying questions', false),
			attr('Identified customer needs', false),
		]),
		cat('Pitch & Objection Handling', 30, [
			attr('Presented a relevant offer', false),
			attr('Handled objections effectively', false),
		]),
		cat('Compliance & Accuracy', 25, [
			attr('Accurate pricing/terms communicated', true),
			attr('Required disclosures given', true),
		]),
		cat('Closing', 15, [
			attr('Attempted or achieved close', false),
			attr('Confirmed next steps', false),
		]),
	];
}

/** @returns {Category[]} */
export function presetBlank() {
	return [cat('Category 1', 100, [attr('Attribute 1', false)])];
}

function cat(name, weight, attributes) {
	return { id: nextId('cat'), name, weight, attributes };
}
function attr(name, critical) {
	return { id: nextId('attr'), name, critical, status: 'unscored' };
}
