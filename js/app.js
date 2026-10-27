(() => {
  const { places, food, plannerIdeas } = window.JAIPUR_GUIDE;
  const byName = (name) => [...places, ...food].find((item) => item.name === name);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;
  const safeSession = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* Session history remains available in memory. */ } }
  };

  const placesGrid = document.querySelector('#places-grid');
  const foodGrid = document.querySelector('#food-grid');
  const dialog = document.querySelector('#detail-dialog');
  const closeButton = dialog.querySelector('.dialog-close');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  let returnFocus = null;
  const card = (item, kind) => `<button class="${kind}-card" type="button" data-kind="${kind}" data-name="${escapeHtml(item.name)}" aria-label="Read about ${escapeHtml(item.name)}"><div class="${kind === 'place' ? 'card-image' : 'food-image'}"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async" data-fallback="true"></div><div class="${kind === 'place' ? 'card-copy' : 'food-copy'}"><div class="card-meta"><span>${escapeHtml(item.category)}</span><span class="card-arrow" aria-hidden="true">↗</span></div><h3>${escapeHtml(item.name)}</h3></div></button>`;
  placesGrid.innerHTML = places.map((item) => card(item, 'place')).join('');
  foodGrid.innerHTML = food.map((item) => card(item, 'food')).join('');

  document.addEventListener('error', (event) => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.dataset.fallback) {
      image.dataset.fallback = '';
      image.src = 'assets/image-unavailable.svg';
      image.alt = `${image.alt} (photograph unavailable)`;
    }
  }, true);

  function openDetails(item, kind, trigger) {
    returnFocus = trigger;
    document.querySelector('#dialog-image').src = item.image;
    document.querySelector('#dialog-image').alt = item.alt;
    document.querySelector('#dialog-kicker').textContent = `${kind === 'food' ? 'Local flavour' : item.category} · ${item.tag}`;
    document.querySelector('#dialog-title').textContent = item.name;
    document.querySelector('#dialog-description').textContent = item.description;
    document.querySelector('#dialog-tip').textContent = item.tip;
    dialog.showModal();
    closeButton.focus();
  }
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-kind][data-name]');
    if (!trigger) return;
    const collection = trigger.dataset.kind === 'food' ? food : places;
    const item = collection.find((entry) => entry.name === trigger.dataset.name);
    if (item) openDetails(item, trigger.dataset.kind, trigger);
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus(); });

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('is-open', !isOpen);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    }
  });

  const form = document.querySelector('#planner-form');
  const result = document.querySelector('#plan-result');
  const tierBands = { modest: [2000, 5000], balanced: [5000, 10000], comfort: [10000, 25000] };
  const bandLabels = { modest: 'Modest', balanced: 'Balanced', comfort: 'Comfort' };
  const labels = {
    solo: 'Solo', pair: 'Two travellers', small: '3–5 travellers', large: '6 or more',
    any: 'No preference', guesthouse: 'Guesthouse or simple stay', hotel: 'Hotel', heritage: 'Heritage property',
    heritageInterest: 'Historical Monuments & Heritage', foodInterest: 'Rajasthani Cuisine & Food Experiences',
    hotels: 'Heritage Hotels & Royal Stays', shopping: 'Shopping, Local Markets & Crafts',
    adventure: 'Adventure & Outdoor Activities', wellness: 'Wellness, Spa & Relaxation',
    culture: 'Cultural exploration', family: 'Family vacation', romantic: 'Romantic getaway',
    shoppingPurpose: 'Shopping trip', foodPurpose: 'Food tour', adventurePurpose: 'Adventure',
    relaxation: 'Relaxation', photography: 'Photography', budget: 'Budget travel',
    relaxed: 'Relaxed', balanced: 'Balanced', full: 'Full days',
    none: 'No specific request', lowerWalking: 'Prefer less walking or fewer stairs',
    stepFree: 'Prioritize step-free access information', wheelchair: 'Prioritize wheelchair access information'
  };
  const interestPools = {
    heritage: ['Amer Fort', 'Jaigarh Fort', 'Nahargarh Fort', 'City Palace', 'Jantar Mantar', 'Hawa Mahal', 'Jal Mahal'].map(byName),
    food: food,
    hotels: [plannerIdeas.royalStay],
    shopping: [byName('Johari Bazaar')],
    adventure: ['Jaigarh Fort', 'Nahargarh Fort', 'Jal Mahal'].map(byName),
    wellness: [plannerIdeas.restBlock]
  };
  const purposeOrder = {
    culture: ['heritage', 'shopping', 'food', 'adventure', 'hotels', 'wellness'],
    family: ['heritage', 'food', 'adventure', 'shopping', 'wellness', 'hotels'],
    romantic: ['hotels', 'heritage', 'wellness', 'food', 'adventure', 'shopping'],
    shopping: ['shopping', 'heritage', 'food', 'hotels', 'wellness', 'adventure'],
    food: ['food', 'shopping', 'heritage', 'hotels', 'wellness', 'adventure'],
    adventure: ['adventure', 'heritage', 'food', 'shopping', 'hotels', 'wellness'],
    relaxation: ['wellness', 'hotels', 'food', 'heritage', 'shopping', 'adventure'],
    photography: ['heritage', 'adventure', 'shopping', 'food', 'hotels', 'wellness'],
    budget: ['shopping', 'food', 'heritage', 'adventure', 'wellness', 'hotels']
  };
  const sampleCosts = {
    'Amer Fort': [500, 1100], 'Jaigarh Fort': [300, 800], 'Nahargarh Fort': [200, 500],
    'City Palace': [700, 1200], 'Jantar Mantar': [200, 400], 'Hawa Mahal': [300, 1000]
  };
  const times = ['9:00 AM', '1:00 PM', '5:00 PM'];
  const slots = ['Morning', 'Afternoon', 'Evening'];
  let lastItinerary = null;

  function makeItinerary() {
    const days = Number(form.elements.days.value);
    const interests = [...form.querySelectorAll('input[name="interest"]:checked')].map((input) => input.value);
    const purpose = form.elements.purpose.value;
    const paceKey = form.elements.pace.value;
    const accessKey = form.elements.access.value;
    const selectedInterests = interests.includes('hotels') || form.elements.stay.value === 'heritage'
      ? [...interests, ...(!interests.includes('hotels') ? ['hotels'] : [])]
      : interests;
    const preferredOrder = purposeOrder[purpose] || purposeOrder.culture;
    const rankedInterests = [...preferredOrder.filter((key) => selectedInterests.includes(key)), ...selectedInterests.filter((key) => !preferredOrder.includes(key))];
    const pools = Object.fromEntries(rankedInterests.map((key) => {
      let items = (interestPools[key] || []).filter(Boolean);
      if (accessKey === 'lower-walking' && key === 'heritage') items = items.filter((item) => !['Amer Fort', 'Jaigarh Fort', 'Nahargarh Fort'].includes(item.name));
      if (accessKey === 'lower-walking' && key === 'adventure') items = items.filter((item) => item.name === 'Jal Mahal');
      return [key, items];
    }));
    const primaryInterest = rankedInterests[0];
    const stopLimit = paceKey === 'relaxed' || accessKey !== 'none' ? 2 : 3;
    const used = new Set();
    const cursors = Object.fromEntries(rankedInterests.map((key) => [key, 0]));
    const makeStop = (item, slotIndex, interest) => ({
      name: item.name,
      category: item.category,
      description: item.description,
      kind: food.includes(item) ? 'food' : places.includes(item) ? 'place' : 'idea',
      interest,
      image: item.image || '',
      alt: item.alt || '',
      timing: times[slotIndex],
      slot: slots[slotIndex],
      cost: sampleCosts[item.name] || null
    });
    const schedule = Array.from({ length: days }, (_, index) => {
      const dayItems = [];
      while (dayItems.length < stopLimit) {
        const nextKey = rankedInterests.find((key) => cursors[key] < pools[key].length);
        if (!nextKey) break;
        const item = pools[nextKey][cursors[nextKey]++];
        if (used.has(item.name)) continue;
        used.add(item.name);
        dayItems.push({ item, interest: nextKey });
      }
      const extras = [];
      let remainingExtraSlots = paceKey === 'full' ? 3 : paceKey === 'relaxed' ? 1 : 2;
      rankedInterests.filter((key) => key !== primaryInterest).forEach((key) => {
        if (!remainingExtraSlots) return;
        const available = (pools[key] || []).filter((item) => !used.has(item.name));
        const item = available[0];
        if (!item) return;
        used.add(item.name); extras.push(makeStop(item, 0, key)); remainingExtraSlots -= 1;
      });
      return { day: index + 1, stops: dayItems.map(({ item, interest }, slotIndex) => makeStop(item, slotIndex, interest)), extras };
    });
    const additionalIdeas = rankedInterests.filter((key) => key !== primaryInterest).map((key) => {
      const item = (pools[key] || []).find((candidate) => !used.has(candidate.name));
      if (!item) return null;
      used.add(item.name);
      return makeStop(item, 0, key);
    }).filter(Boolean);
    const band = tierBands[form.elements.budget.value];
    return {
      createdAt: new Date().toISOString(),
      preferences: {
        days,
        budgetKey: form.elements.budget.value,
        budget: bandLabels[form.elements.budget.value],
        dailyRange: band,
        totalRange: [band[0] * days, band[1] * days],
        group: labels[form.elements.group.value],
        stay: labels[form.elements.stay.value],
        purpose: labels[`${purpose}Purpose`] || labels[purpose] || purpose,
        pace: labels[paceKey],
        accessibility: labels[{ none: 'none', 'lower-walking': 'lowerWalking', 'step-free': 'stepFree', wheelchair: 'wheelchair' }[accessKey]],
        interests: interests.map((key) => labels[`${key}Interest`] || labels[key] || key),
        accessKey
      },
      schedule,
      additionalIdeas
    };
  }

  function renderItinerary(itinerary) {
    const preference = itinerary.preferences;
    const stopVisual = (stop, className) => stop.image
      ? `<img class="${className}" src="${escapeHtml(stop.image)}" alt="${escapeHtml(stop.alt)}" loading="lazy" data-fallback="true">`
      : `<div class="${className} plan-stop-art" role="img" aria-label="${escapeHtml(stop.category)} illustration"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40V24m0 12c-11-4-15-11-14-21 8 0 13 4 14 12 1-8 6-12 14-12 1 10-3 17-14 21Zm-13-20 9 10m17-10-9 10"/></svg></div>`;
    const stopTitle = (stop) => stop.kind === 'place' || stop.kind === 'food'
      ? `<button type="button" class="plan-stop-link" data-kind="${stop.kind}" data-name="${escapeHtml(stop.name)}">${escapeHtml(stop.name)} <span aria-hidden="true">↗</span></button>`
      : `<strong class="plan-stop-title">${escapeHtml(stop.name)}</strong>`;
    const days = itinerary.schedule.map((day) => {
      const stops = day.stops.length ? day.stops.map((stop) => {
        const price = stop.cost
          ? `<span class="plan-cost">${money(stop.cost[0])}–${money(stop.cost[1])}<small>${stop.name === 'Hawa Mahal' ? 'Hawa Mahal + markets combined sample range' : 'sample activity estimate'}; unit not specified</small></span>`
          : '<span class="plan-cost plan-cost-unknown">No amount in supplied reference<small>confirm current fees, rates or menu</small></span>';
        return `<article class="plan-stop">${stopVisual(stop, 'plan-stop-image')}<div class="plan-stop-copy"><span class="plan-slot">${escapeHtml(stop.slot)} · suggested ${escapeHtml(stop.timing)}</span>${stopTitle(stop)}<p>${escapeHtml(stop.description)}</p>${price}</div></article>`;
      }).join('') : '<p class="plan-empty">Leave this day open for a slower pace, a return to a favourite stop, or locally recommended plans.</p>';
      const extras = day.extras.length ? `<div class="plan-additions"><p class="eyebrow">Optional interest pairings</p>${day.extras.map((stop) => `<article class="plan-addition">${stopVisual(stop, 'plan-addition-image')}<div><strong>${escapeHtml(stop.name)}</strong><p>${escapeHtml(stop.description)}</p><span>${stop.cost ? `${money(stop.cost[0])}–${money(stop.cost[1])} sample range; unit unspecified` : 'No amount in supplied reference; confirm locally'}</span></div></article>`).join('')}</div>` : '';
      return `<section class="plan-day-card"><div class="plan-day-heading"><p class="eyebrow">Day ${day.day}</p><h4>${day.stops.length ? 'A day in Jaipur' : 'A flexible day'}</h4></div><div class="plan-stops">${stops}</div>${extras}</section>`;
    }).join('');
    const additionalIdeas = itinerary.additionalIdeas.length ? `<section class="plan-additional-ideas"><p class="eyebrow">More selected-interest ideas</p><div class="plan-additional-grid">${itinerary.additionalIdeas.map((stop) => `<article class="plan-addition">${stopVisual(stop, 'plan-addition-image')}<div><span class="plan-idea-category">${escapeHtml(stop.category)}</span><strong>${escapeHtml(stop.name)}</strong><p>${escapeHtml(stop.description)}</p><span>${stop.cost ? `${money(stop.cost[0])}–${money(stop.cost[1])} sample range; unit unspecified` : 'No amount in supplied reference; confirm locally'}</span></div></article>`).join('')}</div></section>` : '';
    const accessNote = preference.accessKey === 'none' ? '' : 'Accessibility information is not verified. Contact each venue or provider directly to confirm entry routes, surfaces, stairs and facilities.';
    result.innerHTML = `<div class="plan-heading"><div><p class="eyebrow">A considered route</p><h3 id="plan-title">Your ${preference.days}-day Jaipur itinerary</h3><p class="plan-created">${escapeHtml(preference.purpose)} · ${escapeHtml(preference.pace.toLowerCase())} pace</p></div><div class="plan-actions"><button type="button" data-action="pdf">Download PDF</button><button type="button" data-action="share">Share</button></div></div><dl class="plan-summary"><div><dt>Duration</dt><dd>${preference.days} ${preference.days === 1 ? 'day' : 'days'}</dd></div><div><dt>Trip purpose</dt><dd>${escapeHtml(preference.purpose)}</dd></div><div><dt>Budget style</dt><dd>${escapeHtml(preference.budget)} · ${money(preference.dailyRange[0])}–${money(preference.dailyRange[1])}/day</dd></div><div><dt>Estimated trip budget</dt><dd>${money(preference.totalRange[0])}–${money(preference.totalRange[1])}</dd></div><div><dt>Group</dt><dd>${escapeHtml(preference.group)}</dd></div><div><dt>Stay preference</dt><dd>${escapeHtml(preference.stay)}</dd></div><div><dt>Pace</dt><dd>${escapeHtml(preference.pace)}</dd></div><div><dt>Access preference</dt><dd>${escapeHtml(preference.accessibility)}</dd></div><div class="plan-summary-wide"><dt>Interests</dt><dd>${escapeHtml(preference.interests.join(', '))}</dd></div></dl><p class="plan-disclaimer">Illustrative budget bands copied from the legacy planner; not live prices or quotes. The trip total is the daily band multiplied by days, independent of party size because the source does not specify group pricing. Stop-level amounts from the sample have no stated unit and are not added to the trip total. Slots and routes are suggestions, not verified opening hours, travel times or bookings. ${escapeHtml(accessNote)} Confirm current prices and details locally.</p><div class="plan-days">${days}</div>${additionalIdeas}<p class="form-note plan-feedback" id="plan-feedback" role="status"></p>`;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const interests = [...form.querySelectorAll('input[name="interest"]:checked')];
    const message = document.querySelector('#planner-message');
    if (!interests.length) {
      message.textContent = 'Choose at least one interest to make an itinerary.';
      result.hidden = true;
      return;
    }
    message.textContent = '';
    lastItinerary = makeItinerary();
    renderItinerary(lastItinerary);
  });

  function itineraryText(itinerary) {
    const p = itinerary.preferences;
    return [
      `Jaipur SafeTrip — ${p.days}-day itinerary`,
      `Purpose: ${p.purpose}; pace: ${p.pace}; access preference: ${p.accessibility}`,
      `Budget style: ${p.budget}; estimated trip band: ${money(p.totalRange[0])}–${money(p.totalRange[1])}`,
      `Group: ${p.group}; stay: ${p.stay}; interests: ${p.interests.join(', ')}`,
      ...itinerary.schedule.flatMap((day) => [`Day ${day.day}`, ...day.stops.map((stop) => `${stop.timing} ${stop.name}${stop.cost ? ` (${money(stop.cost[0])}–${money(stop.cost[1])})` : ''}`), ...day.extras.map((stop) => `Optional interest pairing: ${stop.name}`)]),
      ...itinerary.additionalIdeas.map((stop) => `More selected-interest ideas: ${stop.name}`)
    ].join('\n');
  }

  function downloadPdf(itinerary) {
    const JsPdf = window.jspdf?.jsPDF;
    if (!JsPdf) throw new Error('PDF library is unavailable. Reconnect and reload this page to download the PDF.');
    const doc = new JsPdf({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 18;
    const right = pageWidth - 18;
    const bottom = pageHeight - 18;
    let y = 20;
    let page = 1;
    const addFooter = () => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 108, 94);
      doc.text('Illustrative planning guide · confirm current details locally', left, pageHeight - 9);
      doc.text(`Page ${page}`, right, pageHeight - 9, { align: 'right' });
    };
    const newPage = () => { addFooter(); doc.addPage(); page += 1; y = 20; };
    const ensureSpace = (amount) => { if (y + amount > bottom) newPage(); };
    const textLines = (text, width = right - left, fontSize = 10, lineHeight = 4.6) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(String(text), width);
      ensureSpace(lines.length * lineHeight + 1);
      doc.text(lines, left, y);
      y += lines.length * lineHeight;
    };
    doc.setProperties({ title: 'Jaipur SafeTrip itinerary', subject: 'Personalized Jaipur trip outline', creator: 'Jaipur SafeTrip' });
    doc.setFillColor(247, 243, 235); doc.rect(0, 0, pageWidth, 3, 'F');
    doc.setTextColor(120, 56, 41); doc.setFont('helvetica', 'bold'); doc.setFontSize(21);
    doc.text('Jaipur SafeTrip', left, y); y += 9;
    doc.setTextColor(41, 40, 35); doc.setFontSize(15); doc.text(`${itinerary.preferences.days}-day Jaipur itinerary`, left, y); y += 9;
    doc.setDrawColor(217, 208, 194); doc.line(left, y, right, y); y += 7;
    const p = itinerary.preferences;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Trip overview', left, y); y += 6;
    doc.setFont('helvetica', 'normal');
    [
      `Duration: ${p.days} ${p.days === 1 ? 'day' : 'days'}`,
      `Trip purpose: ${p.purpose}`,
      `Budget style: ${p.budget} (INR ${p.dailyRange[0].toLocaleString('en-IN')}-${p.dailyRange[1].toLocaleString('en-IN')} per day)`,
      `Estimated trip budget: INR ${p.totalRange[0].toLocaleString('en-IN')}-${p.totalRange[1].toLocaleString('en-IN')}`,
      `Group: ${p.group}`, `Stay preference: ${p.stay}`, `Pace: ${p.pace}`, `Access preference: ${p.accessibility}`, `Interests: ${p.interests.join(', ')}`
    ].forEach((line) => { textLines(line, right - left, 9, 4.2); y += 0.5; });
    y += 2;
    textLines('Budget bands are illustrative estimates copied from the supplied legacy planner, not current prices. The trip total is the daily band multiplied by the number of days and does not adjust for party size. Activity ranges are from the sample, have no stated unit, and are not added to the trip total. Suggested slots are not verified opening hours or travel times. Accessibility details are unverified; contact venues directly.', right - left, 8, 4);
    itinerary.schedule.forEach((day) => {
      ensureSpace(16);
      y += 5;
      doc.setFillColor(238, 230, 217); doc.roundedRect(left, y - 4, right - left, 10, 1.5, 1.5, 'F');
      doc.setTextColor(120, 56, 41); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(`Day ${day.day}`, left + 4, y + 2.5); y += 12;
      if (!day.stops.length) { textLines('Flexible day — leave room to rest or revisit a favourite place.', right - left, 9, 4.5); return; }
      day.stops.forEach((stop) => {
        ensureSpace(25);
        doc.setTextColor(164, 76, 56); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(`${stop.slot} · suggested ${stop.timing}`, left, y); y += 4.5;
        doc.setTextColor(41, 40, 35); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(stop.name, left, y); y += 5;
        doc.setFont('helvetica', 'normal'); textLines(stop.description, right - left, 9, 4.1);
        const estimate = stop.cost ? `${stop.name === 'Hawa Mahal' ? 'Hawa Mahal plus markets combined sample range' : 'Sample activity estimate'}: INR ${stop.cost[0].toLocaleString('en-IN')}-${stop.cost[1].toLocaleString('en-IN')} (unit unspecified)` : 'No activity amount in supplied estimate; check current fees or menu.';
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(113, 110, 101); doc.text(estimate, left, y + 1); y += 6;
      });
      if (day.extras.length) {
        y += 2; doc.setTextColor(120, 56, 41); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('Optional interest pairings', left, y); y += 4.5;
        day.extras.forEach((stop) => { ensureSpace(8); doc.setTextColor(41, 40, 35); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text(stop.name, left, y); y += 4; doc.setFont('helvetica', 'normal'); textLines(stop.description, right - left, 8, 3.7); doc.setFontSize(8); doc.setTextColor(113, 110, 101); doc.text(stop.cost ? `Optional sample range: INR ${stop.cost[0].toLocaleString('en-IN')}-${stop.cost[1].toLocaleString('en-IN')} (unit unspecified)` : 'No amount in supplied estimate; check locally', left, y); y += 4.5; });
      }
    });
    if (itinerary.additionalIdeas.length) {
      newPage();
      doc.setTextColor(120, 56, 41); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('More selected-interest ideas', left, y); y += 7;
      itinerary.additionalIdeas.forEach((stop) => {
        ensureSpace(12); doc.setTextColor(41, 40, 35); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(stop.name, left, y); y += 4.5;
        doc.setFont('helvetica', 'normal'); textLines(stop.description, right - left, 8, 3.7); y += 2;
      });
    }
    addFooter();
    doc.save('jaipur-safetrip-itinerary.pdf');
  }

  result.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action || !lastItinerary) return;
    const feedback = result.querySelector('#plan-feedback');
    if (action === 'pdf') {
      try { downloadPdf(lastItinerary); feedback.textContent = 'Your itinerary PDF has been downloaded.'; }
      catch (error) { feedback.textContent = error.message || 'The PDF could not be created. Please reload and try again.'; }
    } else if (action === 'share') {
      const shareText = itineraryText(lastItinerary);
      try {
        if (navigator.share) await navigator.share({ title: 'My Jaipur itinerary', text: shareText });
        else if (navigator.clipboard) { await navigator.clipboard.writeText(shareText); feedback.textContent = 'Itinerary copied to the clipboard.'; }
        else feedback.textContent = 'Sharing is not available in this browser.';
      } catch (error) { if (error.name !== 'AbortError') feedback.textContent = 'The itinerary could not be shared from this browser.'; }
    }
  });

  const interestInputs = form.querySelectorAll('input[name="interest"]');
  interestInputs.forEach((input) => input.addEventListener('change', () => input.closest('.interest-option').classList.toggle('is-selected', input.checked)));
  interestInputs.forEach((input) => input.closest('.interest-option').classList.toggle('is-selected', input.checked));

  const chatForm = document.querySelector('#chat-form');
  const chatQuestion = document.querySelector('#chat-question');
  const chatMessage = document.querySelector('#chat-message');
  const chatHistory = document.querySelector('#chat-history');
  const endpoint = document.documentElement.dataset.chatEndpoint?.trim();
  const historyKey = 'jaipur-safetrip-chat-v1';
  let conversation = [];
  try { conversation = JSON.parse(safeSession.get(historyKey) || '[]'); } catch { conversation = []; }
  if (!Array.isArray(conversation)) conversation = [];
  conversation = conversation.filter((item) => ['user', 'assistant', 'notice'].includes(item.role) && typeof item.content === 'string').slice(-24);
  document.querySelector('#chat-connection').textContent = endpoint ? 'Secure chat endpoint configured' : 'Secure AI service not configured';
  document.querySelector('.status-dot').classList.toggle('is-connected', Boolean(endpoint));

  function saveConversation() { safeSession.set(historyKey, JSON.stringify(conversation.slice(-24))); }
  function addMessage(role, content, options = {}) {
    conversation.push({ role, content });
    saveConversation();
    const node = document.createElement('article');
    node.className = `chat-message chat-message-${role}${options.loading ? ' is-loading' : ''}`;
    node.dataset.role = role;
    const label = document.createElement('strong');
    label.className = 'chat-speaker'; label.textContent = role === 'user' ? 'You' : role === 'assistant' ? 'Jaipur assistant' : 'Connection note';
    const body = document.createElement('p'); body.className = 'chat-message-body'; body.textContent = content;
    node.append(label, body);
    if (options.loading) {
      const spinner = document.createElement('span'); spinner.className = 'chat-spinner'; spinner.setAttribute('aria-label', 'Waiting for reply'); node.append(spinner);
    }
    chatHistory.append(node); chatHistory.scrollTop = chatHistory.scrollHeight;
    return node;
  }
  conversation.forEach((item) => {
    const node = document.createElement('article'); node.className = `chat-message chat-message-${item.role}`;
    const label = document.createElement('strong'); label.className = 'chat-speaker'; label.textContent = item.role === 'user' ? 'You' : item.role === 'assistant' ? 'Jaipur assistant' : 'Connection note';
    const body = document.createElement('p'); body.className = 'chat-message-body'; body.textContent = item.content;
    node.append(label, body); chatHistory.append(node);
  });
  if (!conversation.length) {
    const welcome = document.createElement('p'); welcome.className = 'chat-empty';
    welcome.textContent = endpoint ? 'Ask a question about Jaipur to begin.' : 'Choose a prompt or enter a question. Without a secure endpoint, it will be saved here but will not be sent or answered.';
    chatHistory.append(welcome);
  }
  chatHistory.scrollTop = chatHistory.scrollHeight;

  async function sendQuestion(question) {
    const normalized = question.trim();
    if (!normalized) { chatMessage.textContent = 'Enter a question, or choose one of the suggested prompts.'; return; }
    if (normalized.length > 800) { chatMessage.textContent = 'Keep your question under 800 characters.'; return; }
    chatHistory.querySelector('.chat-empty')?.remove();
    addMessage('user', normalized);
    chatQuestion.value = '';
    if (!endpoint) {
      addMessage('notice', 'This question was saved in this browser session but was not sent. Connect a secure AI endpoint to receive a real reply.');
      chatMessage.textContent = 'Not sent: no secure AI endpoint is configured.';
      return;
    }
    const submit = chatForm.querySelector('[type="submit"]');
    submit.disabled = true;
    chatQuestion.disabled = true;
    chatMessage.textContent = 'Waiting for the configured Jaipur assistant…';
    const loading = document.createElement('article'); loading.className = 'chat-message chat-message-assistant is-loading';
    const loadingLabel = document.createElement('strong'); loadingLabel.className = 'chat-speaker'; loadingLabel.textContent = 'Jaipur assistant';
    const loadingBody = document.createElement('p'); loadingBody.className = 'chat-message-body'; loadingBody.textContent = 'Preparing a reply';
    const spinner = document.createElement('span'); spinner.className = 'chat-spinner'; spinner.setAttribute('aria-label', 'Waiting for reply');
    loading.append(loadingLabel, loadingBody, spinner); chatHistory.append(loading); chatHistory.scrollTop = chatHistory.scrollHeight;
    try {
      const history = conversation.filter((item) => item.role === 'user' || item.role === 'assistant').slice(-12);
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: normalized, history }) });
      if (!response.ok) throw new Error(`The chat service returned ${response.status}.`);
      const payload = await response.json();
      if (typeof payload.reply !== 'string' || !payload.reply.trim()) throw new Error('The chat service returned no reply. Check its response format.');
      loading.remove(); addMessage('assistant', payload.reply.trim());
      chatMessage.textContent = 'Reply received from the configured service.';
    } catch (error) {
      loading.remove(); addMessage('notice', `No reply was received. ${error.message || 'Check your connection and try again.'}`);
      chatMessage.textContent = 'The chat request failed. You can try again.';
    } finally {
      submit.disabled = false; chatQuestion.disabled = false; chatQuestion.focus();
    }
  }
  chatForm.addEventListener('submit', (event) => { event.preventDefault(); sendQuestion(chatQuestion.value); });
  chatQuestion.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); chatForm.requestSubmit(); }
  });
  document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => {
    chatQuestion.value = button.dataset.prompt;
    sendQuestion(chatQuestion.value);
  }));
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
