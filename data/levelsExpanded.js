// Extended lessons dataset for Civic Education Nepal
// Level 1: 35 detailed lessons, aligned with Constitution of Nepal 2072 (2015)

const level1Lessons = [
  {
    id: 101,
    title: 'Citizenship: Meaning & Importance',
    content: `Citizenship defines a person's legal membership in the state and is the gateway to exercising constitutional rights and fulfilling civic duties. In Nepal, citizenship determines participation in democratic processes, eligibility for public services, and protections under the law.

A well-informed citizen understands both rights and responsibilities. Civic education nurtures respect for the Constitution, adherence to laws, and engagement in nation-building.`,
    keyPoints: [
      'Citizenship links individuals to the state legally',
      'Essential for voting, property, and public services',
      'Rights and duties must be understood and balanced',
    ],
    articles: ['Article 33'],
    helpline: null,
  },
  {
    id: 102,
    title: 'Types of Nepali Citizenship',
    content: `Nepal recognizes citizenship by descent and by naturalization. Each pathway includes criteria to uphold legal integrity and social inclusion.

Citizenship by descent typically applies when parents are Nepali citizens. Naturalization provides a legal path for long-term residents meeting statutory requirements.`,
    keyPoints: [
      'Citizenship by descent and naturalization',
      'Statutory requirements ensure legal integrity',
      'Supports social inclusion and nation-building',
    ],
    articles: ['Article 33'],
    helpline: null,
  },
  {
    id: 103,
    title: 'Constitution 2072: Overview',
    content: `The Constitution of Nepal 2072 (2015) is the supreme law, establishing Nepal as a federal democratic republic. It protects fundamental rights, defines duties, and structures governance at federal, provincial, and local levels.

It contains a Preamble, 35 Parts, 308 Articles, and 9 Schedules, reflecting democratic values, inclusion, and rule of law.`,
    keyPoints: [
      'Supreme law establishing federal democratic republic',
      '35 Parts, 308 Articles, 9 Schedules',
      'Protects rights; defines governance structure',
    ],
    articles: ['Preamble', 'Articles 1–308'],
    helpline: null,
  },
  {
    id: 104,
    title: 'Preamble: National Vision',
    content: `The Preamble expresses Nepal’s commitment to sovereign, socialist-oriented federal democratic republican system. It emphasizes inclusion, human rights, social justice, and sustainable peace.

Understanding the Preamble guides citizens to align personal conduct with constitutional ideals.`,
    keyPoints: [
      'Declares federal democratic republican system',
      'Commits to inclusion and human rights',
      'Guides constitutional interpretation',
    ],
    articles: ['Preamble'],
    helpline: null,
  },
  {
    id: 105,
    title: 'Fundamental Rights: Structure',
    content: `Articles 25–47 safeguard 31 fundamental rights including equality, freedom, education, health, information, environment, justice, and culture. These rights uphold dignity and empower citizens.

Courts enforce rights and provide remedies when violated.`,
    keyPoints: [
      '31 rights under Articles 25–47',
      'Dignity and empowerment for all citizens',
      'Judicial remedies for violations',
    ],
    articles: ['Articles 25–47'],
    helpline: null,
  },
  {
    id: 106,
    title: 'Right to Equality',
    content: `All citizens are equal before the law and shall not be discriminated against on grounds such as caste, sex, religion, or origin. Equality promotes fair access to opportunities.

Affirmative measures may be taken to uplift marginalized groups.`,
    keyPoints: ['Equal protection of law', 'Prohibits discrimination', 'Allows affirmative action'],
    articles: ['Article 18'],
    helpline: null,
  },
  {
    id: 107,
    title: 'Right to Freedom',
    content: `Citizens enjoy freedoms including expression, association, movement, occupation, and press. Freedom is not absolute; restrictions exist for public order and national integrity.

Responsible exercise of freedom strengthens democracy.`,
    keyPoints: [
      'Freedom of expression and association',
      'Reasonable restrictions by law',
      'Responsibility accompanies freedom',
    ],
    articles: ['Article 17'],
    helpline: null,
  },
  {
    id: 108,
    title: 'Right against Exploitation',
    content: `The Constitution prohibits exploitation, forced labor, and human trafficking. Children shall not be employed in hazardous work.

Citizens must report exploitation and support victims’ rehabilitation.`,
    keyPoints: [
      'Prohibits forced labor and trafficking',
      'Protects children from hazardous work',
      'Encourages reporting and support',
    ],
    articles: ['Article 29'],
    helpline: null,
  },
  {
    id: 109,
    title: 'Right to Information',
    content: `Citizens have the right to access information held by public bodies, promoting transparency and accountability.

Timely, accurate information combats corruption and enables informed participation.`,
    keyPoints: [
      'Access public information',
      'Promotes transparency',
      'Enables informed participation',
    ],
    articles: ['Article 27', 'Article 33'],
    helpline: null,
  },
  {
    id: 110,
    title: 'Right to Privacy',
    content: `Everyone has the right to privacy of person, residence, property, documents, and communications. Privacy protects dignity and autonomy.

Digital privacy is essential in the modern era.`,
    keyPoints: [
      'Protects personal and digital privacy',
      'Covers residence, documents, communications',
      'Supports dignity and autonomy',
    ],
    articles: ['Article 28'],
    helpline: null,
  },
  {
    id: 111,
    title: 'Right to Justice & Fair Trial',
    content: `The Constitution guarantees access to justice, fair trial, and legal remedies. Courts must be impartial, and due process must be followed.

Legal aid ensures access for economically disadvantaged citizens.`,
    keyPoints: [
      'Access to justice and fair trial',
      'Due process and impartial courts',
      'Legal aid for the disadvantaged',
    ],
    articles: ['Article 20'],
    helpline: null,
  },
  {
    id: 112,
    title: 'Right to Environment',
    content: `Citizens have the right to live in a clean and healthy environment. The state shall adopt measures for environmental protection and sustainable use of natural resources.

Community participation improves conservation outcomes.`,
    keyPoints: [
      'Clean and healthy environment',
      'State duty to protect resources',
      'Community participation is vital',
    ],
    articles: ['Article 30'],
    helpline: null,
  },
  {
    id: 113,
    title: 'Right to Education',
    content: `Every citizen has the right to free basic education and the right to quality education. The state shall make education inclusive and equitable.

Education empowers citizens and strengthens democracy.`,
    keyPoints: [
      'Free basic education',
      'Inclusive and equitable',
      'Empowers democratic participation',
    ],
    articles: ['Article 31'],
    helpline: null,
  },
  {
    id: 114,
    title: 'Right to Health',
    content: `Citizens have the right to health care and access to clean drinking water. The state ensures health services and promotes public health.

Community health programs strengthen resilience.`,
    keyPoints: ['Right to health care', 'Clean drinking water', 'Public health promotion'],
    articles: ['Article 35'],
    helpline: null,
  },
  {
    id: 115,
    title: 'Labor Rights',
    content: `Workers have the right to fair remuneration, safe working conditions, and social security. Labor rights protect dignity and productivity.

Unions and collective bargaining are recognized within legal frameworks.`,
    keyPoints: [
      'Fair remuneration and safety',
      'Social security provisions',
      'Unions and collective bargaining',
    ],
    articles: ['Article 34'],
    helpline: null,
  },
  {
    id: 116,
    title: 'Consumer Rights',
    content: `Consumers are protected against unfair trade practices and hazardous goods. Access to accurate information enables informed choices.

Effective regulation and awareness reduce harm.`,
    keyPoints: [
      'Protection from unfair practices',
      'Safety from hazardous goods',
      'Right to accurate information',
    ],
    articles: ['Article 44'],
    helpline: null,
  },
  {
    id: 117,
    title: 'Cultural & Religious Rights',
    content: `Citizens can preserve and practice their culture, language, and religion. Nepal respects cultural diversity and religious freedom within legal boundaries.

Cultural rights foster identity and social cohesion.`,
    keyPoints: [
      'Preserve culture and language',
      'Practice religion freely',
      'Promotes social cohesion',
    ],
    articles: ['Articles 32–37'],
    helpline: null,
  },
  {
    id: 118,
    title: 'Women’s Rights & Gender Equality',
    content: `The Constitution ensures gender equality and prohibits discrimination against women. It provides rights to property, reproductive health, and representation.

Empowerment policies support inclusive development.`,
    keyPoints: [
      'Gender equality and non-discrimination',
      'Property and reproductive health rights',
      'Representation in governance',
    ],
    articles: ['Article 38'],
    helpline: null,
  },
  {
    id: 119,
    title: 'Child Rights & Protection',
    content: `Children have rights to name, identity, education, health, and protection from abuse and exploitation. Child labor is prohibited.

Family, community, and state share responsibilities for child welfare.`,
    keyPoints: [
      'Identity, education, health',
      'Protection from abuse and labor',
      'Shared responsibility for welfare',
    ],
    articles: ['Article 39'],
    helpline: null,
  },
  {
    id: 120,
    title: 'Senior Citizens & Social Security',
    content: `Senior citizens are entitled to special protection and social security. Respect for elders is a civic virtue anchored in constitutional values.

Accessible services and social inclusion improve wellbeing.`,
    keyPoints: [
      'Special protection and social security',
      'Respect for elders as civic virtue',
      'Inclusive services for wellbeing',
    ],
    articles: ['Article 41'],
    helpline: null,
  },
  {
    id: 121,
    title: 'Dalit Rights & Inclusion',
    content: `The Constitution guarantees protection against caste-based discrimination and untouchability. Policies promote equitable representation and socio-economic upliftment.

Citizens must challenge discriminatory practices and support inclusion.`,
    keyPoints: [
      'Prohibits caste-based discrimination',
      'Measures for representation and upliftment',
      'Citizen responsibility to challenge bias',
    ],
    articles: ['Article 40'],
    helpline: null,
  },
  {
    id: 122,
    title: 'Indigenous Peoples’ Rights',
    content: `Indigenous nationalities have rights to language, culture, and meaningful participation. Policies aim to address historical exclusion.

Inclusive governance benefits national unity.`,
    keyPoints: [
      'Language and cultural rights',
      'Participation and representation',
      'Addresses historical exclusion',
    ],
    articles: ['Article 42'],
    helpline: null,
  },
  {
    id: 123,
    title: 'Right to Property',
    content: `Citizens have the right to acquire, own, and dispose of property, subject to lawful restrictions for public interest.

Expropriation requires compensation as per law.`,
    keyPoints: [
      'Acquire, own, dispose property',
      'Lawful restrictions for public interest',
      'Compensation when expropriated',
    ],
    articles: ['Article 25'],
    helpline: null,
  },
  {
    id: 124,
    title: 'Freedom of Press & Expression',
    content: `Press freedom underpins democracy. Media must act responsibly, avoiding defamation and misinformation.

Balanced regulation protects rights while ensuring accountability.`,
    keyPoints: [
      'Press freedom supports democracy',
      'Avoid defamation and misinformation',
      'Accountable and balanced regulation',
    ],
    articles: ['Article 17'],
    helpline: null,
  },
  {
    id: 125,
    title: 'Freedom of Assembly & Association',
    content: `Citizens may assemble peacefully and form associations to pursue collective interests. Restrictions apply for public order and security.

Responsible civic action strengthens social capital.`,
    keyPoints: [
      'Peaceful assembly and association',
      'Reasonable restrictions by law',
      'Strengthens social capital',
    ],
    articles: ['Article 17'],
    helpline: null,
  },
  {
    id: 126,
    title: 'Emergency Provisions: Rights & Limits',
    content: `During constitutional emergencies, certain rights may be restricted following due process. Safeguards prevent abuse and ensure proportionality.

Democratic oversight protects citizens even in crisis.`,
    keyPoints: [
      'Rights may be restricted in emergencies',
      'Due process and proportionality required',
      'Democratic oversight is essential',
    ],
    articles: ['Relevant emergency provisions'],
    helpline: null,
  },
  {
    id: 127,
    title: 'Fundamental Duties: Respect & Responsibility',
    content: `Citizens must respect the Constitution and laws, protect sovereignty, pay taxes, preserve public property, and promote unity.

Duties complement rights and sustain democracy.`,
    keyPoints: [
      'Respect Constitution and laws',
      'Protect sovereignty and unity',
      'Pay taxes and preserve public property',
    ],
    articles: ['Articles 48–49'],
    helpline: null,
  },
  {
    id: 128,
    title: 'Tax Responsibility & Civic Finance',
    content: `Paying taxes funds public services like education, health, roads, and security. Transparent budgeting and audits ensure accountability.

Citizens can participate in budget feedback and oversight.`,
    keyPoints: [
      'Taxes fund essential public services',
      'Transparency and audits ensure accountability',
      'Citizens can engage in oversight',
    ],
    articles: ['Fiscal governance provisions'],
    helpline: null,
  },
  {
    id: 129,
    title: 'Public Property & Anti-Corruption',
    content: `Protecting public property prevents losses and enables development. Anti-corruption laws and institutions deter misuse of public resources.

Citizen vigilance and reporting are crucial.`,
    keyPoints: [
      'Protect public assets',
      'Anti-corruption laws deter misuse',
      'Report wrongdoing proactively',
    ],
    articles: ['Good governance provisions'],
    helpline: null,
  },
  {
    id: 130,
    title: 'State Structure: Federal, Provincial, Local',
    content: `Nepal’s federal system consists of federal, seven provincial, and 753 local governments. Powers and responsibilities are distributed for effective governance close to citizens.

Coordination ensures coherent national development.`,
    keyPoints: [
      'Three tiers of government',
      'Seven provinces and 753 local units',
      'Distributed powers and coordination',
    ],
    articles: ['Articles 56–242'],
    helpline: null,
  },
  {
    id: 131,
    title: 'Federal Legislature: Parliament',
    content: `Parliament comprises the House of Representatives and National Assembly. It enacts laws, oversees government, and approves budgets.

Committee systems improve deliberation and accountability.`,
    keyPoints: [
      'Bicameral: House + National Assembly',
      'Law-making and oversight',
      'Committees enhance deliberation',
    ],
    articles: ['Articles 87–136'],
    helpline: null,
  },
  {
    id: 132,
    title: 'Federal Executive: Council of Ministers',
    content: `The executive implements laws and policies. The Prime Minister leads the Council of Ministers accountable to Parliament.

Transparent administration strengthens public trust.`,
    keyPoints: [
      'Implements laws and policies',
      'Led by Prime Minister',
      'Accountable to Parliament',
    ],
    articles: ['Articles 74–86'],
    helpline: null,
  },
  {
    id: 133,
    title: 'Judiciary: Independence & Justice',
    content: `An independent judiciary upholds the Constitution and resolves disputes. The Supreme Court ensures protection of fundamental rights.

Judicial independence is vital for rule of law.`,
    keyPoints: ['Independent judiciary', 'Supreme Court protects rights', 'Ensures rule of law'],
    articles: ['Articles 137–159'],
    helpline: null,
  },
  {
    id: 134,
    title: 'Provinces: Powers & Responsibilities',
    content: `Provinces have powers over education, health, culture, and infrastructure within constitutional lists. Provincial assemblies legislate and executives implement.

Federal cooperation enables balanced development.`,
    keyPoints: [
      'Concurrent and exclusive powers',
      'Assemblies legislate; executives implement',
      'Cooperation with federal level',
    ],
    articles: ['Articles 162–188'],
    helpline: null,
  },
  {
    id: 135,
    title: 'Local Governments: Service Delivery',
    content: `Local governments deliver services in water, sanitation, education, health, and local infrastructure. Citizen participation ensures responsiveness.

Ward-level representation connects governance to communities.`,
    keyPoints: [
      'Service delivery closest to citizens',
      'Participation improves responsiveness',
      'Ward representation ensures access',
    ],
    articles: ['Articles 221–242'],
    helpline: null,
  },
  {
    id: 136,
    title: 'Elections & Representation',
    content: `Regular elections ensure accountability and representation. Proportional and first-past-the-post systems are combined to reflect diversity.

Voter education prevents misinformation and strengthens legitimacy.`,
    keyPoints: [
      'Regular free and fair elections',
      'Mixed electoral systems',
      'Voter education is critical',
    ],
    articles: ['Election provisions'],
    helpline: null,
  },
  {
    id: 137,
    title: 'Fiscal Federalism',
    content: `Revenue sharing and grants support provincial and local governments. Transparent fiscal systems promote equitable development.

Public audits and disclosures enhance accountability.`,
    keyPoints: [
      'Revenue sharing mechanisms',
      'Grants for local development',
      'Transparency and audits',
    ],
    articles: ['Fiscal provisions'],
    helpline: null,
  },
  {
    id: 138,
    title: 'Public Participation & RTI',
    content: `Public consultations and Right to Information enable citizen oversight. Participation improves policy outcomes and service quality.

Civic forums strengthen local democracy.`,
    keyPoints: [
      'Consultations and RTI enhance oversight',
      'Improves policies and services',
      'Forums strengthen democracy',
    ],
    articles: ['Article 27', 'Local Governance provisions'],
    helpline: null,
  },
  {
    id: 139,
    title: 'Ethics in Public Service',
    content: `Integrity, impartiality, and service orientation define public service ethics. Codes of conduct prevent conflicts of interest.

Ethical governance builds trust and reduces corruption.`,
    keyPoints: [
      'Integrity and impartiality',
      'Codes of conduct',
      'Builds trust and reduces corruption',
    ],
    articles: ['Good governance provisions'],
    helpline: null,
  },
  {
    id: 140,
    title: 'Disaster Resilience & Civic Duty',
    content: `Citizens and governments must collaborate in disaster preparedness for earthquakes, floods, and landslides. Community training and early warning systems save lives.

Civic duty includes volunteerism and mutual aid during crises.`,
    keyPoints: [
      'Preparedness and early warning systems',
      'Community training is vital',
      'Volunteerism during crises',
    ],
    articles: ['Public safety provisions'],
    helpline: 'Emergency: 102; Police: 100',
  },
];

// Level 2: Public Cleanliness & Waste Management (expanded)
const level2Lessons = [
  {
    id: 201,
    title: 'Public Sanitation Basics',
    content: `Public sanitation encompasses clean water, safe sewage disposal, and hygienic practices in shared spaces. Effective sanitation prevents disease transmission and improves community wellbeing.\n\nNepal continues to expand sanitation coverage through awareness campaigns and infrastructure, with schools playing a key role in hygiene education.`,
    keyPoints: [
      'Clean water and sewage systems matter',
      'Prevents infectious diseases',
      'Shared responsibility: government + citizens',
      'Schools drive hygiene education',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 202,
    title: 'Open Defecation Free (ODF) Movement',
    content: `ODF initiatives promote universal access to toilets and community monitoring to sustain gains. Behavior change is central to long-term success.\n\nLocal governments and NGOs coordinate construction, maintenance, and education to prevent relapse.`,
    keyPoints: [
      'ODF targets universal toilet access',
      'Behavior change sustains outcomes',
      'Local gov + NGOs coordinate',
      'Community monitoring prevents relapse',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 203,
    title: 'Waste Segregation at Source',
    content: `Segregating waste into organic, recyclable, and hazardous categories streamlines processing and protects the environment. Color-coded bins and household routines make segregation practical.\n\nMunicipal services work best when citizens sort waste before collection.`,
    keyPoints: [
      'Organic, recyclable, hazardous',
      'Color-coded bins help',
      'Segregation reduces landfill load',
      'Citizens sort before collection',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 204,
    title: '3R: Reduce, Reuse, Recycle',
    content: `Reducing consumption, reusing products, and recycling materials cuts waste and saves resources.\n\nHouseholds can avoid single-use plastics, repair items, and separate recyclables for collection.`,
    keyPoints: [
      'Reduce consumption first',
      'Reuse before discarding',
      'Recycle properly',
      'Avoid single-use plastics',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 205,
    title: 'Community Clean-up Drives',
    content: `Local clean-up drives mobilize volunteers to remove litter, clear drains, and beautify public spaces.\n\nRegular events build civic pride and reinforce collective responsibility.`,
    keyPoints: [
      'Volunteer mobilization',
      'Clear drains and litter',
      'Beautify public spaces',
      'Build civic pride',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 206,
    title: 'Bagmati River Restoration',
    content: `Bagmati restoration combines sewage treatment, solid waste control, and community stewardship.\n\nProgress depends on sustained funding, regulation, and public participation.`,
    keyPoints: [
      'Sewage treatment needed',
      'Control industrial discharge',
      'Community stewardship',
      'Sustained funding + regulation',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 207,
    title: 'Municipal Waste Collection Systems',
    content: `Regular collection schedules, route planning, and sorting facilities improve municipal waste management.\n\nCitizens should follow schedules and keep waste ready for pickup.`,
    keyPoints: [
      'Follow collection schedules',
      'Route planning improves service',
      'Sorting facilities required',
      'Citizen cooperation',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 208,
    title: 'Composting & Bio-waste',
    content: `Composting turns kitchen and garden waste into nutrient-rich soil, reducing landfill pressure.\n\nHousehold and community composting programs support urban agriculture.`,
    keyPoints: [
      'Compost kitchen waste',
      'Reduces landfill pressure',
      'Supports urban agriculture',
      'Community composting works',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 209,
    title: 'Recycling Streams & Markets',
    content: `Recycling creates economic value and jobs. Establishing local markets for paper, plastic, glass, and metal encourages proper sorting and sale.\n\nTransparency in recycling chains builds trust and participation.`,
    keyPoints: [
      'Recycling creates jobs',
      'Local markets for materials',
      'Sort paper/plastic/glass/metal',
      'Transparency builds trust',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 210,
    title: 'Hazardous Waste Handling',
    content: `Batteries, medicines, and e-waste must be handled separately to avoid contamination.\n\nDesignated drop-off points and take-back schemes reduce risk.`,
    keyPoints: [
      'Separate hazardous waste',
      'Avoid contamination',
      'Use designated drop-off points',
      'Promote take-back schemes',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 211,
    title: 'School Sanitation & Hygiene',
    content: `School sanitation facilities and hygiene lessons reduce disease and absenteeism.\n\nHandwashing stations and menstrual hygiene support are essential.`,
    keyPoints: [
      'Improve school facilities',
      'Hygiene lessons matter',
      'Handwashing stations',
      'Menstrual hygiene support',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 212,
    title: 'Solid Waste By-laws & Enforcement',
    content: `Municipal by-laws define waste handling and penalties for littering or illegal dumping.\n\nConsistent enforcement and public awareness change behavior.`,
    keyPoints: [
      'By-laws define rules',
      'Penalties deter violations',
      'Enforcement + awareness',
      'Reduce illegal dumping',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 213,
    title: 'Heritage Site Cleanliness',
    content: `Heritage sites require special waste management and visitor education to preserve cultural assets.\n\nGuidelines ensure vendors and visitors maintain cleanliness standards.`,
    keyPoints: [
      'Special management for heritage',
      'Visitor education needed',
      'Vendor guidelines',
      'Preserve cultural assets',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 214,
    title: 'Plastic Reduction Policies',
    content: `Fees, bans, or incentives reduce single-use plastic consumption.\n\nAlternatives like cloth bags and refill stations help communities transition.`,
    keyPoints: [
      'Fees/bans/incentives',
      'Reduce single-use plastic',
      'Use cloth bags',
      'Support refill stations',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 215,
    title: 'Citizen Reporting & Apps',
    content: `Reporting litter hotspots and missed collections via apps improves municipal responsiveness.\n\nCrowdsourced data helps target interventions.`,
    keyPoints: [
      'Report hotspots',
      'Missed collection alerts',
      'Improve responsiveness',
      'Crowdsourced targeting',
    ],
    articles: null,
    helpline: null,
  },
];

// Level 3: Traffic Rules & Road Safety (expanded)
const level3Lessons = [
  {
    id: 301,
    title: 'Traffic Sign Basics',
    content: `Understanding regulatory, warning, and informational signs prevents violations and accidents.\n\nDrivers should refresh sign knowledge periodically.`,
    keyPoints: [
      'Regulatory vs warning signs',
      'Informational signs guide',
      'Refresh knowledge regularly',
      'Prevents violations',
    ],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 302,
    title: 'Lane Discipline & Overtaking',
    content: `Maintain lane discipline and overtake only when safe and legal—never on curves or blind spots.\n\nSignal intentions early and check mirrors.`,
    keyPoints: [
      'Maintain lanes',
      'Safe/legal overtaking only',
      'Avoid curves/blind spots',
      'Signal and check mirrors',
    ],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 303,
    title: 'Speed Management',
    content: `Adjust speed to road conditions and weather; observe posted limits.\n\nLower speeds improve reaction time and reduce crash severity.`,
    keyPoints: [
      'Adjust to conditions',
      'Observe limits',
      'Better reaction time',
      'Reduce crash severity',
    ],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 304,
    title: 'Seatbelts & Child Restraints',
    content: `Seatbelts save lives; child restraints are essential for young passengers.\n\nInstall and use certified equipment correctly.`,
    keyPoints: [
      'Seatbelts mandatory',
      'Child restraints essential',
      'Use certified equipment',
      'Install correctly',
    ],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 305,
    title: 'Motorcycle Safety',
    content: `Wear helmets, protective clothing, and ride defensively.\n\nVisibility and distance are key to avoiding collisions.`,
    keyPoints: [
      'Wear helmets',
      'Protective clothing',
      'Defensive riding',
      'Keep distance & visibility',
    ],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 306,
    title: 'Mountain Roads: Techniques',
    content: `Use engine braking on steep descents and slow before curves.\n\nBe alert for landslides and narrow passages.`,
    keyPoints: [
      'Engine braking',
      'Slow before curves',
      'Watch for landslides',
      'Caution on narrow roads',
    ],
    articles: null,
    helpline: 'Emergency: 102',
  },
  {
    id: 307,
    title: 'Monsoon Driving',
    content: `Rain reduces traction and visibility; increase following distance and avoid flooded roads.\n\nCheck wipers and lights before trips.`,
    keyPoints: ['Reduced traction', 'Increase distance', 'Avoid floods', 'Check wipers/lights'],
    articles: null,
    helpline: 'Emergency: 102',
  },
  {
    id: 308,
    title: 'Distracted Driving',
    content: `Avoid phone use and in-car distractions.\n\nFocus on the road; pull over for calls or navigation setup.`,
    keyPoints: ['No phone use', 'Minimize distractions', 'Pull over safely', 'Focus on road'],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 309,
    title: 'Alcohol & Drugs: Zero Tolerance',
    content: `Driving under the influence is illegal and deadly.\n\nUse designated drivers or public transport when consuming alcohol.`,
    keyPoints: [
      'Illegal and deadly',
      'Designated drivers',
      'Public transport option',
      'Strict enforcement',
    ],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 310,
    title: 'Emergency Numbers & First Aid',
    content: `Know 102 (ambulance) and 103 (traffic). Provide basic first aid and do not move victims unless necessary.\n\nReport location and incident details clearly.`,
    keyPoints: ['102 ambulance', '103 traffic', 'Basic first aid', 'Clear incident details'],
    articles: null,
    helpline: 'Ambulance: 102; Traffic: 103',
  },
  {
    id: 311,
    title: 'Pedestrian & Cyclist Safety',
    content: `Respect crosswalks and cyclists’ lanes; slow down in residential areas and near schools.\n\nShare the road courteously.`,
    keyPoints: ['Respect crosswalks', 'Watch for cyclists', 'Slow near schools', 'Share the road'],
    articles: null,
    helpline: 'Traffic Police: 103',
  },
  {
    id: 312,
    title: 'Vehicle Maintenance for Safety',
    content: `Maintain brakes, tires, and lights; fix defects promptly.\n\nPreventive maintenance reduces breakdowns and accidents.`,
    keyPoints: [
      'Maintain brakes/tires/lights',
      'Fix defects promptly',
      'Preventive maintenance',
      'Fewer breakdowns',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 313,
    title: 'Accident Reporting Protocol',
    content: `Stop safely, secure the scene, call emergency numbers, and cooperate with authorities.\n\nDocument details for insurance and legal processes.`,
    keyPoints: [
      'Stop & secure scene',
      'Call emergency numbers',
      'Cooperate with police',
      'Document details',
    ],
    articles: null,
    helpline: 'Ambulance: 102; Traffic: 103',
  },
  {
    id: 314,
    title: 'Road Etiquette & Courtesy',
    content: `Avoid aggressive driving; use indicators and horn judiciously.\n\nCourtesy reduces conflicts and keeps traffic flowing.`,
    keyPoints: ['No aggression', 'Use indicators/horn', 'Reduce conflicts', 'Keep traffic flowing'],
    articles: null,
    helpline: null,
  },
  {
    id: 315,
    title: 'Night Driving Tips',
    content: `Reduce speed, use low beams in traffic, and watch for fatigue.\n\nClean windshields and check lights before trips.`,
    keyPoints: [
      'Reduce speed at night',
      'Use low beams in traffic',
      'Avoid fatigue',
      'Clean windshield/check lights',
    ],
    articles: null,
    helpline: null,
  },
];

// Level 4: Environmental Protection & Natural Heritage (expanded)
const level4Lessons = [
  {
    id: 401,
    title: 'Biodiversity Overview',
    content: `Nepal’s ecosystems—from Terai plains to Himalayas—host diverse flora and fauna.\n\nConservation is vital for livelihoods and global heritage.`,
    keyPoints: [
      'Diverse ecosystems',
      'Flora & fauna richness',
      'Conservation vital',
      'Supports livelihoods',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 402,
    title: 'National Parks Network',
    content: `Chitwan, Sagarmatha, Langtang, Bardiya and others protect endangered species and habitats.\n\nSustainable tourism supports conservation.`,
    keyPoints: [
      'Parks protect species',
      'Endangered habitats',
      'Sustainable tourism',
      'Local benefits',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 403,
    title: 'Environmental Protection Act 2053',
    content: `Requires environmental impact assessments, sets pollution standards, and penalties for violations.\n\nPublic participation strengthens compliance.`,
    keyPoints: [
      'EIAs mandatory',
      'Pollution standards',
      'Penalties deter violations',
      'Public participation',
    ],
    articles: ['EPA 2053'],
    helpline: null,
  },
  {
    id: 404,
    title: 'Community Forestry',
    content: `Community-managed forests restore habitats and provide resources sustainably.\n\nLocal stewardship improves outcomes.`,
    keyPoints: [
      'Community management',
      'Habitat restoration',
      'Sustainable resources',
      'Local stewardship',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 405,
    title: 'River Health & Pollution',
    content: `Industrial discharge and solid waste degrade rivers.\n\nTreatment plants and strict enforcement are required.`,
    keyPoints: [
      'Industrial discharge harms',
      'Waste control needed',
      'Treatment plants',
      'Strict enforcement',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 406,
    title: 'Climate Change & Himalayas',
    content: `Glacial melt impacts water systems and disaster risk.\n\nAdaptation and mitigation policies are essential.`,
    keyPoints: [
      'Glacial melt risks',
      'Water system impacts',
      'Adaptation needed',
      'Mitigation policies',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 407,
    title: 'Air Quality & Health',
    content: `Urban air pollution affects respiratory health; reduce emissions and adopt cleaner transport.\n\nPublic awareness supports change.`,
    keyPoints: [
      'Urban pollution harms health',
      'Reduce emissions',
      'Cleaner transport',
      'Awareness campaigns',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 408,
    title: 'Wildlife Protection Laws',
    content: `Anti-poaching laws and patrols safeguard endangered species.\n\nCommunity reporting helps enforcement.`,
    keyPoints: [
      'Anti-poaching laws',
      'Patrols & enforcement',
      'Community reporting',
      'Safeguard endangered species',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 409,
    title: 'Sustainable Agriculture',
    content: `Agroforestry, water conservation, and soil health practices increase resilience.\n\nReduce chemical inputs and encourage biodiversity.`,
    keyPoints: [
      'Agroforestry benefits',
      'Conserve water',
      'Improve soil health',
      'Reduce chemicals',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 410,
    title: 'Solid Waste & Ecosystems',
    content: `Plastic and waste harm wildlife and ecosystems; reduce, segregate, and recycle.\n\nClean-up campaigns protect habitats.`,
    keyPoints: [
      'Plastic harms wildlife',
      'Reduce & recycle',
      'Segregate waste',
      'Protect habitats',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 411,
    title: 'Eco-tourism Principles',
    content: `Minimize footprint, respect local culture, and support conservation.\n\nTraining guides and operators improves practices.`,
    keyPoints: [
      'Minimize footprint',
      'Respect culture',
      'Support conservation',
      'Train guides/operators',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 412,
    title: 'Protected Area Management',
    content: `Zoning, visitor limits, and monitoring maintain ecological integrity.\n\nStakeholder engagement is crucial.`,
    keyPoints: [
      'Zoning strategies',
      'Visitor limits',
      'Monitoring ecosystems',
      'Stakeholder engagement',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 413,
    title: 'Disaster Risk Reduction',
    content: `Early warnings, land-use planning, and resilient infrastructure reduce risk.\n\nCommunity drills save lives.`,
    keyPoints: [
      'Early warnings',
      'Resilient infrastructure',
      'Land-use planning',
      'Community drills',
    ],
    articles: null,
    helpline: 'Emergency: 102',
  },
  {
    id: 414,
    title: 'Water Conservation',
    content: `Rainwater harvesting and efficient irrigation protect water resources.\n\nPolicies encourage adoption.`,
    keyPoints: ['Harvest rainwater', 'Efficient irrigation', 'Protect resources', 'Policy support'],
    articles: null,
    helpline: null,
  },
  {
    id: 415,
    title: 'Environmental Education',
    content: `Schools and communities teach stewardship, recycling, and conservation ethics.\n\nYouth programs build future leadership.`,
    keyPoints: [
      'Teach stewardship',
      'Recycling awareness',
      'Conservation ethics',
      'Youth leadership',
    ],
    articles: null,
    helpline: null,
  },
];

// Level 5: Social Inclusion & Cultural Harmony (expanded)
const level5Lessons = [
  {
    id: 501,
    title: 'Unity in Diversity',
    content: `Nepal’s multi-ethnic, multi-lingual society thrives on mutual respect and shared values.\n\nCultural exchange strengthens social cohesion.`,
    keyPoints: ['Multi-ethnic society', 'Mutual respect', 'Shared values', 'Cultural exchange'],
    articles: ['Articles 17–18'],
    helpline: null,
  },
  {
    id: 502,
    title: 'Anti-Discrimination Laws',
    content: `Discrimination based on caste, gender, religion, or origin is prohibited.\n\nVictims can seek remedies through courts and commissions.`,
    keyPoints: [
      'Prohibits discrimination',
      'Caste law enforcement',
      'Court remedies',
      'Commissions support',
    ],
    articles: ['Article 18'],
    helpline: null,
  },
  {
    id: 503,
    title: 'Inclusive Representation',
    content: `Proportional representation ensures participation of women, Dalits, indigenous peoples, and minorities.\n\nPolicies promote fairness across levels.`,
    keyPoints: [
      'Proportional representation',
      'Women & Dalits included',
      'Indigenous participation',
      'Fairness across levels',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 504,
    title: 'Language & Cultural Rights',
    content: `Communities have rights to preserve languages and cultures.\n\nEducation and media support diversity.`,
    keyPoints: ['Preserve languages', 'Cultural rights', 'Education support', 'Media inclusion'],
    articles: ['Articles 32–37'],
    helpline: null,
  },
  {
    id: 505,
    title: 'Religious Harmony',
    content: `Respect and tolerance across faiths reduce conflict and build trust.\n\nInterfaith dialogue and shared festivals strengthen harmony.`,
    keyPoints: [
      'Respect across faiths',
      'Reduce conflict',
      'Interfaith dialogue',
      'Shared festivals',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 506,
    title: 'Gender Equality & Empowerment',
    content: `Policies ensure equal rights in property, education, and governance participation.\n\nEmpowerment programs improve outcomes.`,
    keyPoints: [
      'Equal rights',
      'Property & education',
      'Governance participation',
      'Empowerment programs',
    ],
    articles: ['Article 38'],
    helpline: null,
  },
  {
    id: 507,
    title: 'Caste-based Discrimination & Untouchability',
    content: `Criminalized practices receive penalties; awareness and community action drive change.\n\nVictims must be protected and supported.`,
    keyPoints: [
      'Criminalized practices',
      'Penalties apply',
      'Awareness programs',
      'Protect victims',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 508,
    title: 'Migration & Inclusion',
    content: `Internal/external migration requires inclusive services in urban areas.\n\nLanguage support and access to services aid integration.`,
    keyPoints: [
      'Inclusive urban services',
      'Language support',
      'Access to health/education',
      'Aid integration',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 509,
    title: 'Media & Stereotypes',
    content: `Responsible media coverage avoids harmful stereotypes and promotes balanced narratives.\n\nMedia literacy helps audiences critique bias.`,
    keyPoints: [
      'Avoid stereotypes',
      'Balanced narratives',
      'Media responsibility',
      'Audience media literacy',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 510,
    title: 'Community Dialogue',
    content: `Facilitated dialogues resolve conflicts and build mutual understanding.\n\nLocal leaders enhance legitimacy.`,
    keyPoints: [
      'Facilitated dialogues',
      'Resolve conflicts',
      'Build understanding',
      'Leader involvement',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 511,
    title: 'Festival Etiquette & Inclusivity',
    content: `Inclusive festivities respect diverse customs and reduce noise/waste impacts.\n\nGuidelines help organizers and participants.`,
    keyPoints: [
      'Respect customs',
      'Reduce impacts',
      'Inclusive guidelines',
      'Organizer responsibilities',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 512,
    title: 'Disability Inclusion',
    content: `Accessible infrastructure and services ensure dignity and participation.\n\nAssistive technologies and ramps improve access.`,
    keyPoints: [
      'Accessible infrastructure',
      'Dignity & participation',
      'Assistive technologies',
      'Ramps and signage',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 513,
    title: 'Youth Engagement',
    content: `Youth programs in civic education, volunteering, and leadership build future capacity.\n\nMentorship strengthens outcomes.`,
    keyPoints: ['Civic education', 'Volunteering', 'Leadership programs', 'Mentorship'],
    articles: null,
    helpline: null,
  },
  {
    id: 514,
    title: 'Elderly Care & Respect',
    content: `Respectful care and social participation combat isolation.\n\nCommunity centers support wellbeing.`,
    keyPoints: ['Respectful care', 'Social participation', 'Combat isolation', 'Community centers'],
    articles: ['Article 41'],
    helpline: null,
  },
  {
    id: 515,
    title: 'Local Autonomy & Culture',
    content: `Federalism supports local cultural policies and preservation projects.\n\nCommunity museums and language programs thrive.`,
    keyPoints: [
      'Local cultural policies',
      'Preservation projects',
      'Community museums',
      'Language programs',
    ],
    articles: null,
    helpline: null,
  },
];

// Level 6: Digital Citizenship & Information Literacy (expanded)
const level6Lessons = [
  {
    id: 601,
    title: 'Cybersecurity Basics',
    content: `Use strong passwords, enable two-factor authentication, and keep software updated.\n\nAvoid clicking unknown links and attachments.`,
    keyPoints: ['Strong passwords', 'Enable 2FA', 'Update software', 'Avoid suspicious links'],
    articles: null,
    helpline: 'National Cyber Bureau',
  },
  {
    id: 602,
    title: 'Privacy & Data Protection',
    content: `Configure privacy settings on apps and limit data sharing.\n\nUnderstand what personal data websites collect.`,
    keyPoints: [
      'Configure privacy settings',
      'Limit data sharing',
      'Know data collection',
      'Protect personal info',
    ],
    articles: ['Article 33'],
    helpline: null,
  },
  {
    id: 603,
    title: 'Digital Nepal Framework',
    content: `Focuses on infrastructure, e-governance, digital literacy, and entrepreneurship.\n\nOnline services improve accessibility and reduce corruption.`,
    keyPoints: [
      'Infrastructure & literacy',
      'E-governance services',
      'Reduce corruption',
      'Improve accessibility',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 604,
    title: 'Misinformation & Fact-checking',
    content: `Verify sources, cross-check claims, and beware of deepfakes.\n\nShare responsibly to reduce harm.`,
    keyPoints: ['Verify sources', 'Cross-check claims', 'Beware deepfakes', 'Share responsibly'],
    articles: null,
    helpline: null,
  },
  {
    id: 605,
    title: 'Online Etiquette & Respect',
    content: `Avoid harassment, do not plagiarize, and respect intellectual property.\n\nThink before posting; content is permanent.`,
    keyPoints: ['Avoid harassment', 'No plagiarism', 'Respect IP', 'Think before posting'],
    articles: null,
    helpline: null,
  },
  {
    id: 606,
    title: 'Safe E-commerce Practices',
    content: `Use trusted platforms, secure payments, and verify sellers.\n\nWatch for phishing and fake offers.`,
    keyPoints: ['Trusted platforms', 'Secure payments', 'Verify sellers', 'Avoid phishing'],
    articles: null,
    helpline: null,
  },
  {
    id: 607,
    title: 'Digital Rights & Freedom',
    content: `Balance free expression with responsibility; avoid defamation and harmful content.\n\nReport abuse appropriately.`,
    keyPoints: [
      'Balance expression/Responsibility',
      'Avoid defamation',
      'No harmful content',
      'Report abuse',
    ],
    articles: ['Article 33'],
    helpline: null,
  },
  {
    id: 608,
    title: 'Cybercrimes & Reporting',
    content: `Hacking, fraud, and data theft are crimes; report incidents to authorities.\n\nPreserve evidence when possible.`,
    keyPoints: [
      'Hacking & fraud illegal',
      'Report incidents',
      'Preserve evidence',
      'Cooperate with authorities',
    ],
    articles: null,
    helpline: 'National Cyber Bureau',
  },
  {
    id: 609,
    title: 'Secure Communications',
    content: `Use encrypted messaging where needed; avoid public Wi-Fi for sensitive tasks.\n\nConsider VPNs for privacy.`,
    keyPoints: ['Encrypted messaging', 'Avoid risky Wi-Fi', 'Use VPNs', 'Protect sensitive tasks'],
    articles: null,
    helpline: null,
  },
  {
    id: 610,
    title: 'Digital Footprint & Reputation',
    content: `Your online actions create a lasting footprint; employers and institutions may review it.\n\nCultivate a positive presence.`,
    keyPoints: [
      'Lasting footprint',
      'Be professional',
      'Positive presence',
      'Review privacy settings',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 611,
    title: 'Protecting Children Online',
    content: `Parental guidance, content filters, and education reduce risks.\n\nTeach kids to report and avoid harmful interactions.`,
    keyPoints: ['Parental guidance', 'Use filters', 'Educate children', 'Report harm'],
    articles: null,
    helpline: null,
  },
  {
    id: 612,
    title: 'Digital Literacy Programs',
    content: `Community and school programs build essential skills for safe and effective technology use.\n\nInclusive programs bridge the digital divide.`,
    keyPoints: [
      'Build essential skills',
      'Safe/effective tech use',
      'Community/school programs',
      'Bridge digital divide',
    ],
    articles: null,
    helpline: null,
  },
  {
    id: 613,
    title: 'Cloud & Backups',
    content: `Use reliable cloud services and keep backups to prevent data loss.\n\nEncrypt sensitive files.`,
    keyPoints: ['Use reliable cloud', 'Keep backups', 'Prevent data loss', 'Encrypt files'],
    articles: null,
    helpline: null,
  },
  {
    id: 614,
    title: 'Responsible Social Media Use',
    content: `Set healthy boundaries, avoid oversharing, and be mindful of mental health impacts.\n\nUse platform tools to manage time and content.`,
    keyPoints: ['Avoid oversharing', 'Mind mental health', 'Manage time/content', 'Set boundaries'],
    articles: null,
    helpline: null,
  },
  {
    id: 615,
    title: 'Open Data & Civic Tech',
    content: `Open government data enables civic apps and transparency.\n\nParticipate in hackathons and open-source projects.`,
    keyPoints: [
      'Open data enables apps',
      'Promotes transparency',
      'Civic hackathons',
      'Contribute to open-source',
    ],
    articles: null,
    helpline: null,
  },
];

const levelsExpanded = {
  1: level1Lessons,
  2: level2Lessons,
  3: level3Lessons,
  4: level4Lessons,
  5: level5Lessons,
  6: level6Lessons,
};

module.exports = levelsExpanded;
