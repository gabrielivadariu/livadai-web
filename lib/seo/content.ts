export type CitySlug = "iasi" | "cluj" | "bucuresti" | "timisoara" | "brasov";
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

export const cityGuides: Record<CitySlug, CityGuideContent> = {
  iasi: {
    slug: "iasi",
    name: "Iasi",
    nameAscii: "Iasi",
    county: "Iasi",
    region: "Moldova",
    heroTitle: "Ce merita sa faci in Iasi cand vrei mai mult decat o iesire obisnuita",
    intro: [
      "Iasiul este unul dintre cele mai bune orase din Romania pentru oameni care vor un mix real intre cultura, plimbari relaxate, intalniri bune si experiente locale. Intr-o singura zi poti sa treci de la o cafea lunga in Copou la o vizita intr-un spatiu cultural din centru, apoi la o activitate organizata de un host local care chiar cunoaste orasul.",
      "Daca te intrebi ce e de facut in Iasi, raspunsul bun nu este doar muzeu sau terasa. In oras functioneaza cel mai bine planurile care combina locuri cunoscute cu experiente mai putin evidente: ateliere mici, seri de socializare, activitati pentru cupluri, evenimente de weekend si iesiri cu un ritm mai uman. Exact aici intra LIVADAI: te ajuta sa gasesti lucruri concrete de facut in Iasi, nu doar liste generice de obiective.",
    ],
    directAnswer:
      "In Iasi ai ce face daca vrei cultura, plimbari bune, activitati de cuplu, seri relaxate si experiente organizate de oameni locali. Cele mai bune planuri combina centrul orasului, Copoul, zonele verzi si activitati care iti dau un motiv clar sa iesi din rutina.",
    englishIntent: "What to do in Iasi, date ideas in Iasi and weekend experiences in Iasi.",
    topThingsToDo: [
      "Plimba-te prin Copou si leaga iesirea de o cafea buna sau de un atelier mic in zona centrala.",
      "Alege o experienta organizata local, nu doar o vizita standard intr-un loc cunoscut.",
      "Construieste o dupa-amiaza in jurul Palasului, centrului vechi si unei activitati cu ora fixa.",
      "Rezerva o iesire de seara care are sens: tasting, sport light, social event sau atelier creativ.",
    ],
    uniqueExperiences: [
      "Ateliere creative in grup restrans, unde interactionezi cu oameni, nu doar consumi un loc.",
      "Experiente wellness sau movement care merg bine dupa program si schimba total ritmul zilei.",
      "Intalniri tematice si activitati cu hosti locali care iti arata un Iasi mai putin rigid.",
      "Experiente pentru cupluri sau prieteni care pun accent pe timp petrecut bine, nu pe zgomot.",
    ],
    dateIdeas: [
      "Un date lung in Copou, urmat de o activitate rezervata in avans, merge mai bine decat o simpla cina.",
      "Alege o experienta in doi cu componenta creativa sau playful, ca sa ai si subiecte bune, nu doar decor.",
      "Leaga o plimbare prin centru de o rezervare seara, astfel incat iesirea sa aiba ritm si directie.",
      "Pentru un date mai relaxat, cauta activitati care dureaza 60-120 de minute si lasa loc si pentru o cafea dupa.",
    ],
    weekendActivities: [
      "Sambata merge bine pentru experiente sociale, activitati in grup si planuri care pornesc din centru.",
      "Duminica functioneaza mai bine iesirile slow: plimbari, wellness, miscare usoara si experiente indoor.",
      "Daca stai doar un weekend in oras, combina o rezervare dimineata cu un plan cultural dupa-amiaza.",
      "Pentru grupuri mici, cauta activitati cu slot clar si participare limitata, nu evenimente fara structura.",
    ],
    coolIdeas: [
      "Alege un atelier, o experienta sportiva sau o activitate de grup in loc de aceeasi iesire la mall.",
      "Cauta hosti locali care organizeaza seri tematice, sesiuni premium sau experiente one-off.",
      "Fa un mix intre oras clasic si plan nou: o ora prin centru, apoi o rezervare cu ora fixa.",
      "Daca vrei ceva memorabil, prioritizeaza experiente unde chiar participi, nu doar privesti.",
    ],
    familyIdeas: [
      "Alege activitati cu ritm clar, durata scurta si locuri usor de accesat din centru sau Copou.",
      "Weekendul functioneaza bine pentru ateliere simple, plimbari lungi si activitati indoor daca vremea nu ajuta.",
      "Pentru familii, cele mai bune planuri sunt cele care combina miscare, pauze si un singur obiectiv clar.",
    ],
    hiddenGems: [
      "Iasiul devine mai interesant cand iesi din traseul clasic si cauti experiente conduse de oameni locali.",
      "Nu toate planurile bune sunt in topul ghidurilor turistice; uneori un atelier mic sau o intalnire tematica spune mai mult despre oras.",
      "Cele mai bune descoperiri apar cand folosesti orasul ca fundal pentru o experienta, nu ca destinatie pasiva.",
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
  cluj: {
    slug: "cluj",
    name: "Cluj-Napoca",
    nameAscii: "Cluj",
    county: "Cluj",
    region: "Transilvania",
    heroTitle: "Ce sa faci in Cluj daca vrei experiente, nu doar o seara iesita la intamplare",
    intro: [
      "Clujul functioneaza foarte bine pentru oameni care vor sa umple orasul cu planuri bune, nu doar cu recomandari generice. Este un oras in care poti sa construiesti usor o zi intreaga: cafea in centru, plimbare pe Somes, o experienta rezervata seara si un final relaxat intr-o zona care ramane vie pana tarziu.",
      "Cand cauti ce e de facut in Cluj, merita sa iesi din lista scurta cu muzee, festivaluri si localuri. Orasul are mult mai mult sens cand cauti experiente locale, activitati pentru cupluri, idei de weekend si iesiri care pun oamenii in miscare. LIVADAI te ajuta exact aici: sa gasesti activitati clare, rezervabile si relevante pentru ritmul real al orasului.",
    ],
    directAnswer:
      "In Cluj ai multe lucruri bune de facut daca vrei cultura urbana, seri sociale, date ideas, experiente rezervabile si planuri de weekend care chiar se leaga. Cele mai bune iesiri combina centrul, Somesul, cartierele creative si activitati organizate local.",
    englishIntent: "What to do in Cluj, weekend activities in Cluj and best date ideas in Cluj-Napoca.",
    topThingsToDo: [
      "Construieste un traseu intre centru, Somes si o experienta de seara rezervata in avans.",
      "Cauta activitati locale unde participi, nu doar bifezi un loc popular.",
      "Alege evenimente sau experiente cu grup mic daca vrei interactiune reala, nu aglomeratie.",
      "Pentru o zi reusita in Cluj, combina orasul social cu o activitate care iti da un motiv clar sa iesi.",
    ],
    uniqueExperiences: [
      "Experiente sociale in grup restrans, potrivite pentru oameni noi sau prieteni care vor altceva.",
      "Activitati creative si movement sessions care merg foarte bine dupa program.",
      "Planuri locale care folosesc energia orasului, dar fara graba si fara rutina de club-bar-club.",
      "Experiente pentru cupluri sau prieteni care vor o iesire memorabila, nu doar convenabila.",
    ],
    dateIdeas: [
      "In Cluj merg bine date-urile care au doua ritmuri: plimbare sau cafea, apoi o experienta cu ora fixa.",
      "Pentru un prim date, alege ceva conversational si usor playful, nu un plan prea rigid.",
      "Pentru cupluri care locuiesc deja in oras, merita experiente noi care scot iesirea din repetitie.",
      "Un date bun in Cluj trebuie sa aiba atat atmosfera, cat si un motiv clar de a face ceva impreuna.",
    ],
    weekendActivities: [
      "Weekendul in Cluj merge bine pe experiente sociale, plimbari lungi si activitati rezervabile seara.",
      "Sambata e potrivita pentru planuri cu energie mai mare, iar duminica pentru iesiri slow si wellness.",
      "Daca vii din alt oras, merita sa rezervi macar o activitate care iti structureaza ziua.",
      "Pentru grupuri mici, cele mai bune optiuni sunt activitatile cu slot si capacitate limitata.",
    ],
    coolIdeas: [
      "Alege experiente noi in locul acelorasi locuri unde ajungi de obicei fara plan.",
      "Cauta activitati care combina social, creativ si movement; Clujul raspunde foarte bine la mixul acesta.",
      "Daca vrei ceva cool, mergi pe experiente care pot fi povestite, nu doar pe locuri instagramabile.",
      "Un plan bun in Cluj inseamna sa alegi ceva memorabil si apoi sa lasi orasul sa completeze restul.",
    ],
    familyIdeas: [
      "Planurile de familie merg bine in zone usor accesibile si in activitati cu durata clara.",
      "Alege experiente care lasa loc pentru pauze, plimbari si adaptare la ritmul grupului.",
      "Pentru weekend, combina o activitate rezervata cu o iesire relaxata in jurul centrului sau al Somesului.",
    ],
    hiddenGems: [
      "Clujul ascunde multe planuri bune in zona experientelor mici, nu doar in calendarul mare al orasului.",
      "Un hidden gem poate fi o activitate bine condusa, intr-un spatiu discret, unde atmosfera face diferenta.",
      "Daca vrei sa simti orasul, nu te limita la lista clasica; cauta gazde si experiente locale.",
    ],
    faq: [
      {
        question: "Ce faci in Cluj in weekend daca nu vrei doar terase?",
        answer:
          "Rezerva o experienta locala, adauga o plimbare pe Somes sau prin centru si construieste ziua in jurul unei activitati cu ora fixa.",
      },
      {
        question: "Care sunt date ideas bune in Cluj?",
        answer:
          "Date-urile bune in Cluj combina o zona placuta pentru plimbare cu o experienta unde faceti ceva impreuna: creativ, social sau relaxant.",
      },
      {
        question: "Ce experiente unice gasesti in Cluj?",
        answer:
          "Experiente in grup restrans, activitati locale cu hosti, seri tematice si planuri care folosesc energia orasului fara sa devina obositoare.",
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
  bucuresti: {
    slug: "bucuresti",
    name: "Bucuresti",
    nameAscii: "Bucharest",
    county: "Bucuresti",
    region: "Muntenia",
    heroTitle: "Ce sa faci in Bucuresti cand vrei un oras viu, dar bine filtrat",
    intro: [
      "Bucurestiul are atat de multe variante incat problema reala nu este lipsa de activitati, ci filtrarea lor. In aceeasi zi poti sa alegi intre parc, muzeu, rooftop, atelier, social event, movement session sau o experienta premium organizata de un host local. Daca alegi bine, orasul devine foarte ofertant. Daca alegi la intamplare, devine doar aglomerat.",
      "Cand cauti ce e de facut in Bucuresti, merita sa pleci de la tipul de iesire pe care il vrei: date ideas, plan de weekend, activitati cool cu prietenii sau experiente care te scot complet din ritmul obisnuit. LIVADAI adauga exact stratul de claritate de care are nevoie orasul: activitati rezervabile, explicate bine si usor de conectat cu restul planului tau.",
    ],
    directAnswer:
      "In Bucuresti ai aproape orice tip de iesire: planuri culturale, experiente locale, date ideas, activitati cool si weekenduri foarte diferite de la un cartier la altul. Secretul este sa alegi activitati cu sens si sa nu lasi orasul sa iti fragmenteze timpul.",
    englishIntent: "Best experiences in Bucharest, what to do in Bucharest and date ideas in Bucharest.",
    topThingsToDo: [
      "Combina un cartier bun pentru plimbare cu o experienta rezervata, nu doar cu un restaurant.",
      "Cauta activitati locale care iti dau un ritm clar intr-un oras care altfel se imprastie repede.",
      "Foloseste diferenta dintre zi si seara: cultural sau slow ziua, experienta sau social event seara.",
      "Alege experiente din Bucuresti care te scot din schema clasica mall-cafea-drum spre casa.",
    ],
    uniqueExperiences: [
      "Ateliere, sesiuni premium si activitati locale care se simt personale, nu industriale.",
      "Experiente in spatii interesante din oras, nu doar in locuri previzibile.",
      "Planuri pentru grup mic sau cuplu care au concept clar si ritm bun.",
      "Activitati cu hosti care stiu sa construiasca experienta, nu doar sa inchirieze un loc.",
    ],
    dateIdeas: [
      "Un date bun in Bucuresti incepe cu alegerea zonei si continua cu o activitate care va tine implicati pe amandoi.",
      "Pentru prime intalniri, merg bine experientele conversationale si usor playful.",
      "Pentru cupluri care vor sa iasa din rutina, cele mai bune idei sunt cele care adauga o experienta reala intre doua opriri clasice.",
      "Orasul iti permite sa faci un date premium fara sa para fortat, daca ai un plan bine legat.",
    ],
    weekendActivities: [
      "Weekendul in Bucuresti merge bine daca alegi o zona, nu tot orasul deodata.",
      "Poti construi usor o sambata energica si o duminica slow, fara sa repeti aceleasi locuri.",
      "Pentru city break-uri scurte, experientele rezervabile reduc mult timpul pierdut cu indecizia.",
      "Cele mai bune weekend plans combina orasul mare cu activitati bine alese si usor de ajuns.",
    ],
    coolIdeas: [
      "Bucurestiul are mult potential pentru planuri cool daca alegi experiente, nu doar locatii.",
      "Cauta activitati cu concept clar: creativ, social, movement, fun sau premium.",
      "Un plan cool in Bucuresti trebuie sa aiba energie buna si un motiv clar pentru care merita iesit din casa.",
      "Daca vrei varietate, orasul o ofera; filtrarea corecta face diferenta.",
    ],
    familyIdeas: [
      "Pentru familii, Bucurestiul e mai usor de gestionat cand alegi activitati localizate si cu durata previzibila.",
      "Combinati o experienta rezervata cu parc, muzeu sau o zona usor de parcurs pe jos.",
      "Planurile de familie bune in Bucuresti sunt cele care reduc logistica si cresc claritatea zilei.",
    ],
    hiddenGems: [
      "Descoperirile mai putin evidente din Bucuresti apar cand iesi din lista foarte cunoscuta si intri in zona experientelor locale bine construite.",
      "Nu toate planurile bune sunt pe bulevarde mari; uneori cele mai memorabile iesiri sunt in spatii discrete, cu hosti foarte buni.",
      "Orasul devine mai suportabil si mai interesant cand il filtrezi prin experiente reale.",
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
  timisoara: {
    slug: "timisoara",
    name: "Timisoara",
    nameAscii: "Timisoara",
    county: "Timis",
    region: "Banat",
    heroTitle: "Ce merita sa faci in Timisoara daca vrei un oras elegant, lejer si bine trait",
    intro: [
      "Timisoara este unul dintre orasele in care iesirile bune vin natural daca alegi ritmul potrivit. Ai piete frumoase, zone bune pentru mers pe jos, o scena culturala activa si suficient spatiu cat sa nu simti ca totul este presat. Tocmai de aceea merge foarte bine pentru experiente locale, date-uri bune, weekenduri relaxate si activitati in grup restrans.",
      "Daca te intrebi ce e de facut in Timisoara, raspunsul cel mai util este sa cauti activitati care completeaza orasul, nu care il acopera. O plimbare prin centru, un plan rezervat seara, un atelier sau o activitate pentru cupluri pot transforma foarte usor o iesire simpla intr-una memorabila. LIVADAI te ajuta sa gasesti exact aceste planuri clare si rezervabile.",
    ],
    directAnswer:
      "In Timisoara merita sa cauti planuri care combina centrul pietonal, zona Begai, cultura urbana si experiente locale rezervabile. Orasul este foarte bun pentru date ideas, weekenduri lejere si activitati cu ritm calm, dar bine gandit.",
    englishIntent: "What to do in Timisoara, date ideas in Timisoara and weekend activities by local hosts.",
    topThingsToDo: [
      "Leaga o plimbare prin centru sau pe malul Begai de o experienta rezervata seara.",
      "Alege activitati cu grup mic daca vrei sa simti mai bine atmosfera orasului.",
      "Timisoara merge bine pentru iesiri care au timp, conversatie si context local.",
      "Cauta experiente create de hosti locali, nu doar locuri populare pe harta.",
    ],
    uniqueExperiences: [
      "Experiente culturale, creative sau sociale care se potrivesc cu ritmul lejer al orasului.",
      "Ateliere si activitati premium care functioneaza bine pentru cupluri si grupuri mici.",
      "Planuri locale in spatii cu personalitate, nu doar in locuri foarte comerciale.",
      "Experiente care lasa loc pentru continuarea naturala a serii in oras.",
    ],
    dateIdeas: [
      "Timisoara este foarte buna pentru date-uri care incep cu o plimbare si continua cu o activitate rezervata.",
      "Merg bine planurile conversationale, creative sau relaxate, fara presiune si fara graba.",
      "Pentru cupluri, orasul ofera suficienta eleganta cat sa faci o iesire speciala fara sa o incarci inutil.",
      "Cele mai bune date ideas au ritm simplu: o zona frumoasa, o experienta buna, apoi timp pentru voi.",
    ],
    weekendActivities: [
      "Weekendul in Timisoara merge bine pentru plimbari lungi, cultura si activitati rezervabile de seara.",
      "Daca vrei un plan de sambata, combina zona centrala cu o experienta in grup mic.",
      "Duminica functioneaza bine pe iesiri slow, activitati indoor si experiente care nu obosesc.",
      "Pentru vizitatori, o rezervare clara ajuta mult sa simti orasul fara sa pierzi timp cu alegeri de moment.",
    ],
    coolIdeas: [
      "Alege lucruri cool care se potrivesc cu stilul orasului: elegant, creativ si relaxat.",
      "In locul unei iesiri standard, cauta o experienta care te implica real.",
      "Timisoara raspunde bine la planuri curate, nu la aglomeratie fortata sau hype gol.",
      "Cele mai bune planuri cool sunt cele care pot continua natural prin oras dupa activitate.",
    ],
    familyIdeas: [
      "Familiile pot construi usor o zi in Timisoara in jurul unei activitati scurte si a unei zone bune pentru mers pe jos.",
      "Alege experiente cu durata clara si timp de respiratie intre etape.",
      "Orasul merge bine pentru weekenduri de familie fara mult stres logistic.",
    ],
    hiddenGems: [
      "Descoperirile mai putin evidente din Timisoara sunt adesea experiente bine facute, nu neaparat obiective foarte faimoase.",
      "Un host bun sau un atelier bine ales poate spune mai mult despre oras decat o lista lunga de locuri.",
      "Daca vrei partea buna a orasului, cauta experiente cu ritm mic si calitate buna.",
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
  brasov: {
    slug: "brasov",
    name: "Brasov",
    nameAscii: "Brasov",
    county: "Brasov",
    region: "Transilvania",
    heroTitle: "Ce merita sa faci in Brasov daca vrei oras, aer bun si experiente locale",
    intro: [
      "Brasovul este unul dintre cele mai usor de iubit orase pentru iesiri bine facute. Ai centrul vechi, ai privelisti, ai acces rapid spre natura si ai genul de ritm care face ca o experienta buna sa para parte fireasca din zi. Tocmai de aceea este potrivit atat pentru date ideas si weekenduri in doi, cat si pentru activitati cu prietenii sau escapade scurte.",
      "Cand cauti ce e de facut in Brasov, nu te opri la lista clasica de obiective. Orasul devine mult mai interesant cand legi partea vizuala de o experienta reala: activitate rezervata, atelier, wellness, social plan sau iesire construita in jurul unui host local. LIVADAI face exact asta: transforma intentia de a iesi in plan clar si rezervabil.",
    ],
    directAnswer:
      "In Brasov merita sa combini centrul vechi, zonele cu panorama si experientele locale rezervabile. Orasul este foarte bun pentru weekenduri, activitati de cuplu si planuri care alterneaza intre oras si un ritm mai slow, aproape de natura.",
    englishIntent: "What to do in Brasov, weekend in Brasov and romantic ideas in Brasov.",
    topThingsToDo: [
      "Porneste din centrul vechi si adauga o experienta care iti da un scop clar pentru iesire.",
      "Combina orasul cu activitati locale care nu se rezuma la simplul sightseeing.",
      "Alege planuri care folosesc ritmul mai aerisit al Brasovului in avantajul tau.",
      "Pentru o zi reusita, alterneaza mersul prin oras cu o experienta rezervata si bine explicata.",
    ],
    uniqueExperiences: [
      "Experiente locale in grup restrans, potrivite pentru oameni care vor mai mult decat un traseu turistic.",
      "Activitati relaxante sau creative care completeaza foarte bine o zi petrecuta in Brasov.",
      "Planuri pentru cupluri si grupuri mici care pun accent pe context, nu doar pe locatie.",
      "Experiente conduse de hosti care stiu sa transforme orasul intr-un fundal bun pentru ceva memorabil.",
    ],
    dateIdeas: [
      "Brasovul merge excelent pentru date-uri care incep cu mers pe jos si continua cu o activitate rezervata.",
      "Pentru un date bun, alege o experienta care lasa loc si pentru panorama, cafea sau o cina dupa.",
      "Iesirile in doi se simt mai bine aici cand au si oras, si activitate, si timp de respiratie.",
      "Cele mai bune date ideas in Brasov sunt cele care folosesc atmosfera orasului, nu doar o priveliste.",
    ],
    weekendActivities: [
      "Weekendul in Brasov poate fi urban dimineata si foarte relaxat dupa-amiaza.",
      "Daca vii pentru doua zile, merita sa rezervi o activitate care sa devina punctul central al planului.",
      "Pentru sambata merg bine experientele mai active, iar pentru duminica cele slow sau indoor.",
      "Orasul e ideal pentru weekenduri compacte, dar foarte bine gandite.",
    ],
    coolIdeas: [
      "Lucrurile cool de facut in Brasov sunt cele care combina orasul frumos cu o experienta reala.",
      "Cauta activitati care adauga substanta unei iesiri deja placute vizual.",
      "Un plan cool aici inseamna sa iesi din tiparul centrul vechi-poza-cafea si sa faci ceva concret.",
      "Experientele locale bune te ajuta sa simti orasul, nu doar sa il vezi.",
    ],
    familyIdeas: [
      "Brasovul este usor de gestionat pentru familii daca alegi planuri simple si bine dozate.",
      "Combinatia dintre mers, pauze si o activitate rezervata functioneaza foarte bine.",
      "Weekendurile de familie merg bine in Brasov pentru ca orasul permite ritm calm si trasee scurte.",
    ],
    hiddenGems: [
      "Descoperirile mai putin evidente din Brasov nu sunt doar stradute sau puncte de belvedere, ci si experiente locale bine alese.",
      "Un plan bun cu host local poate scoate la iveala mult mai mult din oras decat un traseu standard.",
      "Daca vrei sa descoperi Brasovul altfel, cauta activitati mici si bine construite.",
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
};

export const majorCityOrder: CitySlug[] = ["iasi", "cluj", "bucuresti", "timisoara", "brasov"];
export const initialQueryPageOrder: QuerySlug[] = [
  "ce-e-de-facut",
  "ce-faci-in-weekend",
  "date-ideas",
  "activitati-cuplu",
  "lucruri-cool-de-facut",
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
    ],
    bullets: (city) => city.dateIdeas,
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
    ],
  },
  "hidden-gems": {
    slug: "hidden-gems",
    title: (city) => `Locuri si experiente mai putin evidente in ${city.name} | LIVADAI`,
    description: (city) => `Idei de hidden gems in ${city.name}: locuri si experiente locale care merita descoperite fara marketing gol si fara filler.`,
    h1: (city) => `Locuri si experiente mai putin evidente in ${city.name}`,
    intro: (city) => [city.queryHooks.hiddenGems, city.directAnswer, `Cele mai bune descoperiri vin atunci cand cauti experiente locale bine facute, nu doar locuri foarte fotogenice.`],
    bullets: (city) => city.hiddenGems,
    faq: (city) => city.faq,
  },
  "family-activities": {
    slug: "family-activities",
    title: (city) => `Activitati pentru familie in ${city.name} | LIVADAI`,
    description: (city) => `Activitati pentru familie in ${city.name}, cu idei clare de weekend, iesiri usor de organizat si experiente locale.`,
    h1: (city) => `Activitati pentru familie in ${city.name}`,
    intro: (city) => [city.queryHooks.familyActivities, city.directAnswer, `Pentru familii, cele mai bune planuri sunt cele clare, rezervabile si usor de combinat cu mers pe jos sau pauze bune.`],
    bullets: (city) => city.familyIdeas,
    faq: (city) => city.faq,
  },
};

export const guidePages: GuideContent[] = [
  {
    slug: "ce-e-de-facut-in-iasi",
    title: "Ce e de facut in Iasi: ghid practic pentru un weekend bun",
    description: "Ghid editorial LIVADAI cu idei clare despre ce e de facut in Iasi, cum construiesti un weekend bun si ce tip de experiente merita cautate.",
    intro: [
      "Daca vrei un raspuns direct la intrebarea ce e de facut in Iasi, incepe simplu: alege o zona buna de mers, un interval clar si o experienta locala rezervata in avans. Asa eviti iesirile trase de par si transformi orasul intr-un plan care chiar curge bine.",
      "Iasiul merge foarte bine pentru combinatii intre cultura, plimbari, activitati de cuplu si experiente in grup restrans. Ghidul acesta este facut ca sa iti dea idei utile, nu o lista lunga de obiective pe care nu le vei folosi niciodata.",
    ],
    sections: [
      {
        title: "Cum construiesti o zi buna in Iasi",
        bullets: [
          "Porneste din Copou sau centru, nu dintr-un traseu prea incarcat.",
          "Alege o experienta cu ora fixa daca vrei sa scoti haosul din plan.",
          "Pastreaza una sau doua opriri bune, nu sapte puncte bifate in graba.",
          "Lasa orasului rolul de fundal si experientei rolul principal.",
        ],
      },
      {
        title: "Cand merita o experienta rezervata",
        paragraphs: [
          "Merita mai ales cand vrei un motiv clar sa iesi, cand planuiesti un date sau cand ai o fereastra mica de timp si nu vrei sa o pierzi pe decizii de moment.",
          "In Iasi functioneaza bine atelierele mici, activitatile de seara si experientele sociale care completeaza natural ritmul orasului.",
        ],
      },
      {
        title: "Linkuri utile din acelasi oras",
        links: [
          { href: "/iasi", title: "Ghid complet pentru Iasi", description: "Hubul principal cu idei de iesit si experiente." },
          { href: "/iasi/ce-faci-in-weekend", title: "Ce faci in weekend in Iasi", description: "Planuri rapide pentru sambata si duminica." },
          { href: "/iasi/date-ideas", title: "Idei de date in Iasi", description: "Idei bune pentru iesiri in doi." },
        ],
      },
    ],
    faq: cityGuides.iasi.faq,
    relatedLinks: [
      { href: "/iasi", title: "Vezi hubul Iasi" },
      { href: "/guides/top-experiente-romania", title: "Top experiente Romania" },
    ],
  },
  {
    slug: "top-experiente-romania",
    title: "Top experiente in Romania: unde merita sa cauti iesiri memorabile",
    description: "Selectie editoriala LIVADAI cu orasele si tipurile de experiente care merita urmarite in Romania pentru iesiri locale, weekenduri si date ideas.",
    intro: [
      "Daca vrei sa gasesti experiente bune in Romania, nu incepe de la cantitate. Incepe de la orase care au ritm, oameni activi si hosti capabili sa construiasca planuri reale. Tocmai de aceea cele mai bune orase pentru experiente locale sunt cele in care cultura urbana si viata de zi cu zi se completeaza bine.",
      "Iasi, Cluj, Bucuresti, Timisoara si Brasov nu sunt valoroase doar pentru obiective sau restaurante. Sunt bune pentru ca pot sustine iesiri memorabile: date ideas, planuri de weekend, activitati creative, social events si experiente rezervabile care scot omul din rutina.",
    ],
    sections: [
      {
        title: "Orase care merita urmarite pe LIVADAI",
        bullets: [
          "Iasi - bun pentru cultura, plimbari lungi si experiente sociale cu ritm calm.",
          "Cluj - excelent pentru planuri sociale, date-uri si activitati de grup restrans.",
          "Bucuresti - ideal cand vrei varietate mare, dar ai nevoie de filtrare buna.",
          "Timisoara - foarte potrivita pentru iesiri elegante, lejere si bine dozate.",
          "Brasov - oras excelent pentru combinatii intre centru vechi, aer liber si activitati in doi.",
        ],
      },
      {
        title: "Cum alegi o experienta buna",
        bullets: [
          "Cauta o activitate cu scop clar, nu doar un loc frumos.",
          "Preferă grupuri mici sau contexte in care interactionezi real.",
          "Verifica daca se potriveste cu ritmul zilei tale: dupa program, sambata, city break sau date.",
          "Alege experiente care iti lasa si orasul la dispozitie, nu iti consuma toata energia.",
        ],
      },
      {
        title: "Huburi urbane si ghiduri utile",
        links: [
          { href: "/iasi", title: "Ce faci in Iasi" },
          { href: "/cluj", title: "Ce faci in Cluj" },
          { href: "/bucuresti", title: "Ce faci in Bucuresti" },
          { href: "/timisoara", title: "Ce faci in Timisoara" },
          { href: "/brasov", title: "Ce faci in Brasov" },
        ],
      },
    ],
    relatedLinks: [
      { href: "/guides/ce-e-de-facut-in-iasi", title: "Ghid practic pentru Iasi" },
      { href: "/guides/idei-de-date-in-bucuresti", title: "Idei de date in Bucuresti" },
    ],
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
          "O zona buna de oras + o experienta rezervata + timp pentru continuarea naturala a serii.",
          "Activitati care creeaza interactiune reala, nu doar fundal frumos.",
          "Planuri care reduc logistica si cresc timpul petrecut bine impreuna.",
          "Iesiri cu ritm clar, mai ales daca este prima intalnire sau aveti putin timp.",
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
        ],
      },
    ],
    relatedLinks: [
      { href: "/guides/top-experiente-romania", title: "Top experiente Romania" },
      { href: "/cluj/date-ideas", title: "Idei de date in Cluj" },
    ],
  },
];
