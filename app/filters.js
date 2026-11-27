// Filtering and sorting for the deal board. Pure functions over the deal list: no DOM here,
// so the rules can be read (and checked) on their own. A deal's discount is always computed
// from its two prices, never stored, so the percentage on screen always adds up.

export function percentOff(deal) {
  return Math.round((1 - deal.price / deal.was) * 100);
}

export function saved(deal) {
  return Math.round((deal.was - deal.price) * 100) / 100;
}

// Verdict strength, strongest first. "Real deals only" keeps the top three rungs.
export const VERDICT_RANK = { lowest: 0, strong: 1, good: 2, routine: 3, weak: 4 };

export function isRealDeal(deal) {
  return VERDICT_RANK[deal.verdict] <= 2;
}

export function filterDeals(deals, state) {
  const query = state.query.trim().toLowerCase();
  return deals.filter((deal) => {
    if (state.category !== 'All' && deal.category !== state.category) return false;
    if (state.store !== 'All' && deal.store !== state.store) return false;
    if (percentOff(deal) < state.minDiscount) return false;
    if (state.realOnly && !isRealDeal(deal)) return false;
    if (query !== '' && !`${deal.title} ${deal.store} ${deal.category}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

export const SORTS = {
  discount: { label: 'Biggest % off', compare: (a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a) },
  saved: { label: 'Most money saved', compare: (a, b) => saved(b) - saved(a) },
  price: { label: 'Lowest price', compare: (a, b) => a.price - b.price || percentOff(b) - percentOff(a) },
  name: { label: 'Name A–Z', compare: (a, b) => a.title.localeCompare(b.title) },
};

export function sortDeals(deals, sortKey) {
  const sort = SORTS[sortKey] ?? SORTS.discount;
  return [...deals].sort(sort.compare);
}

// Deals for the same product at another store, cheapest first. Powers the
// "same product elsewhere" comparison on a deal's page.
export function sameProductElsewhere(deals, deal) {
  return deals
    .filter((other) => other.id !== deal.id && other.title === deal.title)
    .sort((a, b) => a.price - b.price);
}

// Board totals for the header stats.
export function boardStats(deals) {
  if (deals.length === 0) return { count: 0, stores: 0, avgDiscount: 0, biggestSaving: 0 };
  const discounts = deals.map(percentOff);
  return {
    count: deals.length,
    stores: new Set(deals.map((d) => d.store)).size,
    avgDiscount: Math.round(discounts.reduce((sum, n) => sum + n, 0) / discounts.length),
    biggestSaving: Math.max(...deals.map(saved)),
  };
}
