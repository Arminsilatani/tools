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

// ==================== IndexedDB ====================
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

// ==================== CUSTOM HOMEPAGE DESCRIPTIONS ====================
const HOMEPAGE_DESCRIPTIONS = {
    "schema:WebSite": "Use this for your whole website. It tells Google your site name, search box, and what language you use. Good to put on your homepage so search engines understand your site as a whole.",
    "schema:Organization": "For a company, charity, or any group. Add your logo, contact phone, address, and social media links. Helps people find official info about who runs the website.",
    "schema:WebPage": "Any normal page that isn’t a product or article. Just says “this is a webpage” and can show when it was last updated. Use when no other type fits.",
    "schema:Person": "For a real human – author, artist, CEO, or yourself. Add name, birth date, social profiles, and job title. Great for “About me” pages or author bios.",
    "schema:ImageObject": "Every picture on your site gets this. Add caption, who took it, license, and what’s shown. Helps images appear in Google Image search with extra details.",
    "schema:VideoObject": "For any video file – YouTube embed or self-hosted. Add title, description, duration, thumbnail URL. Makes Google show a video preview right in search results.",
    "schema:AudioObject": "Podcasts, music, or any sound clip. Include length, creator, and a transcript if possible. Helps audio content get discovered in Google and podcast apps.",
    "schema:Article": "For news stories, blog posts, or any written piece. Shows headline, author, and publish date in search. Use this as the main type for most written content.",
    "schema:NewsArticle": "Same as Article but for timely, breaking news. Tells Google this is fresh and important. Good for newspapers or sites that cover current events daily.",
    "schema:BlogPosting": "For blog entries exactly. Same fields as Article but more specific. Helps search engines know this is personal or company blog content, not hard news.",
    "schema:FAQPage": "A page with questions and answers. Mark each Q&A separately. Google can show your FAQ directly in search results, saving users a click.",
    "schema:BreadcrumbList": "Shows the navigation path like Home > Products > Shoes. Helps users know where they are and helps Google understand your site structure.",
    "schema:Product": "Anything you sell – price, availability, reviews, and shipping info. Makes shopping results show stars, stock status, and price clearly.",
    "schema:Offer": "Use inside Product to describe a specific deal: price, currency, and conditions. One product can have multiple offers (e.g., new vs refurbished).",
    "schema:AggregateOffer": "When you show a range like “from $10” or “lowest $5 – highest $20”. Groups multiple offers together for search results.",
    "schema:Review": "One customer’s opinion. Add rating out of 5 or 10, the review text, and the reviewer’s name. Works for products, restaurants, or services.",
    "schema:AggregateRating": "Average score from many people – for example, 4.2 stars based on 300 reviews. Shows up as stars in search snippets and builds trust.",
    "schema:Event": "Concerts, webinars, sales, or meetups. Include start date, location, ticket price, and online link. Helps people find things happening near them or online.",
    "schema:SearchAction": "Lets people search your site directly from Google results. They type a query, click, and land on your search page with results.",
    "schema:EntryPoint": "Points to a specific action like “Buy now”, “Sign up”, or “Download”. Works together with Action schemas to show buttons in search.",
    "schema:LocalBusiness": "For any shop, cafe, or office with a physical location. Add address, phone number, and opening hours. Helps nearby customers find you on Google Maps.",
    "schema:Store": "A generic retail store – clothing, electronics, or grocery. Use if there isn’t a more specific type like ClothingStore. Just shows it’s a place that sells things.",
    "schema:Restaurant": "For places serving food. Add menu, cuisine type (Italian, sushi), price range ($ to $$$), and reservation link. Helps hungry people choose.",
    "schema:FoodEstablishment": "Parent type for Restaurant, Cafe, Bakery. Use for any business that prepares and sells food to customers, whether dine‑in or takeout.",
    "schema:BankOrCreditUnion": "For financial places where people deposit money, get loans, or open accounts. Include interest rates, branch locator, and routing number.",
    "schema:FinancialService": "Wider than bank – includes insurance agents, accountants, investment advisors, and tax preparers. Shows you handle money or finance help.",
    "schema:InsuranceAgency": "For companies or agents selling car, home, health, or life insurance policies. Add types offered, quotes, and contact info.",
    "schema:AutomotiveBusiness": "Any car‑related business: dealers, repair shops, auto washes, or parts stores. Use this to group all vehicle services on your site.",
    "schema:Hotel": "For places that rent rooms overnight. Show star rating, amenities (pool, wifi), check‑in time, and price range. Helps travelers compare.",
    "schema:JobPosting": "A job opening at your company. Add title, salary range, location, and application deadline. Shows up in Google Jobs with extra visibility.",
    "schema:Course": "For online or offline classes. Use with EducationalOrganization. Include course length, syllabus, certificate offered, and price. Helps students find learning.",
    "schema:EducationalOccupationalProgram": "A full study program like a bachelor’s degree or coding bootcamp. Shows admission requirements, duration, and what job you qualify for after.",
    "schema:Recipe": "Cooking instructions with ingredients, steps, cooking time, and nutrition info. Makes fancy search results with photos, ratings, and calorie count.",
    "schema:HowTo": "Step‑by‑step guide for anything – DIY, makeup, car repair. Each step can have text, images, and videos. Great for tutorials.",
    "schema:HowToStep": "One single instruction inside a HowTo. Contains the direction, maybe an image, and how long that step takes. Use multiple of these in order.",
    "schema:HowToSection": "Groups several steps under a heading (e.g., “Tools needed” or “Preparing the surface”). Keeps your HowTo organized and easy to follow.",
    "schema:RealEstateListing": "For a house or apartment for sale or rent. Show price, bedrooms, bathrooms, square feet, photos, and agent contact. Helps buyers and renters.",
    "schema:SpecialAnnouncement": "For urgent updates like COVID‑19 info, store closures, or health alerts. Makes your announcement stand out in search with a warning badge.",
    "schema:Dataset": "A collection of data – CSV, Excel, or API. Describe what the data is about, who made it, license, and how to download. Great for researchers.",
    "schema:DataCatalog": "Lists multiple datasets on your site. Like a library index for data files. Helps users find the right dataset without digging through folders.",
    "schema:ContactPoint": "A phone number, email address, or chat link for customer support. Can be used inside Organization, LocalBusiness, or even a Person.",
    "schema:PostalAddress": "Full mailing address with street, city, postal code, and country. Use inside Organization, LocalBusiness, or Person for clear location data.",
    "schema:OpeningHoursSpecification": "Tells when a place is open – for example, Mon‑Fri 9am‑5pm, Sat 10am‑2pm. Works with LocalBusiness, Restaurant, or any shop.",
    "schema:Certification": "A credential someone earned – like “Google Certified Professional” or “ISO 9001”. Shows that a person or company has special qualification.",
    "schema:Grant": "Money given for research, projects, or scholarships. Use for government grants, foundation funding, or academic awards. Include amount and deadline.",
    "schema:ClaimReview": "Fact‑checking content. Tells Google that someone checked a statement and marked it true, false, or unclear. Usually used by news fact‑checkers.",
    "schema:MediaReview": "Ratings for movies, games, or products from a trusted critic (not random users). Shows the critic’s name, score, and review link.",
    "schema:SpeakableSpecification": "Highlights parts of an article that can be read aloud by voice assistants like Alexa or Google Assistant. Good for news and blog posts.",
    "schema:ItemList": "A simple list of items – top 10 movies, products in a category, or playlist steps. Helps Google understand order and importance.",
    "schema:3DModel": "For 3D files like glTF or STL. Use on product pages or archive sites. Google might show a “View in 3D” badge next to your result.",
    "schema:AboutPage": "Marks a page that explains your company, mission, or team. Helps search engines not confuse it with blog posts or product pages.",
    "schema:AcceptAction": "When a user agrees to something – like accepting terms of service or a cookie consent. Usually part of a workflow with Action schemas.",
    "schema:Accommodation": "A place to sleep – hotel room, apartment, hostel bed, or campsite. Includes number of beds, room type (smoking or not), and amenities.",
    "schema:AccountingService": "For tax preparers, bookkeepers, or CPA firms. Include service area, pricing model (hourly or flat fee), and software expertise like QuickBooks.",
    "schema:AchieveAction": "When someone completes a goal – finishing a game level, a course, or a fitness challenge. Not common on normal websites.",
    "schema:ActionAccessSpecification": "Describes what someone needs to perform an action – for example, minimum age, a paid subscription, or being in a certain city.",
    "schema:ActivateAction": "Triggered when a user activates a membership, a software license, or a new account. Good for confirmation pages after signup.",
    "schema:AddAction": "User adds something to a collection – like “add to cart”, “add to playlist”, or “save for later”. Tracks that specific button click.",
    "schema:AdministrativeArea": "A region like a state, province, or city. Use inside addresses or service areas to show where a business operates.",
    "schema:AdultEntertainment": "For content that is pornographic or sexually explicit. Use only if your site truly fits this category. Many search engines restrict it.",
    "schema:AdvertiserContentArticle": "An article that is paid for by an advertiser – sponsored content. Tells readers it’s not editorial and marks it clearly.",
    "schema:AgreeAction": "User agrees to something – like a survey, a call recording, or terms. Similar to AcceptAction but more about consent.",
    "schema:Airline": "For companies that fly passengers. Use with Flight schema to show airline name, IATA code, and frequent flyer program details.",
    "schema:Airport": "Physical airport building. Include IATA code (LAX, JFK), name, address, and website. Helps directions and local travel search.",
    "schema:AlbumRelease": "A music album coming out or already released. Includes track list, record label, release date, and where to buy or stream.",
    "schema:AlignmentObject": "Connects your educational content to official standards – for example, “Grade 5 Math Common Core standard 5.NBT.7”. Good for schools.",
    "schema:AllocateAction": "Assigning resources like time, money, or people to a specific project. Not typical on most consumer websites. Very niche.",
    "schema:AmusementPark": "For theme parks, water parks, or fun centers. Include ticket prices, opening dates, height requirements, and ride list.",
    "schema:AnalysisNewsArticle": "News that provides interpretation and background, not just raw facts. Deeper than standard news – explains why something happened.",
    "schema:AnatomicalStructure": "Body parts like heart, liver, or femur. Use for medical, biology, or health education content. Include diagrams if possible.",
    "schema:AnatomicalSystem": "Group of organs working together – circulatory system, nervous system, digestive system. For scientific articles or medical sites.",
    "schema:AnimalShelter": "A place that rescues and adopts out pets. Show adoption fees, pet list (dogs, cats), vaccination status, and volunteer opportunities.",
    "schema:Answer": "Response to a Question schema. Use inside FAQPage or QAPage. Contains the answer text, author, and upvote count.",
    "schema:Apartment": "An individual flat in a larger building. List number of bedrooms, floor number, pet policy, monthly rent, and security deposit.",
    "schema:ApartmentComplex": "The whole building with many units. Includes amenities like pool, gym, laundry room, parking, and management contact.",
    "schema:APIReference": "Documentation for developers – endpoints, parameters, authentication methods, and example requests. Marks technical API content.",
    "schema:AppendAction": "Adding something to the end – for example, appending text to a document or adding a line to a list. Rare, mostly for automation.",
    "schema:ApplyAction": "User submits a job application, university admission, or loan request. Marks the final “Apply Now” button on forms.",
    "schema:ApprovedIndication": "Medical term: a condition for which a drug or treatment is officially approved by the FDA or similar agency. Very niche.",
    "schema:Aquarium": "A public place with fish and marine life. Include ticket prices, hours, special exhibits (sharks, penguins), and feeding times.",
    "schema:ArchiveComponent": "A piece of an archive – like a folder, box, or collection of documents. Used with ArchiveOrganization to organize historical records.",
    "schema:ArchiveOrganization": "A library, museum, or institution that keeps historical records, manuscripts, or old photographs. Shows what collections they hold.",
    "schema:Artery": "Blood vessel that carries blood away from the heart – aorta, carotid. Use in medical diagrams or articles about the circulatory system.",
    "schema:ArtGallery": "A place showing paintings, sculptures, or photography. Include featured artists, current exhibitions, opening hours, and ticket price.",
    "schema:AskAction": "User asks a question – for example, in a forum or Q&A site. Works with Question and Answer schemas to track the conversation.",
    "schema:AskPublicNewsArticle": "A news article that publicly asks for help or information – like “Who is this suspect?” or “Can you identify this object?”.",
    "schema:AssessAction": "Evaluating something – grading a test, reviewing a product, or judging a competition. Not common on typical websites.",
    "schema:AssignAction": "Assigning a task or role to someone – for example, a manager assigning a bug to a developer. Used in project management tools.",
    "schema:Atlas": "A map collection – either a physical book or a digital set of maps. For geography or travel sites that offer multiple maps.",
    "schema:Attorney": "A lawyer or law firm. Add areas of practice (divorce, injury, criminal), years of experience, and free consultation availability.",
    "schema:Audiobook": "A narrated version of a book. Includes narrator name, total length, publisher, and format (MP3, audible). Use with Book or AudioObject.",
    "schema:AuthenticateAction": "Logging in or verifying identity – entering a password, using two‑factor authentication, or biometric scan. For security flows.",
    "schema:AuthorizeAction": "Granting permission – for example, “allow this app to access my camera” or “approve a payment”. Rare outside OAuth flows.",
    "schema:AutoBodyShop": "Car repair focused on painting, dent removal, and fixing body damage. Different from engine repair shops. Show estimates.",
    "schema:AutoDealer": "Sells new or used cars. Show inventory, financing options, trade‑in value, and warranty information. Also test drive booking.",
    "schema:AutoPartsStore": "Sells car parts like tires, batteries, brake pads, or headlights. Include compatibility by car make and model year.",
    "schema:AutoRental": "Rent a car by the day or hour. Include rental terms, insurance options, pickup location, and unlimited mileage policy.",
    "schema:AutoRepair": "Fixes mechanical issues – engines, transmission, brakes, and electrical systems. Add list of services, hourly rate, and certifications.",
    "schema:AutoWash": "Car wash business – automatic tunnel, hand wash, or self‑service. Show price menu, membership plans, and hours of operation.",
    "schema:BackgroundNewsArticle": "Provides context to current events – historical background, explanation of a crisis, or a deep dive. Not breaking news.",
    "schema:Bakery": "Sells bread, cakes, pastries, and cookies. Indicates if they do custom orders for birthdays or weddings. Show fresh hours.",
    "schema:BankAccount": "Savings or checking account at a bank. Includes account type, interest rate, minimum balance, monthly fee, and overdraft policy.",
    "schema:BarOrPub": "Serves alcoholic drinks. Use with ServingHours and age restriction (21+). Show happy hour times, food menu, and live music.",
    "schema:Barcode": "A product barcode like UPC, EAN, or ISBN. Helps link physical items to digital info. Use inside Product or Offer.",
    "schema:Beach": "Natural sandy shoreline along a lake, sea, or ocean. For travel guides. Include lifeguard presence, parking, and water quality.",
    "schema:BeautySalon": "Haircuts, nails, makeup, waxing, and facials. Add price list, booking link, and list of services (men’s, women’s, kids).",
    "schema:BedAndBreakfast": "Small lodging with breakfast included. More personal than a hotel. Show number of rooms, breakfast menu, and house rules.",
    "schema:BedDetails": "Describes bed size (twin, queen, king) and number of beds. Used inside Accommodation or HotelRoom for accurate room info.",
    "schema:BefriendAction": "User becomes friends with someone on a social network. Rare – used mostly for social media platforms tracking connections.",
    "schema:BikeStore": "Sells bicycles and accessories – helmets, lights, locks. Also does repairs. Show bike types (mountain, road, electric).",
    "schema:BioChemEntity": "Molecules like proteins, DNA, or enzymes. For science or bioinformatics pages. Not for normal blogs or shops.",
    "schema:Blog": "A whole blog – not one post. Lists the blog name, description, language, and typically the latest entries. Good for blog homepage.",
    "schema:BloodTest": "Medical lab test for blood – cholesterol, glucose, white blood count. Shows what it measures, normal range, and cost.",
    "schema:BoatReservation": "Booking a boat trip, ferry, or cruise. Include departure time, seat or cabin type, meal options, and cancellation policy.",
    "schema:BoatTerminal": "Where ferries or boats dock. Similar to a train station but for water. Include gate numbers and parking availability.",
    "schema:BoatTrip": "A journey by water – schedule, route, duration, and operator name. Use with BoatReservation to describe the trip.",
    "schema:BodyOfWater": "A lake, ocean, river, or pond. For travel or geography articles. Include size, depth, water type (fresh or salt).",
    "schema:Bone": "Anatomy – skull, femur, ribs, vertebrae. Use in medical or biology educational content. Include diagram link.",
    "schema:Book": "A printed or digital book. Add author, ISBN, page count, format (hardcover, paperback), publisher, and publication date.",
    "schema:BookmarkAction": "User saves a page or item for later – like a “save to reading list” button. Tracks that action for analytics.",
    "schema:BookSeries": "Multiple books in a series – Harry Potter, The Expanse. Links each book to the series name and order number.",
    "schema:BookStore": "Shop that sells books – physical or online. Show genres carried, author events, loyalty program, and return policy.",
    "schema:BorrowAction": "Taking something temporarily – borrowing a library book, tool, or equipment. For lending systems with due dates.",
    "schema:BrainStructure": "Parts of the brain – hippocampus, amygdala, cortex. Use in medical or neuroscience content. Include function description.",
    "schema:Brand": "A brand name – Nike, Coca‑Cola, Toyota. Can be owned by an Organization. Used inside Product to show who makes it.",
    "schema:Brewery": "Makes beer. Offer tours, tasting rooms, and types of beer (IPA, stout). Show food availability and parking.",
    "schema:Bridge": "Man‑made crossing over water or land. For travel or engineering pages. Include length, year built, and toll status.",
    "schema:BroadcastChannel": "TV or radio channel – BBC One, CNN, NPR. Include call sign, frequency (e.g., 101.1 FM), and language.",
    "schema:BroadcastEvent": "A specific airing of a show – date, start time, channel, episode name. Use for TV schedules or radio programs.",
    "schema:BroadcastFrequencySpecification": "Technical details: AM/FM frequency or digital channel number. Rare – mostly for engineering or regulatory sites.",
    "schema:BroadcastService": "A TV or radio station as a whole. Includes coverage area, owner, launch date, and website link.",
    "schema:BrokerageAccount": "Investment account for stocks, bonds, or ETFs. Shows fees, minimum deposit, margin options, and trading platform.",
    "schema:BuddhistTemple": "Place of worship for Buddhists. Include meditation hours, leadership (monk or nun), and upcoming ceremonies.",
    "schema:BusOrCoach": "A bus vehicle – not the stop. For transit schedules showing bus number, capacity, and amenities (wifi, restroom).",
    "schema:BusReservation": "Booking a bus ticket – seat number, departure and arrival times, luggage allowance, and need to print ticket.",
    "schema:BusStation": "Where buses pick up or drop off passengers. Include address, amenities (restrooms, waiting area, ticket counter).",
    "schema:BusStop": "A single point along a route – often with a shelter and sign. Use for local transit apps showing stop ID.",
    "schema:BusTrip": "The journey itself – route number, stops, total duration, and operator. Use with BusReservation for booking.",
    "schema:BusinessAudience": "Demographic targeting – B2B vs B2C. Use if your product or service is aimed at companies rather than individual consumers.",
    "schema:BusinessEvent": "Conference, networking meetup, trade show, or industry seminar. For professionals. Include speakers and sponsorship.",
    "schema:BuyAction": "Complete purchase – user clicks “Buy now” and finishes checkout. Tracks conversion events for analytics.",
    "schema:CableOrSatelliteService": "TV provider – packages, channels, price, contract length, and installation fee. Use for telecom companies.",
    "schema:CafeOrCoffeeShop": "Small restaurant focusing on coffee, tea, and light food like pastries or sandwiches. Different from full restaurant.",
    "schema:Campground": "Place for tents or RVs. Show hookups (water, electric), fire pits, restrooms, and reservation link.",
    "schema:CampingPitch": "One specific spot inside a campground – e.g., “Site #12 by the lake”. Includes size, shade, and proximity to facilities.",
    "schema:Canal": "Man‑made waterway for boats or irrigation. For travel or history content. Include length, depth, and year built.",
    "schema:CancelAction": "User cancels a reservation, order, or subscription. Tracks cancellation events – useful for retention analytics.",
    "schema:Car": "A specific vehicle model – fuel efficiency, seating capacity, transmission type, trunk space, and safety ratings.",
    "schema:Cardiovascular": "Relating to the heart and blood vessels. Medical term for health articles about heart disease, strokes, or blood pressure.",
    "schema:Casino": "Gambling venue with slot machines and table games. Use carefully – many countries restrict gambling content.",
    "schema:CategoryCode": "A code for a product category – e.g., “electronics > cameras > DSLR”. Use with CategoryCodeSet for taxonomy.",
    "schema:CategoryCodeSet": "A whole list of category codes – like a product taxonomy or library classification system. Good for e‑commerce.",
    "schema:CatholicChurch": "A parish or diocese. Include mass times, confession schedule, priest name, and bulletins. Also wedding or baptism info.",
    "schema:CDCPMDRecord": "Special schema for public health data (COVID stats, flu reports). Very rare – mostly for government health sites.",
    "schema:Cemetery": "Burial ground. For genealogical or local history sites. Show burial records, opening hours, and contact for plots.",
    "schema:Chapter": "One section of a book. Use inside Book or Audiobook to mark chapter title, number, and page range or start time.",
    "schema:CheckAction": "Inspecting something – e.g., “check in a bag” at airport or “check for updates”. Not widely used.",
    "schema:CheckInAction": "User arrives at a place – airport, hotel, event venue, or gym. Good for travel or fitness apps.",
    "schema:CheckOutAction": "User leaves a place or completes checkout – hotel departure, library book return, or cart checkout.",
    "schema:CheckoutPage": "Marks the final step of buying – the page where user enters payment info. Helps search understand conversion.",
    "schema:ChemicalSubstance": "Any chemical – water, salt, aspirin, or sulfuric acid. Use for science, pharmacy, or safety data sheets.",
    "schema:ChildCare": "Daycare or nanny service. Include age range (e.g., 6 weeks to 5 years), hours, staff‑to‑child ratio, and meals.",
    "schema:ChildrensEvent": "Event aimed at kids – puppet show, magic show, story time, or workshop. Show age recommendation and parent supervision.",
    "schema:ChooseAction": "User picks one option from a list – e.g., size S/M/L or color red/blue. For interactive forms and product variants.",
    "schema:Church": "Generic Christian place of worship – not specific to denomination. Use if you don’t know if it’s Catholic, Baptist, etc.",
    "schema:City": "A populated place with government. For travel or government sites. Include mayor, population, timezone, and motto.",
    "schema:CityHall": "Government building where city business happens. Show department contacts, permit office hours, and public meetings.",
    "schema:CivicStructure": "Public building – library, courthouse, community center, or pool. Parent type for many government buildings.",
    "schema:Claim": "A statement that could be true or false – e.g., “Eating chocolate cures colds”. Used with ClaimReview for fact‑checking.",
    "schema:Class": "A programming class (object‑oriented programming). For developer documentation – not for school classes.",
    "schema:Clip": "Short part of a video or audio – trailer, highlight, teaser, or behind‑the‑scenes clip.",
    "schema:ClothingStore": "Sells apparel – shirts, pants, jackets. Include size chart, brands, return policy, and available fits (slim, regular).",
    "schema:Collection": "A group of items – art collection, product lineup, or a set of stamps. Not a page but the abstract idea.",
    "schema:CollectionPage": "A webpage that lists items in a collection – e.g., “Summer collection” or “Best of 2024”. Shows the list.",
    "schema:CollegeOrUniversity": "Higher education institution. Show acceptance rate, tuition, campus location, majors offered, and sports teams.",
    "schema:ComedyClub": "Venue for stand‑up comedy. Include showtimes, drink minimum, age restriction, and headliner names.",
    "schema:ComedyEvent": "A specific comedy show – performer, date, ticket link, and door time. Use for events at comedy clubs.",
    "schema:ComicCoverArt": "Art on the front of a comic book. Use with ComicIssue. Includes artist, issue number, and variant cover info.",
    "schema:ComicIssue": "Single comic book issue – e.g., “Amazing Spider‑Man #1”. Includes issue number, page count, and cover price.",
    "schema:ComicSeries": "A run of comic issues – e.g., “Batman vol. 3”. Shows publisher, start year, end year, and list of issues.",
    "schema:ComicStory": "A storyline that spans multiple issues – e.g., “The Dark Phoenix Saga”. Useful for comic fans.",
    "schema:Comment": "A user response to an article, blog post, or forum thread. Includes text, author, date, and upvote count.",
    "schema:CommentAction": "User writes a comment. Tracks engagement – useful for measuring how many people comment on your content.",
    "schema:CommunicateAction": "Base type for messaging, emailing, or calling. Not used directly – use subtypes like ReplyAction or InviteAction.",
    "schema:CompoundPriceSpecification": "Pricing that combines multiple parts – e.g., monthly fee $10 plus $0.05 per message. Good for subscriptions.",
    "schema:ComputerLanguage": "Programming language – Python, Java, C++, JavaScript. For code tutorials or software documentation.",
    "schema:ComputerStore": "Sells computers, parts, or does repairs. Show specs (RAM, CPU), warranty, and trade‑in or recycling programs.",
    "schema:ConferenceEvent": "Large professional gathering with keynotes, workshops, and exhibitors. Include date, venue, agenda, and registration fee.",
    "schema:ConfirmAction": "User confirms something – email address, order details, or appointment. After initial action, they click confirm.",
    "schema:Consortium": "Group of organizations working together – e.g., “World Wide Web Consortium” (W3C). Shows members and mission.",
    "schema:ConstraintNode": "Technical – used in knowledge graphs to define logical rules. Ignore for most websites.",
    "schema:ConsumeAction": "Watching, reading, or listening. Base type – use subtypes like ViewAction, ListenAction, or ReadAction.",
    "schema:ContactPage": "A page with a contact form, address, phone, or email. Marks it as “Contact us” so search knows where to send people.",
    "schema:Continent": "Africa, Asia, Europe, etc. For geographic context in travel or educational content.",
    "schema:ControlAction": "Operating a device – turn on air conditioner, lock a door. Rare – for smart home APIs.",
    "schema:ConvenienceStore": "Small shop – 7‑Eleven, gas station mart. Open long hours (often 24/7). Sells snacks, drinks, basic groceries.",
    "schema:Conversation": "A chat thread, SMS exchange, or email chain. For messaging apps or customer service transcripts.",
    "schema:CookAction": "User prepares food according to a recipe. For interactive cooking apps or smart kitchens. Not common.",
    "schema:Cooperative": "A business owned by its members – credit union, farm co‑op, housing co‑op. Shows democratic governance.",
    "schema:Corporation": "Large company – use Organization instead unless you need legal terms like “Incorporated”. Very similar.",
    "schema:CorrectionComment": "A comment that fixes an error in the original content – like a typo or wrong fact. Used in collaborative sites.",
    "schema:Courthouse": "Building where courts operate. Show office hours, case lookup, and filing fees. For legal or government sites.",
    "schema:CoverArt": "Album or book cover image. Use with MusicAlbum or Book. Includes artist, resolution, and alternative text.",
    "schema:CovidTestingFacility": "Place where you get a COVID‑19 test – pharmacy, drive‑thru, clinic. Separate from hospitals. Show appointment needed.",
    "schema:CreateAction": "User makes something – a post, an account, a file, or a playlist. Tracks “create” button clicks.",
    "schema:Credential": "ID card, diploma, certificate, or license. Digital or physical. Shows who issued it and expiration date.",
    "schema:CreditCard": "Specific credit card product – APR, annual fee, rewards (cashback or points), and introductory offer.",
    "schema:Crematorium": "Place for cremation services. For funeral home sites. Show pricing, viewing rooms, and after‑care options.",
    "schema:CriticReview": "Professional review from a known critic (e.g., movie critic, restaurant critic). Different from user reviews.",
    "schema:CrossSectional": "Medical study type – a snapshot at one point in time, not following patients over time.",
    "schema:CurrencyConversionService": "Converts money from one currency to another. Include exchange rate, fee, and amount limits.",
    "schema:DanceEvent": "Party, ballroom night, rave, or dance competition. For entertainment listings. Include DJ or performer names.",
    "schema:DanceGroup": "A dance company or crew – e.g., “Alvin Ailey”. Shows members, style (hip hop, ballet), and upcoming shows.",
    "schema:DataDownload": "Link to download a file – CSV, PDF, ZIP, or Excel. Show file size, format, and license.",
    "schema:DataFeed": "A list of data entries – like a product feed or news feed. Used for machine learning or data exchange.",
    "schema:DataFeedItem": "One item inside a DataFeed. Contains the actual data point and a unique identifier.",
    "schema:DDxElement": "Medical differential diagnosis – possible conditions that could explain symptoms. For clinical decision support.",
    "schema:DeactivateAction": "Deactivating an account or service – e.g., “Deactivate my profile”. Opposite of ActivateAction.",
    "schema:DefenceEstablishment": "Military base, Pentagon, or fort. For government or historical sites. Not for civilian use.",
    "schema:DefinedRegion": "A named region that isn’t administrative – like “Silicon Valley” or “Midwest”. Good for marketing.",
    "schema:DefinedTerm": "A word with a specific definition – glossary entry. Use on dictionary or knowledge base sites.",
    "schema:DefinedTermSet": "A whole glossary, dictionary, or thesaurus. Lists multiple DefinedTerm objects.",
    "schema:DeleteAction": "User removes content – a post, file, comment, or account. Tracks deletion events.",
    "schema:DeliveryChargeSpecification": "Shipping cost – free over $50, flat rate $5, or per kilogram. Use with Offer to show delivery fees.",
    "schema:DeliveryEvent": "When a package is delivered – time, location, and carrier. For tracking pages.",
    "schema:DeliveryTimeSettings": "How long delivery takes – standard shipping 3‑5 days, express 1‑2 days. Use with Product or Offer.",
    "schema:Demand": "Product availability without a specific offer – e.g., “out of stock” or “available for preorder”. Not for sale yet.",
    "schema:Dentist": "Dental clinic. Show services – cleaning, braces, whitening, implants. Also insurance accepted and emergency hours.",
    "schema:DepartAction": "Leaving a place – e.g., “check out” of hotel or “depart” from airport. Tracks departure events.",
    "schema:DepartmentStore": "Large store selling many types of goods – Macy’s, Target, Kohl’s. Clothes, home, electronics all in one.",
    "schema:DepositAccount": "Savings or checking account. Interest rate, minimum deposit, monthly fee, and ATM network.",
    "schema:DiagnosticLab": "Medical testing facility – blood work, X‑ray, MRI, urine test. Show turnaround time and insurance.",
    "schema:DiagnosticProcedure": "A specific test used to diagnose disease – e.g., colonoscopy, biopsy, ECG. For medical content.",
    "schema:Diet": "Specific eating plan – keto, vegan, paleo, gluten‑free. Use with Recipe or Health article.",
    "schema:DietarySupplement": "Vitamins, minerals, herbs, or protein powder. Include dosage, warnings, and manufacturer.",
    "schema:DigitalDocument": "PDF, Word file, Excel sheet, or text file. Use for downloads or cloud documents.",
    "schema:DigitalDocumentPermission": "Who can view, edit, or comment on a digital document. For collaborative editing platforms.",
    "schema:DisagreeAction": "User disagrees with a statement – like a downvote or “disagree” button. Opposite of AgreeAction.",
    "schema:DiscoverAction": "Finding something new – e.g., “explore” button or “discover new music”. Tracks exploration.",
    "schema:DiscussionForumPosting": "A forum thread or post. Good for community sites like Reddit or phpBB. Shows topic, replies, and votes.",
    "schema:DislikeAction": "Negative feedback – thumbs down, dislike counter. Opposite of LikeAction. Common on video or comment sections.",
    "schema:Distillery": "Makes whiskey, vodka, gin, or rum. Offer tours, tastings, and bottle sales. Show age statements.",
    "schema:DonateAction": "User gives money or goods. Use with Nonprofit or Charity. Shows donation form and tax deduction info.",
    "schema:DownloadAction": "User saves a file locally – PDF, image, software. Tracks download counts for analytics.",
    "schema:DrawAction": "Creating a drawing – in a drawing app or online whiteboard. For interactive creative tools.",
    "schema:Drawing": "A sketch, blueprint, or illustration. Use with VisualArtwork. Shows medium, dimensions, and artist.",
    "schema:Drug": "Medication – generic name, active ingredient, prescription status (OTC or Rx). For pharmacy or health sites.",
    "schema:DrugClass": "Group of drugs with similar action – NSAIDs (ibuprofen), antibiotics, statins. Educational.",
    "schema:DrugCost": "Price of medication – retail, copay, insurance negotiated price. Good for comparing pharmacies.",
    "schema:DrugLegalStatus": "OTC (over‑the‑counter), prescription only, controlled substance, or banned. For drug safety pages.",
    "schema:DrugStrength": "Dosage – 20mg, 5ml, 1000IU. Use with Drug to show available strengths.",
    "schema:DryCleaningOrLaundry": "Clothing cleaning service. Show turnaround time, price per item, stain removal, and pickup/delivery.",
    "schema:EatAction": "User consumes food – e.g., “ate a burger”. Rare on websites – more for fitness or food tracking apps.",
    "schema:EducationEvent": "Workshop, lecture, webinar, or training session. For learning opportunities. Include instructor and certificate.",
    "schema:EducationalAudience": "Students of a certain grade, major, or age range – e.g., “Grade 5” or “College freshmen”.",
    "schema:EducationalOccupationalCredential": "Degree or certificate – BA in English, CompTIA A+, CPA license.",
    "schema:EducationalOrganization": "School, college, university, or training center. Include name, address, and grades taught.",
    "schema:Electrician": "Electrical repair or installation business. Add service area, license number, and 24/7 emergency availability.",
    "schema:ElectronicsStore": "Sells phones, TVs, computers, cameras. Show brands, trade‑in deals, protection plans, and open‑box items.",
    "schema:ElementarySchool": "Grades K‑5 or similar. Include principal name, school district, after‑school programs, and parent‑teacher conference dates.",
    "schema:EmailMessage": "An email – for archiving or customer service pages. Not typical for most websites.",
    "schema:Embassy": "Foreign diplomatic office. Hours, services (visa, passport, notary), and emergency contact for citizens.",
    "schema:EmergencyService": "Police, fire, ambulance, or poison control. For official government sites. Not for commercial use.",
    "schema:EmployeeRole": "Describes a job within an organization – e.g., “Sales Manager at Acme Inc.” Use inside Role.",
    "schema:EmployerAggregateRating": "Average rating of a company as an employer – like Glassdoor score. Based on employee reviews.",
    "schema:EmployerReview": "Single review from an employee – pros, cons, rating, and job title.",
    "schema:EmploymentAgency": "Connects job seekers with employers. Show job board, resume tips, and placement services.",
    "schema:EndorseAction": "Publicly supporting a person, product, or idea – like a testimonial or recommendation.",
    "schema:EndorsementRating": "A rating given by an endorser – e.g., “5 stars for honesty”. Used with EndorseAction.",
    "schema:EnergyConsumptionDetails": "How much power a device uses – watts, kWh per year, or energy star rating. For appliances.",
    "schema:EngineSpecification": "Engine size (2.0L), horsepower, torque, fuel type, and cylinder count. For cars or machinery.",
    "schema:EntertainmentBusiness": "Cinema, arcade, club, or bowling alley – places for fun. Show hours and prices.",
    "schema:Episode": "One episode of a podcast or TV series. Include episode number, duration, audio/video URL, and release date.",
    "schema:Error": "An error message – 404 Not Found, 500 server error. Helps search understand what went wrong.",
    "schema:EventReservation": "Booking a spot at an event – concert ticket, webinar registration. Shows reservation ID and status.",
    "schema:EventSeries": "Recurring event – every Monday at 7pm or monthly meetup. Show schedule pattern and next date.",
    "schema:EventVenue": "The physical place where events happen – stadium, hall, park. Includes address, seating capacity, and parking.",
    "schema:ExchangeRateSpecification": "Currency conversion rate – e.g., 1 USD = 0.92 EUR. Include date and source.",
    "schema:ExerciseAction": "User does a workout – running, lifting, yoga. For fitness apps. Tracks duration and calories.",
    "schema:ExerciseGym": "Health club with weights, cardio machines, and classes. Show membership fees, hours, and amenities.",
    "schema:ExercisePlan": "A workout routine – “Couch to 5K” or “Full body 3x week”. Includes steps and duration.",
    "schema:ExhibitionEvent": "Art show, museum exhibit, or science fair. Start and end dates, featured works, and ticket price.",
    "schema:FastFoodRestaurant": "Quick service – McDonald’s, KFC, Taco Bell. Show drive‑thru hours, delivery, and value menu.",
    "schema:Festival": "Multi‑day cultural event – music, film, food, or art. Include lineup, schedule, and camping info.",
    "schema:FilmAction": "Recording a video – pressing record on a camera. Uncommon outside video apps.",
    "schema:FinancialIncentive": "Discount, cashback, rebate, or free trial – motivates purchase. Use with Offer.",
    "schema:FinancialProduct": "Mortgage, credit card, loan, or investment account. Show rates, fees, and terms.",
    "schema:FindAction": "User finds an item or location – search or “find my phone”. Tracks discovery.",
    "schema:FireStation": "Fire department building – not for emergencies. Show tours, open houses, and community events.",
    "schema:Flight": "Specific airplane trip – number, departure airport, arrival airport, departure time, arrival time, and duration.",
    "schema:FlightReservation": "Booking a seat on a flight – confirmation number, seat assignment, and checked bags.",
    "schema:FloorPlan": "Map of a house or apartment. Add rooms, dimensions, square footage, and direction (north arrow).",
    "schema:Florist": "Sells flowers and arrangements. Show delivery area, same‑day cutoff, and wedding packages.",
    "schema:FollowAction": "User follows a social media account, RSS feed, or artist. Tracks new followers.",
    "schema:FoodEstablishmentReservation": "Booking a table at a restaurant – party size, date, time, and special requests.",
    "schema:FoodEvent": "Food festival, cooking competition, wine tasting, or farmers market. Show vendors and admission.",
    "schema:FoodService": "Catering, meal delivery, or cafeteria. Include menus, minimum order, and service area.",
    "schema:FundingAgency": "Organization that gives grants – NSF, NIH, Wellcome Trust. Show focus areas and deadlines.",
    "schema:FundingScheme": "A specific grant program – “SBIR Phase I”. Shows award amount and eligibility.",
    "schema:Fungus": "Mushrooms, mold, yeast. Science or biology content. Include scientific name and toxicity.",
    "schema:FurnitureStore": "Sells sofas, tables, beds, desks. Show assembly service, delivery options, and material types.",
    "schema:Game": "Video game or board game. Add platform (PC, PS5), genre, rating (E, T, M), and publisher.",
    "schema:GameServer": "Online multiplayer server – region, player count, ping, and mod support.",
    "schema:GardenStore": "Plants, soil, tools, and seeds. Show seasonal hours, gardening classes, and delivery for mulch.",
    "schema:GasStation": "Fuel stop – also convenience store, air pump, car wash, and diesel or EV charging.",
    "schema:GatedResidenceCommunity": "Neighborhood with controlled access – guard gate or key card. Show HOA fees and amenities.",
    "schema:Gene": "DNA segment – BRCA1, TP53. For bioinformatics or genetics content. Show function and location.",
    "schema:GeneralContractor": "Home builder or remodeler. Include license, insurance, portfolio, and free estimate.",
    "schema:GeoCircle": "Circular area on a map – e.g., “10km radius from city center”. For location‑based services.",
    "schema:GeoCoordinates": "Latitude and longitude – e.g., 40.7128° N, 74.0060° W. Use for any physical place.",
    "schema:GeoShape": "Polygon or line on a map – neighborhood boundary, hiking trail, or delivery zone.",
    "schema:GeospatialGeometry": "More complex 3D shapes or multi‑polygons. For advanced GIS applications.",
    "schema:GiveAction": "User gives something – donate, gift, or tip. Alias of DonateAction. Use for charitable giving.",
    "schema:GolfCourse": "Public or private golf club. Show yardage, par, tee times, green fees, and cart rental.",
    "schema:GovernmentBuilding": "City hall, capitol, courthouse, or DMV. For official government sites.",
    "schema:GovernmentOffice": "Specific department – tax office, passport agency, sheriffs office. Show services and hours.",
    "schema:GovernmentOrganization": "Agency – EPA, FDA, local sanitation department. Includes mission, leadership, and regulations.",
    "schema:GovernmentPermit": "License, building permit, fishing license, or marriage license. Show fees and requirements.",
    "schema:GovernmentService": "Service offered online or in person – passport renewal, tax filing, food stamps.",
    "schema:GroceryStore": "Supermarket selling food and household items. Show weekly ads, loyalty card, curbside pickup, and deli hours.",
    "schema:Guide": "How‑to manual, travel guide, or buying guide. Longer than a simple article.",
    "schema:Hackathon": "Event where programmers build software together – usually 24‑48 hours. Show prizes and rules.",
    "schema:HairSalon": "Same as BeautySalon – haircuts, coloring, styling. Also men’s barbershop.",
    "schema:HardwareStore": "Tools, paint, lumber, keys, and plumbing supplies. Show rental equipment (e.g., carpet cleaner).",
    "schema:HealthAndBeautyBusiness": "Salon, spa, tanning, massage, or nail salon. Wrap‑up type.",
    "schema:HealthClub": "Gym or fitness center – weights, cardio, classes, personal trainers.",
    "schema:HealthInsurancePlan": "Medical coverage – deductibles, copays, out‑of‑pocket max, and network type (HMO, PPO).",
    "schema:HealthPlanCostSharingSpecification": "How costs split between insurer and you – e.g., 80% insurance / 20% you after deductible.",
    "schema:HealthPlanFormulary": "List of drugs covered by a health plan – tiers (generic, brand, specialty).",
    "schema:HealthPlanNetwork": "Doctors and hospitals in‑network. Show search link and coverage area.",
    "schema:HealthTopicContent": "General health info – diabetes, flu, nutrition. Not a diagnosis or treatment.",
    "schema:HighSchool": "Grades 9‑12. Show graduation rate, sports teams, clubs, and college admission stats.",
    "schema:HinduTemple": "Place of worship. Festival dates, priest info, and daily prayer times.",
    "schema:HobbyShop": "Sells models (airplanes, cars), RC vehicles, craft supplies, or train sets.",
    "schema:HomeAndConstructionBusiness": "Handyman, roofer, painter, or flooring installer. Show service area and license.",
    "schema:HomeGoodsStore": "Bedding, decor, kitchenware, curtains, and storage bins.",
    "schema:Hospital": "Full medical facility – ER, surgery, inpatient beds, lab, and pharmacy.",
    "schema:Hostel": "Budget dorm‑style lodging. Shared rooms, kitchen, lockers, and social events.",
    "schema:House": "Single residential building – bedrooms, bathrooms, square footage, lot size, and year built.",
    "schema:HousePainter": "Painting contractor. Show square foot pricing, paint brands, and warranty.",
    "schema:HowToDirection": "A specific instruction step – “Stir the sauce with a wooden spoon”. Inside HowToStep.",
    "schema:HowToItem": "Thing needed in a how‑to – ingredient, tool, or supply. Used in HowToSection.",
    "schema:HowToSupply": "A consumable item – batteries, paint, flour. Used in HowTo.",
    "schema:HowToTip": "Helper advice – “Use cold butter for flaky crust”. Not a required step.",
    "schema:HowToTool": "Reusable equipment – hammer, blender, drill. Used in HowTo.",
    "schema:HVACBusiness": "Heating, ventilation, air conditioning repair and installation. Show emergency service.",
    "schema:HyperToc": "Linked table of contents for a long article. Helps readers jump to sections.",
    "schema:HyperTocEntry": "One item in HyperToc – section title and anchor link.",
    "schema:IceCreamShop": "Scoop shop – flavors (vanilla, chocolate, etc.), vegan options, hours, and toppings.",
    "schema:IgnoreAction": "User dismisses something – notification, suggestion, or ad. Tracks dismissal.",
    "schema:ImagingTest": "X‑ray, CT scan, MRI, ultrasound. For medical content.",
    "schema:IndividualPhysician": "Single doctor – not a clinic. Specialty, board certification, and hospital affiliation.",
    "schema:IndividualProduct": "A specific serialized item – e.g., an iPhone with a serial number. Not a generic product.",
    "schema:InfectiousDisease": "COVID, flu, TB, measles. For medical or public health content.",
    "schema:InformAction": "User notifies someone – “share” or “report”. Rare.",
    "schema:InsertAction": "Insert content – add line to document or image to gallery. For editors.",
    "schema:InstallAction": "User installs an app or browser extension. Track installs from your site.",
    "schema:InstantaneousEvent": "No duration – lightning strike, button click, flash. For real‑time systems.",
    "schema:Intangible": "Abstract thing – honor, love, a feeling. Base class, not used directly.",
    "schema:InteractAction": "Any user interaction base – clicks, taps, hovers.",
    "schema:InteractionCounter": "How many likes, shares, comments, or views. Use with CreativeWork.",
    "schema:InternetCafe": "Place to use computers. Show hourly rates, printing, and game availability.",
    "schema:InvestmentFund": "Mutual fund, ETF, or hedge fund. Show expense ratio, holdings, and minimum.",
    "schema:InvestmentOrDeposit": "Account type – CD, IRA, brokerage. Show rates and terms.",
    "schema:InviteAction": "Send invite to event or group – e.g., “Invite a friend”. Tracks referrals.",
    "schema:Invoice": "Bill for goods/services – total, due date, line items. For accounting.",
    "schema:ItemPage": "A page that focuses on one item – product, article, or image. Parent type.",
    "schema:JewelryStore": "Sells rings, necklaces, bracelets. Show metal (gold, silver), gemstones, and certification (GIA).",
    "schema:Joint": "Anatomy – knee, elbow, shoulder. For medical or fitness content.",
    "schema:JoinAction": "User joins a group, event, or membership – RSVP or “join now”.",
    "schema:Landform": "Mountain, valley, cliff, plateau. For geography or travel.",
    "schema:LandmarksOrHistoricalBuildings": "Famous places – Eiffel Tower, Colosseum, Statue of Liberty.",
    "schema:Language": "Human language – English, Spanish, Mandarin. Use for content language.",
    "schema:LearningResource": "Tutorial, course, video lesson, or practice quiz. For educational sites.",
    "schema:LeaveAction": "User leaves a group, ends membership, or quits a game.",
    "schema:LegalService": "Lawyer, paralegal, notary, or legal document service.",
    "schema:LegalValueLevel": "Legal importance – “authoritative”, “unofficial”, “draft”.",
    "schema:Legislation": "Law or bill – number, date enacted, sponsor, and summary.",
    "schema:LegislationObject": "Detailed legal text – full HTML or PDF of a law.",
    "schema:LegislativeBuilding": "Parliament or congress building – e.g., US Capitol.",
    "schema:LendAction": "Loaning something to someone – library book, tool, or money.",
    "schema:Library": "Public library – card signup, catalog search, events, and digital loans.",
    "schema:LibrarySystem": "Group of library branches – e.g., “New York Public Library system”.",
    "schema:LifestyleModification": "Diet, exercise, sleep changes, or stress reduction. For health advice.",
    "schema:Ligament": "Connects bone to bone – ACL, MCL. Anatomy.",
    "schema:LikeAction": "Positive feedback – thumbs up, heart, or star. Opposite of DislikeAction.",
    "schema:LinkRole": "Relationship between two web pages – e.g., “related to” or “translated from”.",
    "schema:LiquorStore": "Sells alcohol – beer, wine, spirits. Show age verification, delivery, and mixers.",
    "schema:ListenAction": "User plays audio – podcast, music, or audiobook. Tracks listening.",
    "schema:LiteraryEvent": "Book reading, poetry slam, author signing, or literary festival.",
    "schema:LiveBlogPosting": "Real‑time updates – sports game, election, or live event. New entries added frequently.",
    "schema:LoanOrCredit": "Mortgage, car loan, student loan, or credit line. Show interest rate and term.",
    "schema:LocationFeatureSpecification": "Amenity – WiFi, parking, pool, breakfast, or pet friendly.",
    "schema:Locksmith": "Key cutting, lock repair, or safe opening. Show emergency 24/7 service.",
    "schema:LodgingBusiness": "Hotel, motel, inn, hostel – parent type for places that rent rooms.",
    "schema:LodgingReservation": "Booking a room – check‑in/out dates, room type, and cancellation policy.",
    "schema:LoginAction": "User logs into an account – entering username and password.",
    "schema:LymphaticVessel": "Part of the immune system – lymph nodes, ducts. Anatomy.",
    "schema:Manuscript": "Handwritten document – old letters, historical papers. For archives.",
    "schema:Map": "Road map, tourist map, transit map, or topographical map.",
    "schema:MarryAction": "Wedding event – marriage ceremony. Very rare.",
    "schema:MathSolver": "Tool that solves equations – shows steps for algebra, calculus, etc.",
    "schema:MaximumDoseSchedule": "Highest safe drug dose – e.g., “max 4000 mg per day”. For medication guides.",
    "schema:MeasurementMethodEnum": "How a measurement was taken – “scale”, “laboratory”, “estimate”.",
    "schema:MediaGallery": "Collection of images or videos on a page – slideshow or grid.",
    "schema:MediaObject": "Parent of VideoObject, AudioObject, ImageObject – don’t use directly.",
    "schema:MediaReviewItem": "Single item in a media review – e.g., one movie in a “best of” list.",
    "schema:MediaSubscription": "Paid access to content – Netflix, Spotify, newspaper digital subscription.",
    "schema:MedicalAudience": "Patients, doctors, nurses, or students – target audience for medical content.",
    "schema:MedicalBusiness": "Clinic, dentist, pharmacy, or lab – not a hospital.",
    "schema:MedicalCause": "What caused a condition – virus, injury, genetic mutation.",
    "schema:MedicalClinic": "Outpatient doctor’s office – primary care or specialty.",
    "schema:MedicalCode": "ICD‑10 code, CPT code, or RxNorm – used in billing and records.",
    "schema:MedicalCondition": "Disease or syndrome – diabetes, asthma, depression.",
    "schema:MedicalConditionStage": "Stage 1, stage 2 cancer – severity or progression.",
    "schema:MedicalContraindication": "Why a treatment should not be used – allergy or pregnancy.",
    "schema:MedicalDevice": "CPAP machine, pacemaker, glucose meter, or crutches.",
    "schema:MedicalEntity": "Base for all medical types – don’t use directly.",
    "schema:MedicalGuideline": "Standard of care – official recommendations from a health authority.",
    "schema:MedicalGuidelineContraindication": "Treatment to avoid according to guidelines.",
    "schema:MedicalGuidelineRecommendation": "Suggested treatment according to guidelines.",
    "schema:MedicalIndication": "Why a treatment is used – e.g., “antibiotics for bacterial infection”.",
    "schema:MedicalIntangible": "Abstract medical thing – not physical. Base class.",
    "schema:MedicalObservationalStudy": "Study that observes without changing anything – no treatment given.",
    "schema:MedicalOrganization": "Hospital, clinic, insurer, or medical school.",
    "schema:MedicalProcedure": "Surgery, biopsy, dialysis, or physical therapy.",
    "schema:MedicalResearcher": "A scientist who does medical research.",
    "schema:MedicalRiskCalculator": "Tool that predicts risk – e.g., heart attack risk in 10 years.",
    "schema:MedicalRiskEstimator": "Algorithm output – the risk number itself.",
    "schema:MedicalRiskFactor": "Smoking, age, obesity, family history – increases disease risk.",
    "schema:MedicalRiskScore": "Number from risk calculator – e.g., “12%”.",
    "schema:MedicalScholarlyArticle": "Peer‑reviewed medical journal article.",
    "schema:MedicalSign": "Measurable finding – fever, high blood pressure, swelling.",
    "schema:MedicalSignOrSymptom": "Either a sign or symptom – use if unsure.",
    "schema:MedicalStudy": "Any study – clinical trial, observational study, case report.",
    "schema:MedicalSymptom": "Subjective complaint – pain, fatigue, nausea.",
    "schema:MedicalTest": "Lab or imaging – blood test, X‑ray, biopsy.",
    "schema:MedicalTestPanel": "Group of tests – e.g., “complete blood count (CBC)”.",
    "schema:MedicalTherapy": "Treatment – drug, surgery, radiation, physical therapy.",
    "schema:MedicalTrial": "Clinical trial – tests a new drug or device in humans.",
    "schema:MedicalWebPage": "Page about a condition, treatment, or medication – not a news article.",
    "schema:MeetingRoom": "Conference room rental – capacity, equipment, and hourly rate.",
    "schema:MemberProgram": "Loyalty program – Starbucks Rewards, Amazon Prime.",
    "schema:MemberProgramTier": "Gold, silver, platinum level – benefits at each level.",
    "schema:MensClothingStore": "Men’s apparel – suits, casual, accessories, and shoe sizes.",
    "schema:Menu": "Restaurant menu – list of sections and items.",
    "schema:MenuItem": "One dish or drink – price, description, calories.",
    "schema:MenuSection": "“Appetizers”, “Desserts”, “Wine list” – groups menu items.",
    "schema:MerchantReturnPolicy": "Return window (30 days), refund type (full or exchange), and restocking fee.",
    "schema:MerchantReturnPolicySeasonalOverride": "Holiday return policy – extended window for Christmas purchases.",
    "schema:Message": "Text, email, direct message – for messaging apps.",
    "schema:MiddleSchool": "Grades 6‑8 or 7‑9 depending on country.",
    "schema:MobileApplication": "App for iOS/Android – version, price, file size, and reviews.",
    "schema:MobilePhoneStore": "Sells phones and plans – carriers, upgrades, and trade‑in.",
    "schema:MolecularEntity": "Atom, molecule, ion – for chemistry or biochemistry.",
    "schema:MoneyTransfer": "Sending money – PayPal, bank wire, Western Union.",
    "schema:MonetaryAmount": "Price with currency – e.g., $19.99 USD.",
    "schema:MonetaryAmountDistribution": "Range of prices – min to max.",
    "schema:MonetaryGrant": "Money award – amount, funder, and conditions.",
    "schema:MortgageLoan": "Home loan – interest rate, term (30 years), down payment, and monthly payment.",
    "schema:Mosque": "Islamic place of worship – prayer times, Imam name, and events.",
    "schema:Motel": "Roadside hotel with exterior room doors – usually cheaper.",
    "schema:Motorcycle": "Bike model – engine size, type (cruiser, sport), and fuel economy.",
    "schema:MotorcycleDealer": "Sells motorcycles – new and used, also gear and parts.",
    "schema:MotorcycleRepair": "Repair shop for motorcycles – oil changes, tires, engine work.",
    "schema:MotorizedBicycle": "Moped, e‑bike, scooter – engine size under 50cc or electric.",
    "schema:Mountain": "Natural elevation – height, range, and first ascent.",
    "schema:MoveAction": "Moving to a new location – house relocation or office move.",
    "schema:Movie": "Film – director, cast, runtime, genre, and rating (PG‑13, R).",
    "schema:MovieClip": "Short scene from a movie – trailer or deleted scene.",
    "schema:MovieRentalStore": "Physical or online rental – DVD, Blu‑ray, digital rental.",
    "schema:MovieSeries": "Franchise – Star Wars, Marvel, Harry Potter. Links movies.",
    "schema:MovieTheater": "Cinema – showtimes, ticket prices, concessions, and wheelchair access.",
    "schema:MovingCompany": "Packing, loading, transport, and storage. Show estimates and insurance.",
    "schema:Muscle": "Biceps, quadriceps, deltoid – anatomy. Also function (flexion, extension).",
    "schema:Museum": "Art, history, science, or children’s museum. Hours, admission, and exhibits.",
    "schema:MusicAlbum": "Collection of songs – artist, record label, track list, release date.",
    "schema:MusicComposition": "Written piece of music – sheet music, composer, key, and tempo.",
    "schema:MusicEvent": "Concert, recital, or opera – performers, venue, date, ticket link.",
    "schema:MusicGroup": "Band or orchestra – members, genre, albums, and tour dates.",
    "schema:MusicPlaylist": "Curated list of songs – user created or editorial. Track count and duration.",
    "schema:MusicRecording": "One song track – artist, length, album, and ISRC code.",
    "schema:MusicRelease": "Physical or digital album drop – format (CD, vinyl, streaming).",
    "schema:MusicStore": "Sells instruments, sheet music, or audio equipment. Lessons also.",
    "schema:MusicVenue": "Club, hall, stadium, or theater for live music – capacity and schedule.",
    "schema:MusicVideoObject": "Video of a song – director, length, and song credits.",
    "schema:NailSalon": "Manicure, pedicure, gel, acrylic. Show price list and appointment booking.",
    "schema:Nerve": "Neuron, sciatic nerve, optic nerve – anatomy and function.",
    "schema:NewsMediaOrganization": "CNN, BBC, NYT – journalistic outlet. Shows ethics policy and ownership.",
    "schema:Newspaper": "Printed or digital newspaper – circulation, frequency, and editorial team.",
    "schema:NGO": "Non‑governmental charity – mission, donations, and annual report.",
    "schema:NightClub": "Dance club with DJ or live music – age limit, dress code, and cover charge.",
    "schema:Notary": "Signing witness – commission number, service area, and mobile notary option.",
    "schema:NoteDigitalDocument": "Short memo or note – not a full article.",
    "schema:Observation": "Data point – temperature on July 4, stock price at close.",
    "schema:Occupation": "Job title – skill requirements, education, and salary range.",
    "schema:OccupationalExperienceRequirements": "Years needed for a job – e.g., “3‑5 years in sales”.",
    "schema:OccupationalTherapy": "Rehab therapy for daily living skills – for elderly or disabled.",
    "schema:OfferCatalog": "List of offers – e.g., “Winter sale”. Groups multiple offers.",
    "schema:OfferForLease": "Rental offer – apartment, car, or equipment. Monthly price and term.",
    "schema:OfferForPurchase": "Sale offer – one‑time purchase price.",
    "schema:OfferShippingDetails": "Shipping costs, delivery time, and carrier. Inside Offer.",
    "schema:OfficeEquipmentStore": "Printers, desks, chairs, supplies. Show business accounts and bulk pricing.",
    "schema:OnlineBusiness": "No physical store – operates only on the web.",
    "schema:OnlineStore": "E‑commerce site – sells products directly.",
    "schema:OnlineMarketplace": "Amazon, eBay, Etsy – many sellers on one platform."
};

// ==================== PAGE TYPE MAPPING (revised Homepage with custom descriptions) ====================
const PAGE_TYPE_MAP = {
    'Homepage': Object.keys(HOMEPAGE_DESCRIPTIONS),   // use the exact order from the descriptions
    'Landing Page': ['schema:WebPage'],
    'Blog (Blog Listing)': ['schema:Blog'],
    'Blog Post / Article': ['schema:BlogPosting', 'schema:Article'],
    'News Article': ['schema:NewsArticle'],
    'Category / Archive': ['schema:CollectionPage'],
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

// ==================== SCHEMA PROCESSING ====================
let classesMap = new Map();
let propertiesMap = new Map();
let classList = [];

function processSchemaData(data) {
    if (!data || !data['@graph']) throw new Error('Invalid schema file: @graph not found.');
    const graph = data['@graph'];
    classesMap.clear();
    propertiesMap.clear();
    classList = [];

    for (const item of graph) {
        const type = item['@type'];
        const id = item['@id'];
        if (!id) continue;

        if (type === 'rdfs:Class' || (Array.isArray(type) && type.includes('rdfs:Class'))) {
            const label = extractStringValue(item['rdfs:label']) || id.split(':')[1] || id;
            const comment = extractStringValue(item['rdfs:comment']);
            let subClassOf = null;
            if (item['rdfs:subClassOf']) {
                const sc = item['rdfs:subClassOf'];
                if (sc['@id']) subClassOf = sc['@id'];
                else if (typeof sc === 'string') subClassOf = sc;
            }
            classesMap.set(id, { id, label, comment, subClassOf });
            classList.push({ id, label, comment, subClassOf });
        } else if (type === 'rdf:Property') {
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

// ==================== WIZARD STATE ====================
let wizardState = {
    currentStep: 0,
    selectedClass: null,
    properties: {},
    nestedObjects: {},
    activePageType: 'Homepage'   // start with Homepage tab
};

const STEPS = [
    { id: 'selectType', title: 'Select Schema Type', desc: 'Choose the primary schema type for your content' },
    { id: 'fillProps', title: 'Fill Properties', desc: 'Add required and recommended properties' },
    { id: 'review', title: 'Review & Generate', desc: 'Review your schema and generate JSON-LD' }
];

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

    if (step.id === 'selectType') {
        renderSelectTypeStep(content);
    } else if (step.id === 'fillProps') {
        renderFillPropsStep(content);
    } else if (step.id === 'review') {
        renderReviewStep(content);
    }

    updateNavigationButtons();
}

function renderSelectTypeStep(container) {
    const suggested = suggestSchemaType();
    const suggestedLabel = classesMap.get(suggested)?.label || 'WebPage';

    let html = `
        <div class="step-title">Choose Schema Type</div>
        <div class="step-desc">Select the schema type that best describes your content</div>
        <div class="suggestion-box">
            💡 <strong>Smart Suggestion:</strong> Based on page analysis, we recommend <strong>${suggestedLabel}</strong>
        </div>
        <div class="search-box">
            <input type="text" id="classSearch" placeholder="🔍 Search schema types..." />
        </div>
        <div class="tabs-scroll-container">
            <button class="tab-arrow tab-arrow-left" id="tabArrowLeft" aria-label="Scroll left">‹</button>
            <div class="category-tabs" id="pageTypeTabs"></div>
            <button class="tab-arrow tab-arrow-right" id="tabArrowRight" aria-label="Scroll right">›</button>
        </div>
        <div class="class-grid" id="classGrid"></div>
    `;
    container.innerHTML = html;

    renderPageTypeTabs();
    renderClassGrid(wizardState.activePageType);

    document.getElementById('classSearch').addEventListener('input', debounce((e) => {
        filterClasses(e.target.value);
    }, 300));
}

function renderPageTypeTabs() {
    const tabs = document.getElementById('pageTypeTabs');
    const pageTypes = Object.keys(PAGE_TYPE_MAP);
    
    tabs.innerHTML = pageTypes.map(type => `
        <button class="cat-tab ${type === wizardState.activePageType ? 'active' : ''}" data-type="${type}">${type}</button>
    `).join('');

    tabs.querySelectorAll('.cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wizardState.activePageType = btn.dataset.type;
            renderClassGrid(btn.dataset.type);
            document.getElementById('classSearch').value = '';
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    initTabScroll();
    
    const activeBtn = tabs.querySelector('.cat-tab.active');
    if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
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

    leftArrow.addEventListener('click', () => {
        tabsDiv.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
        tabsDiv.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    tabsDiv.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    
    updateArrows();
    tabScrollInitialized = true;
}

function getClassDescription(cls, pageType) {
    if (pageType === 'Homepage' && HOMEPAGE_DESCRIPTIONS[cls.id]) {
        return HOMEPAGE_DESCRIPTIONS[cls.id];
    }
    return cls.comment || '';
}

function renderClassGrid(pageType) {
    const grid = document.getElementById('classGrid');
    const allowedIds = PAGE_TYPE_MAP[pageType] || [];
    
    const classesToShow = (allowedIds.length === 0) 
        ? classList 
        : classList.filter(cls => allowedIds.includes(cls.id));
    
    grid.innerHTML = classesToShow.slice(0, 50).map(cls => {
        const desc = getClassDescription(cls, pageType);
        return `
        <div class="class-card ${cls.id === wizardState.selectedClass ? 'selected' : ''}" data-id="${cls.id}">
            <div class="class-name">${cls.label}</div>
            <div class="class-desc">${desc ? desc.substring(0, 80) + '...' : ''}</div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            wizardState.selectedClass = card.dataset.id;
        });
    });
}

function filterClasses(query) {
    const grid = document.getElementById('classGrid');
    const activeTab = wizardState.activePageType;
    const allowedIds = PAGE_TYPE_MAP[activeTab] || [];
    
    const baseList = (allowedIds.length === 0) ? classList : classList.filter(cls => allowedIds.includes(cls.id));
    
    const filtered = baseList.filter(cls => 
        cls.label.toLowerCase().includes(query.toLowerCase()) ||
        (cls.comment && cls.comment.toLowerCase().includes(query.toLowerCase())) ||
        (HOMEPAGE_DESCRIPTIONS[cls.id] && HOMEPAGE_DESCRIPTIONS[cls.id].toLowerCase().includes(query.toLowerCase()))
    );
    
    grid.innerHTML = filtered.slice(0, 50).map(cls => {
        const desc = getClassDescription(cls, activeTab);
        return `
        <div class="class-card ${cls.id === wizardState.selectedClass ? 'selected' : ''}" data-id="${cls.id}">
            <div class="class-name">${cls.label}</div>
            <div class="class-desc">${desc ? desc.substring(0, 80) + '...' : ''}</div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            wizardState.selectedClass = card.dataset.id;
        });
    });
}

function renderFillPropsStep(container) {
    const recommended = getRecommendedProperties(wizardState.selectedClass);
    const className = classesMap.get(wizardState.selectedClass)?.label || 'Schema';

    let html = `
        <div class="step-title">Add Properties for ${className}</div>
        <div class="step-desc">Fill in the properties below. Required and recommended properties are highlighted.</div>
        <div class="props-container" id="propsContainer">
    `;

    recommended.forEach(prop => {
        const isCore = prop.score >= 100;
        const value = wizardState.properties[prop.id] || '';
        html += `
            <div class="prop-row ${isCore ? 'core-prop' : ''}">
                <label>
                    <span class="prop-label">${prop.label}</span>
                    ${isCore ? '<span class="badge">Core</span>' : ''}
                    ${prop.comment ? `<span class="prop-hint">${prop.comment.substring(0, 100)}</span>` : ''}
                </label>
                <input type="text" class="prop-input" data-prop="${prop.id}" value="${value}" placeholder="Enter ${prop.label}..." />
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll('.prop-input').forEach(input => {
        input.addEventListener('input', (e) => {
            wizardState.properties[e.target.dataset.prop] = e.target.value;
        });
    });
}

function renderReviewStep(container) {
    const className = classesMap.get(wizardState.selectedClass)?.label || 'Schema';
    const filledProps = Object.keys(wizardState.properties).filter(k => wizardState.properties[k]);

    let html = `
        <div class="step-title">Review Your Schema</div>
        <div class="step-desc">Verify the information below before generating JSON-LD</div>
        <div class="review-summary">
            <div class="review-item">
                <strong>Schema Type:</strong> ${className}
            </div>
            <div class="review-item">
                <strong>Properties Filled:</strong> ${filledProps.length}
            </div>
        </div>
        <div class="review-props">
    `;

    filledProps.forEach(propId => {
        const prop = propertiesMap.get(propId);
        const value = wizardState.properties[propId];
        html += `
            <div class="review-prop">
                <span class="review-prop-name">${prop.label}:</span>
                <span class="review-prop-value">${value}</span>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

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
    if (wizardState.currentStep === 0 && !wizardState.selectedClass) {
        alert('Please select a schema type first.');
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

function generateJSONLD() {
    const className = classesMap.get(wizardState.selectedClass)?.label || 'Thing';
    const output = {
        "@context": "https://schema.org",
        "@type": className
    };

    for (const [propId, value] of Object.entries(wizardState.properties)) {
        if (value) {
            const prop = propertiesMap.get(propId);
            if (prop) {
                output[prop.label] = value;
            }
        }
    }

    const jsonString = JSON.stringify(output, null, 2);
    document.getElementById('jsonOutput').textContent = jsonString;
    document.getElementById('outputCard').classList.remove('hidden');
    document.getElementById('wizardCard').classList.add('hidden');
}

// ==================== INITIALIZATION ====================
async function initApp() {
    const statusText = document.getElementById('statusText');
    const loadingStatus = document.getElementById('loadingStatus');
    const statsInfo = document.getElementById('statsInfo');
    const retryBtn = document.getElementById('manualRetryBtn');

    try {
        statusText.textContent = 'Checking local cache...';
        let schemaData = await loadSchemaFromDB();

        if (!schemaData) {
            statusText.textContent = 'Downloading schema vocabulary...';
            loadingStatus.classList.remove('hidden');
            loadingStatus.textContent = 'Fetching schema.org vocabulary (this may take a moment)...';

            const response = await fetch('https://schema.org/version/latest/schemaorg-current-https.jsonld');
            if (!response.ok) throw new Error('Failed to fetch schema');
            schemaData = await response.json();

            await saveSchemaToDB(schemaData);
            loadingStatus.textContent = 'Schema vocabulary cached successfully!';
        }

        processSchemaData(schemaData);

        statusText.textContent = `✅ Ready – ${classList.length} types, ${propertiesMap.size} properties loaded`;
        statsInfo.innerHTML = `<strong>${classList.length}</strong> schema types · <strong>${propertiesMap.size}</strong> properties`;
        loadingStatus.classList.add('hidden');

        document.getElementById('wizardCard').classList.remove('hidden');
        tabScrollInitialized = false;
        renderStepIndicator();
        renderStep();

    } catch (error) {
        statusText.textContent = '❌ Failed to load schema vocabulary';
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
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copied to clipboard!');
    });
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
    wizardState = { currentStep: 0, selectedClass: null, properties: {}, nestedObjects: {}, activePageType: 'Homepage' };
    document.getElementById('outputCard').classList.add('hidden');
    document.getElementById('wizardCard').classList.remove('hidden');
    tabScrollInitialized = false;
    renderStepIndicator();
    renderStep();
});

document.getElementById('manualRetryBtn').addEventListener('click', initApp);

// Start app
initApp();