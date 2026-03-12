export type CitySlug =
  | "iasi"
  | "cluj"
  | "bucuresti"
  | "timisoara"
  | "brasov"
  | "constanta"
  | "sibiu"
  | "oradea"
  | "craiova"
  | "suceava";

export type QuerySlug =
  | "ce-e-de-facut"
  | "ce-faci-in-weekend"
  | "date-ideas"
  | "activitati-cuplu"
  | "lucruri-cool-de-facut"
  | "hidden-gems"
  | "family-activities";

export type LinkItem = {
  href: string;
  title: string;
  description?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type CityGuideContent = {
  slug: CitySlug;
  name: string;
  nameAscii: string;
  county: string;
  region: string;
  heroTitle: string;
  intro: string[];
  directAnswer: string;
  englishIntent: string;
  topThingsToDo: string[];
  uniqueExperiences: string[];
  dateIdeas: string[];
  weekendActivities: string[];
  coolIdeas: string[];
  familyIdeas: string[];
  hiddenGems: string[];
  faq: FAQItem[];
  queryHooks: {
    whatToDo: string;
    weekend: string;
    dateIdeas: string;
    coupleActivities: string;
    coolThings: string;
    hiddenGems: string;
    familyActivities: string;
  };
};

export type GuideContent = {
  slug: string;
  title: string;
  description: string;
  intro: string[];
  sections: Array<{ title: string; paragraphs?: string[]; bullets?: string[]; links?: LinkItem[] }>;
  faq?: FAQItem[];
  relatedLinks?: LinkItem[];
};

type CitySeed = {
  slug: CitySlug;
  name: string;
  nameAscii: string;
  county: string;
  region: string;
  intro: string[];
  directAnswer: string;
  topThingsToDo: string[];
  uniqueExperiences: string[];
  dateIdeas: string[];
  weekendActivities: string[];
  coolIdeas: string[];
  familyIdeas: string[];
  hiddenGems: string[];
  faq: FAQItem[];
  queryHooks: CityGuideContent["queryHooks"];
};

const citySeeds: CitySeed[] = [
  {
    slug: "iasi",
    name: "Iasi",
    nameAscii: "Iasi",
    county: "Iasi",
    region: "Moldova",
    intro: [
      "Iasiul functioneaza foarte bine pentru oameni care vor sa combine cultura, plimbarile relaxate si experientele locale care dau sens unei iesiri. Intr-o singura zi poti sa treci de la Copou si centrul istoric la o activitate organizata de un host local, fara sa simti ca orasul te grabeste sau te impinge in aceeasi rutina clasica.",
      "Cand cauti ce e de facut in Iasi, raspunsul bun nu inseamna doar obiective turistice. In practica, cele mai reusite planuri sunt cele care combina locuri cunoscute cu experiente rezervabile, seri sociale, activitati de cuplu si iesiri de weekend cu ritm clar.",
      "Pe LIVADAI, Iasiul devine mai usor de filtrat: vezi idei concrete, pagini editoriale, intentii de cautare si experiente reale care pot completa natural o zi buna in oras.",
    ],
    directAnswer:
      "In Iasi ai ce face daca vrei cultura, plimbari bune, activitati de cuplu, seri relaxate si experiente organizate de oameni locali. Cele mai bune planuri combina centrul orasului, Copoul, zonele verzi si activitati care iti dau un motiv clar sa iesi din rutina.",
    topThingsToDo: [
      "Plimba-te prin Copou si leaga iesirea de o cafea buna sau de un atelier mic in zona centrala.",
      "Alege o experienta organizata local in locul unei vizite standard intr-un loc deja bifat de toata lumea.",
      "Construieste o dupa-amiaza in jurul Palasului, centrului vechi si unei activitati cu ora fixa.",
      "Rezerva o iesire de seara care are sens: tasting, sport light, social event sau atelier creativ.",
      "Daca stai un weekend intreg in oras, lasa sambata pentru social si duminica pentru plimbari slow si experiente indoor.",
    ],
    uniqueExperiences: [
      "Ateliere creative in grup restrans, unde interactionezi cu oameni, nu doar consumi un loc.",
      "Experiente wellness sau movement care merg bine dupa program si schimba total ritmul zilei.",
      "Intalniri tematice si activitati cu hosti locali care iti arata un Iasi mai putin rigid.",
      "Experiente pentru cupluri sau prieteni care pun accent pe timp petrecut bine, nu pe zgomot.",
      "Planuri locale care transforma o simpla iesire in oras intr-o seara memorabila si mai usor de povestit.",
    ],
    dateIdeas: [
      "Un date lung in Copou, urmat de o activitate rezervata in avans, merge mai bine decat o simpla cina.",
      "Alege o experienta in doi cu componenta creativa sau playful, ca sa ai si subiecte bune, nu doar decor.",
      "Leaga o plimbare prin centru de o rezervare seara, astfel incat iesirea sa aiba ritm si directie.",
      "Pentru un date mai relaxat, cauta activitati care dureaza 60-120 de minute si lasa loc si pentru o cafea dupa.",
      "Pentru aniversari sau iesiri mai speciale, merg bine planurile care combina o experienta premium cu o zona buna de oras.",
    ],
    weekendActivities: [
      "Sambata merge bine pentru experiente sociale, activitati in grup si planuri care pornesc din centru.",
      "Duminica functioneaza mai bine iesirile slow: plimbari, wellness, miscare usoara si experiente indoor.",
      "Daca stai doar un weekend in oras, combina o rezervare dimineata cu un plan cultural dupa-amiaza.",
      "Pentru grupuri mici, cauta activitati cu slot clar si participare limitata, nu evenimente fara structura.",
      "Daca vine vremea rea, Iasiul are suficiente planuri indoor cat sa nu ramai blocat in schema mall-cafenea.",
    ],
    coolIdeas: [
      "Alege un atelier, o experienta sportiva sau o activitate de grup in locul aceleiasi iesiri la mall.",
      "Cauta hosti locali care organizeaza seri tematice, sesiuni premium sau experiente one-off.",
      "Fa un mix intre oras clasic si plan nou: o ora prin centru, apoi o rezervare cu ora fixa.",
      "Daca vrei ceva memorabil, prioritizeaza experiente unde chiar participi, nu doar privesti.",
      "Lucrurile cool din Iasi sunt de obicei planurile simple, dar bine gandite, nu cele cu cel mai mult zgomot in jur.",
    ],
    familyIdeas: [
      "Alege activitati cu ritm clar, durata scurta si locuri usor de accesat din centru sau Copou.",
      "Weekendul functioneaza bine pentru ateliere simple, plimbari lungi si activitati indoor daca vremea nu ajuta.",
      "Pentru familii, cele mai bune planuri sunt cele care combina miscare, pauze si un singur obiectiv clar.",
      "Daca ai copii mici, merg mai bine experientele rezervabile si zonele in care poti continua plimbarea fara stres.",
      "Un plan de familie bun in Iasi inseamna claritate, nu multe mutari intre locatii.",
    ],
    hiddenGems: [
      "Iasiul devine mai interesant cand iesi din traseul clasic si cauti experiente conduse de oameni locali.",
      "Nu toate planurile bune sunt in topul ghidurilor turistice; uneori un atelier mic sau o intalnire tematica spune mai mult despre oras.",
      "Cele mai bune descoperiri apar cand folosesti orasul ca fundal pentru o experienta, nu ca destinatie pasiva.",
      "Hidden gems in Iasi inseamna adesea activitati discrete, bine conduse, nu locuri foarte promovate.",
      "Daca vrei sa simti orasul, cauta oamenii care il locuiesc si organizeaza ceva in el, nu doar cladirile pe care le fotografiezi.",
    ],
    faq: [
      {
        question: "Ce e de facut in Iasi in weekend?",
        answer:
          "In weekend merita sa combini plimbari prin Copou sau centru cu o experienta rezervata in avans: atelier, activitate de grup, wellness sau un date organizat mai bine.",
      },
      {
        question: "Ce activitati poti face in Iasi in cuplu?",
        answer:
          "In cuplu merg bine experientele creative, iesirile slow cu componenta sociala si planurile care includ o rezervare clara, nu doar o terasa aleasa la intamplare.",
      },
      {
        question: "Care sunt experientele unice din Iasi?",
        answer:
          "Experientele unice sunt cele cu hosti locali, grup restrans si o tema clara: creativ, movement, social, wellness sau activitati care te scot din rutina orasului.",
      },
      {
        question: "Merita sa rezervi din timp activitati in Iasi?",
        answer:
          "Da. O rezervare cu ora fixa ajuta mult sa construiesti ziua mai bine, mai ales in weekend sau cand vrei un plan clar pentru seara.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei un raspuns scurt la intrebarea ce e de facut in Iasi, incepe cu trei directii: plimbari bune, cultura care chiar merita vazuta si experiente locale rezervate in avans. Asa transformi orasul dintr-un fundal intr-un plan concret.",
      weekend:
        "In Iasi, weekendul iese bine cand nu lasi totul pe improvizatie. Cel mai simplu plan este sa alegi o experienta cu ora fixa, apoi sa o legi de o plimbare prin centru, Copou sau o pauza buna pentru cafea si mancare.",
      dateIdeas:
        "Pentru idei de date in Iasi, cele mai bune variante sunt cele care te ajuta sa faci ceva impreuna, nu doar sa ocupi o masa. Orasul merge foarte bine pentru combinatii intre plimbare, activitate rezervata si un final lejer intr-o zona buna.",
      coupleActivities:
        "Daca vrei activitati de cuplu in Iasi, cauta experiente care dau un ritm clar iesirii: ceva creativ, ceva relaxant sau ceva playful. Un plan bun in doi are interactiune, timing clar si loc pentru discutii, nu doar decor.",
      coolThings:
        "Lucrurile cool de facut in Iasi sunt cele care rup rutina. In loc de aceeasi iesire standard, merita sa alegi activitati unde participi real: atelier, social event, movement session sau experienta de grup cu host local.",
      hiddenGems:
        "Descoperirile mai putin evidente din Iasi nu inseamna doar stradute sau locuri fotogenice. De multe ori inseamna experiente mici, bine gandite, conduse de oameni care cunosc orasul si stiu cum sa transforme o simpla iesire intr-un plan care chiar ramane cu tine.",
      familyActivities:
        "Pentru activitati de familie in Iasi, functioneaza cel mai bine planurile simple, bine dozate si usor de urmat. Alege activitati cu durata clara, pauze naturale si o zona in care poti continua iesirea fara stres.",
    },
  },
  {
    slug: "cluj",
    name: "Cluj-Napoca",
    nameAscii: "Cluj",
    county: "Cluj",
    region: "Transilvania",
    intro: [
      "Clujul functioneaza foarte bine pentru oameni care vor sa umple orasul cu planuri bune, nu doar cu recomandari generice. Este un oras in care poti sa construiesti usor o zi intreaga: cafea in centru, plimbare pe Somes, o experienta rezervata seara si un final relaxat intr-o zona care ramane vie pana tarziu.",
      "Cand cauti ce e de facut in Cluj, merita sa iesi din lista scurta cu muzee, festivaluri si localuri. Orasul are mult mai mult sens cand cauti experiente locale, activitati pentru cupluri, idei de weekend si iesiri care pun oamenii in miscare.",
      "LIVADAI te ajuta sa filtrezi mai usor orasul: vezi pagini de intentie, ghiduri si experiente publice care se potrivesc cu ritmul real al unui oras foarte activ.",
    ],
    directAnswer:
      "In Cluj ai multe lucruri bune de facut daca vrei cultura urbana, seri sociale, idei de date, experiente rezervabile si planuri de weekend care chiar se leaga. Cele mai bune iesiri combina centrul, Somesul, cartierele creative si activitati organizate local.",
    topThingsToDo: [
      "Construieste un traseu intre centru, Somes si o experienta de seara rezervata in avans.",
      "Cauta activitati locale unde participi, nu doar bifezi un loc popular.",
      "Alege evenimente sau experiente cu grup mic daca vrei interactiune reala, nu aglomeratie.",
      "Pentru o zi reusita in Cluj, combina orasul social cu o activitate care iti da un motiv clar sa iesi.",
      "Daca stai mai multe zile, imparte orasul pe zone si nu-l consuma tot intr-o singura iesire.",
    ],
    uniqueExperiences: [
      "Experiente sociale in grup restrans, potrivite pentru oameni noi sau prieteni care vor altceva.",
      "Activitati creative si movement sessions care merg foarte bine dupa program.",
      "Planuri locale care folosesc energia orasului, dar fara graba si fara rutina de club-bar-club.",
      "Experiente pentru cupluri sau prieteni care vor o iesire memorabila, nu doar convenabila.",
      "Activitati in spatii mici si curate, unde atmosfera si oamenii fac diferenta mai mult decat decorul.",
    ],
    dateIdeas: [
      "In Cluj merg bine date-urile care au doua ritmuri: plimbare sau cafea, apoi o experienta cu ora fixa.",
      "Pentru un prim date, alege ceva conversational si usor playful, nu un plan prea rigid.",
      "Pentru cupluri care locuiesc deja in oras, merita experiente noi care scot iesirea din repetitie.",
      "Un date bun in Cluj trebuie sa aiba atat atmosfera, cat si un motiv clar de a face ceva impreuna.",
      "Planurile in doi ies foarte bine cand reduci logistica si lasi mai mult loc pentru experienta propriu-zisa.",
    ],
    weekendActivities: [
      "Weekendul in Cluj merge bine pe experiente sociale, plimbari lungi si activitati rezervabile seara.",
      "Sambata e potrivita pentru planuri cu energie mai mare, iar duminica pentru iesiri slow si wellness.",
      "Daca vii din alt oras, merita sa rezervi macar o activitate care iti structureaza ziua.",
      "Pentru grupuri mici, cele mai bune optiuni sunt activitatile cu slot si capacitate limitata.",
      "Daca vremea este buna, Clujul raspunde excelent la un plan care alterneaza intre mers, pauze si activitate rezervata.",
    ],
    coolIdeas: [
      "Alege experiente noi in locul acelorasi locuri unde ajungi de obicei fara plan.",
      "Cauta activitati care combina social, creativ si movement; Clujul raspunde foarte bine la mixul acesta.",
      "Daca vrei ceva cool, mergi pe experiente care pot fi povestite, nu doar pe locuri instagramabile.",
      "Un plan bun in Cluj inseamna sa alegi ceva memorabil si apoi sa lasi orasul sa completeze restul.",
      "Lucrurile cool din Cluj sunt de obicei cele care au concept clar si grup restrans, nu cele mai zgomotoase.",
    ],
    familyIdeas: [
      "Planurile de familie merg bine in zone usor accesibile si in activitati cu durata clara.",
      "Alege experiente care lasa loc pentru pauze, plimbari si adaptare la ritmul grupului.",
      "Pentru weekend, combina o activitate rezervata cu o iesire relaxata in jurul centrului sau al Somesului.",
      "Familiile care vin din afara orasului au nevoie de planuri simple si logistica minima.",
      "O activitate buna in Cluj trebuie sa dea structurii zilei claritate, nu sa incarce programul.",
    ],
    hiddenGems: [
      "Clujul ascunde multe planuri bune in zona experientelor mici, nu doar in calendarul mare al orasului.",
      "Un hidden gem poate fi o activitate bine condusa, intr-un spatiu discret, unde atmosfera face diferenta.",
      "Daca vrei sa simti orasul, nu te limita la lista clasica; cauta gazde si experiente locale.",
      "Cartierele si spatiile mai mici pot spune uneori mai mult despre Cluj decat zona foarte promovata din centru.",
      "Descoperirile cele mai bune apar cand renunti la graba si alegi o experienta cu context bun.",
    ],
    faq: [
      {
        question: "Ce faci in Cluj in weekend daca nu vrei doar terase?",
        answer:
          "Rezerva o experienta locala, adauga o plimbare pe Somes sau prin centru si construieste ziua in jurul unei activitati cu ora fixa.",
      },
      {
        question: "Care sunt idei bune de date in Cluj?",
        answer:
          "Date-urile bune in Cluj combina o zona placuta pentru plimbare cu o experienta unde faceti ceva impreuna: creativ, social sau relaxant.",
      },
      {
        question: "Ce experiente unice gasesti in Cluj?",
        answer:
          "Experiente in grup restrans, activitati locale cu hosti, seri tematice si planuri care folosesc energia orasului fara sa devina obositoare.",
      },
      {
        question: "Merita sa rezervi din timp o activitate in Cluj?",
        answer:
          "Da. In special seara si in weekend, o rezervare te ajuta sa-ti organizezi mai bine iesirea si sa eviti planurile facute prea din mers.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca intrebi ce e de facut in Cluj, raspunsul bun este sa alegi intre orasul social, activitatile rezervabile si zonele in care chiar merita sa petreci timp. Clujul functioneaza cel mai bine cand il traiesti in pasi clari, nu in recomandari aruncate la intamplare.",
      weekend:
        "In Cluj, weekendul iese bine daca ai macar un punct fix: o experienta, un atelier, o activitate in grup sau o rezervare de seara. Restul se poate construi usor in jurul orasului.",
      dateIdeas:
        "Ideile de date in Cluj inseamna planuri cu ritm, nu doar o masa rezervata. Orasul iti permite usor sa combini o activitate memorabila cu o zona buna pentru mers, discutii si prelungirea serii.",
      coupleActivities:
        "Activitatile de cuplu in Cluj merg bine cand au putina structura si putina joaca. O experienta rezervata face iesirea mai usoara, mai coerenta si mult mai memorabila.",
      coolThings:
        "Daca vrei lucruri cool de facut in Cluj, incearca ce nu intra in rutina saptamanii: activitati noi, seri tematice, experiente cu hosti sau planuri in grup mic care chiar au energie buna.",
      hiddenGems:
        "Descoperirile mai putin evidente din Cluj apar cand renunti la lista standard si cauti experiente mici, bine conduse, locuri cu atmosfera si oameni care pun sens in ce organizeaza.",
      familyActivities:
        "Pentru activitati de familie in Cluj, ai nevoie de planuri simple, clare si usor de urmat. Activitatile bune sunt cele care dau structura zilei fara sa incarce inutil programul.",
    },
  },
  {
    slug: "bucuresti",
    name: "Bucuresti",
    nameAscii: "Bucharest",
    county: "Bucuresti",
    region: "Muntenia",
    intro: [
      "Bucurestiul are atat de multe variante incat problema reala nu este lipsa de activitati, ci filtrarea lor. In aceeasi zi poti sa alegi intre parc, muzeu, rooftop, atelier, social event, movement session sau o experienta premium organizata de un host local.",
      "Cand cauti ce e de facut in Bucuresti, merita sa pleci de la tipul de iesire pe care il vrei: idei de date, plan de weekend, activitati cool cu prietenii sau experiente care te scot complet din ritmul obisnuit.",
      "LIVADAI adauga un strat de claritate de care orasul are nevoie: activitati rezervabile, ghiduri usor de citit si pagini construite pentru cautari reale, nu pentru zgomot.",
    ],
    directAnswer:
      "In Bucuresti ai aproape orice tip de iesire: planuri culturale, experiente locale, idei de date, activitati cool si weekenduri foarte diferite de la un cartier la altul. Secretul este sa alegi activitati cu sens si sa nu lasi orasul sa iti fragmenteze timpul.",
    topThingsToDo: [
      "Combina un cartier bun pentru plimbare cu o experienta rezervata, nu doar cu un restaurant.",
      "Cauta activitati locale care iti dau un ritm clar intr-un oras care altfel se imprastie repede.",
      "Foloseste diferenta dintre zi si seara: cultural sau slow ziua, experienta sau social event seara.",
      "Alege experiente din Bucuresti care te scot din schema clasica mall-cafea-drum spre casa.",
      "Cand ai putin timp, organizeaza orasul pe zone si nu incerca sa faci prea multe in aceeasi zi.",
    ],
    uniqueExperiences: [
      "Ateliere, sesiuni premium si activitati locale care se simt personale, nu industriale.",
      "Experiente in spatii interesante din oras, nu doar in locuri previzibile.",
      "Planuri pentru grup mic sau cuplu care au concept clar si ritm bun.",
      "Activitati cu hosti care stiu sa construiasca experienta, nu doar sa inchirieze un loc.",
      "Experiente care dau un filtru inteligent unui oras foarte mare si usor de fragmentat.",
    ],
    dateIdeas: [
      "Un date bun in Bucuresti incepe cu alegerea zonei si continua cu o activitate care va tine implicati pe amandoi.",
      "Pentru prime intalniri, merg bine experientele conversationale si usor playful.",
      "Pentru cupluri care vor sa iasa din rutina, cele mai bune idei sunt cele care adauga o experienta reala intre doua opriri clasice.",
      "Orasul iti permite sa faci un date premium fara sa para fortat, daca ai un plan bine legat.",
      "Cele mai bune date-uri sunt cele in care logistica este simpla si atentia ramane pe voi, nu pe trafic.",
    ],
    weekendActivities: [
      "Weekendul in Bucuresti merge bine daca alegi o zona, nu tot orasul deodata.",
      "Poti construi usor o sambata energica si o duminica slow, fara sa repeti aceleasi locuri.",
      "Pentru city break-uri scurte, experientele rezervabile reduc mult timpul pierdut cu indecizia.",
      "Cele mai bune planuri de weekend combina orasul mare cu activitati bine alese si usor de ajuns.",
      "Un weekend bun in Bucuresti are nevoie de selectie, nu de volum.",
    ],
    coolIdeas: [
      "Bucurestiul are mult potential pentru planuri cool daca alegi experiente, nu doar locatii.",
      "Cauta activitati cu concept clar: creativ, social, movement, fun sau premium.",
      "Un plan cool in Bucuresti trebuie sa aiba energie buna si un motiv clar pentru care merita iesit din casa.",
      "Daca vrei varietate, orasul o ofera; filtrarea corecta face diferenta.",
      "Lucrurile cool nu sunt neaparat cele mai virale, ci cele mai bine potrivite pentru tipul tau de iesire.",
    ],
    familyIdeas: [
      "Pentru familii, Bucurestiul e mai usor de gestionat cand alegi activitati localizate si cu durata previzibila.",
      "Combinati o experienta rezervata cu parc, muzeu sau o zona usor de parcurs pe jos.",
      "Planurile de familie bune in Bucuresti sunt cele care reduc logistica si cresc claritatea zilei.",
      "Daca pleci dintr-o singura zona a orasului, castigi timp si pastrezi energia pentru activitatea principala.",
      "Familiile se descurca mai bine cu planuri scurte si clare decat cu zile foarte incarcate.",
    ],
    hiddenGems: [
      "Descoperirile mai putin evidente din Bucuresti apar cand iesi din lista foarte cunoscuta si intri in zona experientelor locale bine construite.",
      "Nu toate planurile bune sunt pe bulevarde mari; uneori cele mai memorabile iesiri sunt in spatii discrete, cu hosti foarte buni.",
      "Orasul devine mai suportabil si mai interesant cand il filtrezi prin experiente reale.",
      "Un hidden gem in Bucuresti poate fi o activitate buna intr-un loc mic, dar bine ales, nu neaparat un obiectiv celebru.",
      "Descoperirile bune apar atunci cand reduci haosul si alegi contexte mai curate si mai personale.",
    ],
    faq: [
      {
        question: "Ce poti face in Bucuresti daca nu vrei o iesire standard?",
        answer:
          "Alege o experienta rezervata, un atelier sau un plan local cu host, apoi construieste restul serii in jurul zonei in care are loc activitatea.",
      },
      {
        question: "Care sunt cele mai bune idei de date in Bucuresti?",
        answer:
          "Cele mai bune idei de date combina o plimbare sau o zona buna de oras cu o activitate clara unde faceti ceva impreuna, nu doar stati la masa.",
      },
      {
        question: "Ce experiente unice poti gasi in Bucuresti?",
        answer:
          "Experiente premium in grup mic, ateliere, activitati sociale, movement sessions si planuri locale care pun accent pe interactiune reala.",
      },
      {
        question: "Merita sa rezervi in avans activitati in Bucuresti?",
        answer:
          "Da. Bucurestiul devine mult mai usor de trait cand ai o activitate rezervata si un punct clar in jurul caruia construiesti restul iesirii.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Bucuresti, gandeste orasul pe straturi: zona, ritm si tip de experienta. Asa eviti aglomeratia inutila si alegi planuri care chiar merita timpul tau.",
      weekend:
        "In Bucuresti, weekendul este bun doar daca il filtrezi. Alege o experienta, o zona si un interval clar, apoi construieste ziua in jurul lor in loc sa incerci sa le faci pe toate.",
      dateIdeas:
        "Ideile de date in Bucuresti exista din abundenta, dar cele memorabile sunt cele care au o structura buna. O activitate rezervata face diferenta dintre o seara corecta si una care chiar ramane in minte.",
      coupleActivities:
        "Activitatile de cuplu in Bucuresti merg bine cand orasul nu va oboseste. Cauta experiente care reduc haosul si cresc interactiunea: creativ, social, wellness sau fun controlat.",
      coolThings:
        "Lucrurile cool de facut in Bucuresti nu sunt neaparat cele mai vizibile. De multe ori sunt experiente bine organizate, in spatii potrivite, cu oameni care stiu sa creeze contextul corect.",
      hiddenGems:
        "Descoperirile mai putin evidente din Bucuresti inseamna sa cauti experiente care scot ce e bun din oras si lasa deoparte zgomotul, traficul si rutina locurilor prea evidente.",
      familyActivities:
        "Pentru activitati de familie in Bucuresti, cheia este sa simplifici. Activitatile bune sunt cele cu logistica usoara, durata clara si zone care permit continuarea fireasca a zilei.",
    },
  },
  {
    slug: "timisoara",
    name: "Timisoara",
    nameAscii: "Timisoara",
    county: "Timis",
    region: "Banat",
    intro: [
      "Timisoara este unul dintre orasele in care iesirile bune vin natural daca alegi ritmul potrivit. Ai piete frumoase, zone bune pentru mers pe jos, o scena culturala activa si suficient spatiu cat sa nu simti ca totul este presat.",
      "Daca te intrebi ce e de facut in Timisoara, raspunsul cel mai util este sa cauti activitati care completeaza orasul, nu care il acopera. O plimbare prin centru, un plan rezervat seara, un atelier sau o activitate pentru cupluri pot transforma foarte usor o iesire simpla intr-una memorabila.",
      "LIVADAI te ajuta sa filtrezi orasul pe intentii clare: weekend, date, hidden gems, experiente locale si planuri usor de rezervat.",
    ],
    directAnswer:
      "In Timisoara merita sa cauti planuri care combina centrul pietonal, zona Begai, cultura urbana si experiente locale rezervabile. Orasul este foarte bun pentru idei de date, weekenduri lejere si activitati cu ritm calm, dar bine gandit.",
    topThingsToDo: [
      "Leaga o plimbare prin centru sau pe malul Begai de o experienta rezervata seara.",
      "Alege activitati cu grup mic daca vrei sa simti mai bine atmosfera orasului.",
      "Timisoara merge bine pentru iesiri care au timp, conversatie si context local.",
      "Cauta experiente create de hosti locali, nu doar locuri populare pe harta.",
      "Foloseste piata centrala, Bega si zonele mai calme ale orasului ca fundal pentru un plan bine structurat.",
    ],
    uniqueExperiences: [
      "Experiente culturale, creative sau sociale care se potrivesc cu ritmul lejer al orasului.",
      "Ateliere si activitati premium care functioneaza bine pentru cupluri si grupuri mici.",
      "Planuri locale in spatii cu personalitate, nu doar in locuri foarte comerciale.",
      "Experiente care lasa loc pentru continuarea naturala a serii in oras.",
      "Activitati conduse de hosti care stiu sa creeze atmosfera, nu doar sa umple un slot din program.",
    ],
    dateIdeas: [
      "Timisoara este foarte buna pentru date-uri care incep cu o plimbare si continua cu o activitate rezervata.",
      "Merg bine planurile conversationale, creative sau relaxate, fara presiune si fara graba.",
      "Pentru cupluri, orasul ofera suficienta eleganta cat sa faci o iesire speciala fara sa o incarci inutil.",
      "Cele mai bune date ideas au ritm simplu: o zona frumoasa, o experienta buna, apoi timp pentru voi.",
      "Daca vrei un date memorabil, alege ceva care adauga un mic concept iesirii, nu doar un loc frumos.",
    ],
    weekendActivities: [
      "Weekendul in Timisoara merge bine pentru plimbari lungi, cultura si activitati rezervabile de seara.",
      "Daca vrei un plan de sambata, combina zona centrala cu o experienta in grup mic.",
      "Duminica functioneaza bine pe iesiri slow, activitati indoor si experiente care nu obosesc.",
      "Pentru vizitatori, o rezervare clara ajuta mult sa simti orasul fara sa pierzi timp cu alegeri de moment.",
      "Orasul merge foarte bine pentru weekenduri scurte, curate si bine dozate.",
    ],
    coolIdeas: [
      "Alege lucruri cool care se potrivesc cu stilul orasului: elegant, creativ si relaxat.",
      "In locul unei iesiri standard, cauta o experienta care te implica real.",
      "Timisoara raspunde bine la planuri curate, nu la aglomeratie fortata sau hype gol.",
      "Cele mai bune planuri cool sunt cele care pot continua natural prin oras dupa activitate.",
      "Daca vrei ceva diferit, cauta activitati mici, premium sau foarte bine curate in executie.",
    ],
    familyIdeas: [
      "Familiile pot construi usor o zi in Timisoara in jurul unei activitati scurte si a unei zone bune pentru mers pe jos.",
      "Alege experiente cu durata clara si timp de respiratie intre etape.",
      "Orasul merge bine pentru weekenduri de familie fara mult stres logistic.",
      "Plimbarile lungi si zonele pietonale ajuta mult daca vrei sa pastrezi ziua lejera.",
      "Un plan bun de familie inseamna putine mutari si un punct central clar.",
    ],
    hiddenGems: [
      "Descoperirile mai putin evidente din Timisoara sunt adesea experiente bine facute, nu neaparat obiective foarte faimoase.",
      "Un host bun sau un atelier bine ales poate spune mai mult despre oras decat o lista lunga de locuri.",
      "Daca vrei partea buna a orasului, cauta experiente cu ritm mic si calitate buna.",
      "Cele mai bune hidden gems sunt de multe ori activitati mici in spatii curate, nu neaparat locatii foarte cunoscute.",
      "Orasul castiga mult cand il descoperi prin oameni si contexte, nu doar prin trasee.",
    ],
    faq: [
      {
        question: "Ce faci in Timisoara in weekend?",
        answer:
          "Leaga centrul si Bega de o experienta rezervata: atelier, activitate sociala, wellness sau un plan bun de seara.",
      },
      {
        question: "Ce activitati merg bine in cuplu in Timisoara?",
        answer:
          "Date-urile cu plimbare, activitate rezervata si continuare relaxata prin oras functioneaza foarte bine in Timisoara.",
      },
      {
        question: "Ce experiente unice poti cauta in Timisoara?",
        answer:
          "Ateliere, experiente creative, activitati premium si planuri locale cu hosti care construiesc o atmosfera buna si un ritm relaxat.",
      },
      {
        question: "Timisoara este un oras bun pentru un city break de doua zile?",
        answer:
          "Da. Timisoara merge foarte bine pentru doua zile daca alegi un ritm calm, o zona buna de mers si una sau doua activitati rezervate.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Timisoara, raspunsul bun incepe cu stilul orasului: plimbari, cultura urbana, experiente locale si un ritm mai calm decat in orasele foarte aglomerate.",
      weekend:
        "In Timisoara, weekendul iese cel mai bine cand il construiesti simplu: o zona buna pentru mers, o experienta rezervata si timp suficient sa lasi orasul sa respire.",
      dateIdeas:
        "Ideile de date in Timisoara merg foarte bine pentru ca orasul are exact mixul potrivit intre eleganta, lejeritate si locuri care nu cer prea mult zgomot in jur.",
      coupleActivities:
        "Activitatile de cuplu in Timisoara functioneaza cel mai bine cand au ritm calm si o experienta buna in mijloc. Orasul se potriveste iesirilor care lasa loc pentru conversatie si timp real petrecut impreuna.",
      coolThings:
        "Lucrurile cool de facut in Timisoara sunt cele care se simt curate si bine alese. Experientele locale bune se potrivesc foarte bine cu stilul orasului.",
      hiddenGems:
        "Descoperirile mai putin evidente din Timisoara nu inseamna neaparat locuri ascunse; de multe ori inseamna experiente locale mici, facute bine, care schimba complet felul in care traiesti orasul.",
      familyActivities:
        "Pentru activitati de familie in Timisoara, functioneaza planurile simple, rezervate si usor de combinat cu o plimbare lunga sau o iesire linistita prin centru.",
    },
  },
  {
    slug: "brasov",
    name: "Brasov",
    nameAscii: "Brasov",
    county: "Brasov",
    region: "Transilvania",
    intro: [
      "Brasovul este unul dintre cele mai usor de iubit orase pentru iesiri bine facute. Ai centrul vechi, privelisti, acces rapid spre natura si genul de ritm care face ca o experienta buna sa para parte fireasca din zi.",
      "Cand cauti ce e de facut in Brasov, nu te opri la lista clasica de obiective. Orasul devine mult mai interesant cand legi partea vizuala de o experienta reala: activitate rezervata, atelier, wellness, social plan sau iesire construita in jurul unui host local.",
      "LIVADAI face exact asta: transforma intentia de a iesi in plan clar, citibil si rezervabil.",
    ],
    directAnswer:
      "In Brasov merita sa combini centrul vechi, zonele cu panorama si experientele locale rezervabile. Orasul este foarte bun pentru weekenduri, activitati de cuplu si planuri care alterneaza intre oras si un ritm mai slow, aproape de natura.",
    topThingsToDo: [
      "Porneste din centrul vechi si adauga o experienta care iti da un scop clar pentru iesire.",
      "Combina orasul cu activitati locale care nu se rezuma la simplul sightseeing.",
      "Alege planuri care folosesc ritmul mai aerisit al Brasovului in avantajul tau.",
      "Pentru o zi reusita, alterneaza mersul prin oras cu o experienta rezervata si bine explicata.",
      "Daca stai un weekend, lasa loc si pentru orele in care orasul se traieste mai slow, nu doar se consuma vizual.",
    ],
    uniqueExperiences: [
      "Experiente locale in grup restrans, potrivite pentru oameni care vor mai mult decat un traseu turistic.",
      "Activitati relaxante sau creative care completeaza foarte bine o zi petrecuta in Brasov.",
      "Planuri pentru cupluri si grupuri mici care pun accent pe context, nu doar pe locatie.",
      "Experiente conduse de hosti care stiu sa transforme orasul intr-un fundal bun pentru ceva memorabil.",
      "Activitati care iti dau un motiv real sa ramai mai mult in oras sau sa te intorci.",
    ],
    dateIdeas: [
      "Brasovul merge excelent pentru date-uri care incep cu mers pe jos si continua cu o activitate rezervata.",
      "Pentru un date bun, alege o experienta care lasa loc si pentru panorama, cafea sau o cina dupa.",
      "Iesirile in doi se simt mai bine aici cand au si oras, si activitate, si timp de respiratie.",
      "Cele mai bune date ideas in Brasov sunt cele care folosesc atmosfera orasului, nu doar o priveliste.",
      "Daca vrei un plan memorabil, alege o experienta care completeaza farmecul orasului, nu una care il acopera complet.",
    ],
    weekendActivities: [
      "Weekendul in Brasov poate fi urban dimineata si foarte relaxat dupa-amiaza.",
      "Daca vii pentru doua zile, merita sa rezervi o activitate care sa devina punctul central al planului.",
      "Pentru sambata merg bine experientele mai active, iar pentru duminica cele slow sau indoor.",
      "Orasul e ideal pentru weekenduri compacte, dar foarte bine gandite.",
      "Brasovul merge bine daca reduci lista de obiective si cresti calitatea timpului petrecut in oras.",
    ],
    coolIdeas: [
      "Lucrurile cool de facut in Brasov sunt cele care combina orasul frumos cu o experienta reala.",
      "Cauta activitati care adauga substanta unei iesiri deja placute vizual.",
      "Un plan cool aici inseamna sa iesi din tiparul centrul vechi-poza-cafea si sa faci ceva concret.",
      "Experientele locale bune te ajuta sa simti orasul, nu doar sa il vezi.",
      "Cele mai bune planuri cool lasa loc si pentru oras, si pentru activitatea principala.",
    ],
    familyIdeas: [
      "Brasovul este usor de gestionat pentru familii daca alegi planuri simple si bine dozate.",
      "Combinatia dintre mers, pauze si o activitate rezervata functioneaza foarte bine.",
      "Weekendurile de familie merg bine in Brasov pentru ca orasul permite ritm calm si trasee scurte.",
      "Daca ai nevoie de flexibilitate, cauta activitati scurte si zone usor de parcurs pe jos.",
      "Familiile castiga mult cand isi aleg un singur punct clar pentru fiecare parte a zilei.",
    ],
    hiddenGems: [
      "Descoperirile mai putin evidente din Brasov nu sunt doar stradute sau puncte de belvedere, ci si experiente locale bine alese.",
      "Un plan bun cu host local poate scoate la iveala mult mai mult din oras decat un traseu standard.",
      "Daca vrei sa descoperi Brasovul altfel, cauta activitati mici si bine construite.",
      "Hidden gems in Brasov inseamna adesea contexte intime, nu doar locuri spectaculoase vizual.",
      "Cele mai bune descoperiri vin atunci cand folosesti orasul ca fundal pentru ceva concret si memorabil.",
    ],
    faq: [
      {
        question: "Ce faci in Brasov in weekend?",
        answer:
          "Combina plimbarea prin centrul vechi cu o experienta rezervata in avans si, daca timpul permite, continua ziua intr-o zona cu panorama sau ritm mai slow.",
      },
      {
        question: "Ce activitati de cuplu merg bine in Brasov?",
        answer:
          "Date-urile in Brasov merg foarte bine daca adaugi o activitate clara intre plimbare si cina: ceva creativ, relaxant sau cu componenta sociala.",
      },
      {
        question: "Care sunt experientele unice din Brasov?",
        answer:
          "Experiente locale in grup mic, ateliere, activitati slow si planuri conduse de hosti care adauga context si atmosfera orasului.",
      },
      {
        question: "Brasovul este bun pentru un weekend romantic?",
        answer:
          "Da. Brasovul merge foarte bine pentru un weekend romantic daca legi orasul, panorama si o experienta rezervata intr-un singur plan coerent.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Brasov, gandeste orasul ca pe un mix intre centru vechi, aer bun si experiente locale. Asa obtii un plan mult mai valoros decat simpla plimbare turistica.",
      weekend:
        "In Brasov, weekendul functioneaza excelent cand iti alegi o experienta centrala si lasi restul orasului sa curga in jurul ei. E unul dintre cele mai usor de planificat orase pentru doua zile bune.",
      dateIdeas:
        "Ideile de date in Brasov sunt multe, dar cele memorabile sunt cele care combina atmosfera orasului cu o activitate reala. Asa iesirea nu ramane doar frumoasa, ci si vie.",
      coupleActivities:
        "Activitatile de cuplu in Brasov se potrivesc foarte bine cu ritmul orasului: mers, privelisti, timp bun impreuna si o experienta care leaga tot planul.",
      coolThings:
        "Lucrurile cool de facut in Brasov apar cand treci de partea evidenta a orasului si cauti experiente care te implica direct, nu doar te plimba dintr-un loc in altul.",
      hiddenGems:
        "Descoperirile mai putin evidente din Brasov pot fi experiente discrete, create local, care se potrivesc perfect cu orasul si completeaza partea lui foarte fotogenica cu ceva concret si memorabil.",
      familyActivities:
        "Pentru activitati de familie in Brasov, cele mai bune planuri sunt cele echilibrate: putina plimbare, o activitate rezervata si suficient timp ca ziua sa ramana placuta pentru toata lumea.",
    },
  },
  {
    slug: "constanta",
    name: "Constanta",
    nameAscii: "Constanta",
    county: "Constanta",
    region: "Dobrogea",
    intro: [
      "Constanta este mult mai interesanta cand nu o tratezi doar ca pe o oprire de vara. Orasul are centru vechi, promenada, energie de litoral, zone bune pentru plimbare si suficient context cat sa sustina experiente locale, date-uri, iesiri de weekend si activitati rezervabile.",
      "Cand cauti ce e de facut in Constanta, merita sa gandesti orasul dincolo de plaja. O zi buna poate insemna faleza, un plan rezervat, o iesire de seara si un ritm mai relaxat decat in orasele aglomerate din interior.",
      "LIVADAI te ajuta sa privesti Constanta ca pe un oras cu experiente si intentii de cautare clare, nu doar ca pe un decor sezonier.",
    ],
    directAnswer:
      "In Constanta merita sa combini faleza, centrul vechi, zonele cu vedere la mare si experientele locale rezervabile. Orasul este bun pentru weekenduri, idei de date, activitati cu prietenii si planuri care functioneaza si in afara sezonului de varf.",
    topThingsToDo: [
      "Porneste de la faleza sau centrul vechi si adauga o experienta rezervata in aceeasi zona.",
      "Nu te limita la plaja: Constanta are sens si prin activitati locale, seri tematice si planuri indoor.",
      "Construieste o iesire care lasa timp pentru mare, dar are si un punct clar in program.",
      "Alege planuri care valorifica seara in oras, nu doar partea de zi.",
      "Daca vii pentru doua zile, foloseste una pentru oras si una pentru ritm mai slow, fara sa te imprastii prea mult.",
    ],
    uniqueExperiences: [
      "Experiente locale care completeaza foarte bine ritmul de litoral, fara sa-l transforme in simplu consum de decor.",
      "Ateliere, activitati creative si iesiri in grup mic care schimba perceptia asupra orasului.",
      "Planuri premium sau sociale care merg bine atat pentru localnici, cat si pentru oameni veniti doar cateva zile.",
      "Experiente care folosesc apropierea de mare ca atmosfera, nu ca unic argument.",
      "Activitati conduse de hosti locali care inteleg foarte bine ritmul orasului si il transforma in context bun.",
    ],
    dateIdeas: [
      "Constanta merge bine pentru date-uri care incep cu o plimbare pe faleza si continua cu o activitate rezervata.",
      "Pentru un date memorabil, alege o experienta care lasa loc si pentru mare, si pentru conversatie.",
      "Orasul raspunde bine la iesiri in doi care combina atmosfera relaxata cu un plan concret.",
      "Cele mai bune date ideas in Constanta nu inseamna doar vedere frumoasa, ci si ceva de facut impreuna.",
      "Pentru seri bune, mizeaza pe activitati scurte, dar bine alese, care nu consuma toata energia iesirii.",
    ],
    weekendActivities: [
      "Weekendul in Constanta poate fi foarte bun si in afara verii daca alegi o activitate rezervata si o zona buna pentru mers.",
      "Sambata merge pe planuri mai sociale, duminica pe ritm mai slow si experiente relaxate.",
      "Daca vii pentru un city break, evita sa umpli tot programul cu trasee turistice si lasa loc pentru o experienta reala.",
      "Pentru grupuri mici, cele mai bune optiuni sunt cele cu durata clara si zona usor de atins.",
      "Constanta merita traita in weekend ca oras complet, nu doar ca statie spre mare.",
    ],
    coolIdeas: [
      "Lucrurile cool de facut in Constanta sunt cele care completeaza atmosfera de litoral cu o experienta buna.",
      "Cauta activitati care rup tiparul plaja-faleza-restaurant si adauga un sens iesirii.",
      "Un plan cool in Constanta merge bine daca are si oras, si experienta, si timp de respiratie.",
      "Activitatile bine alese fac orasul interesant chiar si cand vremea nu este de plaja.",
      "Cele mai bune idei sunt cele care te fac sa vezi orasul dincolo de zona foarte evidenta.",
    ],
    familyIdeas: [
      "Familiile pot construi usor o zi buna in Constanta daca alterneaza plimbarea cu o activitate rezervata.",
      "Alege planuri simple, cu durata clara si locuri unde poti continua natural iesirea.",
      "Orasul se preteaza la weekenduri in familie daca nu incerci sa faci tot litoralul intr-o singura zi.",
      "Pentru copii, functioneaza mai bine activitatile scurte si zonele usor de parcurs pe jos.",
      "Un plan bun de familie inseamna mai putin stres logistic si mai mult timp petrecut bine impreuna.",
    ],
    hiddenGems: [
      "Constanta are mult potential dincolo de traseul foarte turistic, mai ales prin experiente locale si spatii discrete.",
      "Hidden gems pot fi activitati bine alese in oras, nu doar puncte de belvedere sau locuri sezoniere.",
      "Cele mai bune descoperiri vin cand privesti orasul prin oameni si experiente, nu doar prin plaja.",
      "Exista multe planuri bune in Constanta care nu sunt evidente la prima cautare si tocmai de aceea merita filtrate mai bine.",
      "Daca vrei ceva memorabil, cauta experiente care folosesc orasul ca fundal, nu doar ca decor.",
    ],
    faq: [
      {
        question: "Ce e de facut in Constanta daca nu mergi la plaja?",
        answer:
          "Merita sa combini centrul vechi, faleza si o experienta rezervata: atelier, activitate sociala sau un plan local in grup mic.",
      },
      {
        question: "Constanta este buna pentru un weekend in doi?",
        answer:
          "Da. Constanta merge foarte bine pentru un weekend in doi daca alegi o iesire care combina marea, orasul si o experienta clara in program.",
      },
      {
        question: "Ce experiente unice poti cauta in Constanta?",
        answer:
          "Experiente locale in grup restrans, activitati creative, seri tematice si planuri care folosesc energia orasului fara sa depinda doar de plaja.",
      },
      {
        question: "Merita sa cauti activitati in Constanta si in extrasezon?",
        answer:
          "Da. In extrasezon orasul poate fi chiar mai usor de trait daca alegi activitati rezervabile si plimbari in zonele bune.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Constanta, gandeste orasul ca pe un mix intre mare, centru vechi si experiente locale. Cele mai bune planuri nu depind doar de plaja, ci de felul in care combini orasul cu o activitate buna.",
      weekend:
        "In Constanta, weekendul iese bine cand ai un plan clar si nu lasi totul pe schema clasica de litoral. O activitate rezervata ajuta mult sa dai directie zilei.",
      dateIdeas:
        "Ideile de date in Constanta sunt cele mai bune cand combina atmosfera de litoral cu o activitate reala. O iesire in doi merge mai bine daca are si context, nu doar vedere buna.",
      coupleActivities:
        "Activitatile de cuplu in Constanta pot fi foarte reusite daca alegi ceva relaxat, cu ritm clar si posibilitate de continuare pe faleza sau in centru.",
      coolThings:
        "Lucrurile cool de facut in Constanta apar cand iesi din tiparul foarte turistic si cauti experiente locale care dau mai mult sens iesirii.",
      hiddenGems:
        "Descoperirile mai putin evidente din Constanta inseamna deseori experiente mici, curate si bine facute, nu doar locuri care arata bine in poze.",
      familyActivities:
        "Pentru activitati de familie in Constanta, cele mai bune planuri sunt cele simple, rezervabile si usor de legat de o plimbare buna prin oras.",
    },
  },
  {
    slug: "sibiu",
    name: "Sibiu",
    nameAscii: "Sibiu",
    county: "Sibiu",
    region: "Transilvania",
    intro: [
      "Sibiul este unul dintre orasele care se citesc usor si se traiesc bine. Ai centru istoric compact, spatii culturale, ritm bun pentru plimbare si suficienta coerenta cat sa transformi repede o iesire obisnuita intr-un plan bine legat.",
      "Cand cauti ce e de facut in Sibiu, ai nevoie de claritate, nu de o lista infinita. Orasul merge foarte bine pentru weekenduri scurte, date-uri elegante, experiente culturale si activitati locale in grup restrans.",
      "LIVADAI pune toate aceste intentii intr-un singur layer editorial, usor de parcurs si de folosit atunci cand vrei sa alegi rapid ceva bun.",
    ],
    directAnswer:
      "In Sibiu merita sa combini centrul istoric, zonele culturale si experientele locale rezervabile. Orasul este foarte bun pentru weekenduri compacte, iesiri in doi, activitati elegante si planuri care nu au nevoie de multa logistica.",
    topThingsToDo: [
      "Porneste din centrul vechi si alege o experienta care completeaza ziua, nu doar o plimbare fara directie.",
      "Combina atmosfera culturala a orasului cu o activitate rezervata in grup mic.",
      "Alege planuri care folosesc ritmul compact al Sibiului in avantajul tau.",
      "Pentru o zi buna, nu ai nevoie de multe opriri, ci de una sau doua alegeri clare.",
      "Daca vii pentru un city break, pune orasul si experienta in acelasi cadru, nu in planuri separate.",
    ],
    uniqueExperiences: [
      "Experiente locale care se potrivesc cu partea culturala si calma a orasului.",
      "Ateliere, seri tematice sau planuri mici care functioneaza bine in grup restrans.",
      "Activitati premium sau creative care se potrivesc cu stilul mai ordonat al orasului.",
      "Experiente care completeaza centrul istoric in loc sa concureze cu el.",
      "Planuri locale care dau mai multa profunzime unei vizite deja placute in oras.",
    ],
    dateIdeas: [
      "Sibiul este foarte bun pentru date-uri care incep cu mers prin centru si continua cu o experienta rezervata.",
      "Pentru un date reusit, alege o activitate care lasa loc si pentru conversatie, nu doar pentru decor.",
      "Orasul se potriveste iesirilor in doi care au ritm calm si un mic concept in mijloc.",
      "Cele mai bune date ideas in Sibiu nu inseamna multe mutari, ci un plan simplu si elegant.",
      "Pentru seri speciale, merg bine experientele creative sau premium, urmate de o continuare lejera in oras.",
    ],
    weekendActivities: [
      "Weekendul in Sibiu merge bine daca alegi una sau doua activitati centrale si lasi restul orasului sa curga in jurul lor.",
      "Pentru sambata, merg bine iesirile cu componenta culturala sau sociala; pentru duminica, cele slow sau indoor.",
      "Un city break de doua zile in Sibiu poate fi foarte bun daca reduci lista de obiective si cresti calitatea experientei.",
      "Pentru grupuri mici, cauta activitati cu durata clara si locatie usor de atins din centru.",
      "Sibiul nu are nevoie de program incarcat pentru a iesi bine; are nevoie de selectie buna.",
    ],
    coolIdeas: [
      "Lucrurile cool de facut in Sibiu sunt cele care adauga substanta orasului deja foarte placut vizual.",
      "Cauta planuri care combina cultura, creativitatea si experiente in grup mic.",
      "Un plan cool in Sibiu trebuie sa fie curat, bine ales si usor de trait, nu doar foarte promovat.",
      "Experientele bune completeaza foarte bine stilul mai calm si mai atent al orasului.",
      "Daca vrei ceva diferit, cauta activitati mici, locale si bine explicate.",
    ],
    familyIdeas: [
      "Sibiul este usor de gestionat pentru familii tocmai pentru ca este compact si usor de parcurs.",
      "Alege activitati scurte si zone care permit pauze si continuari simple.",
      "Combinatia dintre o activitate rezervata si mers prin centru functioneaza foarte bine.",
      "Pentru copii, zilele ies mai bine daca nu schimbi prea des locatia.",
      "Familiile care vin in Sibiu au nevoie de claritate si ritm bun, nu de volum de obiective.",
    ],
    hiddenGems: [
      "Cele mai bune hidden gems din Sibiu sunt adesea experiente locale mici, nu neaparat locuri foarte promovate.",
      "Un atelier bun sau o activitate creativa poate spune mai mult despre oras decat o lista lunga de obiective.",
      "Daca vrei sa simti Sibiu altfel, cauta contexte locale, nu doar trasee turistice.",
      "Descoperirile mai bune apar cand folosesti orasul ca fundal pentru o experienta, nu doar ca decor frumos.",
      "Sibiul raspunde bine la planuri atente si curate, nu la alergat intre prea multe puncte.",
    ],
    faq: [
      {
        question: "Ce e de facut in Sibiu intr-un weekend?",
        answer:
          "Merita sa combini centrul istoric cu o experienta rezervata si cu un ritm lejer, fara sa umpli ziua cu prea multe mutari intre locuri.",
      },
      {
        question: "Sibiul este bun pentru un date?",
        answer:
          "Da. Sibiul merge foarte bine pentru date-uri elegante, simple si bine legate, mai ales daca adaugi o experienta intre plimbare si cina.",
      },
      {
        question: "Ce experiente unice poti cauta in Sibiu?",
        answer:
          "Experiente culturale, ateliere, activitati creative si planuri locale in grup restrans care completeaza bine stilul orasului.",
      },
      {
        question: "Merita sa cauti activitati indoor in Sibiu?",
        answer:
          "Da. Sibiul functioneaza bine si pentru activitati indoor, mai ales daca vremea nu ajuta sau daca vrei o iesire mai relaxata.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Sibiu, incepe de la avantajul real al orasului: este compact, coerent si foarte bun pentru planuri care combina cultura, mers pe jos si experiente locale.",
      weekend:
        "In Sibiu, weekendul iese bine cand nu il incarci. O activitate buna, cateva ore prin centru si un ritm mai calm fac de obicei diferenta.",
      dateIdeas:
        "Ideile de date in Sibiu sunt foarte bune pentru ca orasul are exact doza potrivita de eleganta, claritate si zone in care o iesire in doi poate curge natural.",
      coupleActivities:
        "Activitatile de cuplu in Sibiu se potrivesc cu stilul orasului: simple, atent alese si cu suficient timp de respiratie intre momente.",
      coolThings:
        "Lucrurile cool de facut in Sibiu sunt cele care adauga o experienta reala unui oras deja foarte bun ca atmosfera.",
      hiddenGems:
        "Descoperirile mai putin evidente din Sibiu nu inseamna doar locuri mici, ci si experiente locale care te ajuta sa traiesti orasul altfel decat prin trasee standard.",
      familyActivities:
        "Pentru activitati de familie in Sibiu, functioneaza cel mai bine planurile scurte, clare si usor de legat de mersul prin centru.",
    },
  },
  {
    slug: "oradea",
    name: "Oradea",
    nameAscii: "Oradea",
    county: "Bihor",
    region: "Crisana",
    intro: [
      "Oradea este unul dintre orasele cele mai curate si mai usor de parcurs din Romania pentru un weekend bun. Are arhitectura frumoasa, centru coerent, ritm placut si o scena urbana care se potriveste foarte bine cu experiente locale, iesiri in doi si planuri rezervabile.",
      "Cand cauti ce e de facut in Oradea, merita sa te gandesti la un mix intre oras, relaxare si o activitate care iti structureaza ziua. Aici lucrurile merg bine cand nu le complici inutil.",
      "LIVADAI construieste acest layer editorial exact pentru astfel de orase: pagini clare, intentii de cautare reale si linkuri spre experiente care au sens in oras.",
    ],
    directAnswer:
      "In Oradea merita sa combini centrul art nouveau, zonele de plimbare si experientele locale rezervabile. Orasul este excelent pentru weekenduri curate, idei de date, activitati lejere si planuri care nu au nevoie de multa agitatie ca sa iasa bine.",
    topThingsToDo: [
      "Plimba-te prin centru si leaga iesirea de o activitate care adauga substanta zilei.",
      "Alege experiente locale in grup mic daca vrei sa simti mai bine orasul.",
      "Oradea merge bine pentru planuri simple, dar bine gandite, nu pentru programe incarcate.",
      "Cauta activitati care completeaza atmosfera orasului, nu care o acopera.",
      "Daca vii pentru un weekend, foloseste ritmul clar al orasului in avantajul tau si evita sa te imprastii.",
    ],
    uniqueExperiences: [
      "Experiente creative, sociale sau premium care se potrivesc cu stilul ordonat al orasului.",
      "Planuri locale in spatii bune, curate si usor de integrat intr-o zi in oras.",
      "Activitati care fac diferenta intre o simpla vizita si o iesire cu memorie buna.",
      "Experiente conduse de oameni care stiu sa foloseasca foarte bine ritmul orasului.",
      "Planuri care se potrivesc atat pentru localnici, cat si pentru oameni veniti doar doua zile.",
    ],
    dateIdeas: [
      "Oradea este foarte buna pentru date-uri simple, elegante si bine legate.",
      "Pentru un date bun, combina centrul cu o experienta rezervata si o continuare lejera.",
      "Iesirile in doi merg bine in Oradea pentru ca orasul nu te oboseste inutil.",
      "Cele mai bune date ideas sunt cele care adauga un motiv bun de a face ceva impreuna.",
      "Daca vrei o seara memorabila, merg bine activitatile scurte si bine explicate.",
    ],
    weekendActivities: [
      "Weekendul in Oradea merge bine cand alegi un plan central si lasi orasul sa completeze restul.",
      "Pentru sambata, poti merge pe social sau creativ; pentru duminica, pe slow si relaxant.",
      "Oradea este buna pentru un weekend compact, dar foarte curat si bine filtrat.",
      "Daca vii din alt oras, o rezervare te ajuta sa scoti haosul din program.",
      "Orasul raspunde bine la zile simple, nu la programe supra-aglomerate.",
    ],
    coolIdeas: [
      "Lucrurile cool de facut in Oradea sunt de obicei cele simple, dar bine curate in executie.",
      "Cauta activitati locale care dau personalitate unei iesiri deja placute in oras.",
      "Un plan cool aici trebuie sa aiba ritm bun, concept clar si logistica mica.",
      "Cele mai bune idei nu sunt neaparat cele mai zgomotoase, ci cele mai bine potrivite orasului.",
      "Oradea merge bine pentru experiente unde calitatea atmosferei conteaza mai mult decat volumul.",
    ],
    familyIdeas: [
      "Familiile se pot organiza usor in Oradea daca aleg un singur punct central si o activitate rezervata.",
      "Orasul compact ajuta mult pentru plimbari si pauze naturale.",
      "Pentru copii, functioneaza bine activitatile scurte si traseele usor de parcurs.",
      "Un plan de familie bun inseamna putine mutari si timp real petrecut impreuna.",
      "Oradea este buna pentru weekenduri de familie tocmai pentru ca nu cere multa logistica.",
    ],
    hiddenGems: [
      "Cele mai bune descoperiri din Oradea apar adesea in zona experientelor locale, nu doar in arhitectura orasului.",
      "Un host bun sau un plan local bine ales poate schimba complet felul in care simti orasul.",
      "Hidden gems pot fi activitati mici si discrete, nu doar locuri care arata bine in poze.",
      "Daca vrei sa traiesti orasul altfel, cauta context si oameni, nu doar trasee.",
      "Oradea se potriveste foarte bine cu descoperiri lente si bine filtrate.",
    ],
    faq: [
      {
        question: "Ce e de facut in Oradea intr-un weekend?",
        answer:
          "Merita sa combini centrul, o plimbare buna si o experienta rezervata. Oradea functioneaza foarte bine pentru planuri simple si bine gandite.",
      },
      {
        question: "Oradea este buna pentru un date?",
        answer:
          "Da. Oradea merge foarte bine pentru date-uri elegante si lejere, mai ales daca adaugi o activitate intre plimbare si masa.",
      },
      {
        question: "Ce experiente unice poti cauta in Oradea?",
        answer:
          "Experiente locale, activitati creative, planuri premium in grup mic si iesiri care completeaza bine atmosfera orasului.",
      },
      {
        question: "Merita sa rezervi din timp activitati in Oradea?",
        answer:
          "Da. O rezervare buna iti da un punct clar in jurul caruia poti construi usor restul iesirii.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Oradea, cel mai bun raspuns incepe cu simplitatea orasului: centru coerent, ritm placut si experiente care completeaza foarte bine o zi bine aleasa.",
      weekend:
        "In Oradea, weekendul merge bine cand nu il complici. O activitate buna, o zona centrala si timp suficient pentru plimbare sunt de obicei suficiente.",
      dateIdeas:
        "Ideile de date in Oradea functioneaza bine pentru ca orasul are exact claritatea si eleganta necesare unei iesiri in doi fara agitatie inutila.",
      coupleActivities:
        "Activitatile de cuplu in Oradea merg cel mai bine cand lasa loc pentru conversatie si un ritm calm, bine dozat.",
      coolThings:
        "Lucrurile cool de facut in Oradea sunt cele care adauga o experienta locala buna unui oras deja foarte placut si bine aranjat.",
      hiddenGems:
        "Descoperirile mai putin evidente din Oradea apar atunci cand cauti planuri mici, locale si curate, nu doar obiective usor de bifat.",
      familyActivities:
        "Pentru activitati de familie in Oradea, cele mai bune planuri sunt cele simple, usor de parcurs si cu un singur punct clar in program.",
    },
  },
  {
    slug: "craiova",
    name: "Craiova",
    nameAscii: "Craiova",
    county: "Dolj",
    region: "Oltenia",
    intro: [
      "Craiova are mai multe lucruri bune de oferit decat lasa sa se vada la prima cautare. Orasul functioneaza bine pentru oameni care vor iesiri locale, zone usor de parcurs, ritm bun de seara si activitati care adauga directie unei zile care altfel ar ramane prea generica.",
      "Cand cauti ce e de facut in Craiova, merita sa privesti orasul ca pe un mix intre centru, parcuri, ritm urban si experiente rezervabile. Nu este un oras in care ai nevoie de haos ca sa iti iasa seara bine.",
      "LIVADAI te ajuta sa vezi partea practica a orasului: idei clare, pagini de intentie si ghiduri care transforma cautarea intr-un plan concret.",
    ],
    directAnswer:
      "In Craiova merita sa combini centrul, parcurile importante si experientele locale rezervabile. Orasul este bun pentru iesiri de weekend, activitati de cuplu, seri sociale si planuri care au nevoie de claritate, nu de mult zgomot.",
    topThingsToDo: [
      "Porneste de la centru sau de la o zona verde buna si adauga o activitate care fixeaza restul planului.",
      "Alege experiente locale daca vrei sa simti orasul dincolo de traseul foarte evident.",
      "Craiova merge bine pentru iesiri simple, dar bine alese, nu pentru programe foarte incarcate.",
      "Pentru seara, cauta activitati care lasa loc pentru continuare naturala in oras.",
      "Daca ai doar cateva ore, o rezervare clara face mult mai mult decat o lista de locuri bifate in graba.",
    ],
    uniqueExperiences: [
      "Experiente locale in grup mic, potrivite pentru cupluri sau prieteni care vor altceva.",
      "Ateliere, activitati creative sau planuri sociale care completeaza bine o iesire in oras.",
      "Experiente conduse de hosti locali care transforma orasul intr-un context bun, nu intr-un simplu fundal.",
      "Planuri premium sau tematice care dau serii un ritm clar si mai multa personalitate.",
      "Activitati care te scot din repetitia orasului fara sa te impinga in prea multa logistica.",
    ],
    dateIdeas: [
      "Craiova merge bine pentru date-uri care combina o plimbare buna cu o activitate rezervata.",
      "Pentru un date reusit, alege ceva care creeaza interactiune si reduce presiunea unei iesiri complet improvizate.",
      "Cele mai bune date ideas sunt cele care au ritm simplu si suficient timp pentru voi.",
      "Daca vrei sa iesi din rutina, merg bine activitatile creative, sociale sau usor playful.",
      "Un date bun nu are nevoie de multe opriri, ci de o alegere buna la momentul potrivit.",
    ],
    weekendActivities: [
      "Weekendul in Craiova merge bine cand alegi un plan principal si lasi restul zilei sa curga natural.",
      "Sambata poate fi mai sociala, iar duminica mai relaxata si mai simpla.",
      "Daca vii din alt oras, o experienta rezervata te ajuta sa reduci mult din indecizie.",
      "Craiova functioneaza bine pentru weekenduri locale care nu au nevoie de mult efort de organizare.",
      "Cele mai bune planuri sunt cele care combina o zona buna cu o activitate potrivita pentru ritmul vostru.",
    ],
    coolIdeas: [
      "Lucrurile cool de facut in Craiova sunt de obicei planurile locale care schimba rutina, nu cele mai zgomotoase optiuni.",
      "Cauta activitati care adauga ceva de facut efectiv, nu doar o locatie noua.",
      "Un plan cool are nevoie de un concept bun si de logistica mica.",
      "Orasul raspunde bine la seri tematice, activitati creative si iesiri in grup mic.",
      "Cele mai bune idei sunt cele care se potrivesc cu ritmul real al orasului, nu cu o imagine fortata.",
    ],
    familyIdeas: [
      "Familiile pot construi usor o zi buna in Craiova daca aleg activitati clare si zone unde se poate continua plimbarea.",
      "Alege planuri cu durata previzibila si putine mutari intre locatii.",
      "Orasul functioneaza bine pentru weekenduri de familie cu ritm simplu.",
      "Daca vrei o zi mai usoara, pune activitatea principala aproape de restul planului.",
      "Pentru familii, claritatea castiga mereu in fata volumului de optiuni.",
    ],
    hiddenGems: [
      "Hidden gems in Craiova inseamna deseori activitati locale si contexte mici, nu doar locuri foarte cunoscute.",
      "Un plan bun poate scoate mult mai mult din oras decat un traseu standard.",
      "Descoperirile cele mai bune apar cand cauti experiente cu oameni, nu doar locatii.",
      "Daca vrei sa traiesti orasul mai bine, cauta contexte in care chiar participi la ceva.",
      "Craiova are mai mult potential decat pare la o cautare superficiala, mai ales in zona de experiente locale.",
    ],
    faq: [
      {
        question: "Ce e de facut in Craiova intr-un weekend?",
        answer:
          "Alege o zona buna pentru plimbare, un parcurs simplu si o activitate rezervata. Asa iesirea are ritm si nu ramane la nivel de improvizatie.",
      },
      {
        question: "Ce activitati de cuplu merg bine in Craiova?",
        answer:
          "Merg bine activitatile conversationale, creative sau relaxate, legate de o plimbare si de o zona usor de continuat dupa experienta.",
      },
      {
        question: "Ce experiente unice poti cauta in Craiova?",
        answer:
          "Ateliere, seri tematice, activitati premium in grup mic si planuri locale care dau orasului mai mult sens.",
      },
      {
        question: "Merita sa cauti hidden gems in Craiova?",
        answer:
          "Da. O mare parte din farmecul orasului vine tocmai din activitati mici si contexte locale care nu sunt cele mai promovate.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Craiova, raspunsul bun este sa alegi intre zonele placute ale orasului si experientele care iti dau un motiv clar sa iesi. Orasul functioneaza mai bine cand este filtrat.",
      weekend:
        "In Craiova, weekendul iese bine cand alegi putin, dar bine. O experienta rezervata si o zona buna pentru mers pot fi suficiente pentru un plan reusit.",
      dateIdeas:
        "Ideile de date in Craiova functioneaza mai bine cand au o activitate la mijloc. Asa iesirea capata ritm si evita senzatia de plan facut doar din obligatie.",
      coupleActivities:
        "Activitatile de cuplu in Craiova merg bine cand reduc logistica si lasa loc pentru o experienta reala, nu doar pentru schimbarea decorului.",
      coolThings:
        "Lucrurile cool de facut in Craiova sunt de obicei cele care rup rutina cu minimum de complicatii si maximum de sens local.",
      hiddenGems:
        "Descoperirile mai putin evidente din Craiova apar atunci cand cauti activitati mici, gazde bune si planuri care nu se sprijina doar pe locuri foarte cunoscute.",
      familyActivities:
        "Pentru activitati de familie in Craiova, functioneaza cel mai bine planurile clare, cu durata usor de anticipat si zone bune pentru continuarea zilei.",
    },
  },
  {
    slug: "suceava",
    name: "Suceava",
    nameAscii: "Suceava",
    county: "Suceava",
    region: "Bucovina",
    intro: [
      "Suceava este unul dintre orasele care merita citite mai larg decat printr-o oprire scurta sau prin ideea ca tot ce conteaza este in afara lui. Orasul si zona lui functioneaza foarte bine pentru oameni care vor planuri locale, ritm bun de weekend si experiente care completeaza natural o vizita in Bucovina.",
      "Cand cauti ce e de facut in Suceava, merita sa gandesti locul ca pe un punct de plecare pentru cultura, plimbari, iesiri in doi si activitati locale rezervabile. Nu trebuie sa alegi doar intre mancare si obiective istorice.",
      "LIVADAI adauga aici un filtru util: idei citibile, pagini long-tail si ghiduri care te ajuta sa transformi orasul intr-un plan clar.",
    ],
    directAnswer:
      "In Suceava merita sa combini partea istorica, ritmul mai calm al orasului si experientele locale rezervabile. Orasul este bun pentru weekenduri in Bucovina, activitati de cuplu, planuri culturale si iesiri care se simt mai asezate si mai umane.",
    topThingsToDo: [
      "Leaga partea istorica a orasului de o experienta care da sens restului zilei.",
      "Alege planuri locale care completeaza bine atmosfera mai asezata a zonei.",
      "Suceava merge bine pentru iesiri lente, dar bine construite.",
      "Cauta activitati care te ajuta sa traiesti orasul, nu doar sa treci prin el.",
      "Daca vii in Bucovina pentru un weekend, foloseste orasul ca punct de pornire pentru o zi mai bine structurata.",
    ],
    uniqueExperiences: [
      "Experiente locale in grup mic, potrivite pentru cupluri, prieteni sau weekenduri scurte.",
      "Planuri culturale si activitati care merg bine cu ritmul mai calm al orasului.",
      "Experiente care se completeaza natural cu specificul zonei, fara sa para fortate.",
      "Activitati unde calitatea contextului conteaza mai mult decat decorul spectaculos.",
      "Planuri locale care aduc mai multa substanta unei vizite in Suceava si Bucovina.",
    ],
    dateIdeas: [
      "Suceava merge bine pentru date-uri simple si bine legate, mai ales daca alegi o activitate rezervata intre doua parti lejere ale iesirii.",
      "Pentru un date bun, orasul cere mai degraba claritate si ritm calm decat un plan foarte incarcat.",
      "Iesirile in doi se simt mai bine aici cand au context local si timp suficient pentru conversatie.",
      "Cele mai bune date ideas combina o plimbare sau o zona buna cu o experienta unde faceti ceva impreuna.",
      "Daca vrei o iesire speciala, alege ceva mic, bine facut si usor de continuat dupa activitate.",
    ],
    weekendActivities: [
      "Weekendul in Suceava merge bine pentru planuri culturale, plimbari si experiente rezervabile in oras sau in apropiere.",
      "Daca vii pentru doua zile, alege o activitate centrala si lasa restul programului aerisit.",
      "Sambata poate merge pe explorare si social, duminica pe planuri slow si mai relaxate.",
      "Suceava are sens pentru weekenduri care nu sunt foarte aglomerate, dar raman memorabile.",
      "Pentru un weekend bun, nu ai nevoie de multe puncte pe harta, ci de un plan coerent.",
    ],
    coolIdeas: [
      "Lucrurile cool de facut in Suceava sunt cele care adauga ceva real unei zone pe care multi o citesc prea repede.",
      "Cauta activitati locale care aduc un plus de energie unui oras altfel foarte calm.",
      "Un plan cool aici trebuie sa ramana compatibil cu ritmul asezat al locului.",
      "Cele mai bune idei sunt cele care combina contextul local cu o experienta bine construita.",
      "Daca vrei ceva diferit, incearca un atelier sau un plan in grup mic in locul unei iesiri previzibile.",
    ],
    familyIdeas: [
      "Suceava merge bine pentru familii daca alegi activitati simple si zone care permit un ritm calm.",
      "Alege experiente cu durata clara si timp pentru pauze intre etape.",
      "Pentru weekenduri in familie, claritatea planului conteaza mai mult decat numarul de opriri.",
      "Orasul si zona din jur permit zile linistite daca nu le incarci inutil.",
      "Cele mai bune planuri de familie sunt cele care lasa loc si pentru mers, si pentru odihna.",
    ],
    hiddenGems: [
      "Hidden gems in Suceava inseamna adesea contexte locale, oameni si experiente care nu apar primele in cautari.",
      "Un host bun sau o activitate locala poate schimba complet felul in care simti orasul.",
      "Descoperirile bune vin atunci cand reduci viteza si alegi lucruri mai mici, dar mai bine facute.",
      "Suceava are multe planuri bune care nu sunt zgomotoase si tocmai de aceea raman mai bine cu tine.",
      "Daca vrei sa traiesti zona altfel, cauta experiente locale, nu doar trasee clasice.",
    ],
    faq: [
      {
        question: "Ce e de facut in Suceava intr-un weekend?",
        answer:
          "Merita sa combini partea istorica, o plimbare buna si o experienta rezervata. Astfel ziua capata ritm si nu ramane doar o succesiune de opriri.",
      },
      {
        question: "Suceava este buna pentru un weekend in doi?",
        answer:
          "Da. Suceava merge bine pentru un weekend in doi daca alegi planuri calme, cu experiente locale si timp real pentru oras si pentru voi.",
      },
      {
        question: "Ce experiente unice poti cauta in Suceava?",
        answer:
          "Experiente locale in grup mic, planuri culturale, ateliere si activitati care completeaza natural ritmul zonei.",
      },
      {
        question: "Merita sa cauti activitati si in jurul Sucevei, nu doar in oras?",
        answer:
          "Da. Suceava functioneaza foarte bine ca baza pentru planuri locale si weekenduri in Bucovina, mai ales daca alegi o activitate centrala si restul ramane flexibil.",
      },
    ],
    queryHooks: {
      whatToDo:
        "Daca vrei sa stii ce e de facut in Suceava, raspunsul bun incepe cu ritmul locului: mai calm, mai asezat si mai bun pentru planuri locale decat pentru alergat intre prea multe puncte.",
      weekend:
        "In Suceava, weekendul iese bine cand alegi o experienta centrala si lasi restul orasului sau al zonei sa completeze ziua fara graba inutila.",
      dateIdeas:
        "Ideile de date in Suceava merg bine pentru ca orasul are un ritm calm si suficienta substanta culturala cat sa sustina o iesire in doi bine aleasa.",
      coupleActivities:
        "Activitatile de cuplu in Suceava se potrivesc foarte bine cu planuri simple, rezervate si usor de continuat dupa experienta principala.",
      coolThings:
        "Lucrurile cool de facut in Suceava sunt cele care adauga o experienta locala reala unei zone pe care multi o citesc prea repede.",
      hiddenGems:
        "Descoperirile mai putin evidente din Suceava apar atunci cand cauti oameni, contexte si activitati locale, nu doar obiective foarte cunoscute.",
      familyActivities:
        "Pentru activitati de familie in Suceava, cele mai bune planuri sunt cele clare, calme si usor de legat de restul zilei.",
    },
  },
];

const cityGuideMap = Object.fromEntries(
  citySeeds.map((seed) => [
    seed.slug,
    {
      ...seed,
      heroTitle: `Ce merita sa faci in ${seed.name} daca vrei un plan mai bun decat o iesire la intamplare`,
      englishIntent: `What to do in ${seed.nameAscii}, date ideas in ${seed.nameAscii} and weekend activities in ${seed.nameAscii}.`,
    },
  ])
) as Record<CitySlug, CityGuideContent>;

export const cityGuides = cityGuideMap;

export const majorCityOrder: CitySlug[] = [
  "iasi",
  "cluj",
  "bucuresti",
  "timisoara",
  "brasov",
  "constanta",
  "sibiu",
  "oradea",
  "craiova",
  "suceava",
];

export const initialQueryPageOrder: QuerySlug[] = [
  "ce-e-de-facut",
  "ce-faci-in-weekend",
  "date-ideas",
  "activitati-cuplu",
  "lucruri-cool-de-facut",
  "hidden-gems",
  "family-activities",
];

export const scalableQueryTemplates: Record<
  QuerySlug,
  {
    slug: QuerySlug;
    title: (city: CityGuideContent) => string;
    description: (city: CityGuideContent) => string;
    h1: (city: CityGuideContent) => string;
    intro: (city: CityGuideContent) => string[];
    bullets: (city: CityGuideContent) => string[];
    faq: (city: CityGuideContent) => FAQItem[];
  }
> = {
  "ce-e-de-facut": {
    slug: "ce-e-de-facut",
    title: (city) => `Ce e de facut in ${city.name} | LIVADAI`,
    description: (city) => `Raspuns direct la intrebarea ce e de facut in ${city.name}, cu idei concrete pentru weekend, cuplu si experiente locale.`,
    h1: (city) => `Ce e de facut in ${city.name}`,
    intro: (city) => [
      city.queryHooks.whatToDo,
      city.directAnswer,
      `Daca vrei idei concrete, mergi pe un mix intre oras, experiente locale si timp bine folosit. In ${city.name}, cele mai bune planuri nu sunt neaparat cele mai zgomotoase, ci cele care au context clar si un motiv bun pentru a iesi.`,
      `Aceasta pagina este gandita pentru oameni care vor un raspuns rapid, dar si suficient context cat sa transforme cautarea intr-o alegere buna.`,
    ],
    bullets: (city) => city.topThingsToDo,
    faq: (city) => city.faq,
  },
  "ce-faci-in-weekend": {
    slug: "ce-faci-in-weekend",
    title: (city) => `Ce faci in weekend in ${city.name} | LIVADAI`,
    description: (city) => `Idei clare pentru weekend in ${city.name}: experiente locale, iesiri in cuplu, activitati cu prietenii si planuri rezervabile.`,
    h1: (city) => `Ce faci in weekend in ${city.name}`,
    intro: (city) => [
      city.queryHooks.weekend,
      `Pentru ${city.name}, un weekend bun inseamna sa alegi una sau doua experiente care iti structureaza ziua, apoi sa lasi orasul sa completeze restul. Astfel eviti planurile obosite si ramai cu iesiri care chiar au ritm.`,
      `Daca vrei eficienta, cauta activitati cu slot clar, grup mic si un punct bun de pornire in oras. Asa ai mai putin timp pierdut si mai multa energie pentru ce conteaza.`,
      `O pagina buna de weekend trebuie sa te ajute sa alegi repede, fara sa sacrifici calitatea. Exact asta incearca sa faca ghidul acesta.`,
    ],
    bullets: (city) => city.weekendActivities,
    faq: (city) => [
      city.faq[0],
      {
        question: `Cum iti organizezi un weekend reusit in ${city.name}?`,
        answer: `Alege o activitate centrala, lasa loc pentru plimbare si pastreaza restul planului simplu. In ${city.name}, claritatea bate improvizatia.`,
      },
      {
        question: `Merita sa rezervi activitati din timp in ${city.name}?`,
        answer: `Da. O rezervare buna iti fixeaza ritmul zilei si te ajuta sa construiesti un weekend coerent, mai ales daca vii doar pentru doua zile.`,
      },
      {
        question: `Ce tip de activitati merg cel mai bine in weekend in ${city.name}?`,
        answer: `Merg bine activitatile cu durata clara, experientele locale in grup mic si planurile care pot fi legate usor de o zona buna pentru mers sau pentru continuarea serii.`,
      },
    ],
  },
  "date-ideas": {
    slug: "date-ideas",
    title: (city) => `Idei de date in ${city.name} | LIVADAI`,
    description: (city) => `Idei bune de date in ${city.name}, cu activitati reale, planuri in doi si experiente locale care chiar merita.`,
    h1: (city) => `Idei de date in ${city.name}`,
    intro: (city) => [
      city.queryHooks.dateIdeas,
      `Un date bun in ${city.name} nu trebuie sa fie complicat. Trebuie doar sa combine o zona buna, o activitate potrivita si suficient timp cat sa nu simtiti ca alergati intre locuri.`,
      `Cele mai bune idei sunt cele care va dau ceva de facut impreuna: conversatie, joaca, creativitate sau o experienta cu ritm clar. De aici apare diferenta dintre o iesire ok si una pe care vreti sa o repetati.`,
      `Pagina aceasta este construita ca sa ofere idei care pot fi folosite direct, nu doar inspiratie vaga.`,
    ],
    bullets: (city) => city.dateIdeas,
    faq: (city) => [
      city.faq[1],
      {
        question: `Care sunt cele mai bune date ideas pentru o prima intalnire in ${city.name}?`,
        answer: `Planurile lejere, conversationale si cu o activitate usoara la mijloc functioneaza cel mai bine. Evita iesirile prea rigide si alege ceva care lasa loc pentru naturalete.`,
      },
      {
        question: `Cum alegi un date mai memorabil in ${city.name}?`,
        answer: `Porneste de la o experienta rezervata si construieste restul serii in jurul ei. Asa iesirea capata directie si ramane mai usor in minte.`,
      },
      {
        question: `Ce greseli merita evitate la un date in ${city.name}?`,
        answer: `Nu incarca seara cu prea multe opriri si nu lasa totul pe improvizatie. O singura alegere buna face mai mult decat trei mutari intre locuri doar ca sa para interesant.`,
      },
    ],
  },
  "activitati-cuplu": {
    slug: "activitati-cuplu",
    title: (city) => `Activitati de cuplu in ${city.name} | LIVADAI`,
    description: (city) => `Activitati de cuplu in ${city.name}, de la experiente locale si idei romantice pana la planuri playful si activitati de weekend.`,
    h1: (city) => `Activitati de cuplu in ${city.name}`,
    intro: (city) => [
      city.queryHooks.coupleActivities,
      `Daca sunteti deja in oras sau pregatiti o iesire speciala, merita sa alegeti activitati care adauga interactiune, nu doar decor. In ${city.name}, iesirile in doi merg bine cand aveti ceva real de facut impreuna.`,
      `Planurile bune de cuplu pot fi creative, relaxante, sociale sau usor active. Important este sa aiba un cadru clar si sa va lase timp sa traiti orasul fara graba inutila.`,
      `Aici gasesti idei care functioneaza pentru cupluri noi, cupluri care locuiesc deja in oras sau oameni care vor sa iasa din rutina.`,
    ],
    bullets: (city) => [...city.dateIdeas, ...city.coolIdeas.slice(0, 2)],
    faq: (city) => [
      city.faq[1],
      {
        question: `Ce activitati de cuplu merg bine dupa program in ${city.name}?`,
        answer: `Merg bine activitatile scurte, rezervabile si usor de legat de o cina sau o plimbare. Ideal este sa alegi ceva care schimba energia serii, nu doar locul.`,
      },
      {
        question: `Cum alegi o iesire in doi fara sa repeti aceeasi rutina in ${city.name}?`,
        answer: `Schimba structura iesirii, nu doar locatia. O experienta rezervata, chiar scurta, poate reseta complet felul in care traiti orasul impreuna.`,
      },
      {
        question: `Merita sa cauti activitati de cuplu si in timpul saptamanii in ${city.name}?`,
        answer: `Da. Multe dintre cele mai bune iesiri in doi sunt cele de dupa program, tocmai pentru ca nu cer un efort mare de organizare daca ai ales bine activitatea.`,
      },
    ],
  },
  "lucruri-cool-de-facut": {
    slug: "lucruri-cool-de-facut",
    title: (city) => `Lucruri cool de facut in ${city.name} | LIVADAI`,
    description: (city) => `Lucruri cool de facut in ${city.name}: idei noi, experiente locale, activitati pentru prieteni si planuri care rup rutina.`,
    h1: (city) => `Lucruri cool de facut in ${city.name}`,
    intro: (city) => [
      city.queryHooks.coolThings,
      `Cand cauti ceva cool in ${city.name}, merita sa alegi activitati care te pun in miscare sau iti schimba ritmul, nu doar acelasi traseu repetat cu alta destinatie.`,
      `Cele mai bune idei sunt cele care au un concept clar si o atmosfera buna: ceva creativ, ceva social, ceva usor premium sau pur si simplu ceva diferit de ce faci de obicei.`,
      `Pagina aceasta este facuta pentru oameni care vor sa iasa din schema standard, dar nu vor sa cada in recomandari vagi.`,
    ],
    bullets: (city) => city.coolIdeas,
    faq: (city) => [
      {
        question: `Ce inseamna un lucru cool de facut in ${city.name}?`,
        answer: `Inseamna o activitate care schimba ritmul obisnuit, are context bun si se simte suficient de diferita incat sa merite timpul tau.`,
      },
      city.faq[2],
      {
        question: `Cum gasesti idei noi de iesit in ${city.name}?`,
        answer: `Cauta experiente locale, hosti si activitati rezervabile in loc sa te bazezi doar pe liste generice sau pe aceleasi recomandari repetate.`,
      },
      {
        question: `Lucrurile cool trebuie sa fie scumpe ca sa merite in ${city.name}?`,
        answer: `Nu. Ce conteaza este claritatea experientei, atmosfera si felul in care completeaza orasul, nu doar pretul sau eticheta de premium.`,
      },
    ],
  },
  "hidden-gems": {
    slug: "hidden-gems",
    title: (city) => `Locuri si experiente mai putin evidente in ${city.name} | LIVADAI`,
    description: (city) => `Idei de hidden gems in ${city.name}: locuri si experiente locale care merita descoperite fara marketing gol si fara filler.`,
    h1: (city) => `Locuri si experiente mai putin evidente in ${city.name}`,
    intro: (city) => [
      city.queryHooks.hiddenGems,
      city.directAnswer,
      `Cele mai bune descoperiri vin atunci cand cauti experiente locale bine facute, nu doar locuri foarte fotogenice.`,
      `Daca vrei ceva care chiar merita povestit, cauta contexte locale cu sens si oameni care stiu sa creeze experienta, nu doar sa o promoveze.`,
    ],
    bullets: (city) => city.hiddenGems,
    faq: (city) => city.faq,
  },
  "family-activities": {
    slug: "family-activities",
    title: (city) => `Activitati pentru familie in ${city.name} | LIVADAI`,
    description: (city) => `Activitati pentru familie in ${city.name}, cu idei clare de weekend, iesiri usor de organizat si experiente locale.`,
    h1: (city) => `Activitati pentru familie in ${city.name}`,
    intro: (city) => [
      city.queryHooks.familyActivities,
      city.directAnswer,
      `Pentru familii, cele mai bune planuri sunt cele clare, rezervabile si usor de combinat cu mers pe jos sau pauze bune.`,
      `Aceasta pagina este construita pentru oameni care vor sa transforme o zi de familie intr-un plan simplu, coerent si usor de urmat.`,
    ],
    bullets: (city) => city.familyIdeas,
    faq: (city) => city.faq,
  },
};

const buildCityGuidePage = (guide: CityGuideContent): GuideContent => ({
  slug: `ce-e-de-facut-in-${guide.slug}`,
  title: `Ce e de facut in ${guide.name}: ghid local complet LIVADAI`,
  description: `Ghid editorial LIVADAI despre ce e de facut in ${guide.name}, cu idei de weekend, activitati de cuplu, experiente locale si intrebari frecvente utile.`,
  intro: [
    `${guide.directAnswer} ${guide.intro[0]}`,
    `${guide.intro[1]} ${guide.intro[2]}`,
  ],
  sections: [
    {
      title: `Cum construiesti o zi buna in ${guide.name}`,
      paragraphs: [
        `Daca vrei un raspuns practic, incepe cu o zona buna de oras, alege o activitate care iti fixeaza ritmul si lasa restul zilei suficient de aerisit cat sa poti continua natural iesirea. In ${guide.name}, planurile bune apar mai des atunci cand nu incerci sa faci prea multe deodata.`,
        `Acest ghid este facut pentru cautari reale, nu pentru liste decorative. De aceea, continutul pune accent pe idei aplicabile, legaturi intre oras si experiente si felul in care alegi ceva potrivit pentru contextul tau.`,
      ],
      bullets: guide.topThingsToDo,
    },
    {
      title: `Idei de weekend si iesiri bine filtrate in ${guide.name}`,
      paragraphs: [
        `Weekendul in ${guide.name} iese cel mai bine cand ai una sau doua alegeri bune, nu cinci planuri puse la intamplare. Activitatile rezervabile ajuta foarte mult pentru ca reduc timpul pierdut pe indecizie si fac ziua mai usor de organizat.`,
      ],
      bullets: guide.weekendActivities,
    },
    {
      title: `Idei de date si activitati de cuplu in ${guide.name}`,
      paragraphs: [
        `Daca vrei o iesire in doi care chiar sa iasa bine, cauta activitati care adauga interactiune si ritm. Un date memorabil nu vine doar din locatie, ci din felul in care experienta, orasul si timpul petrecut impreuna se leaga firesc.`,
      ],
      bullets: guide.dateIdeas,
    },
    {
      title: `Experiente unice, lucruri cool si hidden gems in ${guide.name}`,
      paragraphs: [
        `Partea cea mai interesanta a unui oras nu este intotdeauna cea mai evidenta. De multe ori, experientele cele mai bune sunt cele in care oamenii, atmosfera si ritmul local conteaza mai mult decat lista clasica de obiective.`,
      ],
      bullets: [...guide.uniqueExperiences, ...guide.coolIdeas.slice(0, 2), ...guide.hiddenGems.slice(0, 2)],
    },
    {
      title: `Linkuri utile pentru ${guide.name}`,
      links: [
        { href: `/${guide.slug}`, title: `Hubul principal pentru ${guide.name}`, description: guide.directAnswer },
        { href: `/${guide.slug}/ce-faci-in-weekend`, title: `Ce faci in weekend in ${guide.name}`, description: scalableQueryTemplates["ce-faci-in-weekend"].description(guide) },
        { href: `/${guide.slug}/date-ideas`, title: `Idei de date in ${guide.name}`, description: scalableQueryTemplates["date-ideas"].description(guide) },
        { href: `/${guide.slug}/activitati-cuplu`, title: `Activitati de cuplu in ${guide.name}`, description: scalableQueryTemplates["activitati-cuplu"].description(guide) },
        { href: `/${guide.slug}/hidden-gems`, title: `Hidden gems in ${guide.name}`, description: scalableQueryTemplates["hidden-gems"].description(guide) },
        { href: `/${guide.slug}/family-activities`, title: `Activitati pentru familie in ${guide.name}`, description: scalableQueryTemplates["family-activities"].description(guide) },
      ],
    },
  ],
  faq: guide.faq,
  relatedLinks: [
    { href: `/${guide.slug}`, title: `Vezi hubul ${guide.name}`, description: guide.directAnswer },
    { href: "/guides/top-experiente-romania", title: "Top experiente in Romania", description: "Vezi o selectie editoriala despre orase si tipuri de iesiri care merita urmarite." },
  ],
});

const editorialGuidePages: GuideContent[] = [
  {
    slug: "top-experiente-romania",
    title: "Top experiente in Romania: unde merita sa cauti iesiri memorabile",
    description: "Selectie editoriala LIVADAI cu orasele si tipurile de experiente care merita urmarite in Romania pentru iesiri locale, weekenduri si idei de date.",
    intro: [
      "Daca vrei sa gasesti experiente bune in Romania, nu incepe de la cantitate. Incepe de la orase care au ritm, oameni activi si hosti capabili sa construiasca planuri reale. Tocmai de aceea cele mai bune orase pentru experiente locale sunt cele in care cultura urbana si viata de zi cu zi se completeaza bine.",
      "Iasi, Cluj, Bucuresti, Timisoara, Brasov, Constanta, Sibiu, Oradea, Craiova si Suceava nu sunt valoroase doar pentru obiective sau restaurante. Sunt bune pentru ca pot sustine iesiri memorabile: idei de date, planuri de weekend, activitati creative, social events si experiente rezervabile care scot omul din rutina.",
    ],
    sections: [
      {
        title: "Orase care merita urmarite pe LIVADAI",
        bullets: majorCityOrder.map((city) => `${cityGuides[city].name} - ${cityGuides[city].directAnswer}`),
      },
      {
        title: "Cum alegi o experienta buna",
        bullets: [
          "Cauta o activitate cu scop clar, nu doar un loc frumos.",
          "Preferă grupuri mici sau contexte in care interactionezi real.",
          "Verifica daca se potriveste cu ritmul zilei tale: dupa program, sambata, city break sau date.",
          "Alege experiente care iti lasa si orasul la dispozitie, nu iti consuma toata energia.",
          "Nu te lasa ghidat doar de popularitate; contextul si potrivirea cu planul tau conteaza mai mult.",
        ],
      },
      {
        title: "Huburi urbane si ghiduri utile",
        links: majorCityOrder.map((city) => ({ href: `/${city}`, title: `Ce faci in ${cityGuides[city].name}`, description: cityGuides[city].directAnswer })),
      },
    ],
    relatedLinks: majorCityOrder.slice(0, 6).map((city) => ({ href: `/guides/ce-e-de-facut-in-${city}`, title: `Ghid complet pentru ${cityGuides[city].name}` })),
  },
  {
    slug: "idei-de-date-in-bucuresti",
    title: "Idei de date in Bucuresti: planuri care chiar ies bine",
    description: "Ghid LIVADAI cu idei de date in Bucuresti, de la iesiri simple si creative pana la experiente locale care fac diferenta.",
    intro: [
      "Daca vrei idei de date in Bucuresti, regula cea mai buna este sa nu lasi orasul sa iti fragmenteze iesirea. Alege o zona, o experienta clara si un ritm care va lasa loc pentru conversatie, nu doar pentru trafic si mutari dintr-un loc in altul.",
      "Bucurestiul este foarte bun pentru date-uri tocmai pentru ca iti ofera varietate. Problema nu este lipsa de idei, ci filtrarea lor. Cele mai bune iesiri in doi au un punct central: atelier, activitate, tasting, social plan sau o experienta premium care scoate seara din rutina.",
    ],
    sections: [
      {
        title: "Ce functioneaza bine la un date in Bucuresti",
        bullets: [
          "O zona buna de oras plus o experienta rezervata plus timp pentru continuarea naturala a serii.",
          "Activitati care creeaza interactiune reala, nu doar fundal frumos.",
          "Planuri care reduc logistica si cresc timpul petrecut bine impreuna.",
          "Iesiri cu ritm clar, mai ales daca este prima intalnire sau aveti putin timp.",
          "Experiente care lasa loc pentru conversatie, nu doar pentru mutarea intre locuri.",
        ],
      },
      {
        title: "Cand merita sa rezervi din timp",
        paragraphs: [
          "Merita aproape intotdeauna cand vrei sa eviti energia risipita pe improvizatie. In Bucuresti, o rezervare buna poate face diferenta intre o seara haotica si una foarte coerenta.",
          "Este util mai ales pentru vineri, sambata seara si pentru planuri in care vrei sa lasi o impresie buna fara sa pari fortat.",
        ],
      },
      {
        title: "Linkuri utile",
        links: [
          { href: "/bucuresti/date-ideas", title: "Idei de date in Bucuresti" },
          { href: "/bucuresti/activitati-cuplu", title: "Activitati de cuplu in Bucuresti" },
          { href: "/bucuresti", title: "Hubul Bucuresti" },
          { href: "/guides/top-experiente-romania", title: "Top experiente in Romania" },
        ],
      },
    ],
    relatedLinks: [
      { href: "/guides/ce-e-de-facut-in-bucuresti", title: "Ghid complet pentru Bucuresti" },
      { href: "/cluj/date-ideas", title: "Idei de date in Cluj" },
      { href: "/iasi/date-ideas", title: "Idei de date in Iasi" },
    ],
  },
  {
    slug: "orase-din-romania-pentru-un-weekend-bun",
    title: "Orase din Romania pentru un weekend bun: cum alegi destinatia potrivita",
    description: "Ghid LIVADAI despre orase din Romania care merita pentru un weekend bun, in functie de ritm, tip de iesire si genul de experiente pe care le cauti.",
    intro: [
      "Nu toate orasele functioneaza la fel pentru un weekend bun. Unele merg pentru cultura si plimbare, altele pentru date-uri si social, iar altele pentru un ritm mai calm si experiente locale discrete. Daca alegi orasul potrivit pentru tipul tau de iesire, scad sansele sa umpli programul cu lucruri care arata bine pe hartie, dar se simt slab in realitate.",
      "Ghidul acesta te ajuta sa alegi mai inteligent intre orasele unde LIVADAI construieste acum layer-ul editorial si paginile de intentie. Ideea nu este sa bifezi cat mai multe destinatii, ci sa ajungi intr-un loc care raspunde bine la ce cauti tu de fapt.",
    ],
    sections: [
      {
        title: "Daca vrei cultura, plimbare si ritm calm",
        bullets: [
          "Iasi pentru mixul dintre Copou, centru si experiente locale bine dozate.",
          "Sibiu pentru un oras compact, elegant si foarte bun pentru city break-uri curate.",
          "Timisoara pentru plimbari lungi, piete bune si iesiri care nu au nevoie de mult zgomot.",
        ],
      },
      {
        title: "Daca vrei energie urbana si varietate mare",
        bullets: [
          "Bucuresti daca ai nevoie de volum mare de optiuni, dar il poti filtra bine.",
          "Cluj daca vrei un oras social, activ si foarte bun pentru seri in grup mic sau date-uri.",
          "Constanta daca iti place mixul dintre oras, mare si planuri care merg bine si in extrasezon.",
        ],
      },
      {
        title: "Daca vrei weekenduri simple si foarte coerente",
        bullets: [
          "Oradea pentru claritate si ritm urban foarte usor de parcurs.",
          "Brasov pentru combinatie buna intre centru, panorama si activitati in doi.",
          "Suceava pentru ritm calm si planuri locale care pot fi legate de Bucovina.",
          "Craiova pentru iesiri locale fara prea multa agitatie si cu logistica mica.",
        ],
      },
      {
        title: "Huburi pe care merita sa intri mai departe",
        links: majorCityOrder.map((city) => ({ href: `/${city}`, title: `Ce e de facut in ${cityGuides[city].name}`, description: cityGuides[city].directAnswer })),
      },
    ],
    relatedLinks: [
      { href: "/guides/top-experiente-romania", title: "Top experiente in Romania" },
      { href: "/guides/ce-e-de-facut-in-cluj", title: "Ghid complet pentru Cluj" },
      { href: "/guides/ce-e-de-facut-in-sibiu", title: "Ghid complet pentru Sibiu" },
    ],
  },
  {
    slug: "idei-de-date-in-romania",
    title: "Idei de date in Romania: orase si contexte care chiar functioneaza",
    description: "Ghid editorial LIVADAI despre idei de date in Romania, orase potrivite pentru iesiri in doi si felul in care alegi experiente care chiar raman in minte.",
    intro: [
      "Daca vrei idei de date in Romania, nu toate orasele functioneaza la fel. Unele sunt foarte bune pentru mers si conversatie, altele pentru varietate mare, iar altele pentru week-enduri in doi care au nevoie de ritm mai calm si mai putina logistica.",
      "Cele mai bune date-uri au in comun acelasi lucru: nu se bazeaza doar pe locatie, ci pe structura. O activitate potrivita, un context bun si timp suficient pentru continuarea serii fac de obicei diferenta dintre o iesire corecta si una memorabila.",
    ],
    sections: [
      {
        title: "Orase foarte bune pentru date-uri",
        bullets: [
          "Brasov pentru atmosfera, mers pe jos si idei de date care combina orasul cu activitati in doi.",
          "Cluj pentru energie urbana, seri sociale si date-uri cu componenta mai dinamica.",
          "Sibiu pentru iesiri elegante, simple si foarte usor de legat intr-un plan coerent.",
          "Timisoara pentru cupluri care vor ritm calm, plimbare si experiente cu grup mic.",
          "Bucuresti pentru varietate mare, atata timp cat filtrezi bine orasul si nu il lasi sa-ti consume energia.",
        ],
      },
      {
        title: "Cum alegi un date bun",
        bullets: [
          "Porneste de la o activitate, nu doar de la un restaurant.",
          "Alege o zona buna si evita sa muti seara in prea multe locuri.",
          "Lasa spatiu pentru conversatie si pentru o continuare naturala a iesirii.",
          "Rezerva din timp daca vrei sa scoti improvizatia din ecuație.",
          "Alege contextul potrivit pentru ce fel de date vrei: primul, aniversare, iesire usoara dupa program sau weekend in doi.",
        ],
      },
      {
        title: "Pagini utile pentru continuare",
        links: [
          { href: "/bucuresti/date-ideas", title: "Idei de date in Bucuresti" },
          { href: "/cluj/date-ideas", title: "Idei de date in Cluj" },
          { href: "/brasov/date-ideas", title: "Idei de date in Brasov" },
          { href: "/sibiu/date-ideas", title: "Idei de date in Sibiu" },
          { href: "/timisoara/date-ideas", title: "Idei de date in Timisoara" },
        ],
      },
    ],
    relatedLinks: [
      { href: "/guides/top-experiente-romania", title: "Top experiente in Romania" },
      { href: "/guides/orase-din-romania-pentru-un-weekend-bun", title: "Orase din Romania pentru un weekend bun" },
    ],
  },
];

const cityGuidePages: GuideContent[] = majorCityOrder.map((city) => buildCityGuidePage(cityGuides[city]));

export const guidePages: GuideContent[] = [...cityGuidePages, ...editorialGuidePages];
