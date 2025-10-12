// Shared resume logic: selection, data storage, rendering, and PDF
(function () {
  const STORAGE_KEYS = {
    template: 'selectedTemplate',
    data: 'resumeData',
    style: 'resumeStyle',
  };

  function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function iconSvg(kind) {
    // Inline SVGs with white stroke for reliable PDF rendering
    if (kind === 'info') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" opacity="0"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="12" y1="7" x2="12" y2="7"/></svg>`;
    }
    if (kind === 'edu') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7l-10-4L2 7l10 4 10-4z"/><path d="M6 10v4c0 1.1 2.7 2 6 2s6-.9 6-2v-4"/></svg>`;
    }
    if (kind === 'work') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 12h18"/></svg>`;
    }
    if (kind === 'phone') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.31 1.77.57 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.09a2 2 0 0 1 2.11-.45c.83.26 1.7.45 2.6.57A2 2 0 0 1 22 16.92z"/></svg>`;
    }
    if (kind === 'mail') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z" fill="none"/><polyline points="22,6 12,13 2,6"/></svg>`;
    }
    if (kind === 'location') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
    }
    if (kind === 'linkedin') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`;
    }
    if (kind === 'idcard') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><circle cx="8" cy="15" r="1"/></svg>`;
    }
    if (kind === 'license') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5z"/><circle cx="9" cy="17" r="2"/><circle cx="15" cy="17" r="2"/><path d="M5 11V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/></svg>`;
    }
    return '';
  }

  function setTemplate(tpl) {
    if (tpl) localStorage.setItem(STORAGE_KEYS.template, tpl);
  }

  function getTemplate() {
    return getParam('template') || localStorage.getItem(STORAGE_KEYS.template) || 'classic';
  }

  function getStyleOptions() {
    try {
      const obj = JSON.parse(localStorage.getItem(STORAGE_KEYS.style) || '{}');
      return {
        accent: obj.accent || '#5e1037',
        font: obj.font || 'Inter',
      };
    } catch {
      return { accent: '#5e1037', font: 'Inter' };
    }
  }

  function setStyleOptions(partial) {
    const current = getStyleOptions();
    const next = { ...current, ...(partial || {}) };
    localStorage.setItem(STORAGE_KEYS.style, JSON.stringify(next));
    return next;
  }

  function collectValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function saveFormData() {
    const data = {
      firstname: collectValue('firstname'),
      lastname: collectValue('lastname'),
      title: collectValue('title'),
      email: collectValue('email'),
      phone: collectValue('phone'),
      city: collectValue('city'),
      linkedin: collectValue('linkedin'),
      pnpe: collectValue('pnpe'),
      drivingLicense: collectValue('driving-license'),
      summary: collectValue('summary'),
      experience: {
        jobTitle: collectValue('job-title'),
        company: collectValue('company'),
        start: collectValue('start-date-exp'),
        end: collectValue('end-date-exp'),
        missions: collectValue('missions'),
      },
      education: {
        school: collectValue('school'),
        degree: collectValue('degree'),
        start: collectValue('start-date-edu'),
        end: collectValue('end-date-edu'),
        details: collectValue('education-details'),
      },
      skills: {
        tech: collectValue('tech-skills'),
        methods: collectValue('methods-skills'),
        tools: collectValue('tools-skills'),
        soft: collectValue('soft-skills'),
      },
      languages: [
        { name: collectValue('language-1'), level: collectValue('level-1') },
      ],
      certifications: [
        { name: collectValue('cert-name') },
      ],
      interests: collectValue('interests'),
    };
    localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(data));
    return data;
  }

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.data) || '{}');
    } catch {
      return {};
    }
  }

  function esc(str) {
    return (str || '').replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function section(title, content) {
    return `
      <div class="mb-3" style="break-inside: avoid; page-break-inside: avoid;">
        <h3 class="text-base font-bold text-gray-900 border-b border-gray-200 pb-1">${esc(title)}</h3>
        <div class="mt-2 text-sm text-gray-800">${content}</div>
      </div>
    `;
  }

  function listHtml(raw) {
    const items = (raw || '')
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
    if (!items.length) return '';
    return `<ul class="list-disc list-inside">${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`;
  }

  function renderClassic(data) {
    const style = getStyleOptions();
    const accent = style.accent || '#5e1037';
    const fullName = `${esc(data.firstname)} <span style="color:${accent}; font-weight:800;">${esc(data.lastname || '')}</span>`;

    // Build left sidebar data
    const contactRow = (kind, text) => `
      <div class="flex items-center gap-2"><span class="inline-flex items-center justify-center" style="color:${accent}">${iconSvg(kind)}</span><span>${esc(text)}</span></div>`;
    const contactHtml = `
      <div class="space-y-2 text-sm">
        ${data.phone ? contactRow('phone', data.phone) : ''}
        ${data.email ? contactRow('mail', data.email) : ''}
        ${data.city ? contactRow('location', data.city) : ''}
        ${data.linkedin ? contactRow('linkedin', data.linkedin) : ''}
        ${data.pnpe ? contactRow('idcard', `PNPE: ${data.pnpe}`) : ''}
        ${data.drivingLicense ? contactRow('license', `Permis ${data.drivingLicense}`) : ''}
      </div>`;

    const skillsAll = [data.skills?.tech, data.skills?.methods, data.skills?.tools, data.skills?.soft]
      .filter(Boolean)
      .join('\n');
    const skillsHtml = skillsAll ? listHtml(skillsAll) : '';

    const langsStr = [
      [data.languages?.[0]?.name, data.languages?.[0]?.level].filter(Boolean).join(' - '),
    ].filter(Boolean).join('\n');
    const langsHtml = langsStr ? listHtml(langsStr) : '';

    // Right column content
    const summaryHtml = data.summary ? `
      <div class="mb-5">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background:${accent};">${iconSvg('info')}</div>
          <h3 class="text-sm font-bold tracking-[0.15em] uppercase" style="color:${accent}">Profil</h3>
        </div>
        <div class="mt-3 text-sm leading-6 text-gray-800">${esc(data.summary).replace(/\n/g,'<br/>')}</div>
      </div>` : '';

    const eduHtml = (data.education && (data.education.school || data.education.degree)) ? `
      <div class="mb-6">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background:${accent};">${iconSvg('edu')}</div>
          <h3 class="text-sm font-bold tracking-[0.15em] uppercase" style="color:${accent}">Formation</h3>
        </div>
        <div class="mt-3">
          <div class="flex items-start justify-between gap-4 border-b border-gray-200 pb-3">
            <div>
              <div class="font-semibold text-gray-900">${esc(data.education.degree)}</div>
              <div class="text-sm text-gray-700">${esc(data.education.details || '')}</div>
              <div class="text-sm text-gray-700">${esc(data.education.school)}</div>
            </div>
            <div class="text-sm text-gray-600 whitespace-nowrap">${esc(data.education.end || data.education.start || '')}</div>
          </div>
        </div>
      </div>` : '';

    const expHtml = (data.experience && (data.experience.jobTitle || data.experience.company)) ? `
      <div class="mb-2">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background:${accent};">${iconSvg('work')}</div>
          <h3 class="text-sm font-bold tracking-[0.15em] uppercase" style="color:${accent}">Expériences</h3>
        </div>
        <div class="mt-3 space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="font-semibold text-gray-900">${esc(data.experience.jobTitle)}</div>
              <div class="text-sm italic text-gray-700">${esc(data.experience.company)}</div>
              <div class="mt-2 text-sm text-gray-800">${listHtml(data.experience.missions)}</div>
            </div>
            <div class="text-sm text-gray-600 whitespace-nowrap">${esc(data.experience.start)} - ${esc(data.experience.end)}</div>
          </div>
        </div>
      </div>` : '';

    return `
      <div class="bg-white text-gray-900" style="width: 210mm; box-sizing: border-box; padding: 0; font-family: '${esc(style.font)}', sans-serif;">
        <!-- Top accent bar -->
        <div style="height: 10mm; background:${accent};"></div>
        <div style="padding: 8mm;">
          <!-- Name and title -->
          <div class="text-center py-6">
            <h1 class="text-3xl tracking-wide">${fullName}</h1>
            ${data.title ? `<div class="mt-1 text-sm tracking-[0.3em] uppercase text-gray-600">${esc(data.title)}</div>` : ''}
          </div>

          <!-- Two columns -->
          <div class="grid grid-cols-3 gap-8">
            <!-- Left sidebar -->
            <div>
              <div class="space-y-8 pr-4" style="border-right:1px solid #e5e7eb;">
                <div>
                  <h3 class="text-sm font-bold tracking-[0.2em] uppercase text-gray-900" style="color:${accent}">Contact</h3>
                  <div class="mt-3">${contactHtml}</div>
                </div>
                <div>
                  <h3 class="text-sm font-bold tracking-[0.2em] uppercase text-gray-900" style="color:${accent}">Compétences</h3>
                  <div class="mt-3 text-sm">${skillsHtml || ''}</div>
                </div>
                <div>
                  <h3 class="text-sm font-bold tracking-[0.2em] uppercase text-gray-900" style="color:${accent}">Langues</h3>
                  <div class="mt-3 text-sm">${langsHtml || ''}</div>
                </div>
                ${data.interests ? `
                <div>
                  <h3 class="text-sm font-bold tracking-[0.2em] uppercase text-gray-900" style="color:${accent}">Centres d'intérêt</h3>
                  <div class="mt-3 text-sm">${listHtml(data.interests)}</div>
                </div>` : ''}
              </div>
            </div>

            <!-- Right content -->
            <div class="col-span-2">
              ${summaryHtml}
              ${eduHtml}
              ${expHtml}
            </div>
          </div>
          <div style="height: 12mm;"></div>
        </div>
      </div>
    `;
  }

  function renderModern(data) {
    return `
      <div class="bg-white" style="width: 210mm; box-sizing: border-box; padding: 8mm;">
        <div class="grid grid-cols-3 gap-6">
          <div class="col-span-1 bg-gray-50 p-4 rounded">
            <h2 class="text-xl font-bold">${esc(data.firstname)} ${esc(data.lastname)}</h2>
            <p class="text-sm text-gray-600">${esc(data.title)}</p>
            <div class="mt-3 text-xs text-gray-600">
              <div>${esc(data.email)}</div>
              <div>${esc(data.phone)}</div>
              <div>${esc(data.city)}</div>
              <div>${esc(data.linkedin)}</div>
              ${data.pnpe ? `<div>PNPE: ${esc(data.pnpe)}</div>` : ''}
            </div>
            <div class="mt-4 space-y-3">
              <h3 class="text-sm font-semibold">Compétences</h3>
              ${data.skills?.tech ? `<div><div class="text-xs font-medium text-gray-600">Techniques</div>${listHtml(data.skills.tech)}</div>` : ''}
              ${data.skills?.methods ? `<div><div class="text-xs font-medium text-gray-600">Méthodes</div>${listHtml(data.skills.methods)}</div>` : ''}
              ${data.skills?.tools ? `<div><div class="text-xs font-medium text-gray-600">Outils</div>${listHtml(data.skills.tools)}</div>` : ''}
              ${data.skills?.soft ? `<div><div class="text-xs font-medium text-gray-600">Soft Skills</div>${listHtml(data.skills.soft)}</div>` : ''}
            </div>
            ${data.interests ? `
            <div class="mt-4">
              <h3 class="text-sm font-semibold">Centres d'intérêt</h3>
              <div class="text-xs">${listHtml(data.interests)}</div>
            </div>` : ''}
          </div>
          <div class="col-span-2">
            ${data.summary ? section('Profil', esc(data.summary).replace(/\n/g,'<br/>')) : ''}
            ${(data.experience && (data.experience.jobTitle || data.experience.company)) ? section('Expérience', `
              <div class="font-medium">${esc(data.experience.jobTitle)} - ${esc(data.experience.company)}</div>
              <div class="text-xs text-gray-600">${esc(data.experience.start)} - ${esc(data.experience.end)}</div>
              <div class="mt-1 text-sm">${esc(data.experience.missions).replace(/\n/g,'<br/>')}</div>
            `) : ''}
            ${(data.education && (data.education.school || data.education.degree)) ? section('Formation', `
              <div class="font-medium">${esc(data.education.degree)} - ${esc(data.education.school)}</div>
              <div class="text-xs text-gray-600">${esc(data.education.start)} - ${esc(data.education.end)}</div>
              <div class="mt-1 text-sm">${esc(data.education.details).replace(/\n/g,'<br/>')}</div>
            `) : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderTemplate(container) {
    const data = loadData();
    const tpl = getTemplate();
    const html = tpl === 'modern' ? renderModern(data) : renderClassic(data);
    container.innerHTML = html;
  }

  function generatePDF(container) {
    const pageEl = container.firstElementChild || container;
    const original = {
      width: pageEl.style.width,
      transform: pageEl.style.transform,
      transformOrigin: pageEl.style.transformOrigin,
      boxShadow: pageEl.style.boxShadow,
      borderRadius: pageEl.style.borderRadius,
    };
    // Force A4 width
    pageEl.style.width = '210mm';
    // Neutralize visual effects that may affect bounds
    pageEl.style.boxShadow = 'none';
    pageEl.style.borderRadius = '0';

    // Measure content in px and compute scale to fit both width and height
    const mmToPx = (mm) => (mm / 25.4) * 96;
    const targetWpx = mmToPx(210);
    const targetHpx = mmToPx(297);
    const rect = pageEl.getBoundingClientRect();
    const contentW = pageEl.scrollWidth || rect.width;
    const contentH = pageEl.scrollHeight || rect.height;
    const scale = Math.min(1, targetWpx / contentW, targetHpx / contentH);
    pageEl.style.transformOrigin = 'top left';
    pageEl.style.transform = `scale(${scale})`;

    const opt = {
      margin: 0,
      filename: 'cv.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] },
    };

    return window
      .html2pdf()
      .set(opt)
      .from(pageEl)
      .save()
      .finally(() => {
        pageEl.style.width = original.width;
        pageEl.style.transform = original.transform;
        pageEl.style.transformOrigin = original.transformOrigin;
        pageEl.style.boxShadow = original.boxShadow;
        pageEl.style.borderRadius = original.borderRadius;
      });
  }

  function handleGenerate() {
    saveFormData();
    const tpl = getTemplate();
    window.location.href = `preview_resume.html?template=${encodeURIComponent(tpl)}`;
  }

  function loadFormData() {
    const data = loadData();
    if (!data || Object.keys(data).length === 0) return;

    // Informations personnelles
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    };

    setVal('firstname', data.firstname);
    setVal('lastname', data.lastname);
    setVal('title', data.title);
    setVal('email', data.email);
    setVal('phone', data.phone);
    setVal('city', data.city);
    setVal('linkedin', data.linkedin);
    setVal('pnpe', data.pnpe);
    setVal('driving-license', data.drivingLicense);
    setVal('summary', data.summary);

    // Expérience
    if (data.experience) {
      setVal('job-title', data.experience.jobTitle);
      setVal('company', data.experience.company);
      setVal('start-date-exp', data.experience.start);
      setVal('end-date-exp', data.experience.end);
      setVal('missions', data.experience.missions);
    }

    // Formation
    if (data.education) {
      setVal('school', data.education.school);
      setVal('degree', data.education.degree);
      setVal('start-date-edu', data.education.start);
      setVal('end-date-edu', data.education.end);
      setVal('education-details', data.education.details);
    }

    // Compétences
    if (data.skills) {
      setVal('tech-skills', data.skills.tech);
      setVal('methods-skills', data.skills.methods);
      setVal('tools-skills', data.skills.tools);
      setVal('soft-skills', data.skills.soft);
    }

    // Langues
    if (data.languages && data.languages[0]) {
      setVal('language-1', data.languages[0].name);
      setVal('level-1', data.languages[0].level);
    }

    // Certifications
    if (data.certifications && data.certifications[0]) {
      setVal('cert-name', data.certifications[0].name);
    }

    // Centres d'intérêt
    setVal('interests', data.interests);
  }

  // Expose minimal API
  window.ResumeApp = {
    setTemplate,
    getTemplate,
    saveFormData,
    loadFormData,
    getStyleOptions,
    setStyleOptions,
    renderTemplate,
    generatePDF,
    handleGenerate,
  };

  // On pages with ?template param, persist it
  const t = getParam('template');
  if (t) setTemplate(t);
})();
