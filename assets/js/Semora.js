// ========== UTILS & DB (unchanged) ==========
function extractStringValue(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
        if (field['@value']) return String(field['@value']);
        if (field['@language'] && field['@value']) return String(field['@value']);
        if (Array.isArray(field) && field.length) return extractStringValue(field[0]);
    }
    return String(field);
}

const DB_NAME = 'SchemaOrgDB', STORE_NAME = 'schemaStore', KEY_NAME = 'mainSchema';
function openDB() { /* ... same as before ... */ }
async function saveSchemaToDB(data) { /* ... same ... */ }
async function loadSchemaFromDB() { /* ... same ... */ }

// ========== PROCESS FULL VOCABULARY ==========
let classesMap = new Map(), propertiesMap = new Map(), classList=[];
function processSchemaData(data) {
    // Exactly the same processing as earlier, but we also build a `classHierarchy` for recommendations.
    // (I'll keep the same code as before, just ensuring it runs after fetch.)
    // ... (same code as in previous version that filled classesMap, propertiesMap, classList) ...
    // For brevity, I'll assume that function is already present in your project and works.
}

// ========== GLOBALS ==========
const statusTextSpan = document.getElementById('statusText');
const loadingDiv = document.getElementById('loadingStatus');
const statsSpan = document.getElementById('statsInfo');
const manualRetryBtn = document.getElementById('manualRetryBtn');
const wizardCard = document.getElementById('wizardCard');
const outputCard = document.getElementById('outputCard');
const stepIndicator = document.getElementById('stepIndicator');
const stepContent = document.getElementById('stepContent');
const prevBtn = document.getElementById('prevBtn'), nextBtn = document.getElementById('nextBtn'), finishBtn = document.getElementById('finishBtn');
const jsonOutputPre = document.getElementById('jsonOutput');
const copyBtn = document.getElementById('copyBtn'), restartBtn = document.getElementById('restartBtn');

let currentStep = 0;
let steps = [];
let formState = {
    selectedClasses: [],     // array of class IDs (like 'schema:Article')
    entities: {}             // final graph entities keyed by a unique ID
};

// ========== PAGE FOCUS RECOMMENDATIONS ==========
const PAGE_FOCUS = [
    {
        id: 'Article',
        label: 'Article / Blog Post',
        recommend: ['schema:Article', 'schema:WebPage', 'schema:BreadcrumbList', 'schema:Organization'],
        extras: ['FAQ', 'MultiLanguage']
    },
    {
        id: 'FAQ',
        label: 'FAQ Page',
        recommend: ['schema:FAQPage', 'schema:Question', 'schema:Answer', 'schema:BreadcrumbList', 'schema:Organization'],
        extras: ['MultiLanguage']
    },
    {
        id: 'Product',
        label: 'Product',
        recommend: ['schema:Product', 'schema:Offer', 'schema:WebPage', 'schema:BreadcrumbList', 'schema:Organization', 'schema:AggregateRating'],
        extras: ['MultiLanguage']
    },
    {
        id: 'LocalBusiness',
        label: 'Local Business',
        recommend: ['schema:LocalBusiness', 'schema:PostalAddress', 'schema:WebPage', 'schema:BreadcrumbList', 'schema:Organization'],
        extras: ['MultiLanguage']
    },
    {
        id: 'Event',
        label: 'Event',
        recommend: ['schema:Event', 'schema:Place', 'schema:Organization', 'schema:BreadcrumbList'],
        extras: ['MultiLanguage']
    },
    {
        id: 'Recipe',
        label: 'Recipe',
        recommend: ['schema:Recipe', 'schema:HowToSection', 'schema:WebPage', 'schema:BreadcrumbList'],
        extras: ['MultiLanguage']
    }
];

// ========== STEP DEFINITIONS ==========
function buildSteps() {
    steps = [];

    // Step 1: Choose page focus (optional) + browse all classes
    steps.push({
        title: 'Select Schema Types',
        render: () => {
            let html = `<h3>Pick the schemas you need</h3>
            <div class="form-group">
                <label>Quick focus (optional)</label>
                <select id="focusSelect">
                    <option value="">-- Choose a page type for recommendations --</option>
                    ${PAGE_FOCUS.map(f => `<option value="${f.id}">${f.label}</option>`).join('')}
                </select>
            </div>
            <div id="recommendSection" class="hidden">
                <p style="color:#F6C700; font-size:0.9rem;">Recommended for this focus:</p>
                <div id="recommendList" class="class-grid"></div>
            </div>
            <hr style="border-color:#2a2a2a; margin:16px 0;">
            <p style="font-size:0.9rem;">Or browse all classes (search):</p>
            <div class="search-select">
                <input type="text" id="classSearchInput" placeholder="Search classes…" autocomplete="off">
                <div id="classDropdown" class="class-list-dropdown hidden"></div>
            </div>
            <div id="selectedClassesList" style="margin-top:16px; font-size:0.85rem;">
                <strong>Selected:</strong> <span id="selectedCount">0</span> types.
                <div id="selectedPills" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;"></div>
            </div>`;
            return html;
        },
        init: () => {
            const focusSelect = document.getElementById('focusSelect');
            const recommendSection = document.getElementById('recommendSection');
            const recommendList = document.getElementById('recommendList');
            const classSearch = document.getElementById('classSearchInput');
            const classDropdown = document.getElementById('classDropdown');
            const selectedPills = document.getElementById('selectedPills');
            const selectedCount = document.getElementById('selectedCount');

            // Update UI based on focus
            focusSelect.addEventListener('change', () => {
                const focus = PAGE_FOCUS.find(f => f.id === focusSelect.value);
                if (focus) {
                    recommendSection.classList.remove('hidden');
                    renderRecommendCards(focus.recommend);
                } else {
                    recommendSection.classList.add('hidden');
                }
            });

            // Search all classes
            classSearch.addEventListener('input', () => {
                const term = classSearch.value.trim().toLowerCase();
                if (!term) { classDropdown.classList.add('hidden'); return; }
                const filtered = classList.filter(c => String(c.label).toLowerCase().includes(term) || c.id.toLowerCase().includes(term));
                if (filtered.length) renderDropdown(filtered);
                else classDropdown.classList.add('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!classDropdown.contains(e.target) && e.target !== classSearch) classDropdown.classList.add('hidden');
            });

            // Render recommendation cards
            function renderRecommendCards(ids) {
                recommendList.innerHTML = '';
                ids.forEach(id => {
                    const cls = classesMap.get(id);
                    if (!cls) return;
                    const div = document.createElement('div');
                    div.className = `class-card ${formState.selectedClasses.includes(id) ? 'selected' : ''}`;
                    div.innerHTML = `<label><input type="checkbox" value="${id}" ${formState.selectedClasses.includes(id) ? 'checked' : ''}> ${cls.label}</label>`;
                    const checkbox = div.querySelector('input');
                    checkbox.addEventListener('change', () => toggleClass(id, checkbox.checked));
                    recommendList.appendChild(div);
                });
                updateSelectedUI();
            }

            function renderDropdown(items) {
                classDropdown.innerHTML = '';
                items.slice(0, 100).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'class-item';
                    div.textContent = `${item.label} (${item.id})`;
                    div.onclick = () => {
                        if (!formState.selectedClasses.includes(item.id)) {
                            toggleClass(item.id, true);
                        }
                        classDropdown.classList.add('hidden');
                        classSearch.value = '';
                    };
                    classDropdown.appendChild(div);
                });
                if (items.length > 100) {
                    const more = document.createElement('div');
                    more.className = 'class-item';
                    more.textContent = `... and ${items.length-100} more`;
                    classDropdown.appendChild(more);
                }
                classDropdown.classList.remove('hidden');
            }

            function toggleClass(id, add) {
                if (add) {
                    if (!formState.selectedClasses.includes(id)) formState.selectedClasses.push(id);
                } else {
                    formState.selectedClasses = formState.selectedClasses.filter(c => c !== id);
                }
                updateSelectedUI();
                // Also update recommendation checkboxes if present
                document.querySelectorAll(`.class-card input[value="${id}"]`).forEach(cb => cb.checked = add);
            }

            function updateSelectedUI() {
                selectedCount.textContent = formState.selectedClasses.length;
                selectedPills.innerHTML = formState.selectedClasses.map(id => {
                    const cls = classesMap.get(id);
                    return `<span style="background:#F6C700; color:#000; padding:4px 10px; border-radius:20px; font-size:0.8rem; display:flex; align-items:center; gap:5px;">
                        ${cls ? cls.label : id}
                        <span style="cursor:pointer; font-weight:bold;" onclick="event.stopPropagation(); toggleClass('${id}', false)">&times;</span>
                    </span>`;
                }).join('');
            }

            // Store toggleClass in step scope for pill click
            window._toggleClass = toggleClass;
            // Attach initial update
            updateSelectedUI();
        },
        save: () => {
            // selectedClasses already updated via toggleClass
        }
    });

    // Step 2..N: For each selected class, collect properties
    formState.selectedClasses.forEach((classId, idx) => {
        const cls = classesMap.get(classId);
        if (!cls) return;
        steps.push({
            title: `Define ${cls.label} Properties`,
            classId: classId,
            render: () => {
                const entity = formState.entities[classId] || {};
                return `<h3>${cls.label} (${classId.replace('schema:','')})</h3>
                <div class="properties-grid" id="props-${idx}"></div>`;
            },
            init: () => {
                const container = document.getElementById(`props-${idx}`);
                buildPropertyForm(container, classId, formState.entities[classId] || {});
            },
            save: () => {
                const container = document.getElementById(`props-${idx}`);
                const data = {};
                container.querySelectorAll('.prop-input').forEach(inp => {
                    if (inp.dataset.propid) data[inp.dataset.propid] = inp.value;
                });
                formState.entities[classId] = data;
            }
        });
    });

    // Final step: Global settings (language, breadcrumb link)
    steps.push({
        title: 'Global Settings',
        render: () => {
            return `<h3>Page‑wide Settings</h3>
            <div class="form-group">
                <label>Language (e.g., en-US)</label>
                <input type="text" id="globalLang" value="${escapeHtml(formState.globalLang || '')}" placeholder="en-US">
            </div>
            <div class="form-group">
                <label>Breadcrumb List (one per line: Name | URL)</label>
                <textarea id="globalBreadcrumbs" rows="4">${escapeHtml(formState.globalBreadcrumbs || '')}</textarea>
            </div>`;
        },
        save: () => {
            formState.globalLang = document.getElementById('globalLang').value;
            formState.globalBreadcrumbs = document.getElementById('globalBreadcrumbs').value;
        }
    });

    // After building steps, render first
    currentStep = 0;
    renderStep();
}

// ========== DYNAMIC PROPERTY FORM BUILDER ==========
function buildPropertyForm(container, classId, existingData) {
    const cls = classesMap.get(classId);
    if (!cls || !cls.allProps) return;
    container.innerHTML = '';
    for (const propId of [...cls.allProps].sort()) {
        const prop = propertiesMap.get(propId);
        if (!prop) continue;
        const div = document.createElement('div'); div.className = 'prop-card';
        const labelSpan = document.createElement('div'); labelSpan.className = 'prop-label';
        labelSpan.innerHTML = `<span>${prop.label}</span> <span class="badge">${propId.replace('schema:', '')}</span>`;
        let input;
        const rangeTypes = (prop.rangeIncludesIds || []).map(r => r.replace('schema:', '')).join(', ');
        const hasSimple = rangeTypes.split(',').some(t => ['Text','Number','Integer','Float','Date','DateTime','Time','Boolean','URL','Duration'].includes(t.trim()));
        if (rangeTypes) {
            const hint = document.createElement('div'); hint.className = 'prop-hint'; hint.innerText = `Type: ${rangeTypes.substring(0,80)}`;
            if (rangeTypes.includes('Boolean')) {
                const select = document.createElement('select');
                select.innerHTML = `<option value="">-- Choose --</option><option value="true">true</option><option value="false">false</option>`;
                input = select;
            } else if (hasSimple) {
                input = document.createElement('input'); input.type = 'text'; input.placeholder = `Value (${rangeTypes.split(',')[0]})`;
            } else {
                input = document.createElement('textarea'); input.rows = 2; input.placeholder = 'Value (object/array) — enter valid JSON';
            }
            div.appendChild(hint);
        } else {
            input = document.createElement('input'); input.type = 'text'; input.placeholder = 'Any value';
        }
        input.className = 'prop-input';
        input.dataset.propid = propId;
        if (existingData[propId]) input.value = existingData[propId];
        div.appendChild(labelSpan);
        div.appendChild(input);
        container.appendChild(div);
    }
}

// ========== NAVIGATION & RENDERING ==========
function renderStep() {
    stepIndicator.innerHTML = steps.map((s,i) => {
        let cls = 'step-dot';
        if (i === currentStep) cls += ' active';
        else if (i < currentStep) cls += ' completed';
        return `<div class="${cls}">${i+1}</div>`;
    }).join('');

    const step = steps[currentStep];
    stepContent.innerHTML = step.render();
    if (step.init) step.init();

    prevBtn.disabled = (currentStep === 0);
    if (currentStep === steps.length - 1) {
        nextBtn.classList.add('hidden');
        finishBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        finishBtn.classList.add('hidden');
    }
}

function goToStep(index) {
    if (steps[currentStep].save) steps[currentStep].save();
    currentStep = index;
    renderStep();
}

nextBtn.addEventListener('click', () => {
    if (steps[currentStep].save) steps[currentStep].save();
    if (currentStep < steps.length - 1) goToStep(currentStep + 1);
});

prevBtn.addEventListener('click', () => {
    if (currentStep > 0) goToStep(currentStep - 1);
});

finishBtn.addEventListener('click', () => {
    if (steps[currentStep].save) steps[currentStep].save();
    generateJSON();
});

// ========== JSON GENERATION ==========
function generateJSON() {
    const graph = [];
    const globalIdCounter = { value: 0 };
    function nextId(prefix='id') { return `#${prefix}-${++globalIdCounter.value}`; }

    // Build entities from selected classes
    formState.selectedClasses.forEach(classId => {
        const cls = classesMap.get(classId);
        const data = formState.entities[classId] || {};
        const entity = { '@type': classId.replace('schema:', '') };
        let hasProps = false;
        for (const [propId, raw] of Object.entries(data)) {
            if (!raw || raw.trim() === '') continue;
            let val = raw.trim();
            // Try to parse JSON
            if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
                try { val = JSON.parse(val); } catch(e) {}
            } else if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(Number(val)) && val !== '') { let n = Number(val); if (isFinite(n)) val = n; }
            entity[propId.replace('schema:', '')] = val;
            hasProps = true;
        }
        if (hasProps) {
            entity['@id'] = nextId(cls.label.toLowerCase().replace(/\s+/g, '-'));
            graph.push(entity);
        }
    });

    // Add WebPage if not already present
    const hasWebPage = formState.selectedClasses.some(id => id === 'schema:WebPage');
    if (!hasWebPage && graph.length > 0) {
        const webpage = { '@type': 'WebPage', '@id': '#webpage', name: document.title };
        // Link all top-level entities as mainEntity
        const mainEntities = graph.filter(e => e['@type'] !== 'BreadcrumbList' && e['@type'] !== 'Organization');
        if (mainEntities.length > 0) {
            webpage.mainEntity = mainEntities.length === 1 ? mainEntities[0] : mainEntities.map(e => ({ '@id': e['@id'] }));
        }
        graph.unshift(webpage);
    }

    // BreadcrumbList from global settings
    if (formState.globalBreadcrumbs && formState.globalBreadcrumbs.trim()) {
        const items = formState.globalBreadcrumbs.trim().split('\n').filter(line => line.trim());
        const itemList = items.map((line, idx) => {
            const parts = line.split('|').map(s => s.trim());
            return {
                '@type': 'ListItem',
                position: idx + 1,
                name: parts[0] || `Item ${idx+1}`,
                item: parts[1] || '#'
            };
        });
        graph.push({ '@type': 'BreadcrumbList', itemListElement: itemList });
    }

    // Language
    if (formState.globalLang) {
        graph.forEach(e => { if (!e.inLanguage) e.inLanguage = formState.globalLang; });
    }

    // Add Organization if any entity references it (simplified)
    const orgId = formState.selectedClasses.find(id => id === 'schema:Organization');
    if (orgId) {
        const orgData = formState.entities[orgId] || {};
        const org = { '@type': 'Organization' };
        for (const [k, v] of Object.entries(orgData)) if (v.trim()) org[k] = v.trim();
        if (Object.keys(org).length > 1) {
            org['@id'] = nextId('organization');
            graph.push(org);
            // Link as publisher for WebPage or Article
            graph.forEach(e => {
                if (e['@type'] === 'WebPage' || e['@type'] === 'Article') {
                    e.publisher = { '@id': org['@id'] };
                }
            });
        }
    }

    const result = { '@context': 'https://schema.org', '@graph': graph };
    jsonOutputPre.textContent = JSON.stringify(result, null, 2);
    outputCard.classList.remove('hidden');
    wizardCard.classList.add('hidden');
}

// ========== INIT SEQUENCE ==========
async function initialize() {
    let cached = await loadSchemaFromDB();
    if (cached) {
        processSchemaData(cached);
        statusTextSpan.innerHTML = 'Vocabulary loaded from cache.';
        statsSpan.innerHTML = `${classesMap.size} classes, ${propertiesMap.size} properties.`;
        hideLoading();
        manualRetryBtn.classList.add('hidden');
        startWizard();
        return;
    }
    showLoading('Fetching schema vocabulary from the web (about 1.5 MB)…');
    try {
        const resp = await fetch('https://raw.githubusercontent.com/schemaorg/schemaorg/main/data/releases/30.0/schemaorg-all-https.jsonld');
        if (!resp.ok) throw new Error('HTTP '+resp.status);
        const data = await resp.json();
        await saveSchemaToDB(data);
        processSchemaData(data);
        statusTextSpan.innerHTML = 'Vocabulary downloaded and cached.';
        statsSpan.innerHTML = `${classesMap.size} classes, ${propertiesMap.size} properties.`;
        hideLoading();
        manualRetryBtn.classList.add('hidden');
        startWizard();
    } catch (err) {
        console.error(err);
        showLoading(`Failed to load vocabulary: ${err.message}`, true);
        manualRetryBtn.classList.remove('hidden');
    }
}

function startWizard() {
    formState = { selectedClasses: [], entities: {}, globalLang: '', globalBreadcrumbs: '' };
    wizardCard.classList.remove('hidden');
    outputCard.classList.add('hidden');
    buildSteps();
}

function showLoading(msg, isError=false) {
    loadingDiv.textContent = msg;
    loadingDiv.className = isError ? 'alert' : 'alert success';
    loadingDiv.classList.remove('hidden');
}
function hideLoading() { loadingDiv.classList.add('hidden'); }

manualRetryBtn.onclick = () => { manualRetryBtn.classList.add('hidden'); initialize(); };
restartBtn.addEventListener('click', () => { outputCard.classList.add('hidden'); startWizard(); });
copyBtn.onclick = () => {
    const txt = jsonOutputPre.textContent;
    if (txt) navigator.clipboard.writeText(txt).then(() => alert('Copied!'));
};

function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Launch
initialize();