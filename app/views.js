// HTML for every page of the board, built from the deal data. Every value that comes from
// the data is escaped before it goes into the page. Views never touch the network.

import { VERDICTS } from './data.js';
import { percentOff, saved } from './filters.js';

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const usd = (n) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

// A date-only check shows as a date; a full timestamp shows date and time, always UTC.
export function checkedLabel(checked) {
  const date = new Date(checked);
  if (checked.length <= 10) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }
  return (
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) +
    ', ' +
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }) +
    ' UTC'
  );
}

function verdictBadge(deal) {
  const v = VERDICTS[deal.verdict];
  return `<span class="verdict verdict-${deal.verdict}" title="${escape(v.blurb)}">${escape(v.label)}</span>`;
}

export function dealCard(deal) {
  return `<article class="card">
  <div class="card-top">${verdictBadge(deal)}<span class="category">${escape(deal.category)}</span></div>
  <h3><a href="#/deal/${encodeURIComponent(deal.id)}">${escape(deal.title)}</a></h3>
  <p class="store">${escape(deal.store)}</p>
  <p class="price"><strong>${usd(deal.price)}</strong> <s>${usd(deal.was)}</s></p>
  <p class="saving">${percentOff(deal)}% off &middot; save ${usd(saved(deal))}</p>
  <p class="checked">Checked ${checkedLabel(deal.checked)} &middot; ${escape(deal.source)}</p>
  <p class="actions"><a class="button" href="${escape(deal.url)}" target="_blank" rel="noopener">View at ${escape(deal.store)} &nearr;</a>
  <a class="details" href="#/deal/${encodeURIComponent(deal.id)}">Details</a></p>
</article>`;
}

export function dealList(deals, stats) {
  const cards = deals.map(dealCard).join('\n');
  return `<section class="stats" aria-label="Board totals">
  <div><strong>${stats.count}</strong><span>deals on the board</span></div>
  <div><strong>${stats.stores}</strong><span>stores</span></div>
  <div><strong>${stats.avgDiscount}%</strong><span>average discount</span></div>
  <div><strong>${usd(stats.biggestSaving)}</strong><span>biggest single saving</span></div>
</section>
<p class="count-line" id="count-line">${deals.length === 1 ? '1 deal matches.' : `${deals.length} deals match.`}</p>
${deals.length === 0 ? '<p class="empty">No deal matches those filters. Loosen one and try again.</p>' : `<div class="grid">${cards}</div>`}`;
}

export function dealPage(deal, elsewhere) {
  const v = VERDICTS[deal.verdict];
  const rows = elsewhere
    .map(
      (other) => `<li><a href="#/deal/${encodeURIComponent(other.id)}">${escape(other.store)} — ${usd(other.price)}</a>
      (${percentOff(other)}% off, ${escape(other.source)})</li>`,
    )
    .join('\n');
  return `<p><a class="back" href="#/">&larr; All deals</a></p>
<article class="detail">
  <div class="card-top">${verdictBadge(deal)}<span class="category">${escape(deal.category)}</span></div>
  <h1>${escape(deal.title)}</h1>
  <p class="price big"><strong>${usd(deal.price)}</strong> <s>${usd(deal.was)}</s></p>
  <p class="saving big">${percentOff(deal)}% off &middot; save ${usd(saved(deal))}</p>
  <dl>
    <dt>Store</dt><dd>${escape(deal.store)}</dd>
    <dt>Category</dt><dd>${escape(deal.category)}</dd>
    <dt>Price checked</dt><dd>${checkedLabel(deal.checked)}</dd>
    <dt>Read in</dt><dd>${escape(deal.source)}</dd>
  </dl>
  <h2>Is it really a deal?</h2>
  <p><strong>${escape(v.label)}.</strong> ${escape(v.blurb)} ${escape(deal.note)}</p>
  ${
    elsewhere.length > 0
      ? `<h2>Same product elsewhere</h2><ul class="elsewhere">${rows}</ul>`
      : `<h2>Same product elsewhere</h2><p>No other store on this board carries this exact product.</p>`
  }
  <p class="actions"><a class="button" href="${escape(deal.url)}" target="_blank" rel="noopener">View it at ${escape(deal.store)} &nearr;</a></p>
  <p class="fineprint">Prices change fast on Black Friday — confirm the price at checkout before you buy.</p>
</article>`;
}

export function missingPage() {
  return `<h1>Deal not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}

export function methodSection(sources) {
  const items = sources.map((s) => `<li><strong>${escape(s.name)}</strong> — ${escape(s.detail)}</li>`).join('\n');
  return `<section class="method" id="how-we-check">
  <h2>How we check a deal</h2>
  <p>Every price on this board was read by the agent from a named deals source or retailer
  release on Black Friday, Nov 27, 2026 — never guessed, never copied from another deal site's
  branding. The discount is always computed from the two prices, so the percentage on screen
  always adds up. A “was” price that a store only states as “$X off” is marked as implied in
  the research notes, and the verdict says plainly when a cut is barely a deal at all.</p>
  <h3>What the verdicts mean</h3>
  <ul>
    <li><strong>Lowest ever</strong> — the lowest price anyone has tracked for this item.</li>
    <li><strong>Strong deal</strong> — a cut well past what the category usually peaks at.</li>
    <li><strong>Good deal</strong> — a solid saving on a current model.</li>
    <li><strong>Routine sale</strong> — an ordinary sale price, not a standout.</li>
    <li><strong>Barely a deal</strong> — a tiny cut. Only buy it if you wanted it anyway.</li>
  </ul>
  <h3>Sources checked</h3>
  <ul>${items}</ul>
  <p class="fineprint">Prices were checked Nov 24–27, 2026 and change by the hour on sale days.
  A deal that has sold out or moved since will still show its checked price — the check time
  next to each deal is the point. Verify at checkout.</p>
</section>`;
}
