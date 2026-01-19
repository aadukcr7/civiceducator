// Comprehensive levels and lessons data for Civic Education Nepal
const levels = [
  {
    id: 1,
    title: 'Civic Consciousness & Constitution',
    description:
      "Learn about Nepal's Constitution, fundamental rights, duties, and state structure",
    icon: '📜',
    lessons: [
      {
        id: 101,
        title: 'What is Citizenship?',
        content:
          "Citizenship is a legal status establishing a person's relationship with a state. In Nepal, citizenship is recognized as a fundamental right under Article 33 of the Constitution. It grants rights and imposes duties on all citizens.",
      },
      {
        id: 102,
        title: 'Constitution of Nepal 2072',
        content:
          "Adopted on September 16, 2015, Nepal's Constitution establishes a federal democratic republic. It comprises 308 Articles organized in 35 Parts and represents a transition from feudal monarchy to democracy.",
      },
      {
        id: 103,
        title: 'Fundamental Rights (31 Types)',
        content:
          'Articles 25-47 guarantee 31 fundamental rights including equality, freedom, education, and health. These rights are protected through the judiciary and cannot be arbitrarily suspended.',
      },
      {
        id: 104,
        title: 'Fundamental Duties',
        content:
          'Articles 48-49 outline citizen duties: respecting Constitution, paying taxes, protecting sovereignty, promoting unity, and maintaining public cleanliness.',
      },
      {
        id: 105,
        title: 'Federal System: 7 Provinces',
        content:
          "Nepal's three-tiered federal system includes federal government, 7 provincial governments, and 753 local governments, enabling localized and responsive governance.",
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'In which article is citizenship recognized?',
        options: ['Article 25', 'Article 33', 'Article 48', 'Article 56'],
        correct: 1,
      },
      {
        id: 2,
        question: 'How many fundamental rights are guaranteed?',
        options: ['25', '28', '31', '35'],
        correct: 2,
      },
      {
        id: 3,
        question: 'How many provinces does Nepal have?',
        options: ['5', '6', '7', '8'],
        correct: 2,
      },
      {
        id: 4,
        question: 'When was Constitution 2072 promulgated?',
        options: ['Sept 16, 2015', 'Sept 20, 2015', 'Oct 1, 2015', 'Oct 15, 2015'],
        correct: 1,
      },
      {
        id: 5,
        question: 'How many local governments in Nepal?',
        options: ['500', '653', '753', '853'],
        correct: 2,
      },
    ],
  },
  {
    id: 2,
    title: 'Public Cleanliness & Waste Management',
    description:
      'Understanding sanitation, waste management, and environmental cleanliness in Nepal',
    icon: '🧹',
    lessons: [
      {
        id: 201,
        title: 'Swachh Nepal Campaign',
        content:
          "Nepal's national cleanliness initiative promoting sanitation, waste management, and environmental awareness. Focuses on ending open defecation and improving public health through behavioral change.",
      },
      {
        id: 202,
        title: 'Waste Segregation System',
        content:
          'Color-coded waste bins: Red for hazardous, Yellow for organic/biodegradable, Blue for recyclable. Segregation at source facilitates proper treatment and recycling.',
      },
      {
        id: 203,
        title: '3R Principle',
        content:
          'Reduce, Reuse, Recycle: Minimize consumption, use items multiple times, and process used materials into new products. Core to sustainable waste management.',
      },
      {
        id: 204,
        title: 'Bagmati River Cleanup',
        content:
          'Community initiative to restore Bagmati River through cleanup drives, sewage treatment, and pollution control. Model for addressing water pollution nationwide.',
      },
      {
        id: 205,
        title: 'Public Sanitation Importance',
        content:
          'Proper sanitation prevents infectious diseases and improves public health. Responsibility shared between government, institutions, and individuals.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'What color bin for recyclables?',
        options: ['Red', 'Yellow', 'Blue', 'Green'],
        correct: 2,
      },
      {
        id: 2,
        question: 'What does 3R stand for?',
        options: [
          'Recycle, Reduce, React',
          'Reduce, Reuse, Recycle',
          'React, Repair, Recycle',
          'Remove, Reuse, Recycle',
        ],
        correct: 1,
      },
      {
        id: 3,
        question: 'Which river\'s cleanup is "Clean Bagmati" campaign?',
        options: ['Koshi', 'Kali Gandaki', 'Bagmati', 'Narayani'],
        correct: 2,
      },
      {
        id: 4,
        question: 'Yellow bin is for which waste?',
        options: ['Hazardous', 'Organic', 'Recyclable', 'Plastic'],
        correct: 1,
      },
      {
        id: 5,
        question: 'Goal of waste segregation?',
        options: ['Increase waste', 'Facilitate recycling', 'Export waste', 'Create landfills'],
        correct: 1,
      },
    ],
  },
  {
    id: 3,
    title: 'Traffic Rules & Road Safety',
    description: 'Learn traffic regulations, road safety, and emergency helpline numbers',
    icon: '🚗',
    lessons: [
      {
        id: 301,
        title: 'Motor Vehicles Act 2053',
        content:
          "Nepal's primary traffic law requiring vehicle registration, driver licensing, and insurance. Violations carry penalties from fines to imprisonment. Enforced by Nepal Traffic Police.",
      },
      {
        id: 302,
        title: 'Traffic Fines & Penalties',
        content:
          'Graduated penalties for violations: minor infractions from NPR 500, serious violations up to NPR 10,000. License suspension or cancellation for repeated violations.',
      },
      {
        id: 303,
        title: 'Safe Driving Practices',
        content:
          "Follow speed limits, maintain safe distance, avoid distractions, don't drive under influence. Regular vehicle maintenance ensures safety. Defensive driving prevents accidents.",
      },
      {
        id: 304,
        title: 'Mountain & Monsoon Safety',
        content:
          'Mountain roads require reduced speed, engine braking on descents. Monsoon season creates landslides and floods; avoid night driving. Check weather before traveling.',
      },
      {
        id: 305,
        title: 'Emergency Helplines',
        content:
          'Ambulance: 102, Traffic Police: 103, Police: 100. Available 24/7 for emergencies. Report location and nature of incident for faster response.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Traffic Police emergency number?',
        options: ['100', '102', '103', '110'],
        correct: 2,
      },
      {
        id: 2,
        question: 'Motor Vehicles Act year?',
        options: ['2049 B.S.', '2050 B.S.', '2053 B.S.', '2055 B.S.'],
        correct: 2,
      },
      {
        id: 3,
        question: 'What to do in traffic accident?',
        options: ['Drive away', 'Call emergency, stay with victims', 'Take photos', 'Leave area'],
        correct: 1,
      },
      {
        id: 4,
        question: 'Emergency ambulance number?',
        options: ['100', '102', '103', '105'],
        correct: 1,
      },
      {
        id: 5,
        question: 'Mountain driving safety?',
        options: ['Drive fast', 'Engine braking on descents', 'Drive in rain', 'Ignore signs'],
        correct: 1,
      },
    ],
  },
  {
    id: 4,
    title: 'Environmental Protection & Natural Heritage',
    description: 'Explore biodiversity, national parks, and environmental protection laws',
    icon: '🌿',
    lessons: [
      {
        id: 401,
        title: "Nepal's Biodiversity Hotspot",
        content:
          "Nepal hosts 4% of world's species despite tiny land area. Home to 123 languages, 125+ ethnic groups. Diverse ecosystems from Terai plains to Himalayan mountains.",
      },
      {
        id: 402,
        title: 'National Parks & Protected Areas',
        content:
          'Nepal has 8 national parks including Chitwan (one-horned rhinos) and Sagarmatha (Mt. Everest). Protected areas serve conservation and sustainable tourism. Community involvement essential.',
      },
      {
        id: 403,
        title: 'Environmental Protection Act 2053',
        content:
          'Primary environmental law requiring environmental impact assessments for projects. Sets pollution standards and penalties for violations. Ensures public participation in decisions.',
      },
      {
        id: 404,
        title: 'Endangered Species in Nepal',
        content:
          'Protected species: one-horned rhinoceros, Bengal tiger, Asian elephant, snow leopard. Over 800 bird species. Conservation through protected areas and community forests.',
      },
      {
        id: 405,
        title: 'Climate Change & Himalayas',
        content:
          'Glacier melting threatens water sources and increases natural disasters. Community forestry programs and sustainable practices help mitigate climate impacts.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'What % of world species in Nepal?',
        options: ['1%', '2%', '4%', '8%'],
        correct: 2,
      },
      {
        id: 2,
        question: "Nepal's first national park?",
        options: ['Sagarmatha', 'Chitwan', 'Langtang', 'Bardiya'],
        correct: 1,
      },
      {
        id: 3,
        question: 'Environmental Protection Act year?',
        options: ['2050 B.S.', '2052 B.S.', '2053 B.S.', '2055 B.S.'],
        correct: 2,
      },
      { id: 4, question: 'How many national parks?', options: ['5', '6', '7', '8'], correct: 3 },
      {
        id: 5,
        question: 'Endangered species in Nepal?',
        options: ['Cow', 'Goat', 'Snow leopard', 'Chicken'],
        correct: 2,
      },
    ],
  },
  {
    id: 5,
    title: 'Social Inclusion & Cultural Harmony',
    description: 'Learn about diversity, anti-discrimination, and cultural unity',
    icon: '🤝',
    lessons: [
      {
        id: 501,
        title: 'Unity in Diversity',
        content:
          'Nepal has 123 languages, 125+ ethnic groups, multiple religions coexisting peacefully. "Unity in diversity" embedded in Constitution. Cultural festivals unite communities.',
      },
      {
        id: 502,
        title: 'Anti-Discrimination Laws',
        content:
          'Article 25 guarantees equality; discrimination illegal. Affirmative action for marginalized groups. Caste-based discrimination and untouchability criminalized.',
      },
      {
        id: 503,
        title: 'Proportional Representation',
        content:
          'Constitutional requirement for women, Dalits, indigenous peoples, religious minorities in government. Ensures inclusive democracy and community representation.',
      },
      {
        id: 504,
        title: 'Federal Structure & Provinces',
        content:
          'Seven provinces enable local governance. Regions control education, health, cultural affairs. Protects local languages and heritage preservation.',
      },
      {
        id: 505,
        title: 'Festivals & Coexistence',
        content:
          'Dashain, Tihar, Holi, Eid, Christmas celebrated nationally. Interfaith marriages and shared spaces strengthen cohesion. Education emphasizes pluralism.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Languages spoken in Nepal?',
        options: ['85', '100', '123', '150'],
        correct: 2,
      },
      {
        id: 2,
        question: 'Discrimination is...?',
        options: [
          'Acceptable',
          'Prohibited on all grounds',
          'Allowed privately',
          'Only illegal in cities',
        ],
        correct: 1,
      },
      {
        id: 3,
        question: 'Ethnic groups in Nepal?',
        options: ['50', '85', '100', '125+'],
        correct: 3,
      },
      {
        id: 4,
        question: 'Major anti-discrimination law?',
        options: ['Labor Act', 'Caste-based Discrimination Act', 'Education Act', 'Land Act'],
        correct: 1,
      },
      {
        id: 5,
        question: 'National holiday festivals?',
        options: ['Only Hindu', 'Only Buddhist', 'Multiple religions', 'None'],
        correct: 2,
      },
    ],
  },
  {
    id: 6,
    title: 'Digital Citizenship & Information Literacy',
    description: 'Understand cyber laws, digital ethics, and information security',
    icon: '💻',
    lessons: [
      {
        id: 601,
        title: 'Cyber Security Act 2075',
        content:
          "Nepal's cybercrime law enacted 2075 B.S. (2018). Criminalizes hacking, unauthorized access, data theft, fraud. National Cyber Bureau implements policy.",
      },
      {
        id: 602,
        title: 'Digital Rights & Privacy',
        content:
          'Constitution recognizes right to information and privacy. Personal data should be protected. Use privacy-respecting tools. Data protection laws needed for stronger protection.',
      },
      {
        id: 603,
        title: 'Digital Nepal Framework',
        content:
          'Government initiative for digital empowerment. E-governance services reduce corruption and improve efficiency. Digital literacy essential for inclusive transformation.',
      },
      {
        id: 604,
        title: 'Information Literacy & Misinformation',
        content:
          'Ability to find, evaluate, use information. Critical thinking distinguishes trustworthy sources. Misinformation spread through social media. Verify before sharing.',
      },
      {
        id: 605,
        title: 'Digital Citizenship & Ethics',
        content:
          'Responsible online behavior: respect privacy, avoid harassment, no plagiarism. Cyberbullying causes serious harm. Digital security practices: strong passwords, 2FA, avoid suspicious links.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Cyber Security Act year?',
        options: ['2073 B.S.', '2074 B.S.', '2075 B.S.', '2076 B.S.'],
        correct: 2,
      },
      {
        id: 2,
        question: 'Right to information article?',
        options: ['Article 25', 'Article 30', 'Article 33', 'Article 40'],
        correct: 2,
      },
      {
        id: 3,
        question: 'What is e-governance?',
        options: ['Online gaming', 'Public services via digital', 'Entertainment', 'Shopping'],
        correct: 1,
      },
      {
        id: 4,
        question: 'Combat misinformation?',
        options: [
          'Share immediately',
          'Verify source, check facts',
          'Assume true',
          'Share without thinking',
        ],
        correct: 1,
      },
      {
        id: 5,
        question: 'Cyber security agency?',
        options: [
          'Ministry of Education',
          'Ministry of Health',
          'National Cyber Bureau',
          'Ministry of Transport',
        ],
        correct: 2,
      },
    ],
  },
];

module.exports = levels;
