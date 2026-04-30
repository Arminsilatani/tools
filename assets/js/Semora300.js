

const schemaAllData = {
  
  "@graph": [
    {
      "@id": "schema:WebSite",
      "@type": "rdfs:Class",
      "rdfs:comment": "A WebSite is a set of related web pages and other items typically served from a single web domain and accessible via URLs.",
      "rdfs:label": "WebSite",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:WebPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "A web page. Every web page is implicitly assumed to be declared to be of type WebPage, so the various properties about that webpage, such as <code>breadcrumb</code> may be used. We recommend explicit declaration if these properties are specified, but if they are found outside of an itemscope, they will be assumed to be about the page.",
      "rdfs:label": "WebPage",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:AboutPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "Web page type: About page.",
      "rdfs:label": "AboutPage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      }
    },
    {
      "@id": "schema:ContactPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "Web page type: Contact page.",
      "rdfs:label": "ContactPage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      }
    },
    {
      "@id": "schema:FAQPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "A [[FAQPage]] is a [[WebPage]] presenting one or more \"[Frequently asked questions](https://en.wikipedia.org/wiki/FAQ)\" (see also [[QAPage]]).",
      "rdfs:label": "FAQPage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1723"
      }
    },
    {
      "@id": "schema:ProfilePage",
      "@type": "rdfs:Class",
      "rdfs:comment": "Web page type: Profile page.",
      "rdfs:label": "ProfilePage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      }
    },
    {
      "@id": "schema:QAPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "A QAPage is a WebPage focussed on a specific Question and its Answer(s), e.g. in a question answering site or documenting Frequently Asked Questions (FAQs).",
      "rdfs:label": "QAPage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      }
    },
    {
      "@id": "schema:CheckoutPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "Web page type: Checkout page.",
      "rdfs:label": "CheckoutPage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      }
    },
    {
      "@id": "schema:CollectionPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "Web page type: Collection page.",
      "rdfs:label": "CollectionPage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      }
    },
    {
      "@id": "schema:SearchResultsPage",
      "@type": "rdfs:Class",
      "rdfs:comment": "Web page type: Search results page.",
      "rdfs:label": "SearchResultsPage",
      "rdfs:subClassOf": {
        "@id": "schema:WebPage"
      }
    },
    {
      "@id": "schema:Organization",
      "@type": "rdfs:Class",
      "owl:equivalentClass": [
        {
          "@id": "gs1:Organization"
        },
        {
          "@id": "fibo-fnd-org-org:Organization"
        }
      ],
      "rdfs:comment": "An organization such as a school, NGO, corporation, club, etc.",
      "rdfs:label": "Organization",
      "rdfs:subClassOf": {
        "@id": "schema:Thing"
      }
    },
    {
      "@id": "schema:Corporation",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "fibo-be-corp-corp:Corporation"
      },
      "rdfs:comment": "Organization: A business corporation.",
      "rdfs:label": "Corporation",
      "rdfs:subClassOf": {
        "@id": "schema:Organization"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/rNews"
      }
    },
    {
      "@id": "schema:LocalBusiness",
      "@type": "rdfs:Class",
      "rdfs:comment": "A particular physical business or branch of an organization. Examples of LocalBusiness include a restaurant, a particular branch of a restaurant chain, a branch of a bank, a medical practice, a club, a bowling alley, etc.",
      "rdfs:label": "LocalBusiness",
      "rdfs:subClassOf": [
        {
          "@id": "schema:Place"
        },
        {
          "@id": "schema:Organization"
        }
      ],
      "skos:closeMatch": {
        "@id": "http://www.w3.org/ns/regorg#RegisteredOrganization"
      }
    },
    {
      "@id": "schema:ProfessionalService",
      "@type": "rdfs:Class",
      "rdfs:comment": "Original definition: \"provider of professional services.\"\\n\\nThe general [[ProfessionalService]] type for local businesses was deprecated due to confusion with [[Service]]. For reference, the types that it included were: [[Dentist]],\n        [[AccountingService]], [[Attorney]], [[Notary]], as well as types for several kinds of [[HomeAndConstructionBusiness]]: [[Electrician]], [[GeneralContractor]],\n        [[HousePainter]], [[Locksmith]], [[Plumber]], [[RoofingContractor]]. [[LegalService]] was introduced as a more inclusive supertype of [[Attorney]].",
      "rdfs:label": "ProfessionalService",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:Service",
      "@type": "rdfs:Class",
      "rdfs:comment": "A service provided by an organization, e.g. delivery service, print services, etc.",
      "rdfs:label": "Service",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      }
    },
    {
      "@id": "schema:FinancialService",
      "@type": "rdfs:Class",
      "rdfs:comment": "Financial services business.",
      "rdfs:label": "FinancialService",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:MedicalOrganization",
      "@type": "rdfs:Class",
      "rdfs:comment": "A medical organization (physical or not), such as hospital, institution or clinic.",
      "rdfs:label": "MedicalOrganization",
      "rdfs:subClassOf": {
        "@id": "schema:Organization"
      }
    },
    {
      "@id": "schema:Dentist",
      "@type": "rdfs:Class",
      "rdfs:comment": "A dentist.",
      "rdfs:label": "Dentist",
      "rdfs:subClassOf": [
        {
          "@id": "schema:MedicalBusiness"
        },
        {
          "@id": "schema:MedicalOrganization"
        },
        {
          "@id": "schema:LocalBusiness"
        }
      ]
    },
    {
      "@id": "schema:LegalService",
      "@type": "rdfs:Class",
      "rdfs:comment": "A LegalService is a business that provides legally-oriented services, advice and representation, e.g. law firms.\\n\\nAs a [[LocalBusiness]] it can be described as a [[provider]] of one or more [[Service]]\\(s).",
      "rdfs:label": "LegalService",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:AccountingService",
      "@type": "rdfs:Class",
      "rdfs:comment": "Accountancy business.\\n\\nAs a [[LocalBusiness]] it can be described as a [[provider]] of one or more [[Service]]\\(s).\n      ",
      "rdfs:label": "AccountingService",
      "rdfs:subClassOf": {
        "@id": "schema:FinancialService"
      }
    },
    {
      "@id": "schema:AutoRepair",
      "@type": "rdfs:Class",
      "rdfs:comment": "Car repair business.",
      "rdfs:label": "AutoRepair",
      "rdfs:subClassOf": {
        "@id": "schema:AutomotiveBusiness"
      }
    },
    {
      "@id": "schema:AutomotiveBusiness",
      "@type": "rdfs:Class",
      "rdfs:comment": "Car repair, sales, or parts.",
      "rdfs:label": "AutomotiveBusiness",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:BeautySalon",
      "@type": "rdfs:Class",
      "rdfs:comment": "Beauty salon.",
      "rdfs:label": "BeautySalon",
      "rdfs:subClassOf": {
        "@id": "schema:HealthAndBeautyBusiness"
      }
    },
    {
      "@id": "schema:Store",
      "@type": "rdfs:Class",
      "rdfs:comment": "A retail good store.",
      "rdfs:label": "Store",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:ComputerStore",
      "@type": "rdfs:Class",
      "rdfs:comment": "A computer store.",
      "rdfs:label": "ComputerStore",
      "rdfs:subClassOf": {
        "@id": "schema:Store"
      }
    },
    {
      "@id": "schema:ElectronicsStore",
      "@type": "rdfs:Class",
      "rdfs:comment": "An electronics store.",
      "rdfs:label": "ElectronicsStore",
      "rdfs:subClassOf": {
        "@id": "schema:Store"
      }
    },
    {
      "@id": "schema:FurnitureStore",
      "@type": "rdfs:Class",
      "rdfs:comment": "A furniture store.",
      "rdfs:label": "FurnitureStore",
      "rdfs:subClassOf": {
        "@id": "schema:Store"
      }
    },
    {
      "@id": "schema:GroceryStore",
      "@type": "rdfs:Class",
      "rdfs:comment": "A grocery store.",
      "rdfs:label": "GroceryStore",
      "rdfs:subClassOf": {
        "@id": "schema:Store"
      }
    },
    {
      "@id": "schema:HardwareStore",
      "@type": "rdfs:Class",
      "rdfs:comment": "A hardware store.",
      "rdfs:label": "HardwareStore",
      "rdfs:subClassOf": {
        "@id": "schema:Store"
      }
    },
    {
      "@id": "schema:HealthClub",
      "@type": "rdfs:Class",
      "rdfs:comment": "A health club.",
      "rdfs:label": "HealthClub",
      "rdfs:subClassOf": [
        {
          "@id": "schema:HealthAndBeautyBusiness"
        },
        {
          "@id": "schema:SportsActivityLocation"
        }
      ]
    },
    {
      "@id": "schema:HomeAndConstructionBusiness",
      "@type": "rdfs:Class",
      "rdfs:comment": "A construction business.\\n\\nA HomeAndConstructionBusiness is a [[LocalBusiness]] that provides services around homes and buildings.\\n\\nAs a [[LocalBusiness]] it can be described as a [[provider]] of one or more [[Service]]\\(s).",
      "rdfs:label": "HomeAndConstructionBusiness",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:InternetCafe",
      "@type": "rdfs:Class",
      "rdfs:comment": "An internet cafe.",
      "rdfs:label": "InternetCafe",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:Locksmith",
      "@type": "rdfs:Class",
      "rdfs:comment": "A locksmith.",
      "rdfs:label": "Locksmith",
      "rdfs:subClassOf": {
        "@id": "schema:HomeAndConstructionBusiness"
      }
    },
    {
      "@id": "schema:NailSalon",
      "@type": "rdfs:Class",
      "rdfs:comment": "A nail salon.",
      "rdfs:label": "NailSalon",
      "rdfs:subClassOf": {
        "@id": "schema:HealthAndBeautyBusiness"
      }
    },
    {
      "@id": "schema:RealEstateAgent",
      "@type": "rdfs:Class",
      "rdfs:comment": "A real-estate agent.",
      "rdfs:label": "RealEstateAgent",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:Restaurant",
      "@type": "rdfs:Class",
      "rdfs:comment": "A restaurant.",
      "rdfs:label": "Restaurant",
      "rdfs:subClassOf": {
        "@id": "schema:FoodEstablishment"
      }
    },
    {
      "@id": "schema:CafeOrCoffeeShop",
      "@type": "rdfs:Class",
      "rdfs:comment": "A cafe or coffee shop.",
      "rdfs:label": "CafeOrCoffeeShop",
      "rdfs:subClassOf": {
        "@id": "schema:FoodEstablishment"
      }
    },
    {
      "@id": "schema:Bakery",
      "@type": "rdfs:Class",
      "rdfs:comment": "A bakery.",
      "rdfs:label": "Bakery",
      "rdfs:subClassOf": {
        "@id": "schema:FoodEstablishment"
      }
    },
    {
      "@id": "schema:TravelAgency",
      "@type": "rdfs:Class",
      "rdfs:comment": "A travel agency.",
      "rdfs:label": "TravelAgency",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:LodgingBusiness",
      "@type": "rdfs:Class",
      "rdfs:comment": "A lodging business, such as a motel, hotel, or inn.",
      "rdfs:label": "LodgingBusiness",
      "rdfs:subClassOf": {
        "@id": "schema:LocalBusiness"
      }
    },
    {
      "@id": "schema:Hotel",
      "@type": "rdfs:Class",
      "rdfs:comment": "A hotel is an establishment that provides lodging paid on a short-term basis (source: Wikipedia, the free encyclopedia, see http://en.wikipedia.org/wiki/Hotel).\n<br /><br />\nSee also the <a href=\"/docs/hotels.html\">dedicated document on the use of schema.org for marking up hotels and other forms of accommodations</a>.\n",
      "rdfs:label": "Hotel",
      "rdfs:subClassOf": {
        "@id": "schema:LodgingBusiness"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/STI_Accommodation_Ontology"
      }
    },
    {
      "@id": "schema:BedAndBreakfast",
      "@type": "rdfs:Class",
      "rdfs:comment": "Bed and breakfast.\n<br /><br />\nSee also the <a href=\"/docs/hotels.html\">dedicated document on the use of schema.org for marking up hotels and other forms of accommodations</a>.\n",
      "rdfs:label": "BedAndBreakfast",
      "rdfs:subClassOf": {
        "@id": "schema:LodgingBusiness"
      }
    },
    {
      "@id": "schema:Person",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "foaf:Person"
      },
      "rdfs:comment": "A person (alive, dead, undead, or fictional).",
      "rdfs:label": "Person",
      "rdfs:subClassOf": {
        "@id": "schema:Thing"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/rNews"
      }
    },
    {
      "@id": "schema:EmployeeRole",
      "@type": "rdfs:Class",
      "rdfs:comment": "A subclass of OrganizationRole used to describe employee relationships.",
      "rdfs:label": "EmployeeRole",
      "rdfs:subClassOf": {
        "@id": "schema:OrganizationRole"
      }
    },
    {
      "@id": "schema:Article",
      "@type": "rdfs:Class",
      "rdfs:comment": "An article, such as a news article or piece of investigative report. Newspapers and magazines have articles of many different types and this is intended to cover them all.\\n\\nSee also [blog post](https://blog.schema.org/2014/09/02/schema-org-support-for-bibliographic-relationships-and-periodicals/).",
      "rdfs:label": "Article",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/rNews"
      }
    },
    {
      "@id": "schema:NewsArticle",
      "@type": "rdfs:Class",
      "rdfs:comment": "A NewsArticle is an article whose content reports news, or provides background context and supporting materials for understanding the news.\n\nA more detailed overview of [schema.org News markup](/docs/news.html) is also available.\n",
      "rdfs:label": "NewsArticle",
      "rdfs:subClassOf": {
        "@id": "schema:Article"
      },
      "schema:contributor": [
        {
          "@id": "https://schema.org/docs/collab/rNews"
        },
        {
          "@id": "https://schema.org/docs/collab/TP"
        }
      ]
    },
    {
      "@id": "schema:Blog",
      "@type": "rdfs:Class",
      "rdfs:comment": "A [blog](https://en.wikipedia.org/wiki/Blog), sometimes known as a \"weblog\". Note that the individual posts ([[BlogPosting]]s) in a [[Blog]] are often colloquially referred to by the same term.",
      "rdfs:label": "Blog",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:BlogPosting",
      "@type": "rdfs:Class",
      "rdfs:comment": "A blog post.",
      "rdfs:label": "BlogPosting",
      "rdfs:subClassOf": {
        "@id": "schema:SocialMediaPosting"
      }
    },
    {
      "@id": "schema:DiscussionForumPosting",
      "@type": "rdfs:Class",
      "rdfs:comment": "A posting to a discussion forum.",
      "rdfs:label": "DiscussionForumPosting",
      "rdfs:subClassOf": {
        "@id": "schema:SocialMediaPosting"
      }
    },
    {
      "@id": "schema:AnalysisNewsArticle",
      "@type": "rdfs:Class",
      "rdfs:comment": "An AnalysisNewsArticle is a [[NewsArticle]] that, while based on factual reporting, incorporates the expertise of the author/producer, offering interpretations and conclusions.",
      "rdfs:label": "AnalysisNewsArticle",
      "rdfs:subClassOf": {
        "@id": "schema:NewsArticle"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/TP"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1525"
      }
    },
    {
      "@id": "schema:BackgroundNewsArticle",
      "@type": "rdfs:Class",
      "rdfs:comment": "A [[NewsArticle]] providing historical context, definition and detail on a specific topic (aka \"explainer\" or \"backgrounder\"). For example, an in-depth article or frequently-asked-questions ([FAQ](https://en.wikipedia.org/wiki/FAQ)) document on topics such as Climate Change or the European Union. Other kinds of background material from a non-news setting are often described using [[Book]] or [[Article]], in particular [[ScholarlyArticle]]. See also [[NewsArticle]] for related vocabulary from a learning/education perspective.",
      "rdfs:label": "BackgroundNewsArticle",
      "rdfs:subClassOf": {
        "@id": "schema:NewsArticle"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/TP"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1525"
      }
    },
    {
      "@id": "schema:Report",
      "@type": "rdfs:Class",
      "rdfs:comment": "A Report generated by governmental or non-governmental organization.",
      "rdfs:label": "Report",
      "rdfs:subClassOf": {
        "@id": "schema:Article"
      }
    },
    {
      "@id": "schema:Review",
      "@type": "rdfs:Class",
      "rdfs:comment": "A review of an item - for example, of a restaurant, movie, or store.",
      "rdfs:label": "Review",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:CriticReview",
      "@type": "rdfs:Class",
      "rdfs:comment": "A [[CriticReview]] is a more specialized form of Review written or published by a source that is recognized for its reviewing activities. These can include online columns, travel and food guides, TV and radio shows, blogs and other independent Web sites. [[CriticReview]]s are typically more in-depth and professionally written. For simpler, casually written user/visitor/viewer/customer reviews, it is more appropriate to use the [[UserReview]] type. Review aggregator sites such as Metacritic already separate out the site's user reviews from selected critic reviews that originate from third-party sources.",
      "rdfs:label": "CriticReview",
      "rdfs:subClassOf": {
        "@id": "schema:Review"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1589"
      }
    },
    {
      "@id": "schema:Comment",
      "@type": "rdfs:Class",
      "rdfs:comment": "A comment on an item - for example, a comment on a blog post. The comment's content is expressed via the [[text]] property, and its topic via [[about]], properties shared with all CreativeWorks.",
      "rdfs:label": "Comment",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:CreativeWork",
      "@type": "rdfs:Class",
      "rdfs:comment": "The most generic kind of creative work, including books, movies, photographs, software programs, etc.",
      "rdfs:label": "CreativeWork",
      "rdfs:subClassOf": {
        "@id": "schema:Thing"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/rNews"
      }
    },
    {
      "@id": "schema:CreativeWorkSeries",
      "@type": "rdfs:Class",
      "rdfs:comment": "A CreativeWorkSeries in schema.org is a group of related items, typically but not necessarily of the same kind. CreativeWorkSeries are usually organized into some order, often chronological. Unlike [[ItemList]] which is a general purpose data structure for lists of things, the emphasis with CreativeWorkSeries is on published materials (written e.g. books and periodicals, or media such as TV, radio and games).\\n\\nSpecific subtypes are available for describing [[TVSeries]], [[RadioSeries]], [[MovieSeries]], [[BookSeries]], [[Periodical]] and [[VideoGameSeries]]. In each case, the [[hasPart]] / [[isPartOf]] properties can be used to relate the CreativeWorkSeries to its parts. The general CreativeWorkSeries type serves largely just to organize these more specific and practical subtypes.\\n\\nIt is common for properties applicable to an item from the series to be usefully applied to the containing group. Schema.org attempts to anticipate some of these cases, but publishers should be free to apply properties of the series parts to the series as a whole wherever they seem appropriate.\n    ",
      "rdfs:label": "CreativeWorkSeries",
      "rdfs:subClassOf": [
        {
          "@id": "schema:Series"
        },
        {
          "@id": "schema:CreativeWork"
        }
      ]
    },
    {
      "@id": "schema:DigitalDocument",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "unece:ElectronicDocument"
      },
      "rdfs:comment": "An electronic file or document.",
      "rdfs:label": "DigitalDocument",
      "rdfs:subClassOf": [
        {
          "@id": "schema:CreativeWork"
        },
        {
          "@id": "fibo-fnd-arr-doc:Document"
        }
      ]
    },
    {
      "@id": "schema:AudioObject",
      "@type": "rdfs:Class",
      "rdfs:comment": "An audio file.",
      "rdfs:label": "AudioObject",
      "rdfs:subClassOf": {
        "@id": "schema:MediaObject"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/rNews"
      }
    },
    {
      "@id": "schema:AudioObjectSnapshot",
      "@type": "rdfs:Class",
      "rdfs:comment": "A specific and exact (byte-for-byte) version of an [[AudioObject]]. Two byte-for-byte identical files, for the purposes of this type, considered identical. If they have different embedded metadata the files will differ. Different external facts about the files, e.g. creator or dateCreated that aren't represented in their actual content, do not affect this notion of identity.",
      "rdfs:label": "AudioObjectSnapshot",
      "rdfs:subClassOf": {
        "@id": "schema:AudioObject"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/2450"
      }
    },
    {
      "@id": "schema:VideoObject",
      "@type": "rdfs:Class",
      "rdfs:comment": "A video file.",
      "rdfs:label": "VideoObject",
      "rdfs:subClassOf": {
        "@id": "schema:MediaObject"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/rNews"
      }
    },
    {
      "@id": "schema:Movie",
      "@type": "rdfs:Class",
      "rdfs:comment": "A movie.",
      "rdfs:label": "Movie",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:TVSeries",
      "@type": "rdfs:Class",
      "rdfs:comment": "CreativeWorkSeries dedicated to TV broadcast and associated online delivery.",
      "rdfs:label": "TVSeries",
      "rdfs:subClassOf": [
        {
          "@id": "schema:CreativeWorkSeries"
        },
        {
          "@id": "schema:CreativeWork"
        }
      ]
    },
    {
      "@id": "schema:Episode",
      "@type": "rdfs:Class",
      "rdfs:comment": "A media episode (e.g. TV, radio, video game) which can be part of a series or season.",
      "rdfs:label": "Episode",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:ImageObject",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "dctype:Image"
      },
      "rdfs:comment": "An image file.",
      "rdfs:label": "ImageObject",
      "rdfs:subClassOf": {
        "@id": "schema:MediaObject"
      }
    },
    {
      "@id": "schema:Clip",
      "@type": "rdfs:Class",
      "rdfs:comment": "A short TV or radio program or a segment/part of a program.",
      "rdfs:label": "Clip",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:Drawing",
      "@type": "rdfs:Class",
      "rdfs:comment": "A picture or diagram made with a pencil, pen, or crayon rather than paint.",
      "rdfs:label": "Drawing",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1448"
      }
    },
    {
      "@id": "schema:3DModel",
      "@type": "rdfs:Class",
      "rdfs:comment": "A 3D model represents some kind of 3D content, which may have [[encoding]]s in one or more [[MediaObject]]s. Many 3D formats are available (e.g. see [Wikipedia](https://en.wikipedia.org/wiki/Category:3D_graphics_file_formats)); specific encoding formats can be represented using the [[encodingFormat]] property applied to the relevant [[MediaObject]]. For the\ncase of a single file published after Zip compression, the convention of appending '+zip' to the [[encodingFormat]] can be used. Geospatial, AR/VR, artistic/animation, gaming, engineering and scientific content can all be represented using [[3DModel]].",
      "rdfs:label": "3DModel",
      "rdfs:subClassOf": {
        "@id": "schema:MediaObject"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/2140"
      }
    },
    {
      "@id": "schema:Product",
      "@type": "rdfs:Class",
      "owl:equivalentClass": [
        {
          "@id": "unece:TradeProduct"
        },
        {
          "@id": "fibo-fnd-pas-pas:Product"
        }
      ],
      "rdfs:comment": "Any offered product or service. For example: a pair of shoes; a concert ticket; the rental of a car; a haircut; or an episode of a TV show streamed online.",
      "rdfs:label": "Product",
      "rdfs:subClassOf": {
        "@id": "schema:Thing"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/GoodRelationsTerms"
      }
    },
    {
      "@id": "schema:Offer",
      "@type": "rdfs:Class",
      "owl:equivalentClass": [
        {
          "@id": "unece:Offer"
        },
        {
          "@id": "fibo-fnd-pas-pas:Offer"
        }
      ],
      "rdfs:comment": "An offer to transfer some rights to an item or to provide a service — for example, an offer to sell tickets to an event, to rent the DVD of a movie, to stream a TV show over the internet, to repair a motorcycle, or to loan a book.\\n\\nNote: As the [[businessFunction]] property, which identifies the form of offer (e.g. sell, lease, repair, dispose), defaults to http://purl.org/goodrelations/v1#Sell; an Offer without a defined businessFunction value can be assumed to be an offer to sell.\\n\\nFor [GTIN](http://www.gs1.org/barcodes/technical/idkeys/gtin)-related fields, see [Check Digit calculator](http://www.gs1.org/barcodes/support/check_digit_calculator) and [validation guide](http://www.gs1us.org/resources/standards/gtin-validation-guide) from [GS1](http://www.gs1.org/).",
      "rdfs:label": "Offer",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/GoodRelationsTerms"
      }
    },
    {
      "@id": "schema:AggregateOffer",
      "@type": "rdfs:Class",
      "rdfs:comment": "When a single product is associated with multiple offers (for example, the same pair of shoes is offered by different merchants), then AggregateOffer can be used.\\n\\nNote: AggregateOffers are normally expected to associate multiple offers that all share the same defined [[businessFunction]] value, or default to http://purl.org/goodrelations/v1#Sell if businessFunction is not explicitly defined.",
      "rdfs:label": "AggregateOffer",
      "rdfs:subClassOf": {
        "@id": "schema:Offer"
      }
    },
    {
      "@id": "schema:AggregateRating",
      "@type": "rdfs:Class",
      "rdfs:comment": "The average rating based on multiple ratings or reviews.",
      "rdfs:label": "AggregateRating",
      "rdfs:subClassOf": {
        "@id": "schema:Rating"
      }
    },
    {
      "@id": "schema:Brand",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "unece:BrandName"
      },
      "rdfs:comment": "A brand is a name used by an organization or business person for labeling a product, product group, or similar.",
      "rdfs:label": "Brand",
      "rdfs:subClassOf": [
        {
          "@id": "schema:Intangible"
        },
        {
          "@id": "cmns-cls:Classifier"
        }
      ],
      "schema:contributor": {
        "@id": "https://blog.schema.org/2012/11/08/good-relations-and-schema-org/"
      }
    },
    {
      "@id": "schema:MerchantReturnPolicy",
      "@type": "rdfs:Class",
      "rdfs:comment": "A MerchantReturnPolicy provides information about product return policies associated with an [[Organization]], [[Product]], or [[Offer]].",
      "rdfs:label": "MerchantReturnPolicy",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/2288"
      }
    },
    {
      "@id": "schema:SizeSpecification",
      "@type": "rdfs:Class",
      "rdfs:comment": "Size related properties of a product, typically a size code ([[name]]) and optionally a [[sizeSystem]], [[sizeGroup]], and product measurements ([[hasMeasurement]]). In addition, the intended audience can be defined through [[suggestedAge]], [[suggestedGender]], and suggested body measurements ([[suggestedMeasurement]]).",
      "rdfs:label": "SizeSpecification",
      "rdfs:subClassOf": {
        "@id": "schema:QualitativeValue"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/2811"
      }
    },
    {
      "@id": "schema:JobPosting",
      "@type": "rdfs:Class",
      "rdfs:comment": "A listing that describes a job opening in a certain organization.",
      "rdfs:label": "JobPosting",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      }
    },
    {
      "@id": "schema:PropertyValue",
      "@type": "rdfs:Class",
      "rdfs:comment": "A property-value pair, e.g. representing a feature of a product or place. Use the 'name' property for the name of the property. If there is an additional human-readable version of the value, put that into the 'description' property.\\n\\n Always use specific schema.org properties when a) they exist and b) you can populate them. Using PropertyValue as a substitute will typically not trigger the same effect as using the original, specific property.\n    ",
      "rdfs:label": "PropertyValue",
      "rdfs:subClassOf": {
        "@id": "schema:StructuredValue"
      },
      "schema:contributor": {
        "@id": "https://blog.schema.org/2012/11/08/good-relations-and-schema-org/"
      }
    },
    {
      "@id": "schema:mpn",
      "@type": "rdf:Property",
      "owl:equivalentProperty": {
        "@id": "unece:manufacturerAssignedId"
      },
      "rdfs:comment": "The Manufacturer Part Number (MPN) of the product, or the product to which the offer refers.",
      "rdfs:label": "mpn",
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/GoodRelationsTerms"
      },
      "schema:domainIncludes": [
        {
          "@id": "schema:Demand"
        },
        {
          "@id": "schema:Product"
        },
        {
          "@id": "schema:Offer"
        }
      ],
      "schema:rangeIncludes": {
        "@id": "schema:Text"
      }
    },
    {
      "@id": "schema:gtin",
      "@type": "rdf:Property",
      "owl:equivalentProperty": [
        {
          "@id": "gs1:gtin"
        },
        {
          "@id": "unece:gTINId"
        }
      ],
      "rdfs:comment": "A Global Trade Item Number ([GTIN](https://www.gs1.org/standards/id-keys/gtin)). GTINs identify trade items, including products and services, using numeric identification codes.\n\nA correct [[gtin]] value should be a valid GTIN, which means that it should be an all-numeric string of either 8, 12, 13 or 14 digits, or a \"GS1 Digital Link\" URL based on such a string. The numeric component should also have a [valid GS1 check digit](https://www.gs1.org/services/check-digit-calculator) and meet the other rules for valid GTINs. See also [GS1's GTIN Summary](http://www.gs1.org/barcodes/technical/idkeys/gtin) and [Wikipedia](https://en.wikipedia.org/wiki/Global_Trade_Item_Number) for more details. Left-padding of the gtin values is not required or encouraged. The [[gtin]] property generalizes the earlier [[gtin8]], [[gtin12]], [[gtin13]], and [[gtin14]] properties.\n\nThe GS1 [digital link specifications](https://www.gs1.org/standards/Digital-Link/) expresses GTINs as URLs (URIs, IRIs, etc.).\nDigital Links should be populated into the [[hasGS1DigitalLink]] attribute.\n\nNote also that this is a definition for how to include GTINs in Schema.org data, and not a definition of GTINs in general - see the GS1 documentation for authoritative details.",
      "rdfs:label": "gtin",
      "rdfs:subPropertyOf": {
        "@id": "schema:identifier"
      },
      "schema:domainIncludes": [
        {
          "@id": "schema:Offer"
        },
        {
          "@id": "schema:Demand"
        },
        {
          "@id": "schema:Product"
        }
      ],
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:rangeIncludes": [
        {
          "@id": "schema:Text"
        },
        {
          "@id": "schema:URL"
        }
      ],
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/2288"
      }
    },
    {
      "@id": "schema:sku",
      "@type": "rdf:Property",
      "owl:equivalentProperty": {
        "@id": "unece:sellerAssignedId"
      },
      "rdfs:comment": "The Stock Keeping Unit (SKU), i.e. a merchant-specific identifier for a product or service, or the product to which the offer refers.",
      "rdfs:label": "sku",
      "rdfs:subPropertyOf": {
        "@id": "schema:identifier"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/GoodRelationsTerms"
      },
      "schema:domainIncludes": [
        {
          "@id": "schema:Product"
        },
        {
          "@id": "schema:Offer"
        },
        {
          "@id": "schema:Demand"
        }
      ],
      "schema:rangeIncludes": {
        "@id": "schema:Text"
      }
    },
    {
      "@id": "schema:PriceSpecification",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "fibo-fnd-pas-pas:Price"
      },
      "rdfs:comment": "A structured value representing a price or price range. Typically, only the subclasses of this type are used for markup. It is recommended to use [[MonetaryAmount]] to describe independent amounts of money such as a salary, credit card limits, etc.",
      "rdfs:label": "PriceSpecification",
      "rdfs:subClassOf": {
        "@id": "schema:StructuredValue"
      },
      "schema:contributor": {
        "@id": "https://blog.schema.org/2012/11/08/good-relations-and-schema-org/"
      }
    },
    {
      "@id": "schema:UnitPriceSpecification",
      "@type": "rdfs:Class",
      "rdfs:comment": "The price asked for a given offer by the respective organization or person.",
      "rdfs:label": "UnitPriceSpecification",
      "rdfs:subClassOf": {
        "@id": "schema:PriceSpecification"
      },
      "schema:contributor": {
        "@id": "https://blog.schema.org/2012/11/08/good-relations-and-schema-org/"
      }
    },
    {
      "@id": "schema:DeliveryTimeSettings",
      "@type": "rdfs:Class",
      "rdfs:comment": "A DeliveryTimeSettings represents re-usable pieces of shipping information, relating to timing. It is designed for publication on an URL that may be referenced via the [[shippingSettingsLink]] property of an [[OfferShippingDetails]]. Several occurrences can be published, distinguished (and identified/referenced) by their different values for [[transitTimeLabel]].",
      "rdfs:label": "DeliveryTimeSettings",
      "rdfs:subClassOf": {
        "@id": "schema:StructuredValue"
      },
      "schema:isPartOf": {
        "@id": "https://attic.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/2506"
      },
      "schema:supersededBy": {
        "@id": "schema:ShippingConditions"
      }
    },
    {
      "@id": "schema:Demand",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "unece:RequestForQuotation"
      },
      "rdfs:comment": "A demand entity represents the public, not necessarily binding, not necessarily exclusive, announcement by an organization or person to seek a certain type of goods or services. For describing demand using this type, the very same properties used for Offer apply.",
      "rdfs:label": "Demand",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      },
      "schema:contributor": {
        "@id": "https://blog.schema.org/2012/11/08/good-relations-and-schema-org/"
      }
    },
    {
      "@id": "schema:ItemList",
      "@type": "rdfs:Class",
      "rdfs:comment": "A list of items of any sort&#x2014;for example, Top 10 Movies About Weathermen, or Top 100 Party Songs. Not to be confused with HTML lists, which are often used only for formatting.",
      "rdfs:label": "ItemList",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      }
    },
    {
      "@id": "schema:BreadcrumbList",
      "@type": "rdfs:Class",
      "rdfs:comment": "A BreadcrumbList is an ItemList consisting of a chain of linked Web pages, typically described using at least their URL and their name, and typically ending with the current page.\\n\\nThe [[position]] property is used to reconstruct the order of the items in a BreadcrumbList. The convention is that a breadcrumb list has an [[itemListOrder]] of [[ItemListOrderAscending]] (lower values listed first), and that the first items in this list correspond to the \"top\" or beginning of the breadcrumb trail, e.g. with a site or section homepage. The specific values of 'position' are not assigned meaning for a BreadcrumbList, but they should be integers, e.g. beginning with '1' for the first item in the list.\n      ",
      "rdfs:label": "BreadcrumbList",
      "rdfs:subClassOf": {
        "@id": "schema:ItemList"
      }
    },
    {
      "@id": "schema:HowTo",
      "@type": "rdfs:Class",
      "rdfs:comment": "Instructions that explain how to achieve a result by performing a sequence of steps.",
      "rdfs:label": "HowTo",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:SpeakableSpecification",
      "@type": "rdfs:Class",
      "rdfs:comment": "A SpeakableSpecification indicates (typically via [[xpath]] or [[cssSelector]]) sections of a document that are highlighted as particularly [[speakable]]. Instances of this type are expected to be used primarily as values of the [[speakable]] property.",
      "rdfs:label": "SpeakableSpecification",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1389"
      }
    },
    {
      "@id": "schema:Recipe",
      "@type": "rdfs:Class",
      "rdfs:comment": "A recipe. For dietary restrictions covered by the recipe, a few common restrictions are enumerated via [[suitableForDiet]]. The [[keywords]] property can also be used to add more detail.",
      "rdfs:label": "Recipe",
      "rdfs:subClassOf": {
        "@id": "schema:HowTo"
      }
    },
    {
      "@id": "schema:Event",
      "@type": "rdfs:Class",
      "owl:equivalentClass": [
        {
          "@id": "dctype:Event"
        },
        {
          "@id": "fibo-fnd-dt-oc:Occurrence"
        }
      ],
      "rdfs:comment": "An event happening at a certain time and location, such as a concert, lecture, or festival. Ticketing information may be added via the [[offers]] property. Repeated events may be structured as separate Event objects.",
      "rdfs:label": "Event",
      "rdfs:subClassOf": {
        "@id": "schema:Thing"
      }
    },
    {
      "@id": "schema:BusinessEvent",
      "@type": "rdfs:Class",
      "rdfs:comment": "Event type: Business event.",
      "rdfs:label": "BusinessEvent",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:EducationEvent",
      "@type": "rdfs:Class",
      "rdfs:comment": "Event type: Education event.",
      "rdfs:label": "EducationEvent",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:MusicEvent",
      "@type": "rdfs:Class",
      "rdfs:comment": "Event type: Music event.",
      "rdfs:label": "MusicEvent",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:SportsEvent",
      "@type": "rdfs:Class",
      "rdfs:comment": "Event type: Sports event.",
      "rdfs:label": "SportsEvent",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:SaleEvent",
      "@type": "rdfs:Class",
      "rdfs:comment": "Event type: Sales event.",
      "rdfs:label": "SaleEvent",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:Festival",
      "@type": "rdfs:Class",
      "rdfs:comment": "Event type: Festival.",
      "rdfs:label": "Festival",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:TheaterEvent",
      "@type": "rdfs:Class",
      "rdfs:comment": "Event type: Theater performance.",
      "rdfs:label": "TheaterEvent",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:CourseInstance",
      "@type": "rdfs:Class",
      "rdfs:comment": "An instance of a [[Course]] which is distinct from other instances because it is offered at a different time or location or through different media or modes of study or to a specific section of students.",
      "rdfs:label": "CourseInstance",
      "rdfs:subClassOf": {
        "@id": "schema:Event"
      }
    },
    {
      "@id": "schema:EventSeries",
      "@type": "rdfs:Class",
      "rdfs:comment": "A series of [[Event]]s. Included events can relate with the series using the [[superEvent]] property.\n\nAn EventSeries is a collection of events that share some unifying characteristic. For example, \"The Olympic Games\" is a series, which\nis repeated regularly. The \"2012 London Olympics\" can be presented both as an [[Event]] in the series \"Olympic Games\", and as an\n[[EventSeries]] that included a number of sporting competitions as Events.\n\nThe nature of the association between the events in an [[EventSeries]] can vary, but typical examples could\ninclude a thematic event series (e.g. topical meetups or classes), or a series of regular events that share a location, attendee group and/or organizers.\n\nEventSeries has been defined as a kind of Event to make it easy for publishers to use it in an Event context without\nworrying about which kinds of series are really event-like enough to call an Event. In general an EventSeries\nmay seem more Event-like when the period of time is compact and when aspects such as location are fixed, but\nit may also sometimes prove useful to describe a longer-term series as an Event.\n   ",
      "rdfs:label": "EventSeries",
      "rdfs:subClassOf": [
        {
          "@id": "schema:Series"
        },
        {
          "@id": "schema:Event"
        }
      ],
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/447"
      }
    },
    {
      "@id": "schema:EducationalOrganization",
      "@type": "rdfs:Class",
      "rdfs:comment": "An educational organization.",
      "rdfs:label": "EducationalOrganization",
      "rdfs:subClassOf": [
        {
          "@id": "schema:CivicStructure"
        },
        {
          "@id": "schema:Organization"
        }
      ]
    },
    {
      "@id": "schema:LearningResource",
      "@type": "rdfs:Class",
      "rdfs:comment": "The LearningResource type can be used to indicate [[CreativeWork]]s (whether physical or digital) that have a particular and explicit orientation towards learning, education, skill acquisition, and other educational purposes.\n\n[[LearningResource]] is expected to be used as an addition to a primary type such as [[Book]], [[VideoObject]], [[Product]] etc.\n\n[[EducationEvent]] serves a similar purpose for event-like things (e.g. a [[Trip]]). A [[LearningResource]] may be created as a result of an [[EducationEvent]], for example by recording one.",
      "rdfs:label": "LearningResource",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1401"
      }
    },
    {
      "@id": "schema:Book",
      "@type": "rdfs:Class",
      "rdfs:comment": "A book.",
      "rdfs:label": "Book",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:Place",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "cmns-loc:Location"
      },
      "rdfs:comment": "Entities that have a somewhat fixed, physical extension.",
      "rdfs:label": "Place",
      "rdfs:subClassOf": {
        "@id": "schema:Thing"
      }
    },
    {
      "@id": "schema:CivicStructure",
      "@type": "rdfs:Class",
      "rdfs:comment": "A public structure, such as a town hall or concert hall.",
      "rdfs:label": "CivicStructure",
      "rdfs:subClassOf": {
        "@id": "schema:Place"
      }
    },
    {
      "@id": "schema:TouristAttraction",
      "@type": "rdfs:Class",
      "rdfs:comment": "A tourist attraction.  In principle any Thing can be a [[TouristAttraction]], from a [[Mountain]] and [[LandmarksOrHistoricalBuildings]] to a [[LocalBusiness]].  This Type can be used on its own to describe a general [[TouristAttraction]], or be used as an [[additionalType]] to add tourist attraction properties to any other type.  (See examples below)",
      "rdfs:label": "TouristAttraction",
      "rdfs:subClassOf": {
        "@id": "schema:Place"
      },
      "schema:contributor": [
        {
          "@id": "https://schema.org/docs/collab/IIT-CNR.it"
        },
        {
          "@id": "https://schema.org/docs/collab/Tourism"
        }
      ]
    },
    {
      "@id": "schema:TouristDestination",
      "@type": "rdfs:Class",
      "rdfs:comment": "A tourist destination. In principle any [[Place]] can be a [[TouristDestination]] from a [[City]], Region or [[Country]] to an [[AmusementPark]] or [[Hotel]]. This Type can be used on its own to describe a general [[TouristDestination]], or be used as an [[additionalType]] to add tourist relevant properties to any other [[Place]].  A [[TouristDestination]] is defined as a [[Place]] that contains, or is colocated with, one or more [[TouristAttraction]]s, often linked by a similar theme or interest to a particular [[touristType]]. The [UNWTO](http://www2.unwto.org/) defines Destination (main destination of a tourism trip) as the place visited that is central to the decision to take the trip.\n  (See examples below.)",
      "rdfs:label": "TouristDestination",
      "rdfs:subClassOf": {
        "@id": "schema:Place"
      },
      "schema:contributor": [
        {
          "@id": "https://schema.org/docs/collab/IIT-CNR.it"
        },
        {
          "@id": "https://schema.org/docs/collab/Tourism"
        }
      ],
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1810"
      }
    },
    {
      "@id": "schema:LandmarksOrHistoricalBuildings",
      "@type": "rdfs:Class",
      "rdfs:comment": "An historical landmark or building.",
      "rdfs:label": "LandmarksOrHistoricalBuildings",
      "rdfs:subClassOf": {
        "@id": "schema:Place"
      }
    },
    {
      "@id": "schema:Airport",
      "@type": "rdfs:Class",
      "rdfs:comment": "An airport.",
      "rdfs:label": "Airport",
      "rdfs:subClassOf": {
        "@id": "schema:CivicStructure"
      }
    },
    {
      "@id": "schema:Park",
      "@type": "rdfs:Class",
      "rdfs:comment": "A park.",
      "rdfs:label": "Park",
      "rdfs:subClassOf": {
        "@id": "schema:CivicStructure"
      }
    },
    {
      "@id": "schema:Museum",
      "@type": "rdfs:Class",
      "rdfs:comment": "A museum.",
      "rdfs:label": "Museum",
      "rdfs:subClassOf": {
        "@id": "schema:CivicStructure"
      }
    },
    {
      "@id": "schema:StadiumOrArena",
      "@type": "rdfs:Class",
      "rdfs:comment": "A stadium.",
      "rdfs:label": "StadiumOrArena",
      "rdfs:subClassOf": [
        {
          "@id": "schema:CivicStructure"
        },
        {
          "@id": "schema:SportsActivityLocation"
        }
      ]
    },
    {
      "@id": "schema:MedicalCondition",
      "@type": "rdfs:Class",
      "rdfs:comment": "Any condition of the human body that affects the normal functioning of a person, whether physically or mentally. Includes diseases, injuries, disabilities, disorders, syndromes, etc.",
      "rdfs:label": "MedicalCondition",
      "rdfs:subClassOf": {
        "@id": "schema:MedicalEntity"
      },
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:MedicalCause",
      "@type": "rdfs:Class",
      "rdfs:comment": "The causative agent(s) that are responsible for the pathophysiologic process that eventually results in a medical condition, symptom or sign. In this schema, unless otherwise specified this is meant to be the proximate cause of the medical condition, symptom or sign. The proximate cause is defined as the causative agent that most directly results in the medical condition, symptom or sign. For example, the HIV virus could be considered a cause of AIDS. Or in a diagnostic context, if a patient fell and sustained a hip fracture and two days later sustained a pulmonary embolism which eventuated in a cardiac arrest, the cause of the cardiac arrest (the proximate cause) would be the pulmonary embolism and not the fall. Medical causes can include cardiovascular, chemical, dermatologic, endocrine, environmental, gastroenterologic, genetic, hematologic, gynecologic, iatrogenic, infectious, musculoskeletal, neurologic, nutritional, obstetric, oncologic, otolaryngologic, pharmacologic, psychiatric, pulmonary, renal, rheumatologic, toxic, traumatic, or urologic causes; medical conditions can be causes as well.",
      "rdfs:label": "MedicalCause",
      "rdfs:subClassOf": {
        "@id": "schema:MedicalEntity"
      },
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:MedicalProcedure",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "snomed:50731006"
      },
      "rdfs:comment": "A process of care used in either a diagnostic, therapeutic, preventive or palliative capacity that relies on invasive (surgical), non-invasive, or other techniques.",
      "rdfs:label": "MedicalProcedure",
      "rdfs:subClassOf": {
        "@id": "schema:MedicalEntity"
      },
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:MedicalTest",
      "@type": "rdfs:Class",
      "rdfs:comment": "Any medical test, typically performed for diagnostic purposes.",
      "rdfs:label": "MedicalTest",
      "rdfs:subClassOf": {
        "@id": "schema:MedicalEntity"
      },
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:Hospital",
      "@type": "rdfs:Class",
      "rdfs:comment": "A hospital.",
      "rdfs:label": "Hospital",
      "rdfs:subClassOf": [
        {
          "@id": "schema:CivicStructure"
        },
        {
          "@id": "schema:EmergencyService"
        },
        {
          "@id": "schema:MedicalOrganization"
        }
      ]
    },
    {
      "@id": "schema:Diet",
      "@type": "rdfs:Class",
      "rdfs:comment": "A strategy of regulating the intake of food to achieve or maintain a specific health-related goal.",
      "rdfs:label": "Diet",
      "rdfs:subClassOf": [
        {
          "@id": "schema:CreativeWork"
        },
        {
          "@id": "schema:LifestyleModification"
        }
      ],
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:Drug",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "snomed:410942007"
      },
      "rdfs:comment": "A chemical or biologic substance, used as a medical therapy, that has a physiological effect on an organism. Here the term drug is used interchangeably with the term medicine although clinical knowledge makes a clear difference between them.",
      "rdfs:label": "Drug",
      "rdfs:subClassOf": [
        {
          "@id": "schema:Product"
        },
        {
          "@id": "schema:Substance"
        }
      ],
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:DoseSchedule",
      "@type": "rdfs:Class",
      "rdfs:comment": "A specific dosing schedule for a drug or supplement.",
      "rdfs:label": "DoseSchedule",
      "rdfs:subClassOf": {
        "@id": "schema:MedicalIntangible"
      },
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:OccupationalTherapy",
      "@type": "rdfs:Class",
      "rdfs:comment": "A treatment of people with physical, emotional, or social problems, using purposeful activity to help them overcome or learn to deal with their problems.",
      "rdfs:label": "OccupationalTherapy",
      "rdfs:subClassOf": {
        "@id": "schema:MedicalTherapy"
      },
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:PhysicalTherapy",
      "@type": "rdfs:Class",
      "rdfs:comment": "A process of progressive physical care and rehabilitation aimed at improving a health condition.",
      "rdfs:label": "PhysicalTherapy",
      "rdfs:subClassOf": {
        "@id": "schema:MedicalTherapy"
      },
      "schema:isPartOf": {
        "@id": "https://health-lifesci.schema.org"
      }
    },
    {
      "@id": "schema:Dataset",
      "@type": "rdfs:Class",
      "owl:equivalentClass": [
        {
          "@id": "dcat:Dataset"
        },
        {
          "@id": "dctype:Dataset"
        },
        {
          "@id": "void:Dataset"
        }
      ],
      "rdfs:comment": "A body of structured information describing some topic(s) of interest.",
      "rdfs:label": "Dataset",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/DatasetClass"
      }
    },
    {
      "@id": "schema:DataCatalog",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "dcat:Catalog"
      },
      "rdfs:comment": "A collection of datasets.",
      "rdfs:label": "DataCatalog",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/DatasetClass"
      }
    },
    {
      "@id": "schema:DataDownload",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "dcat:Distribution"
      },
      "rdfs:comment": "All or part of a [[Dataset]] in downloadable form. ",
      "rdfs:label": "DataDownload",
      "rdfs:subClassOf": {
        "@id": "schema:MediaObject"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/DatasetClass"
      }
    },
    {
      "@id": "schema:SoftwareApplication",
      "@type": "rdfs:Class",
      "rdfs:comment": "A software application.",
      "rdfs:label": "SoftwareApplication",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:MobileApplication",
      "@type": "rdfs:Class",
      "rdfs:comment": "A software application designed specifically to work well on a mobile device such as a telephone.",
      "rdfs:label": "MobileApplication",
      "rdfs:subClassOf": {
        "@id": "schema:SoftwareApplication"
      }
    },
    {
      "@id": "schema:WebApplication",
      "@type": "rdfs:Class",
      "rdfs:comment": "Web applications.",
      "rdfs:label": "WebApplication",
      "rdfs:subClassOf": {
        "@id": "schema:SoftwareApplication"
      }
    },
    {
      "@id": "schema:APIReference",
      "@type": "rdfs:Class",
      "rdfs:comment": "Reference documentation for application programming interfaces (APIs).",
      "rdfs:label": "APIReference",
      "rdfs:subClassOf": {
        "@id": "schema:TechArticle"
      }
    },
    {
      "@id": "schema:Code",
      "@type": "rdfs:Class",
      "rdfs:comment": "Computer programming source code. Example: Full (compile ready) solutions, code snippet samples, scripts, templates.",
      "rdfs:label": "Code",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      },
      "schema:supersededBy": {
        "@id": "schema:SoftwareSourceCode"
      }
    },
    {
      "@id": "schema:ComputerLanguage",
      "@type": "rdfs:Class",
      "rdfs:comment": "This type covers computer programming languages such as Scheme and Lisp, as well as other language-like computer representations. Natural languages are best represented with the [[Language]] type.",
      "rdfs:label": "ComputerLanguage",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      }
    },
    {
      "@id": "schema:Trip",
      "@type": "rdfs:Class",
      "rdfs:comment": "A trip or journey. An itinerary of visits to one or more places.",
      "rdfs:label": "Trip",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/Tourism"
      }
    },
    {
      "@id": "schema:Flight",
      "@type": "rdfs:Class",
      "rdfs:comment": "An airline flight.",
      "rdfs:label": "Flight",
      "rdfs:subClassOf": {
        "@id": "schema:Trip"
      }
    },
    {
      "@id": "schema:FlightReservation",
      "@type": "rdfs:Class",
      "rdfs:comment": "A reservation for air travel.\\n\\nNote: This type is for information about actual reservations, e.g. in confirmation emails or HTML pages with individual confirmations of reservations. For offers of tickets, use [[Offer]].",
      "rdfs:label": "FlightReservation",
      "rdfs:subClassOf": {
        "@id": "schema:Reservation"
      }
    },
    {
      "@id": "schema:HotelRoom",
      "@type": "rdfs:Class",
      "rdfs:comment": "A hotel room is a single room in a hotel.\n<br /><br />\nSee also the <a href=\"/docs/hotels.html\">dedicated document on the use of schema.org for marking up hotels and other forms of accommodations</a>.\n",
      "rdfs:label": "HotelRoom",
      "rdfs:subClassOf": {
        "@id": "schema:Room"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/STI_Accommodation_Ontology"
      }
    },
    {
      "@id": "schema:LodgingReservation",
      "@type": "rdfs:Class",
      "rdfs:comment": "A reservation for lodging at a hotel, motel, inn, etc.\\n\\nNote: This type is for information about actual reservations, e.g. in confirmation emails or HTML pages with individual confirmations of reservations.",
      "rdfs:label": "LodgingReservation",
      "rdfs:subClassOf": {
        "@id": "schema:Reservation"
      }
    },
    {
      "@id": "schema:TrainTrip",
      "@type": "rdfs:Class",
      "rdfs:comment": "A trip on a commercial train line.",
      "rdfs:label": "TrainTrip",
      "rdfs:subClassOf": {
        "@id": "schema:Trip"
      }
    },
    {
      "@id": "schema:BusTrip",
      "@type": "rdfs:Class",
      "rdfs:comment": "A trip on a commercial bus line.",
      "rdfs:label": "BusTrip",
      "rdfs:subClassOf": {
        "@id": "schema:Trip"
      }
    },
    {
      "@id": "schema:TouristTrip",
      "@type": "rdfs:Class",
      "rdfs:comment": "A tourist trip. A created itinerary of visits to one or more places of interest ([[TouristAttraction]]/[[TouristDestination]]) often linked by a similar theme, geographic area, or interest to a particular [[touristType]]. The [UNWTO](http://www2.unwto.org/) defines tourism trip as the Trip taken by visitors.\n  (See examples below.)",
      "rdfs:label": "TouristTrip",
      "rdfs:subClassOf": {
        "@id": "schema:Trip"
      },
      "schema:contributor": [
        {
          "@id": "https://schema.org/docs/collab/IIT-CNR.it"
        },
        {
          "@id": "https://schema.org/docs/collab/Tourism"
        }
      ],
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1810"
      }
    },
    {
      "@id": "schema:Car",
      "@type": "rdfs:Class",
      "rdfs:comment": "A car is a wheeled, self-powered motor vehicle used for transportation.",
      "rdfs:label": "Car",
      "rdfs:subClassOf": {
        "@id": "schema:Vehicle"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/Automotive_Ontology_Working_Group"
      }
    },
    {
      "@id": "schema:TaxiReservation",
      "@type": "rdfs:Class",
      "rdfs:comment": "A reservation for a taxi.\\n\\nNote: This type is for information about actual reservations, e.g. in confirmation emails or HTML pages with individual confirmations of reservations. For offers of tickets, use [[Offer]].",
      "rdfs:label": "TaxiReservation",
      "rdfs:subClassOf": {
        "@id": "schema:Reservation"
      }
    },
    {
      "@id": "schema:BankAccount",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "fibo-fbc-pas-fpas:BankAccount"
      },
      "rdfs:comment": "A product or service offered by a bank whereby one may deposit, withdraw or transfer money and in some cases be paid interest.",
      "rdfs:label": "BankAccount",
      "rdfs:subClassOf": {
        "@id": "schema:FinancialProduct"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/FIBO"
      }
    },
    {
      "@id": "schema:CreditCard",
      "@type": "rdfs:Class",
      "rdfs:comment": "A card payment method of a particular brand or name.  Used to mark up a particular payment method and/or the financial product/service that supplies the card account.\\n\\nCommonly used values:\\n\\n* http://purl.org/goodrelations/v1#AmericanExpress\\n* http://purl.org/goodrelations/v1#DinersClub\\n* http://purl.org/goodrelations/v1#Discover\\n* http://purl.org/goodrelations/v1#JCB\\n* http://purl.org/goodrelations/v1#MasterCard\\n* http://purl.org/goodrelations/v1#VISA\n       ",
      "rdfs:label": "CreditCard",
      "rdfs:subClassOf": [
        {
          "@id": "schema:PaymentCard"
        },
        {
          "@id": "schema:LoanOrCredit"
        }
      ],
      "schema:contributor": [
        {
          "@id": "https://schema.org/docs/collab/FIBO"
        },
        {
          "@id": "https://blog.schema.org/2012/11/08/good-relations-and-schema-org/"
        }
      ]
    },
    {
      "@id": "schema:PaymentService",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "fibo-pay-ps-ps:PaymentService"
      },
      "rdfs:comment": "A Service to transfer funds from a person or organization to a beneficiary person or organization.",
      "rdfs:label": "PaymentService",
      "rdfs:subClassOf": [
        {
          "@id": "schema:PaymentMethod"
        },
        {
          "@id": "schema:FinancialProduct"
        }
      ],
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/FIBO"
      }
    },
    {
      "@id": "schema:Invoice",
      "@type": "rdfs:Class",
      "owl:equivalentClass": {
        "@id": "unece:Invoice"
      },
      "rdfs:comment": "A statement of the money due for goods or services; a bill.",
      "rdfs:label": "Invoice",
      "rdfs:subClassOf": [
        {
          "@id": "fibo-fnd-arr-doc:LegalDocument"
        },
        {
          "@id": "schema:Intangible"
        }
      ]
    },
    {
      "@id": "schema:LikeAction",
      "@type": "rdfs:Class",
      "rdfs:comment": "The act of expressing a positive sentiment about the object. An agent likes an object (a proposition, topic or theme) with participants.",
      "rdfs:label": "LikeAction",
      "rdfs:subClassOf": {
        "@id": "schema:ReactAction"
      }
    },
    {
      "@id": "schema:DislikeAction",
      "@type": "rdfs:Class",
      "rdfs:comment": "The act of expressing a negative sentiment about the object. An agent dislikes an object (a proposition, topic or theme) with participants.",
      "rdfs:label": "DislikeAction",
      "rdfs:subClassOf": {
        "@id": "schema:ReactAction"
      }
    },
    {
      "@id": "schema:FollowAction",
      "@type": "rdfs:Class",
      "rdfs:comment": "The act of forming a personal connection with someone/something (object) unidirectionally/asymmetrically to get updates polled from.\\n\\nRelated actions:\\n\\n* [[BefriendAction]]: Unlike BefriendAction, FollowAction implies that the connection is *not* necessarily reciprocal.\\n* [[SubscribeAction]]: Unlike SubscribeAction, FollowAction implies that the follower acts as an active agent constantly/actively polling for updates.\\n* [[RegisterAction]]: Unlike RegisterAction, FollowAction implies that the agent is interested in continuing receiving updates from the object.\\n* [[JoinAction]]: Unlike JoinAction, FollowAction implies that the agent is interested in getting updates from the object.\\n* [[TrackAction]]: Unlike TrackAction, FollowAction refers to the polling of updates of all aspects of animate objects rather than the location of inanimate objects (e.g. you track a package, but you don't follow it).",
      "rdfs:label": "FollowAction",
      "rdfs:subClassOf": {
        "@id": "schema:InteractAction"
      }
    },
    {
      "@id": "schema:ShareAction",
      "@type": "rdfs:Class",
      "rdfs:comment": "The act of distributing content to people for their amusement or edification.",
      "rdfs:label": "ShareAction",
      "rdfs:subClassOf": {
        "@id": "schema:CommunicateAction"
      }
    },
    {
      "@id": "schema:CommentAction",
      "@type": "rdfs:Class",
      "rdfs:comment": "The act of generating a comment about a subject.",
      "rdfs:label": "CommentAction",
      "rdfs:subClassOf": {
        "@id": "schema:CommunicateAction"
      }
    },
    {
      "@id": "schema:CommunicateAction",
      "@type": "rdfs:Class",
      "rdfs:comment": "The act of conveying information to another person via a communication medium (instrument) such as speech, email, or telephone conversation.",
      "rdfs:label": "CommunicateAction",
      "rdfs:subClassOf": {
        "@id": "schema:InteractAction"
      }
    },
    {
      "@id": "schema:Message",
      "@type": "rdfs:Class",
      "rdfs:comment": "A single message from a sender to one or more organizations or people.",
      "rdfs:label": "Message",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:Occupation",
      "@type": "rdfs:Class",
      "rdfs:comment": "A profession, may involve prolonged training and/or a formal qualification.",
      "rdfs:label": "Occupation",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1698"
      }
    },
    {
      "@id": "schema:Game",
      "@type": "rdfs:Class",
      "rdfs:comment": "The Game type represents things which are games. These are typically rule-governed recreational activities, e.g. role-playing games in which players assume the role of characters in a fictional setting.",
      "rdfs:label": "Game",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:VideoGame",
      "@type": "rdfs:Class",
      "rdfs:comment": "A video game is an electronic game that involves human interaction with a user interface to generate visual feedback on a video device.",
      "rdfs:label": "VideoGame",
      "rdfs:subClassOf": [
        {
          "@id": "schema:SoftwareApplication"
        },
        {
          "@id": "schema:Game"
        }
      ]
    },
    {
      "@id": "schema:MusicRecording",
      "@type": "rdfs:Class",
      "rdfs:comment": "A music recording (track), usually a single song.",
      "rdfs:label": "MusicRecording",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:MusicAlbum",
      "@type": "rdfs:Class",
      "rdfs:comment": "A collection of music tracks.",
      "rdfs:label": "MusicAlbum",
      "rdfs:subClassOf": {
        "@id": "schema:MusicPlaylist"
      }
    },
    {
      "@id": "schema:MusicGroup",
      "@type": "rdfs:Class",
      "rdfs:comment": "A musical group, such as a band, an orchestra, or a choir. Can also be a solo musician.",
      "rdfs:label": "MusicGroup",
      "rdfs:subClassOf": {
        "@id": "schema:PerformingGroup"
      }
    },
    {
      "@id": "schema:Vehicle",
      "@type": "rdfs:Class",
      "rdfs:comment": "A vehicle is a device that is designed or used to transport people or cargo over land, water, air, or through space.",
      "rdfs:label": "Vehicle",
      "rdfs:subClassOf": {
        "@id": "schema:Product"
      }
    },
    {
      "@id": "schema:BoatTrip",
      "@type": "rdfs:Class",
      "rdfs:comment": "A trip on a commercial ferry line.",
      "rdfs:label": "BoatTrip",
      "rdfs:subClassOf": {
        "@id": "schema:Trip"
      },
      "schema:isPartOf": {
        "@id": "https://pending.schema.org"
      },
      "schema:source": {
        "@id": "https://github.com/schemaorg/schemaorg/issues/1755"
      }
    },
    {
      "@id": "schema:Menu",
      "@type": "rdfs:Class",
      "rdfs:comment": "A structured representation of food or drink items available from a FoodEstablishment.",
      "rdfs:label": "Menu",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:MenuItem",
      "@type": "rdfs:Class",
      "rdfs:comment": "A food or drink item listed in a menu or menu section.",
      "rdfs:label": "MenuItem",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      }
    },
    {
      "@id": "schema:WebPageElement",
      "@type": "rdfs:Class",
      "rdfs:comment": "A web page element, like a table or an image.",
      "rdfs:label": "WebPageElement",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    },
    {
      "@id": "schema:InteractionCounter",
      "@type": "rdfs:Class",
      "rdfs:comment": "A summary of how users have interacted with this CreativeWork. In most cases, authors will use a subtype to specify the specific type of interaction.",
      "rdfs:label": "InteractionCounter",
      "rdfs:subClassOf": {
        "@id": "schema:StructuredValue"
      }
    },
    {
      "@id": "schema:EntryPoint",
      "@type": "rdfs:Class",
      "rdfs:comment": "An entry point, within some Web-based protocol.",
      "rdfs:label": "EntryPoint",
      "rdfs:subClassOf": {
        "@id": "schema:Intangible"
      },
      "schema:contributor": {
        "@id": "https://schema.org/docs/collab/ActionCollabClass"
      }
    },
    {
      "@id": "schema:SoftwareSourceCode",
      "@type": "rdfs:Class",
      "rdfs:comment": "Computer programming source code. Example: Full (compile ready) solutions, code snippet samples, scripts, templates.",
      "rdfs:label": "SoftwareSourceCode",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      }
    }
  ]
}
window.schemaAllData = schemaAllData; 