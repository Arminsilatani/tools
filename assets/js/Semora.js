/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-04-30
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== SCHEMA GENERATOR APP ============================ */

/* ------------------------- UTILITIES ------------------------- */
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
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
/**
 * Converts a camelCase or PascalCase string into a space-separated label.
 * "VideoObject"   -> "Video Object"
 * "BedAndBreakfast" -> "Bed And Breakfast"
 * "Organization"  -> "Organization" (unchanged)
 */
function humanizeLabel(str) {
    if (!str) return '';
    // Only transform if string has no spaces and contains at least one uppercase letter
    if (str.includes(' ')) return str;
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}
/* ------------------------- INDEXEDDB STORAGE ------------------------- */
const DB_NAME = 'SchemaOrgDB';
const STORE_NAME = 'schemaStore';
const KEY_NAME = 'mainSchema';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
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

/* ------------------------- CLASS LOADING & TRENDING ------------------------- */
let classesMap = new Map();
let classList = [];

/**
 * Retrieve schema class definitions from the global scope.
 * Priority: window.schemaDefinitions > window.schemaAllData['@graph'].
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

// Built-in list of important schema types that always show the "Trending" badge
const TRENDING_CLASS_IDS = new Set([
    'schema:WebSite',
    'schema:WebPage',
    'schema:Organization',
    'schema:LocalBusiness',
    'schema:Person',
    'schema:Article',
    'schema:Product',
    'schema:Offer',
    'schema:Review',
    'schema:AggregateRating',
    'schema:BreadcrumbList',
    'schema:FAQPage',
    'schema:ImageObject',
    'schema:VideoObject',
    'schema:Event',
    'schema:AboutPage',
    'schema:ContactPage',
    'schema:BlogPosting',
    'schema:NewsArticle',
    'schema:Recipe',
    'schema:HowTo',
    'schema:JobPosting',
    'schema:Restaurant',
    'schema:Hotel',
    'schema:Store',
    'schema:Service',
    'schema:Brand',
    'schema:ItemList',
    'schema:SoftwareApplication',
    'schema:MobileApplication',
    'schema:WebApplication',
    'schema:Book',
    'schema:Course',
    'schema:Place',
    'schema:SearchResultsPage',
    'schema:QAPage',
    'schema:AudioObject',
    'schema:Movie',
    'schema:MusicRecording',
    'schema:Dataset'
]);

function buildClassesFromLocalDefinitions() {
    const definitions = getSchemaDefinitions();
    if (!definitions || definitions.length === 0) {
        console.error('schemaDefinitions not loaded. Please add window.schemaDefinitions = schemaAllData["@graph"]; at the end of Semora300.js');
        return;
    }
    classesMap.clear();
    classList = [];
    for (const def of definitions) {
        // Filter: only rdfs:Class entries
        const type = Array.isArray(def['@type']) ? def['@type'] : [def['@type']];
        if (!type.includes('rdfs:Class')) continue;

const id = def['@id'];
const rawLabel = extractStringValue(def['rdfs:label']) || id.split(':')[1] || id;
const label = humanizeLabel(rawLabel);
        const comment = extractStringValue(def['rdfs:comment']) || '';
        const subClassOf = def['rdfs:subClassOf']?.['@id'] || null;
        const priority = def.priority || 'medium';
        classesMap.set(id, { id, label, comment, subClassOf, priority });
        classList.push({ id, label, comment, subClassOf, priority });
    }
}

/* ------------------------- PROPERTY PROCESSING ------------------------- */
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

/* ------------------------- SCORING & RECOMMENDATION ------------------------- */
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

/* ------------------------- PAGE CONTEXT DETECTION ------------------------- */
function detectPageContext() {
    return {
        hasImages: document.querySelectorAll('img').length > 0,
        hasAddress: !!document.querySelector('[itemprop="address"]') || document.body.innerText.match(/\d{5}/) !== null,
        hasPrice: document.body.innerText.match(/\$\d+|\€\d+/) !== null,
        hasArticle: !!document.querySelector('article') || !!document.querySelector('[itemtype*="Article"]'),
        hasProduct: !!document.querySelector('[itemtype*="Product"]')
    };
}

function suggestSchemaType() {
    const ctx = detectPageContext();
    if (ctx.hasArticle) return 'schema:Article';
    if (ctx.hasProduct) return 'schema:Product';
    if (ctx.hasAddress) return 'schema:LocalBusiness';
    return 'schema:WebPage';
}

/* ------------------------- PAGE TYPE MAPPING ------------------------- */
const PAGE_TYPE_MAP = {
    'All': () => classList.map(c => c.id),
    
    
    'Homepage': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:LocalBusiness',
        'schema:BreadcrumbList',
        'schema:SpeakableSpecification',
        'schema:Corporation',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:EducationalOrganization',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Person',
        'schema:EmployeeRole',
        'schema:Article',
        'schema:NewsArticle',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:Review',
        'schema:Comment',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:Movie',
        'schema:TVSeries',
        'schema:Product',
        'schema:Service',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:SaleEvent',
        'schema:Festival',
        'schema:TheaterEvent',
        'schema:Place',
        'schema:CivicStructure',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:LandmarksOrHistoricalBuildings',
        'schema:Airport',
        'schema:Park',
        'schema:Museum',
        'schema:StadiumOrArena',
        'schema:Hospital',
        'schema:ItemList',
        'schema:Menu',
        'schema:MenuItem',
        'schema:InteractionCounter',
        'schema:LikeAction',
        'schema:FollowAction',
        'schema:ShareAction',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:HowTo',
        'schema:Recipe',
        'schema:JobPosting',
        'schema:Game',
        'schema:VideoGame',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:MusicGroup',
        'schema:Book',
        'schema:Dataset',
        'schema:Vehicle',
        'schema:Car'
    ],


    'Landing Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:Service',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Person',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:Review',
        'schema:VideoObject',
        'schema:ImageObject',
        'schema:Article',
        'schema:HowTo',
        'schema:Recipe',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:SaleEvent',
        'schema:Festival',
        'schema:TheaterEvent',
        'schema:BreadcrumbList',
        'schema:ItemList',
        'schema:FAQPage',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:Place',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:LandmarksOrHistoricalBuildings',
        'schema:Airport',
        'schema:Park',
        'schema:Museum',
        'schema:StadiumOrArena',
        'schema:EducationalOrganization',
        'schema:LearningResource',
        'schema:CourseInstance',
        'schema:JobPosting',
        'schema:SpeakableSpecification',
        'schema:InteractionCounter'
    ],


    'Blog (Blog Listing)': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:CollectionPage',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:Article',
        'schema:NewsArticle',
        'schema:AnalysisNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:Report',
        'schema:Review',
        'schema:CriticReview',
        'schema:Comment',
        'schema:Organization',
        'schema:Corporation',
        'schema:Person',
        'schema:Brand',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:BreadcrumbList',
        'schema:ItemList',
        'schema:AggregateRating',
        'schema:InteractionCounter',
        'schema:SpeakableSpecification'
    ],


    'Blog Post / Article': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:Person',
        'schema:Article',
        'schema:NewsArticle',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:AnalysisNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:Report',
        'schema:Review',
        'schema:CriticReview',
        'schema:Comment',
        'schema:CreativeWork',
        'schema:AudioObject',
        'schema:VideoObject',
        'schema:Movie',
        'schema:ImageObject',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:HowTo',
        'schema:SpeakableSpecification',
        'schema:Recipe',
        'schema:Event',
        'schema:Book',
        'schema:LearningResource',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:VideoGame',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:InteractionCounter'
    ],


    'News Article': [
        'schema:NewsArticle',
        'schema:AnalysisNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:Report',
        'schema:Article',
        'schema:WebPage',
        'schema:WebSite',
        'schema:Organization',
        'schema:Corporation',
        'schema:Person',
        'schema:Brand',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:Clip',
        'schema:Place',
        'schema:Event',
        'schema:Product',
        'schema:Review',
        'schema:CriticReview',
        'schema:Comment',
        'schema:AggregateRating',
        'schema:BreadcrumbList',
        'schema:SpeakableSpecification',
        'schema:InteractionCounter',
        'schema:LikeAction',
        'schema:DislikeAction',
        'schema:ShareAction',
        'schema:CommentAction'
    ],


    'Category / Archive': [
        'schema:WebPage',
        'schema:CollectionPage',
        'schema:SearchResultsPage',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:Blog',
        'schema:CreativeWorkSeries',
        'schema:DataCatalog'
    ],


    'FAQ Page': [
        'schema:WebSite',
        'schema:FAQPage',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:EducationalOrganization',
        'schema:Hospital',
        'schema:Person',
        'schema:Product',
        'schema:Brand',
        'schema:Service',
        'schema:BreadcrumbList',
        'schema:QAPage'
    ],


    'How‑To Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:HowTo',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:Person',
        'schema:Brand',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:Clip',
        'schema:AudioObject',
        'schema:Product',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:AggregateRating',
        'schema:Review',
        'schema:Comment',
        'schema:CreativeWork',
        'schema:Article',
        'schema:BlogPosting',
        'schema:Recipe',
        'schema:PropertyValue',
        'schema:SpeakableSpecification'
    ],


    'Documentation / Knowledge Base': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:AboutPage',
        'schema:ContactPage',
        'schema:FAQPage',
        'schema:QAPage',
        'schema:Article',
        'schema:NewsArticle',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:AnalysisNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:Report',
        'schema:CreativeWork',
        'schema:DigitalDocument',
        'schema:HowTo',
        'schema:Recipe',
        'schema:LearningResource',
        'schema:Book',
        'schema:Dataset',
        'schema:DataCatalog',
        'schema:DataDownload',
        'schema:SoftwareApplication',
        'schema:WebApplication',
        'schema:APIReference',
        'schema:Code',
        'schema:ComputerLanguage',
        'schema:SoftwareSourceCode',
        'schema:TechArticle'
    ],


    'Product Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:MerchantReturnPolicy',
        'schema:SizeSpecification',
        'schema:PropertyValue',
        'schema:mpn',
        'schema:gtin',
        'schema:sku',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:DeliveryTimeSettings',
        'schema:Demand',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:Review',
        'schema:CriticReview',
        'schema:Comment',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:3DModel',
        'schema:HowTo',
        'schema:Recipe',
        'schema:Vehicle',
        'schema:Car',
        'schema:Book',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:Game',
        'schema:VideoGame',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:Drug',
        'schema:DoseSchedule',
        'schema:Diet'
    ],


    'E‑commerce Category': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:CollectionPage',
        'schema:SearchResultsPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:MerchantReturnPolicy',
        'schema:SizeSpecification',
        'schema:PropertyValue',
        'schema:mpn',
        'schema:gtin',
        'schema:sku',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:DeliveryTimeSettings',
        'schema:Demand',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:Review',
        'schema:CriticReview',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:SpeakableSpecification',
        'schema:Vehicle',
        'schema:Car',
        'schema:WebPageElement',
        'schema:InteractionCounter'
    ],


    'CheckoutPage': [
        'schema:WebSite',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:MerchantReturnPolicy',
        'schema:SizeSpecification',
        'schema:PropertyValue',
        'schema:mpn',
        'schema:gtin',
        'schema:sku',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:DeliveryTimeSettings',
        'schema:Demand',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:Person',
        'schema:ImageObject',
        'schema:Review',
        'schema:PaymentService',
        'schema:CreditCard',
        'schema:Invoice'
    ],


    'Reservation, Order': [
        'schema:Flight',
        'schema:FlightReservation',
        'schema:HotelRoom',
        'schema:LodgingReservation',
        'schema:TrainTrip',
        'schema:BusTrip',
        'schema:TouristTrip',
        'schema:Car',
        'schema:TaxiReservation',
        'schema:Invoice',
        'schema:Trip',
        'schema:BoatTrip',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:SaleEvent',
        'schema:Festival',
        'schema:TheaterEvent',
        'schema:CourseInstance',
        'schema:EventSeries',
        'schema:Product',
        'schema:Offer',
        'schema:Service',
        'schema:FoodEstablishmentReservation'
    ],


    'Service Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Service',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:TravelAgency',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:Person',
        'schema:EmployeeRole',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Review',
        'schema:Brand',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:HowTo',
        'schema:FAQPage',
        'schema:BreadcrumbList',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:Place',
        'schema:SpeakableSpecification'
    ],


    'About Us': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:AboutPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Person',
        'schema:EmployeeRole',
        'schema:Brand',
        'schema:Place',
        'schema:EducationalOrganization',
        'schema:SpeakableSpecification',
        'schema:ImageObject',
        'schema:VideoObject'
    ],


    'Contact Us': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:ContactPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Person',
        'schema:Place',
        'schema:CivicStructure',
        'schema:EducationalOrganization',
        'schema:Hospital',
        'schema:PostalAddress',
        'schema:ContactPoint',
        'schema:Message',
        'schema:CommunicateAction'
    ],


    'ProfilePage + Person': [
        'schema:Person',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:EducationalOrganization',
        'schema:EmployeeRole',
        'schema:Brand',
        'schema:ImageObject',
        'schema:AudioObject',
        'schema:VideoObject',
        'schema:Article',
        'schema:NewsArticle',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:Review',
        'schema:CriticReview',
        'schema:CreativeWork',
        'schema:Book',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:MusicGroup',
        'schema:Movie',
        'schema:VideoGame',
        'schema:SoftwareApplication',
        'schema:WebApplication',
        'schema:MobileApplication',
        'schema:Place',
        'schema:PostalAddress',
        'schema:ContactPoint',
        'schema:Occupation',
        'schema:EducationEvent',
        'schema:Event',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateRating',
        'schema:InteractionCounter',
        'schema:SpeakableSpecification'
    ],


    'Local Business Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:ContactPage',
        'schema:FAQPage',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:Service',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Person',
        'schema:EmployeeRole',
        'schema:Article',
        'schema:BlogPosting',
        'schema:Review',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:MerchantReturnPolicy',
        'schema:JobPosting',
        'schema:PropertyValue',
        'schema:PriceSpecification',
        'schema:BreadcrumbList',
        'schema:HowTo',
        'schema:Recipe',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:Place',
        'schema:Hospital',
        'schema:Menu',
        'schema:MenuItem',
        'schema:InteractionCounter'
    ],


    'Event Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:EducationalOrganization',
        'schema:Person',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:SaleEvent',
        'schema:Festival',
        'schema:TheaterEvent',
        'schema:CourseInstance',
        'schema:EventSeries',
        'schema:Place',
        'schema:CivicStructure',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:LandmarksOrHistoricalBuildings',
        'schema:Airport',
        'schema:Park',
        'schema:Museum',
        'schema:StadiumOrArena',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Review',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:BreadcrumbList',
        'schema:Brand',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:MusicGroup',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:PerformingGroup'
    ],


    'Course Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:EducationalOrganization',
        'schema:Person',
        'schema:Course',
        'schema:CourseInstance',
        'schema:LearningResource',
        'schema:EducationEvent',
        'schema:Article',
        'schema:BlogPosting',
        'schema:Review',
        'schema:AggregateRating',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:Brand',
        'schema:VideoObject',
        'schema:ImageObject',
        'schema:AudioObject',
        'schema:BreadcrumbList',
        'schema:ItemList',
        'schema:FAQPage',
        'schema:HowTo',
        'schema:SpeakableSpecification',
        'schema:Occupation',
        'schema:PropertyValue'
    ],


    'Video Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:Person',
        'schema:VideoObject',
        'schema:Movie',
        'schema:TVSeries',
        'schema:Episode',
        'schema:Clip',
        'schema:CreativeWork',
        'schema:AudioObject',
        'schema:ImageObject',
        'schema:Brand',
        'schema:AggregateRating',
        'schema:Review',
        'schema:Comment',
        'schema:InteractionCounter',
        'schema:BreadcrumbList',
        'schema:ItemList',
        'schema:Article',
        'schema:BlogPosting',
        'schema:Event',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:Product',
        'schema:Offer',
        'schema:HowTo',
        'schema:Recipe',
        'schema:LearningResource',
        'schema:Course',
        'schema:WebPageElement',
        'schema:EntryPoint',
        'schema:SpeakableSpecification'
    ],


    'Podcast Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:CollectionPage',
        'schema:ProfilePage',
        'schema:Organization',
        'schema:Corporation',
        'schema:Person',
        'schema:CreativeWork',
        'schema:CreativeWorkSeries',
        'schema:PodcastSeries',
        'schema:PodcastEpisode',
        'schema:AudioObject',
        'schema:AudioObjectSnapshot',
        'schema:Clip',
        'schema:Brand',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:SpeakableSpecification',
        'schema:ImageObject',
        'schema:Review',
        'schema:AggregateRating',
        'schema:Comment',
        'schema:LikeAction',
        'schema:DislikeAction',
        'schema:FollowAction',
        'schema:ShareAction',
        'schema:CommentAction',
        'schema:InteractionCounter',
        'schema:WebPageElement',
        'schema:EntryPoint'
    ],


    'Movie, TVSeries, TVEpisode': [
        'schema:VideoObject',
        'schema:Movie',
        'schema:TVSeries',
        'schema:Episode',
        'schema:Clip',
        'schema:CreativeWork',
        'schema:CreativeWorkSeries',
        'schema:Person',
        'schema:Organization',
        'schema:Corporation',
        'schema:Brand',
        'schema:Review',
        'schema:CriticReview',
        'schema:Comment',
        'schema:AggregateRating',
        'schema:Offer',
        'schema:ImageObject',
        'schema:AudioObject',
        'schema:MusicRecording',
        'schema:MusicGroup',
        'schema:Event',
        'schema:Place',
        'schema:Country',
        'schema:Language',
        'schema:InteractionCounter',
        'schema:EntryPoint',
        'schema:BreadcrumbList',
        'schema:ItemList',
        'schema:WebPage',
        'schema:WebSite'
    ],


    'MusicAlbum, MusicRecording': [
        'schema:Person',
        'schema:Organization',
        'schema:MusicGroup',
        'schema:Brand',
        'schema:AggregateRating',
        'schema:Review',
        'schema:CriticReview',
        'schema:Comment',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:PropertyValue',
        'schema:ImageObject',
        'schema:AudioObject',
        'schema:VideoObject',
        'schema:Clip',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:Event',
        'schema:MusicEvent',
        'schema:Place',
        'schema:ItemList',
        'schema:LikeAction',
        'schema:DislikeAction',
        'schema:ShareAction',
        'schema:InteractionCounter'
    ],


    'Book': [
        'schema:Person',
        'schema:Organization',
        'schema:Corporation',
        'schema:EducationalOrganization',
        'schema:Brand',
        'schema:Review',
        'schema:CriticReview',
        'schema:AggregateRating',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:PropertyValue',
        'schema:ImageObject',
        'schema:AudioObject',
        'schema:VideoObject',
        'schema:Comment',
        'schema:InteractionCounter',
        'schema:LikeAction',
        'schema:DislikeAction',
        'schema:ShareAction',
        'schema:CommentAction',
        'schema:Place',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:SaleEvent',
        'schema:ItemList',
        'schema:WebPage',
        'schema:AboutPage',
        'schema:ContactPage',
        'schema:FAQPage',
        'schema:ProfilePage',
        'schema:QAPage',
        'schema:CheckoutPage',
        'schema:CollectionPage',
        'schema:SearchResultsPage',
        'schema:WebPageElement',
        'schema:EntryPoint'
    ],


    'Recipe': [
        'schema:Person',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:AggregateRating',
        'schema:Review',
        'schema:Comment',
        'schema:NutritionInformation',
        'schema:HowToStep',
        'schema:HowToSection',
        'schema:ItemList',
        'schema:PropertyValue',
        'schema:Brand',
        'schema:Place',
        'schema:CreativeWork',
        'schema:Article',
        'schema:BlogPosting'
    ],


    'Review Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:Service',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Person',
        'schema:Article',
        'schema:NewsArticle',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:DiscussionForumPosting',
        'schema:AnalysisNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:Report',
        'schema:Review',
        'schema:CriticReview',
        'schema:CreativeWork',
        'schema:CreativeWorkSeries',
        'schema:DigitalDocument',
        'schema:AudioObject',
        'schema:VideoObject',
        'schema:Movie',
        'schema:TVSeries',
        'schema:Episode',
        'schema:ImageObject',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:Book',
        'schema:Place',
        'schema:CivicStructure',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:LandmarksOrHistoricalBuildings',
        'schema:Airport',
        'schema:Park',
        'schema:Museum',
        'schema:StadiumOrArena',
        'schema:MedicalCondition',
        'schema:Hospital',
        'schema:Diet',
        'schema:Drug',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:HotelRoom',
        'schema:Car',
        'schema:Game',
        'schema:VideoGame',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:Vehicle',
        'schema:Menu',
        'schema:MenuItem',
        'schema:EducationalOrganization',
        'schema:LearningResource',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:SaleEvent',
        'schema:Festival',
        'schema:TheaterEvent',
        'schema:CourseInstance'
    ],


    'Comparison Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:Brand',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Review',
        'schema:CriticReview',
        'schema:Rating',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:Service',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:Vehicle',
        'schema:Car',
        'schema:Hotel',
        'schema:Restaurant',
        'schema:Book',
        'schema:Movie',
        'schema:VideoGame',
        'schema:Game',
        'schema:MusicAlbum',
        'schema:CreativeWork',
        'schema:Place',
        'schema:LodgingBusiness',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:PriceSpecification',
        'schema:PropertyValue',
        'schema:ImageObject',
        'schema:VideoObject'
    ],


    'Portfolio / Project': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:CollectionPage',
        'schema:CreativeWork',
        'schema:CreativeWorkSeries',
        'schema:DigitalDocument',
        'schema:Article',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:Report',
        'schema:AudioObject',
        'schema:VideoObject',
        'schema:Movie',
        'schema:ImageObject',
        'schema:Clip',
        'schema:Drawing',
        'schema:3DModel',
        'schema:Product',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:APIReference',
        'schema:Code',
        'schema:SoftwareSourceCode',
        'schema:ComputerLanguage',
        'schema:Dataset',
        'schema:DataCatalog',
        'schema:DataDownload',
        'schema:Book',
        'schema:LearningResource',
        'schema:Game',
        'schema:VideoGame',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:Brand',
        'schema:ItemList',
        'schema:HowTo',
        'schema:Recipe',
        'schema:Event',
        'schema:EventSeries'
    ],


    'Software / App Page': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:Person',
        'schema:Article',
        'schema:BlogPosting',
        'schema:Review',
        'schema:CriticReview',
        'schema:Comment',
        'schema:CreativeWork',
        'schema:VideoObject',
        'schema:ImageObject',
        'schema:Product',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Brand',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:APIReference',
        'schema:Code',
        'schema:SoftwareSourceCode',
        'schema:ComputerLanguage',
        'schema:HowTo',
        'schema:FAQPage',
        'schema:QAPage',
        'schema:BreadcrumbList',
        'schema:ItemList',
        'schema:SpeakableSpecification',
        'schema:LikeAction',
        'schema:DislikeAction',
        'schema:FollowAction',
        'schema:ShareAction',
        'schema:CommentAction',
        'schema:InteractionCounter',
        'schema:EntryPoint',
        'schema:VideoGame',
        'schema:Game'
    ],


    'RealEstateListing': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:RealEstateAgent',
        'schema:Person',
        'schema:Place',
        'schema:CivicStructure',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:PropertyValue',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:Review',
        'schema:Rating',
        'schema:PostalAddress',
        'schema:GeoCoordinates',
        'schema:QuantitativeValue',
        'schema:FloorPlan',
        'schema:Accommodation',
        'schema:Apartment',
        'schema:House',
        'schema:SingleFamilyResidence'
    ],


    'Hotel, LodgingBusiness': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:AboutPage',
        'schema:ContactPage',
        'schema:FAQPage',
        'schema:Organization',
        'schema:LocalBusiness',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Place',
        'schema:CivicStructure',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:Person',
        'schema:EmployeeRole',
        'schema:Service',
        'schema:Offer',
        'schema:AggregateOffer',
        'schema:AggregateRating',
        'schema:Review',
        'schema:Brand',
        'schema:PropertyValue',
        'schema:PriceSpecification',
        'schema:UnitPriceSpecification',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:HotelRoom',
        'schema:LodgingReservation',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:SaleEvent',
        'schema:Menu',
        'schema:MenuItem',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Article',
        'schema:BlogPosting',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:SpeakableSpecification',
        'schema:InteractionCounter',
        'schema:EntryPoint'
    ],


    'DiscussionForumPosting': [
        'schema:Person',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:EducationalOrganization',
        'schema:Comment',
        'schema:ImageObject',
        'schema:VideoObject',
        'schema:AudioObject',
        'schema:AggregateRating',
        'schema:InteractionCounter',
        'schema:WebPageElement'
    ],


    'MedicalWebPage, HealthTopicContent': [
        'schema:WebSite',
        'schema:WebPage',
        'schema:MedicalWebPage',
        'schema:HealthTopicContent',
        'schema:Organization',
        'schema:MedicalOrganization',
        'schema:Hospital',
        'schema:Dentist',
        'schema:Person',
        'schema:Article',
        'schema:MedicalScholarlyArticle',
        'schema:Review',
        'schema:CreativeWork',
        'schema:VideoObject',
        'schema:ImageObject',
        'schema:AudioObject',
        'schema:MedicalCondition',
        'schema:MedicalCause',
        'schema:MedicalProcedure',
        'schema:MedicalTest',
        'schema:Diet',
        'schema:Drug',
        'schema:DoseSchedule',
        'schema:OccupationalTherapy',
        'schema:PhysicalTherapy',
        'schema:BreadcrumbList',
        'schema:HowTo',
        'schema:SpeakableSpecification',
        'schema:ItemList',
        'schema:WebPageElement',
        'schema:InteractionCounter'
    ],


    'SearchResultsPage': [
        'schema:WebSite',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:Service',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:Person',
        'schema:Article',
        'schema:NewsArticle',
        'schema:Blog',
        'schema:BlogPosting',
        'schema:AnalysisNewsArticle',
        'schema:BackgroundNewsArticle',
        'schema:Report',
        'schema:Review',
        'schema:CriticReview',
        'schema:CreativeWork',
        'schema:CreativeWorkSeries',
        'schema:VideoObject',
        'schema:Movie',
        'schema:TVSeries',
        'schema:Episode',
        'schema:ImageObject',
        'schema:Product',
        'schema:Brand',
        'schema:JobPosting',
        'schema:ItemList',
        'schema:BreadcrumbList',
        'schema:Recipe',
        'schema:Event',
        'schema:BusinessEvent',
        'schema:EducationEvent',
        'schema:MusicEvent',
        'schema:SportsEvent',
        'schema:SaleEvent',
        'schema:Festival',
        'schema:TheaterEvent',
        'schema:CourseInstance',
        'schema:EventSeries',
        'schema:EducationalOrganization',
        'schema:LearningResource',
        'schema:Book',
        'schema:Place',
        'schema:CivicStructure',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:LandmarksOrHistoricalBuildings',
        'schema:Airport',
        'schema:Park',
        'schema:Museum',
        'schema:StadiumOrArena',
        'schema:Dataset',
        'schema:DataCatalog',
        'schema:SoftwareApplication',
        'schema:MobileApplication',
        'schema:WebApplication',
        'schema:Trip',
        'schema:Flight',
        'schema:HotelRoom',
        'schema:TrainTrip',
        'schema:BusTrip',
        'schema:TouristTrip',
        'schema:Car',
        'schema:Game',
        'schema:VideoGame',
        'schema:MusicRecording',
        'schema:MusicAlbum',
        'schema:MusicGroup',
        'schema:Vehicle',
        'schema:BoatTrip',
        'schema:Menu'
    ],


    'Job Posting': [
        'schema:JobPosting',
        'schema:Organization',
        'schema:Corporation',
        'schema:LocalBusiness',
        'schema:ProfessionalService',
        'schema:FinancialService',
        'schema:MedicalOrganization',
        'schema:Dentist',
        'schema:LegalService',
        'schema:AccountingService',
        'schema:AutoRepair',
        'schema:AutomotiveBusiness',
        'schema:BeautySalon',
        'schema:Store',
        'schema:ComputerStore',
        'schema:ElectronicsStore',
        'schema:FurnitureStore',
        'schema:GroceryStore',
        'schema:HardwareStore',
        'schema:HealthClub',
        'schema:HomeAndConstructionBusiness',
        'schema:InternetCafe',
        'schema:Locksmith',
        'schema:NailSalon',
        'schema:RealEstateAgent',
        'schema:Restaurant',
        'schema:CafeOrCoffeeShop',
        'schema:Bakery',
        'schema:TravelAgency',
        'schema:LodgingBusiness',
        'schema:Hotel',
        'schema:BedAndBreakfast',
        'schema:EducationalOrganization',
        'schema:Place',
        'schema:CivicStructure',
        'schema:TouristAttraction',
        'schema:TouristDestination',
        'schema:LandmarksOrHistoricalBuildings',
        'schema:Airport',
        'schema:Park',
        'schema:Museum',
        'schema:StadiumOrArena',
        'schema:Hospital',
        'schema:PropertyValue',
        'schema:MonetaryAmount',
        'schema:QuantitativeValue',
        'schema:Occupation'
    ]


};

function getAllowedClassIds(pageType) {
    const entry = PAGE_TYPE_MAP[pageType];
    if (typeof entry === 'function') return entry();
    return entry || [];
}

/* ------------------------- WIZARD STATE & STEPS ------------------------- */
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
let currentSearchQuery = '';

/* ------------------------- UI RENDERING FUNCTIONS ------------------------- */
function getPriorityBadge(priority, classId) {
    if (priority === 'high' || TRENDING_CLASS_IDS.has(classId)) {
        return '<span class="trending-badge" style="background: rgba(224,164,20,0.12); color: #E0A414; font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 500;">Trending</span>';
    }
    return '';
}

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

/* ---------- STEP 1: SELECT TYPE ---------- */
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
    currentSearchQuery = '';
    renderClassGrid(wizardState.activePageType);

    document.getElementById('classSearch').addEventListener('input', debounce((e) => {
        currentDisplayLimit = 20;
        renderClassGrid(wizardState.activePageType, e.target.value);
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

/**
 * Renders the schema class cards. Optional query filters by label/comment.
 */
function renderClassGrid(pageType, query = null) {
    if (query !== null) currentSearchQuery = query;
    const grid = document.getElementById('classGrid');
    const allowedIds = getAllowedClassIds(pageType);
    let baseList = allowedIds.length ? classList.filter(cls => allowedIds.includes(cls.id)) : classList;

    // Filter by search query
    let filtered = baseList;
    if (currentSearchQuery.trim()) {
        const q = currentSearchQuery.toLowerCase();
        filtered = baseList.filter(cls =>
            cls.label.toLowerCase().includes(q) ||
            (cls.comment && cls.comment.toLowerCase().includes(q))
        );
    }
    currentFilteredList = filtered;
    const total = filtered.length;
    const hasMore = total > currentDisplayLimit;
    const visibleClasses = filtered.slice(0, currentDisplayLimit);

grid.innerHTML = visibleClasses.map(cls => {
    const isSelected = wizardState.selectedClasses.includes(cls.id);
    const selectedClass = isSelected ? 'selected' : '';

    // تمیز کردن توضیحات
    const cleanComment = cls.comment ? cls.comment.replace(/<[^>]*>/g, '') : '';
    const shortComment = cleanComment.length > 80 ? cleanComment.substring(0, 80) + '...' : cleanComment;

    return `
    <div class="class-card ${selectedClass}" data-id="${cls.id}">
        <div class="class-name" style="display: flex; justify-content: space-between; align-items: center;">
            <span>${cls.label}</span>
            ${getPriorityBadge(cls.priority, cls.id)}
        </div>
        <div class="class-desc">${shortComment}</div>
    </div>`;
}).join('');

    attachClassCardEvents(grid);

    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        if (hasMore) {
            loadMoreContainer.innerHTML = `<button id="loadMoreBtn" class="minimal-btn">Load more (${total - currentDisplayLimit} remaining)</button>`;
            document.getElementById('loadMoreBtn').addEventListener('click', () => {
                currentDisplayLimit += 20;
                renderClassGrid(pageType);
            });
        } else {
            loadMoreContainer.innerHTML = '';
        }
    }
}

function attachClassCardEvents(grid) {
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
}

/* ---------- STEP 2: FILL PROPERTIES ---------- */
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
    const tabs = document.querySelectorAll('.schema-tab');
    tabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showTab(idx);
        });
    });
}

/* ---------- STEP 3: REVIEW ---------- */
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

/* ---------- NAVIGATION ---------- */
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

/* ------------------------- JSON-LD GENERATION ------------------------- */
function generateJSONLD() {
    const graph = [];
    for (const clsId of wizardState.selectedClasses) {
        const cls = classesMap.get(clsId);
        const typeName = cls ? (cls.rawLabel || cls.label) : 'Thing';
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

/* ------------------------- PAGE TABS RENDERING ------------------------- */
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
            currentSearchQuery = '';
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

/* ------------------------- INITIALIZATION & EVENT LISTENERS ------------------------- */
async function initApp() {
    const statusText = document.getElementById('statusText');
    const loadingStatus = document.getElementById('loadingStatus');
    const statsInfo = document.getElementById('statsInfo');
    const retryBtn = document.getElementById('manualRetryBtn');
    try {
        statusText.textContent = 'Loading local schema definitions...';
        buildClassesFromLocalDefinitions();

        if (classList.length === 0) {
            throw new Error('Semora300.js not loaded or schemaDefinitions not set. Please check the script order and add window.schemaDefinitions = schemaAllData["@graph"]; to the end of semora300.js');
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
    currentSearchQuery = '';
    currentDisplayLimit = 20;
    renderStepIndicator();
    renderStep();
});
document.getElementById('manualRetryBtn').addEventListener('click', initApp);

initApp();