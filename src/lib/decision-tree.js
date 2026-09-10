// Data model + pure helpers for the Decision Tree Builder. No DOM access.
//
// A tree is a graph of nodes (technically allows cycles, which is fine and
// often realistic for SOPs with retry/loop steps):
//   { title, startNodeId, nodeOrder: [id...], nodes: { id: Node } }
// A Node is either:
//   { id, type: 'question', text, options: [{ label, nextId }] }
//   { id, type: 'outcome', text, tone: 'resolve' | 'escalate' | 'info' }

let idCounter = 0;
export function nextId() {
	idCounter += 1;
	return `n-${Date.now().toString(36)}-${idCounter}`;
}

export function getNode(tree, id) {
	return tree.nodes[id] ?? null;
}

/** Options (or outcomes with no options) pointing at a node id that doesn't exist. */
export function findBrokenLinks(tree) {
	const broken = [];
	for (const id of tree.nodeOrder) {
		const node = tree.nodes[id];
		if (!node || node.type !== 'question') continue;
		for (const opt of node.options) {
			if (opt.nextId && !tree.nodes[opt.nextId]) {
				broken.push({ nodeId: id, optionLabel: opt.label, missingNextId: opt.nextId });
			}
		}
	}
	if (tree.startNodeId && !tree.nodes[tree.startNodeId]) {
		broken.push({ nodeId: null, optionLabel: '(start node)', missingNextId: tree.startNodeId });
	}
	return broken;
}

/** A small, generic example tree -- not based on any real company's SOP. */
export function sampleTree() {
	const nodes = {
		n1: {
			id: 'n1',
			type: 'question',
			text: 'Has the tracking status updated in the last 24 hours?',
			options: [
				{ label: 'Yes', nextId: 'n2' },
				{ label: 'No', nextId: 'n3' },
			],
		},
		n2: {
			id: 'n2',
			type: 'question',
			text: "Does tracking show the order as 'delivered'?",
			options: [
				{ label: 'Yes', nextId: 'n4' },
				{ label: 'No', nextId: 'n5' },
			],
		},
		n3: {
			id: 'n3',
			type: 'question',
			text: 'Is the order past its estimated delivery date?',
			options: [
				{ label: 'Yes', nextId: 'n6' },
				{ label: 'No', nextId: 'n7' },
			],
		},
		n4: {
			id: 'n4',
			type: 'question',
			text: 'Has the customer checked with household members, neighbors, or building reception?',
			options: [
				{ label: 'Yes, already checked', nextId: 'n8' },
				{ label: 'No, not yet', nextId: 'n9' },
			],
		},
		n5: {
			id: 'n5',
			type: 'outcome',
			tone: 'info',
			text: 'Share the current tracking status and the next expected update time with the customer.',
		},
		n6: {
			id: 'n6',
			type: 'outcome',
			tone: 'escalate',
			text: 'File a lost-package claim and offer the customer redelivery or a refund per policy.',
		},
		n7: {
			id: 'n7',
			type: 'outcome',
			tone: 'info',
			text: 'Reassure the customer, share the tracking link, and ask them to check again in 24 hours.',
		},
		n8: {
			id: 'n8',
			type: 'outcome',
			tone: 'escalate',
			text: 'Escalate to the carrier claims team for a delivery investigation.',
		},
		n9: {
			id: 'n9',
			type: 'outcome',
			tone: 'info',
			text: 'Ask the customer to check with neighbors, household members, or building reception, and follow up in a few hours.',
		},
	};
	return {
		title: 'Order Not Received — Triage (example)',
		startNodeId: 'n1',
		nodeOrder: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'],
		nodes,
	};
}

export function blankTree() {
	const id = nextId();
	return {
		title: 'New decision tree',
		startNodeId: id,
		nodeOrder: [id],
		nodes: {
			[id]: { id, type: 'outcome', tone: 'info', text: 'Describe the outcome here.' },
		},
	};
}
