// Single source of truth for /work case studies. Order = publish order;
// the homepage features the last entry, so a new case study becomes the
// featured one automatically without touching index.astro.
export const caseStudies = [
	{
		slug: '/work/fcr-root-cause',
		title: 'The 8 Points Hiding Behind a Third-Party Booking',
		summary:
			'How cross-referencing FCR, CSAT, and CES instead of watching FCR alone surfaced a single fixable process gap.',
	},
	{
		slug: '/work/language-vs-trust',
		title: "When the Real Problem Wasn't the Language",
		summary:
			'An agent with the lowest NPS on a German-language team was fluent in German. The root cause was perceived comprehension, not actual comprehension.',
	},
	{
		slug: '/work/points-lost-attribution',
		title: 'Why "Points Lost by Fail Rate" Was Quietly Wrong',
		summary:
			'A proportional attribution method looked reasonable and was structurally wrong — fail-all attributes were understated by up to 3x until the model was rebuilt at the evaluation level.',
	},
];
