// ==================== UTILS ====================
function extractStringValue(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
        if (field['@value']) return String(field['@value']);
        if (Array.isArray(field) && field.length) return extractStringValue(field[0]);
    }
    return String(field);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ==================== IndexedDB (only for properties) ====================
const DB_NAME = 'SchemaOrgDB';
const STORE_NAME = 'schemaStore';
const KEY_NAME = 'mainSchema';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME))
                db.createObjectStore(STORE_NAME);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveSchemaToDB(schemaData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(schemaData, KEY_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

async function loadSchemaFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(KEY_NAME);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

// ==================== CLASSES FROM LOCAL Semora300.js ====================
let classesMap = new Map();
let classList = [];

/**
 * Try to get definitions from:
 * 1) window.schemaDefinitions (if already set)
 * 2) window.schemaAllData?.['@graph'] (if semora300.js exports that)
 */
function getSchemaDefinitions() {
    if (window.schemaDefinitions && Array.isArray(window.schemaDefinitions) && window.schemaDefinitions.length) {
        return window.schemaDefinitions;
    }
    if (window.schemaAllData && Array.isArray(window.schemaAllData['@graph']) && window.schemaAllData['@graph'].length) {
        return window.schemaAllData['@graph'];
    }
    return null;
}

// Built‑in list of important schema types that should always show the "Trending" badge
const TRENDING_CLASS_IDS = new Set([
    'schema:Organization',
    'schema:LocalBusiness',
    'schema:WebSite',
    'schema:WebPage',
    'schema:BreadcrumbList',
    'schema:SearchAction',
    'schema:PostalAddress',
    'schema:ContactPoint',
    'schema:Brand',
    'schema:Product',
    'schema:Service',
    'schema:Offer',
    'schema:AggregateRating',
    'schema:Review',
    'schema:FAQPage',
    'schema:Article',
    'schema:BlogPosting',
    'schema:ImageObject',
    'schema:VideoObject',
    'schema:Place',
    'schema:Person',
    'schema:Event',
    'schema:Comment',
    'schema:Rating',
    'schema:NewsArticle',
    'schema:ScholarlyArticle',
    'schema:TechArticle',
    'schema:UserComments',
    'schema:AudioObject',
    'schema:HowTo',
    'schema:Recipe',
    'schema:Question',
    'schema:Answer',
    'schema:ItemList',
    'schema:DateTime',
    'schema:Date',
    'schema:Duration',
    'schema:PropertyValue',
    'schema:Book',
    'schema:Movie',
    'schema:CreativeWorkSeries',
    'schema:BookSeries',
    'schema:MovieSeries',
    'schema:TVSeries',
    'schema:Collection',
    'schema:Course',
    'schema:Dataset',
    'schema:Catalog',
]);

function buildClassesFromLocalDefinitions() {
    const definitions = getSchemaDefinitions();
    if (!definitions || definitions.length === 0) {
        console.error('schemaDefinitions not loaded. Please add `window.schemaDefinitions = schemaAllData["@graph"];` at the end of Semora300.js');
        return;
    }
    classesMap.clear();
    classList = [];
    for (const def of definitions) {
        // ---------- رفع مشکل آمیختگی: فقط کلاس‌ها (rdfs:Class) را استخراج کن ----------
        const type = Array.isArray(def['@type']) ? def['@type'] : [def['@type']];
        if (!type.includes('rdfs:Class')) continue;
        // --------------------------------------------------------------------------
        const id = def['@id'];
        const label = extractStringValue(def['rdfs:label']) || id.split(':')[1] || id;
        const comment = extractStringValue(def['rdfs:comment']) || '';
        const subClassOf = def['rdfs:subClassOf']?.['@id'] || null;
        const priority = def.priority || 'medium';
        classesMap.set(id, { id, label, comment, subClassOf, priority });
        classList.push({ id, label, comment, subClassOf, priority });
    }
}
let propertiesMap = new Map();
function processPropertiesOnly(data) {
    if (!data || !data['@graph']) throw new Error('Invalid schema file: @graph not found.');
    const graph = data['@graph'];
    propertiesMap.clear();
    for (const item of graph) {
        const type = item['@type'];
        const id = item['@id'];
        if (!id) continue;
        if (type === 'rdf:Property') {
            const label = extractStringValue(item['rdfs:label']) || id.split(':')[1] || id;
            const comment = extractStringValue(item['rdfs:comment']);
            let domainIncludes = [];
            let rangeIncludes = [];
            if (item['schema:domainIncludes']) {
                const di = Array.isArray(item['schema:domainIncludes']) ? item['schema:domainIncludes'] : [item['schema:domainIncludes']];
                domainIncludes = di.map(d => d['@id'] || d).filter(Boolean);
            }
            if (item['schema:rangeIncludes']) {
                const ri = Array.isArray(item['schema:rangeIncludes']) ? item['schema:rangeIncludes'] : [item['schema:rangeIncludes']];
                rangeIncludes = ri.map(r => r['@id'] || r).filter(Boolean);
            }
            propertiesMap.set(id, { id, label, comment, domainIncludes, rangeIncludes });
        }
    }
}

// ==================== SCORING SYSTEM ====================
function scoreProperty(prop, selectedClass, userContext = {}) {
    let score = 0;
    const propLabel = prop.label.toLowerCase();
    const coreProps = ['name', 'description', 'url', 'image'];
    if (coreProps.includes(propLabel)) score += 100;
    if (prop.domainIncludes.includes(selectedClass)) score += 50;
    if (userContext.hasImages && propLabel.includes('image')) score += 30;
    if (userContext.hasAddress && propLabel.includes('address')) score += 30;
    if (userContext.hasPrice && (propLabel.includes('price') || propLabel.includes('offer'))) score += 30;
    const seoProps = ['headline', 'author', 'datePublished', 'publisher', 'mainEntityOfPage'];
    if (seoProps.includes(propLabel)) score += 40;
    return score;
}

function getRecommendedProperties(selectedClass, limit = 20) {
    const props = [];
    for (const [id, prop] of propertiesMap) {
        if (prop.domainIncludes.includes(selectedClass)) {
            const score = scoreProperty(prop, selectedClass);
            props.push({ ...prop, score });
        }
    }
    props.sort((a, b) => b.score - a.score);
    return props.slice(0, limit);
}

// ==================== DOM DETECTION ====================
function detectPageContext() {
    const context = {
        hasImages: document.querySelectorAll('img').length > 0,
        hasAddress: !!document.querySelector('[itemprop="address"]') || document.body.innerText.match(/\d{5}/) !== null,
        hasPrice: document.body.innerText.match(/\$\d+|\€\d+/) !== null,
        hasArticle: !!document.querySelector('article') || !!document.querySelector('[itemtype*="Article"]'),
        hasProduct: !!document.querySelector('[itemtype*="Product"]')
    };
    return context;
}

function suggestSchemaType() {
    const ctx = detectPageContext();
    if (ctx.hasArticle) return 'schema:Article';
    if (ctx.hasProduct) return 'schema:Product';
    if (ctx.hasAddress) return 'schema:LocalBusiness';
    return 'schema:WebPage';
}

// ==================== PAGE TYPE MAPPING ====================
const PAGE_TYPE_MAP = {
    'All': () => classList.map(c => c.id),                     // 🔹 همهٔ اسکیماها
    'Homepage': [                                                // صفحهٔ اصلی
        'schema:Organization',
        'schema:LocalBusiness',
        'schema:WebSite',
        'schema:WebPage',
        'schema:BreadcrumbList',
        'schema:SearchAction',
        'schema:PostalAddress',
        'schema:ContactPoint',
        'schema:Brand',
        'schema:Product',
        'schema:Service',
        'schema:Offer',
        'schema:AggregateRating',
        'schema:Review',
        'schema:FAQPage',
        'schema:Article',
        'schema:BlogPosting',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:Corporation',
        'schema:GovernmentOrganization',
        'schema:EducationalOrganization',
        'schema:NGO',
        'schema:Consortium',
        'schema:SportsOrganization',
        'schema:PerformingGroup',
        'schema:NewsMediaOrganization',
        'schema:Store',
        'schema:Restaurant',
        'schema:Hotel',
        'schema:Hospital',
        'schema:School',
        'schema:Library',
        'schema:Museum',
        'schema:ShoppingCenter',
        'schema:AutoRepair',
        'schema:BeautySalon',
        'schema:Dentist',
        'schema:Pharmacy',
        'schema:Bank',
        'schema:RealEstateAgent',
        'schema:TravelAgency',
        'schema:GasStation',
        'schema:ParkingFacility',
        'schema:NewsArticle',
        'schema:TechArticle',
        'schema:ScholarlyArticle',
        'schema:Report',
        'schema:WebContent',
        'schema:CreativeWork',
        'schema:MediaObject',
        'schema:AudioObject',
        'schema:Podcast',
        'schema:ItemList',
        'schema:CollectionPage',
        'schema:AboutPage',
        'schema:ContactPage',
        'schema:ProfilePage',
        'schema:SearchResultsPage',
        'schema:GovernmentOrganization',
        'schema:EducationalOrganization',
        'schema:NGO',
        'schema:Consortium',
        'schema:SportsOrganization',
        'schema:SiteNavigationElement',
        'schema:PriceSpecification',
        'schema:PaymentMethod',
        'schema:Invoice',
        'schema:Order',
        'schema:Demand',
        'schema:BusinessFunction',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:SocialEvent',
        'schema:SportsEvent',
        'schema:Place',
        'schema:City',
        'schema:Country',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:Thing',
        'schema:Intangible',
        'schema:StructuredValue',
        'schema:PropertyValue',
        'schema:QuantitativeValue',
        'schema:OpeningHoursSpecification'
    ],


    'Landing Page': [
        'schema:WebPage',
        'schema:Organization',
        'schema:Product',
        'schema:Offer',
        'schema:Service',
        'schema:FAQPage',
        'schema:Review',
        'schema:AggregateRating',
        'schema:ContactPoint',
        'schema:BreadcrumbList',
        'schema:Article',
        'schema:BlogPosting',
        'schema:NewsArticle',
        'schema:VideoObject',
        'schema:ImageObject',
        'schema:HowTo',
        'schema:Question',
        'schema:Answer',
        'schema:LocalBusiness',
        'schema:Store',
        'schema:Restaurant',
        'schema:Hotel',
        'schema:ProfessionalService',
        'schema:Brand',
        'schema:Corporation',
        'schema:OnlineStore',
        'schema:Event',
        'schema:Action',
        'schema:BuyAction',
        'schema:OrderAction',
        'schema:SubscribeAction',
        'schema:Place',
        'schema:PostalAddress',
        'schema:GeoCoordinates',
        'schema:ItemList',
        'schema:ListItem',
        'schema:Table',
        'schema:WebSite',
        'schema:SiteNavigationElement',
        'schema:SearchAction',
        'schema:Comment',
        'schema:UserReview',
        'schema:Rating',
        'schema:PriceSpecification',
        'schema:PaymentMethod',
        'schema:Invoice',
        'schema:MonetaryAmount',
        'schema:MediaObject',
        'schema:AudioObject',
        'schema:ImageGallery',
        'schema:VideoGallery',
        'schema:Certification',
        'schema:Credential',
        'schema:EducationalOccupationalCredential',
        'schema:Person',
        'schema:SocialMediaPosting',
        'schema:UserComments',
        'schema:SoftwareApplication',
        'schema:WebApplication',
        'schema:MobileApplication',
        'schema:Course',
        'schema:EducationalOrganization'
    ],


    'Blog (Blog Listing)': [
        'schema:Blog',
        'schema:BlogPosting',
        'schema:Article',
        'schema:Person',
        'schema:Organization',
        'schema:ImageObject',
        'schema:Comment',
        'schema:AggregateRating',
        'schema:Rating',
        'schema:WebPage',
        'schema:NewsArticle',
        'schema:ScholarlyArticle',
        'schema:TechArticle',
        'schema:OpinionNewsArticle',
        'schema:ReviewNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:AnalysisNewsArticle',
        'schema:ReportageNewsArticle',
        'schema:SatiricalArticle',
        'schema:AdvertiserContentArticle',
        'schema:AskPublicNewsArticle',
        'schema:CreativeWork',
        'schema:MediaObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:Photograph',
        'schema:TextObject',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:CollectionPage',
        'schema:WebSite',
        'schema:SiteNavigationElement',
        'schema:UserComments',
        'schema:UserReview',
        'schema:UserInteraction',
        'schema:LikeAction',
        'schema:ShareAction',
        'schema:CommentAction',
        'schema:PostalAddress',
        'schema:ContactPoint',
        'schema:Brand',
        'schema:Language',
        'schema:DefinedTerm',
        'schema:CategoryCode',
        'schema:DataFeed',
        'schema:DataFeedItem',
        'schema:PropertyValue',
        'schema:StructuredValue',
        'schema:DateTime',
        'schema:Date',
        'schema:Duration',
        'cmns-dt:DateTime',
        'cmns-dt:Date',
        'cmns-dt:Duration',
        'schema:Text',
        'schema:URL',
        'schema:Boolean',
        'schema:Number',
        'schema:Integer',
        'schema:Float'
    ],


    'Blog Post / Article': [
        'schema:BlogPosting',
        'schema:Article',
        'schema:ScholarlyArticle',
        'schema:TechArticle',
        'schema:AdvertiserContentArticle',
        'schema:SatiricalArticle',
        'schema:OpinionNewsArticle',
        'schema:ReviewNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:ReportageNewsArticle',
        'schema:AnalysisNewsArticle',
        'schema:AskPublicNewsArticle',
        'schema:WebPage',
        'schema:WebSite',
        'schema:WebContent',
        'schema:ItemPage',
        'schema:AboutPage',
        'schema:ContactPage',
        'schema:FAQPage',
        'schema:QAPage',
        'schema:ProfilePage',
        'schema:SearchResultsPage',
        'schema:CollectionPage',
        'schema:Person',
        'schema:Organization',
        'foaf:Person',
        'gs1:Organization',
        'fibo-fnd-org-org:Organization',
        'schema:Comment',
        'schema:UserComments',
        'schema:Review',
        'schema:Rating',
        'schema:AggregateRating',
        'schema:UserReview',
        'schema:CriticReview',
        'schema:MediaReview',
        'schema:EmployerReview',
        'schema:ClaimReview',
        'schema:EndorsementRating',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:ImageObjectSnapshot',
        'schema:VideoObjectSnapshot',
        'schema:AudioObjectSnapshot',
        'schema:Photograph',
        'schema:MediaObject',
        'dctype:Image',
        'schema:HowTo',
        'schema:Recipe',
        'schema:Question',
        'schema:Answer',
        'schema:HowToStep',
        'schema:HowToDirection',
        'schema:HowToSection',
        'schema:HowToTip',
        'schema:HowToSupply',
        'schema:HowToTool',
        'schema:HowToItem',
        'schema:Quiz',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:ListItem',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:SocialEvent',
        'schema:PublicationEvent',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:Review',
        'schema:Place',
        'schema:LocalBusiness',
        'schema:PostalAddress',
        'gs1:PostalAddress',
        'fibo-fnd-plc-adr:PostalAddress',
        'schema:DateTime',
        'schema:Date',
        'schema:Duration',
        'schema:Time',
        'cmns-dt:DateTime',
        'cmns-dt:Date',
        'cmns-dt:Duration',
        'schema:PropertyValue',
        'schema:QuantitativeValue',
        'schema:StructuredValue',
        'schema:DefinedTerm',
        'schema:DefinedTermSet',
        'schema:CategoryCode',
        'schema:CategoryCodeSet',
        'schema:Claim',
        'schema:Quotation',
        'schema:Statement',
        'schema:DigitalDocument',
        'schema:TextDigitalDocument',
        'schema:PresentationDigitalDocument',
        'schema:SpreadsheetDigitalDocument',
        'schema:Thing',
        'schema:CreativeWork',
        'schema:Text',
        'schema:URL',
        'schema:Boolean',
        'schema:Number',
        'schema:Integer',
        'schema:Float',
        'schema:SocialMediaPosting',
        'schema:DiscussionForumPosting',
        'schema:LiveBlogPosting',
        'schema:UserInteraction',
        'schema:InteractionCounter',
        'schema:Audience',
        'schema:EducationalAudience',
        'schema:BusinessAudience',
        'schema:PeopleAudience',
        'schema:SiteNavigationElement',
        'schema:WPHeader',
        'schema:WPFooter',
        'schema:WPSideBar',
        'schema:Dataset',
        'schema:DataFeed',
        'schema:DataFeedItem',
        'dcat:Dataset',
        'void:Dataset',
        'dctype:Dataset'
    ],


    'News Article': [
        'schema:NewsArticle',
        'schema:Person',
        'schema:Organization',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:Place',
        'schema:Event',
        'schema:PostalAddress',
        'schema:WebPage',
        'schema:AnalysisNewsArticle',
        'schema:AskPublicNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:OpinionNewsArticle',
        'schema:ReportageNewsArticle',
        'schema:ReviewNewsArticle',
        'schema:AdvertiserContentArticle',
        'schema:AudioObject',
        'schema:VideoObjectSnapshot',
        'schema:ImageObjectSnapshot',
        'schema:Photograph',
        'schema:MediaObject',
        'schema:Clip',
        'schema:VideoClip',
        'schema:Author',
        'schema:NewsMediaOrganization',
        'schema:Journalist',
        'schema:ContactPoint',
        'schema:DateTime',
        'schema:Date',
        'schema:Duration',
        'schema:Country',
        'schema:City',
        'schema:AdministrativeArea',
        'schema:GeoCoordinates',
        'schema:GeoShape',
        'schema:SportsEvent',
        'schema:BusinessEvent',
        'schema:SocialEvent',
        'schema:EducationEvent',
        'schema:PublicationEvent',
        'schema:GovernmentOrganization',
        'schema:Corporation',
        'schema:EducationalOrganization',
        'schema:NGO',
        'schema:PoliticalParty',
        'schema:Review',
        'schema:Rating',
        'schema:AggregateRating',
        'schema:ClaimReview',
        'schema:CriticReview',
        'schema:Comment',
        'schema:Answer',
        'schema:Quotation',
        'schema:TextObject',
        'schema:PropertyValue',
        'schema:QuantitativeValue',
        'schema:StructuredValue',
        'schema:DefinedTerm',
        'schema:Language',
        'schema:CreativeWork',
        'schema:Thing',
        'schema:URL',
        'schema:Text',
        'schema:Boolean',
        'schema:Number',
        'schema:Integer'
    ],


    'Category / Archive': [
        'schema:Article',
        'schema:BlogPosting',
        'schema:NewsArticle',
        'schema:ScholarlyArticle',
        'schema:OpinionNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:AdvertiserContentArticle',
        'schema:SatiricalArticle',
        'schema:ReportageNewsArticle',
        'schema:AnalysisNewsArticle',
        'schema:ReviewNewsArticle',
        'schema:AskPublicNewsArticle',
        'schema:Book',
        'schema:Chapter',
        'schema:ShortStory',
        'schema:Thesis',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:ImageObject',
        'schema:Photograph',
        'schema:Painting',
        'schema:Drawing',
        'schema:Sculpture',
        'schema:VisualArtwork',
        'schema:Movie',
        'schema:MusicRecording',
        'schema:MusicComposition',
        'schema:Podcast',
        'schema:PodcastEpisode',
        'schema:CreativeWorkSeries',
        'schema:BookSeries',
        'schema:MovieSeries',
        'schema:TVSeries',
        'schema:RadioSeries',
        'schema:PodcastSeries',
        'schema:VideoGameSeries',
        'schema:ComicSeries',
        'schema:Collection',
        'schema:ProductCollection',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:ExhibitionEvent',
        'schema:Festival',
        'schema:FoodEvent',
        'schema:LiteraryEvent',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:TheaterEvent',
        'schema:VisualArtsEvent',
        'schema:SocialEvent',
        'schema:ComedyEvent',
        'schema:DanceEvent',
        'schema:SaleEvent',
        'schema:Product',
        'schema:IndividualProduct',
        'schema:ProductModel',
        'schema:ProductGroup',
        'schema:SomeProducts',
        'schema:Organization',
        'schema:LocalBusiness',
        'schema:Corporation',
        'schema:EducationalOrganization',
        'schema:GovernmentOrganization',
        'schema:NewsMediaOrganization',
        'schema:PerformingGroup',
        'schema:SportsOrganization',
        'schema:SportsTeam',
        'schema:Place',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:LandmarksOrHistoricalBuildings',
        'schema:Museum',
        'schema:Park',
        'schema:Course',
        'schema:LearningResource',
        'schema:Quiz',
        'schema:HowTo',
        'schema:Recipe',
        'schema:WebPage',
        'schema:CollectionPage',
        'schema:QAPage',
        'schema:FAQPage',
        'dcat:Dataset',
        'dcat:Catalog',
        'schema:DataCatalog',
        'schema:DefinedTermSet',
        'schema:CategoryCodeSet'
    ],


    'FAQ Page': ['schema:FAQPage'],


    'How‑To Page': ['schema:HowTo'],


    'Documentation / Knowledge Base': ['schema:TechArticle', 'schema:Article'],


    'Product Page': ['schema:Product'],


    'E‑commerce Category': ['schema:CollectionPage'],


    'CheckoutPage': ['schema:CheckoutPage'],


    'Reservation, Order': ['schema:Order', 'schema:Reservation'],


    'Service Page': ['schema:Service'],


    'About Us': ['schema:AboutPage'],


    'Contact Us': ['schema:ContactPage'],


    'ProfilePage + Person': ['schema:ProfilePage', 'schema:Person'],


    'Local Business Page': ['schema:LocalBusiness'],


    'Event Page': ['schema:Event'],


    'Course Page': ['schema:Course'],


    'Video Page': ['schema:VideoObject'],


    'Podcast Page': ['schema:PodcastEpisode', 'schema:PodcastSeries'],


    'Movie, TVSeries, TVEpisode': ['schema:Movie', 'schema:TVSeries', 'schema:TVEpisode'],


    'MusicAlbum, MusicRecording': ['schema:MusicAlbum', 'schema:MusicRecording'],


    'Book': ['schema:Book'],


    'Recipe': ['schema:Recipe'],


    'Review Page': ['schema:Review'],


    'Comparison Page': ['schema:Product'],


    'Portfolio / Project': ['schema:CreativeWork', 'schema:VisualArtwork'],


    'Software / App Page': ['schema:SoftwareApplication', 'schema:WebApplication', 'schema:MobileApplication'],


    'RealEstateListing': ['schema:RealEstateListing'],


    'Hotel, LodgingBusiness': ['schema:Hotel', 'schema:LodgingBusiness'],


    'DiscussionForumPosting': ['schema:DiscussionForumPosting'],


    'MedicalWebPage, HealthTopicContent': ['schema:MedicalWebPage', 'schema:HealthTopicContent'],


    'SearchResultsPage': ['schema:SearchResultsPage'],


    'Job Posting': ['schema:JobPosting']
};

function getAllowedClassIds(pageType) {
    const entry = PAGE_TYPE_MAP[pageType];
    if (typeof entry === 'function') return entry();
    return entry || [];
}

// ==================== WIZARD STATE (MULTI-SELECT) ====================
let wizardState = {
    currentStep: 0,
    selectedClasses: [],
    multiProperties: {},
    activePageType: 'Homepage'
};

const STEPS = [
    { id: 'selectType', title: 'Select Schema Types', desc: 'Choose one or more schema types' },
    { id: 'fillProps', title: 'Fill Properties', desc: 'Fill properties for each selected schema' },
    { id: 'review', title: 'Review & Generate', desc: 'Review all schemas and generate JSON-LD' }
];

let currentDisplayLimit = 20;
let currentFilteredList = [];

// ==================== BADGE (حالا بر اساس لیست داخلی کار می‌کند) ====================
function getPriorityBadge(priority, classId) {
    // اگر اولویت بالا باشد یا در لیست داخلی اسکیماهای مهم باشد، نشان را نمایش بده
    if (priority === 'high' || TRENDING_CLASS_IDS.has(classId)) {
        return '<span class="trending-badge" style="background: rgba(224,164,20,0.12); color: #E0A414; font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 500;">Trending</span>';
    }
    return '';
}

// ==================== UI RENDERING ====================
function renderStepIndicator() {
    const indicator = document.getElementById('stepIndicator');
    indicator.innerHTML = STEPS.map((step, idx) => `
        <div class="step ${idx === wizardState.currentStep ? 'active' : ''} ${idx < wizardState.currentStep ? 'completed' : ''}">
            <div class="step-number">${idx + 1}</div>
            <div class="step-label">${step.title}</div>
        </div>
    `).join('');
}

function renderStep() {
    const content = document.getElementById('stepContent');
    const step = STEPS[wizardState.currentStep];
    if (step.id === 'selectType') renderSelectTypeStep(content);
    else if (step.id === 'fillProps') renderFillPropsStep(content);
    else if (step.id === 'review') renderReviewStep(content);
    updateNavigationButtons();
}

// -------------------- STEP 1: NO CHECKBOX, CARD CLICK TOGGLE --------------------
function renderSelectTypeStep(container) {
    const suggested = suggestSchemaType();
    const suggestedLabel = classesMap.get(suggested)?.label || 'WebPage';
    let html = `
        <div class="step-title">Choose Schema Types</div>
        <div class="step-desc">Select one or more schema types. Click on a card to select/deselect.</div>
        <div class="suggestion-box">
            <strong>Smart Suggestion:</strong> Based on page analysis, we recommend <strong>${suggestedLabel}</strong>
        </div>
        <div class="search-box">
            <input type="text" id="classSearch" placeholder="Search schema types..." />
        </div>
        <div class="tabs-scroll-container">
            <button class="tab-arrow tab-arrow-left" id="tabArrowLeft">‹</button>
            <div class="category-tabs" id="pageTypeTabs"></div>
            <button class="tab-arrow tab-arrow-right" id="tabArrowRight">›</button>
        </div>
        <div class="class-grid" id="classGrid"></div>
        <div id="loadMoreContainer" style="text-align: center; margin-top: 20px;"></div>
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 20px;">
            <button id="selectAllBtn" class="minimal-btn">Select All</button>
            <button id="clearAllBtn" class="minimal-btn">Clear All</button>
        </div>
    `;
    container.innerHTML = html;
    renderPageTypeTabs();
    renderClassGrid(wizardState.activePageType);
    document.getElementById('classSearch').addEventListener('input', debounce((e) => {
        currentDisplayLimit = 20;
        filterClasses(e.target.value);
    }, 300));

    document.getElementById('selectAllBtn').addEventListener('click', () => {
        const allowedIds = getAllowedClassIds(wizardState.activePageType);
        let classesToShow = allowedIds.length ? classList.filter(cls => allowedIds.includes(cls.id)) : classList;
        wizardState.selectedClasses = classesToShow.map(c => c.id);
        renderClassGrid(wizardState.activePageType);
    });
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        wizardState.selectedClasses = [];
        renderClassGrid(wizardState.activePageType);
    });
}

function renderClassGrid(pageType) {
    const grid = document.getElementById('classGrid');
    const allowedIds = getAllowedClassIds(pageType);
    let classesToShow = allowedIds.length ? classList.filter(cls => allowedIds.includes(cls.id)) : classList;
    currentFilteredList = classesToShow;
    const total = currentFilteredList.length;
    const hasMore = total > currentDisplayLimit;
    const visibleClasses = currentFilteredList.slice(0, currentDisplayLimit);
    
    grid.innerHTML = visibleClasses.map(cls => {
        const isSelected = wizardState.selectedClasses.includes(cls.id);
        const selectedClass = isSelected ? 'selected' : '';
        return `
        <div class="class-card ${selectedClass}" data-id="${cls.id}">
            <div class="class-name" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${cls.label}</span>
                ${getPriorityBadge(cls.priority, cls.id)}
            </div>
            <div class="class-desc">${cls.comment ? cls.comment.substring(0, 80) + '...' : ''}</div>
        </div>`;
    }).join('');

    // attach click toggles
    grid.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            if (wizardState.selectedClasses.includes(id)) {
                wizardState.selectedClasses = wizardState.selectedClasses.filter(c => c !== id);
                card.classList.remove('selected');
            } else {
                wizardState.selectedClasses.push(id);
                card.classList.add('selected');
            }
        });
    });
    
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        if (hasMore) {
            loadMoreContainer.innerHTML = `<button id="loadMoreBtn" class="minimal-btn">Load more (${total - currentDisplayLimit} remaining)</button>`;
            const btn = document.getElementById('loadMoreBtn');
            btn.addEventListener('click', () => {
                currentDisplayLimit += 20;
                renderClassGrid(pageType);
            });
        } else {
            loadMoreContainer.innerHTML = '';
        }
    }
}

function filterClasses(query) {
    const grid = document.getElementById('classGrid');
    const activeTab = wizardState.activePageType;
    const allowedIds = getAllowedClassIds(activeTab);
    let baseList = allowedIds.length ? classList.filter(cls => allowedIds.includes(cls.id)) : classList;
    const filtered = baseList.filter(cls => 
        cls.label.toLowerCase().includes(query.toLowerCase()) ||
        (cls.comment && cls.comment.toLowerCase().includes(query.toLowerCase()))
    );
    currentFilteredList = filtered;
    currentDisplayLimit = 20;
    const total = filtered.length;
    const visibleClasses = filtered.slice(0, currentDisplayLimit);
    
    grid.innerHTML = visibleClasses.map(cls => {
        const isSelected = wizardState.selectedClasses.includes(cls.id);
        const selectedClass = isSelected ? 'selected' : '';
        return `
        <div class="class-card ${selectedClass}" data-id="${cls.id}">
            <div class="class-name" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${cls.label}</span>
                ${getPriorityBadge(cls.priority, cls.id)}
            </div>
            <div class="class-desc">${cls.comment ? cls.comment.substring(0, 80) + '...' : ''}</div>
        </div>`;
    }).join('');
    
    grid.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            if (wizardState.selectedClasses.includes(id)) {
                wizardState.selectedClasses = wizardState.selectedClasses.filter(c => c !== id);
                card.classList.remove('selected');
            } else {
                wizardState.selectedClasses.push(id);
                card.classList.add('selected');
            }
        });
    });
    
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        if (total > currentDisplayLimit) {
            loadMoreContainer.innerHTML = `<button id="loadMoreBtn" class="minimal-btn">Load more (${total - currentDisplayLimit} remaining)</button>`;
            const btn = document.getElementById('loadMoreBtn');
            btn.addEventListener('click', () => {
                currentDisplayLimit += 20;
                filterClasses(query);
            });
        } else {
            loadMoreContainer.innerHTML = '';
        }
    }
}

// -------------------- STEP 2: TABS FOR EACH SELECTED SCHEMA --------------------
function renderFillPropsStep(container) {
    if (wizardState.selectedClasses.length === 0) {
        container.innerHTML = `<div class="step-title">No schema selected</div><div class="step-desc">You haven't selected any schema type. Please go back and select at least one.</div>`;
        return;
    }
    for (const clsId of wizardState.selectedClasses) {
        if (!wizardState.multiProperties[clsId]) {
            wizardState.multiProperties[clsId] = {};
        }
    }
    let tabsHtml = `<div class="step-title">Fill Properties for Each Schema</div>`;
    tabsHtml += `<div class="tabs-horizontal" id="schemaTabs" style="display: flex; gap: 10px; border-bottom: 1px solid #2a2a2a; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">`;
    wizardState.selectedClasses.forEach((clsId, idx) => {
        const cls = classesMap.get(clsId);
        const label = cls ? cls.label : clsId;
        tabsHtml += `<button class="schema-tab ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="background: none; border: none; padding: 6px 12px; cursor: pointer; color: #b0b0b0; font-weight: 500; border-radius: 20px;">${label}</button>`;
    });
    tabsHtml += `</div><div id="propsPanelContainer"></div>`;
    container.innerHTML = tabsHtml;
    
    function showTab(index) {
        const clsId = wizardState.selectedClasses[index];
        const recommended = getRecommendedProperties(clsId);
        let html = `<div class="props-container" data-class="${clsId}">`;
        recommended.forEach(prop => {
            const isCore = prop.score >= 100;
            const currentValue = wizardState.multiProperties[clsId][prop.id] || '';
            html += `<div class="prop-row ${isCore ? 'core-prop' : ''}">
                        <label><span class="prop-label">${prop.label}</span>${isCore ? '<span class="badge">Core</span>' : ''}${prop.comment ? `<span class="prop-hint">${prop.comment.substring(0, 100)}</span>` : ''}</label>
                        <input type="text" class="prop-input" data-prop="${prop.id}" data-class="${clsId}" value="${currentValue}" placeholder="Enter ${prop.label}..." />
                    </div>`;
        });
        html += `</div>`;
        document.getElementById('propsPanelContainer').innerHTML = html;
        // attach input events
        document.querySelectorAll('.prop-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const classId = input.dataset.class;
                const propId = input.dataset.prop;
                if (!wizardState.multiProperties[classId]) wizardState.multiProperties[classId] = {};
                wizardState.multiProperties[classId][propId] = input.value;
            });
        });
    }
    showTab(0);
    // attach tab click events
    const tabs = document.querySelectorAll('.schema-tab');
    tabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showTab(idx);
        });
    });
}

// -------------------- STEP 3: REVIEW --------------------
function renderReviewStep(container) {
    let html = `<div class="step-title">Review All Schemas</div><div class="step-desc">Check the information for each schema below.</div>`;
    for (const clsId of wizardState.selectedClasses) {
        const cls = classesMap.get(clsId);
        const label = cls ? cls.label : clsId;
        const props = wizardState.multiProperties[clsId] || {};
        const filled = Object.keys(props).filter(k => props[k]).length;
        html += `<div style="margin-top: 20px; border: 1px solid #2a2a2a; border-radius: 16px; padding: 12px;">`;
        html += `<div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 10px;">${label}</div>`;
        html += `<div style="font-size: 0.8rem; color: #b0b0b0; margin-bottom: 8px;">Properties filled: ${filled}</div>`;
        html += `<div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
        for (const [propId, value] of Object.entries(props)) {
            if (value) {
                const prop = propertiesMap.get(propId);
                const propName = prop ? prop.label : propId;
                html += `<span style="background: #141414; padding: 4px 8px; border-radius: 20px; font-size: 0.75rem;"><strong>${propName}</strong>: ${value}</span>`;
            }
        }
        html += `</div></div>`;
    }
    container.innerHTML = html;
}

// -------------------- NAVIGATION --------------------
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    prevBtn.disabled = wizardState.currentStep === 0;
    if (wizardState.currentStep === STEPS.length - 1) {
        nextBtn.classList.add('hidden');
        finishBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        finishBtn.classList.add('hidden');
    }
}

function nextStep() {
    if (wizardState.currentStep === 0 && wizardState.selectedClasses.length === 0) {
        alert('Please select at least one schema type first.');
        return;
    }
    if (wizardState.currentStep < STEPS.length - 1) {
        wizardState.currentStep++;
        renderStepIndicator();
        renderStep();
    }
}

function prevStep() {
    if (wizardState.currentStep > 0) {
        wizardState.currentStep--;
        renderStepIndicator();
        renderStep();
    }
}

// -------------------- GENERATE JSON-LD --------------------
function generateJSONLD() {
    const graph = [];
    for (const clsId of wizardState.selectedClasses) {
        const cls = classesMap.get(clsId);
        const typeName = cls ? cls.label : 'Thing';
        const item = { "@type": typeName };
        const props = wizardState.multiProperties[clsId] || {};
        for (const [propId, value] of Object.entries(props)) {
            if (value) {
                const prop = propertiesMap.get(propId);
                if (prop) {
                    item[prop.label] = value;
                } else {
                    item[propId] = value;
                }
            }
        }
        graph.push(item);
    }
    let output;
    if (graph.length === 1) {
        output = { "@context": "https://schema.org", ...graph[0] };
    } else {
        output = {
            "@context": "https://schema.org",
            "@graph": graph
        };
    }
    const jsonString = JSON.stringify(output, null, 2);
    document.getElementById('jsonOutput').textContent = jsonString;
    document.getElementById('outputCard').classList.remove('hidden');
    document.getElementById('wizardCard').classList.add('hidden');
}

// -------------------- PAGE TABS RENDERING (unchanged) --------------------
function renderPageTypeTabs() {
    const tabs = document.getElementById('pageTypeTabs');
    const pageTypes = Object.keys(PAGE_TYPE_MAP);
    tabs.innerHTML = pageTypes.map(type => `<button class="cat-tab ${type === wizardState.activePageType ? 'active' : ''}" data-type="${type}">${type}</button>`).join('');
    tabs.querySelectorAll('.cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wizardState.activePageType = btn.dataset.type;
            currentDisplayLimit = 20;
            renderClassGrid(wizardState.activePageType);
            document.getElementById('classSearch').value = '';
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });
    initTabScroll();
    const activeBtn = tabs.querySelector('.cat-tab.active');
    if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest', inline: 'center' });
}

let tabScrollInitialized = false;
function initTabScroll() {
    if (tabScrollInitialized) return;
    const tabsDiv = document.getElementById('pageTypeTabs');
    const leftArrow = document.getElementById('tabArrowLeft');
    const rightArrow = document.getElementById('tabArrowRight');
    if (!tabsDiv || !leftArrow || !rightArrow) return;
    function updateArrows() {
        const tolerance = 1;
        leftArrow.disabled = !(tabsDiv.scrollLeft > tolerance);
        rightArrow.disabled = !(tabsDiv.scrollLeft < tabsDiv.scrollWidth - tabsDiv.clientWidth - tolerance);
    }
    const scrollAmount = () => 200;
    leftArrow.addEventListener('click', () => tabsDiv.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    rightArrow.addEventListener('click', () => tabsDiv.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
    tabsDiv.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
    tabScrollInitialized = true;
}

// ==================== INITIALIZATION ====================
async function initApp() {
    const statusText = document.getElementById('statusText');
    const loadingStatus = document.getElementById('loadingStatus');
    const statsInfo = document.getElementById('statsInfo');
    const retryBtn = document.getElementById('manualRetryBtn');
    try {
        statusText.textContent = 'Loading local schema definitions...';
        
        buildClassesFromLocalDefinitions();

        if (classList.length === 0) {
            throw new Error('Semora300.js not loaded or schemaDefinitions not set. Please check the script order and add `window.schemaDefinitions = schemaAllData["@graph"];` to the end of semora300.js');
        }

        statusText.textContent = `Loaded ${classList.length} schema types. Now loading properties...`;
        let schemaData = await loadSchemaFromDB();
        if (!schemaData) {
            statusText.textContent = 'Downloading properties from schema.org...';
            loadingStatus.classList.remove('hidden');
            loadingStatus.textContent = 'Fetching properties (this may take a moment)...';
            const response = await fetch('https://schema.org/version/latest/schemaorg-current-https.jsonld');
            if (!response.ok) throw new Error('Failed to fetch properties');
            schemaData = await response.json();
            await saveSchemaToDB(schemaData);
            loadingStatus.textContent = 'Properties cached successfully!';
        }
        processPropertiesOnly(schemaData);
        statusText.textContent = `Ready – ${classList.length} types, ${propertiesMap.size} properties loaded`;
        statsInfo.innerHTML = `<strong>${classList.length}</strong> schema types · <strong>${propertiesMap.size}</strong> properties`;
        loadingStatus.classList.add('hidden');
        document.getElementById('wizardCard').classList.remove('hidden');
        tabScrollInitialized = false;
        renderStepIndicator();
        renderStep();
    } catch (error) {
        statusText.textContent = 'Failed to load schema data';
        loadingStatus.classList.remove('hidden');
        loadingStatus.textContent = `Error: ${error.message}`;
        retryBtn.classList.remove('hidden');
    }
}

// ==================== EVENT LISTENERS ====================
document.getElementById('prevBtn').addEventListener('click', prevStep);
document.getElementById('nextBtn').addEventListener('click', nextStep);
document.getElementById('finishBtn').addEventListener('click', generateJSONLD);
document.getElementById('copyBtn').addEventListener('click', () => {
    const text = document.getElementById('jsonOutput').textContent;
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
});
document.getElementById('downloadBtn').addEventListener('click', () => {
    const text = document.getElementById('jsonOutput').textContent;
    const blob = new Blob([text], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.jsonld';
    a.click();
    URL.revokeObjectURL(url);
});
document.getElementById('restartBtn').addEventListener('click', () => {
    wizardState = { currentStep: 0, selectedClasses: [], multiProperties: {}, activePageType: 'Homepage' };
    document.getElementById('outputCard').classList.add('hidden');
    document.getElementById('wizardCard').classList.remove('hidden');
    tabScrollInitialized = false;
    renderStepIndicator();
    renderStep();
});
document.getElementById('manualRetryBtn').addEventListener('click', initApp);
initApp();