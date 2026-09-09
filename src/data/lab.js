// Single source of truth for /lab tools. Order = publish order; the
// homepage features the last entry, so a new tool becomes the featured
// one automatically without touching index.astro.
export const tools = [
	{
		slug: '/lab/qa-calculator',
		title: 'QA Calculator',
		summary:
			'Build a weighted QA scorecard with fail-all and fail-section zero-tolerance tiers, score an evaluation, get a live result. Runs entirely in your browser.',
	},
	{
		slug: '/lab/nps-calculator',
		title: 'NPS Confidence Calculator',
		summary:
			'NPS is a difference of two proportions, not a single trustworthy number — see the real margin of error for your sample size, and how many responses you actually need.',
	},
	{
		slug: '/lab/cross-tab-finder',
		title: 'Cross-Tab Finder',
		summary:
			'Paste two metrics side by side and see where they diverge — the same technique behind the case studies on this site, as a tool you can run on your own data.',
	},
	{
		slug: '/lab/contact-center-simulator',
		title: 'Contact Center Simulator',
		summary:
			'Erlang C staffing calculator with live sliders — volume and handle time in, required agents and service level out, plus a chart showing how non-linear that relationship really is.',
	},
];
