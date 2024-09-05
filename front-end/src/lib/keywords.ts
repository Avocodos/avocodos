export const validPages = ["home", "posts", "profile", "notifications", "login"] as const;

export type validPagesType = (typeof validPages)[number];

export const baseKeywords = [
    "Avocodos",
    "Web3 Social",
    "Aptos Blockchain",
    "Cryptocurrency",
    "Blockchain Community",
    "Decentralized Social Network",
    "Crypto Social Platform",
    "Web3 Account Access",
    "Aptos Ecosystem",
    "Blockchain Social Media",
    "DeFi Community",
    "NFT Social Network",
    "Crypto Enthusiasts",
    "Web3 Networking",
    "Blockchain Education",
    "Aptos Development",
    "Decentralized Identity",
    "Crypto Content Creation",
    "Defi",
    "Nft",
    "Nft Social Network",
    "Nft Social Media",
    "Nft Social Platform",
    "Nft Social Network",
    "Nft Social Network",
    "Nft Social Network",
    "Nft Social Network",
    "Web3 Gaming",
    "Avocodos Web3",
    "Avocodos Aptos",
    "Avocodos Cryptocurrency",
    "Avocodos Blockchain",
    "Avocodos Community",
    "Avocodos Social",
    "Avocodos NFT",
    "Avocodos Defi",
    "Avocodos Web3 Social",
]

export function getKeywords(page: validPagesType) {

    switch (page) {
        case "home":
            return [
                ...baseKeywords,
                "Avocodos",
                "Home",
                "Web3 Social",
                "Aptos Blockchain",
                "Cryptocurrency",
                "Blockchain Community",
                "Social Media",
                "Decentralized",
                "NFTs",
                "Digital Assets",
                "Web3 Development",
                "Smart Contracts",
                "Community Building",
                "User Engagement",
                "Content Creation",
                "Online Learning",
                "Developer Tools",
                "Blockchain Technology",
                "Peer-to-Peer",
                "Tokenomics",
                "Crypto Trading",
                "Decentralized Finance",
                "DAOs",
                "Web3 Gaming",
                "Metaverse",
                "Digital Identity",
                "Privacy",
                "Security",
                "Interoperability",
                "User Experience",
                "User Interface",
                "Open Source",
                "Innovation",
                "Crowdfunding",
                "Token Standards",
                "ERC-20",
                "ERC-721",
                "ERC-1155",
                "Layer 1",
                "Layer 2",
                "Scalability",
                "Blockchain Solutions",
                "Decentralized Applications",
                "DApps",
                "Crypto Wallets",
                "Staking",
                "Yield Farming",
                "Liquidity Pools",
                "Marketplaces",
                "NFT Marketplaces",
                "Digital Collectibles",
                "Crypto Art",
                "Blockchain Gaming",
                "Play-to-Earn",
                "Token Sales",
                "Initial Coin Offerings",
                "Security Tokens",
                "Utility Tokens",
                "Blockchain Analytics",
                "Data Privacy",
                "Data Ownership",
                "Digital Rights",
                "Content Monetization",
                "Social Tokens",
                "Community Governance",
                "Decentralized Storage",
                "IPFS",
                "Filecoin",
                "Web3 Infrastructure",
                "Blockchain Interoperability",
                "Cross-Chain",
                "Decentralized Exchanges",
                "DEX",
                "Centralized Exchanges",
                "CEX",
                "Crypto Regulations",
                "Compliance",
                "Blockchain Adoption",
                "User Retention",
                "Gamification",
                "Community Incentives",
                "Referral Programs",
                "Social Impact",
                "Sustainability",
                "Green Blockchain",
                "Energy Efficiency",
                "Blockchain Education",
                "Workshops",
                "Webinars",
                "Online Courses",
                "Mentorship",
                "Networking",
                "Collaboration",
                "Partnerships",
                "Ecosystem Development",
                "Blockchain Research",
                "Future of Work",
                "Remote Work",
                "Digital Nomads",
                "Freelancing",
                "Gig Economy",
                "Crowdsourcing",
                "Open Innovation",
                "Hackathons",
                "Startup Incubation",
                "Accelerators",
                "Venture Capital",
                "Angel Investing",
                "Funding",
                "Investment Strategies",
                "Portfolio Management",
                "Risk Management",
                "Market Analysis",
                "Technical Analysis",
                "Fundamental Analysis",
                "Trading Strategies",
                "Market Trends",
                "Economic Impact",
                "Global Economy",
                "Digital Transformation",
                "Technology Trends",
                "Future Technologies",
                "Artificial Intelligence",
                "Machine Learning",
                "Internet of Things",
                "5G Technology",
                "Augmented Reality",
                "Virtual Reality",
                "Blockchain in Healthcare",
                "Blockchain in Finance",
                "Blockchain in Supply Chain",
                "Blockchain in Education",
                "Blockchain in Government",
                "Blockchain in Real Estate",
                "Blockchain in Energy",
                "Blockchain in Agriculture",
                "Blockchain in Retail",
                "Blockchain in Logistics",
                "Blockchain in Telecommunications",
                "Blockchain in Media",
                "Blockchain in Entertainment",
                "Blockchain in Travel",
                "Blockchain in Sports",
                "Blockchain in Art",
                "Blockchain in Music",
                "Blockchain in Fashion",
                "Blockchain in Food",
                "Blockchain in Charity",
                "Blockchain in Philanthropy",
                "Blockchain in Nonprofits",
                "Blockchain in Crowdfunding",
                "Blockchain in Social Impact",
                "Blockchain in Community Development",
                "Blockchain in Disaster Relief",
                "Blockchain in Humanitarian Aid",
                "Blockchain in Environmental Protection",
                "Blockchain in Wildlife Conservation",
                "Blockchain in Climate Change",
                "Blockchain in Public Health",
                "Blockchain in Mental Health",
                "Blockchain in Aging",
                "Blockchain in Disability",
                "Blockchain in Education Equity",
                "Blockchain in Gender Equality",
                "Blockchain in Racial Justice",
                "Blockchain in LGBTQ+ Rights",
                "Blockchain in Indigenous Rights",
                "Blockchain in Refugee Support",
                "Blockchain in Youth Empowerment",
                "Blockchain in Elderly Care",
                "Blockchain in Child Welfare",
                "Blockchain in Family Support",
                "Blockchain in Community Resilience",
                "Blockchain in Economic Development",
                "Blockchain in Job Creation",
                "Blockchain in Workforce Development",
                "Blockchain in Skills Training",
                "Blockchain in Career Development",
                "Blockchain in Entrepreneurship",
                "Blockchain in Small Business Support",
                "Blockchain in Local Economies",
                "Blockchain in Global Trade",
                "Blockchain in International Development",
                "Blockchain in Foreign Aid",
                "Blockchain in Human Rights",
                "Blockchain in Social Justice",
                "Blockchain in Peacebuilding",
                "Blockchain in Conflict Resolution",
                "Blockchain in Diplomacy",
                "Blockchain in International Relations",
                "Blockchain in Global Governance",
                "Blockchain in Multilateralism",
                "Blockchain in Global Citizenship",
                "Blockchain in Cultural Exchange",
                "Blockchain in Language Preservation",
                "Blockchain in Heritage Conservation",
                "Blockchain in Arts and Culture",
                "Blockchain in Sports and Recreation",
                "Blockchain in Community Engagement",
                "Blockchain in Civic Participation",
                "Blockchain in Political Activism",
                "Blockchain in Social Movements",
                "Blockchain in Grassroots Organizing",
                "Blockchain in Community Organizing",
                "Blockchain in Collective Action",
                "Blockchain in Social Change",
                "Blockchain in Social Innovation",
                "Blockchain in Social Entrepreneurship",
                "Blockchain in Social Enterprise",
                "Blockchain in Social Business",
                "Blockchain in Social Impact Investing",
                "Blockchain in Impact Measurement",
                "Blockchain in Social Return on Investment",
                "Blockchain in Social Value",
                "Blockchain in Social Capital",
                "Blockchain in Social Cohesion",
                "Blockchain in Social Trust",
                "Blockchain in Social Networks",
                "Blockchain in Social Media",
                "Blockchain in Online Communities",
                "Blockchain in Digital Activism",
                "Blockchain in Digital Rights",
                "Blockchain in Digital Privacy",
                "Blockchain in Digital Security",
                "Blockchain in Digital Literacy",
                "Blockchain in Digital Inclusion",
                "Blockchain in Digital Divide",
                "Blockchain in Digital Economy",
                "Blockchain in Digital Innovation",
                "Blockchain in Digital Transformation",
                "Blockchain in Digital Strategy",
                "Blockchain in Digital Marketing",
                "Blockchain in Digital Branding",
                "Blockchain in Digital Communication",
                "Blockchain in Digital Storytelling",
                "Blockchain in Digital Content",
                "Blockchain in Digital Media",
                "Blockchain in Digital Art",
                "Blockchain in Digital Music",
                "Blockchain in Digital Film",
                "Blockchain in Digital Photography",
                "Blockchain in Digital Design",
                "Blockchain in Digital Fashion",
                "Blockchain in Digital Gaming",
                "Blockchain in Digital Sports",
                "Blockchain in Digital Entertainment",
                "Blockchain in Digital Culture",
                "Blockchain in Digital Heritage",
                "Blockchain in Digital Preservation",
                "Blockchain in Digital Archiving",
                "Blockchain in Digital Curation",
                "Blockchain in Digital Scholarship",
                "Blockchain in Digital Research",
                "Blockchain in Digital Education",
                "Blockchain in Digital Learning",
                "Blockchain in Digital Teaching",
                "Blockchain in Digital Pedagogy",
                "Blockchain in Digital Curriculum",
                "Blockchain in Digital Assessment",
                "Web3 Social Platform",
                "Aptos Blockchain",
                "Cryptocurrency",
                "Blockchain Community"
            ];
        case "login":
            return [
                ...baseKeywords,
                "Log In",
                "Sign In",
                "Web3 Social",
                "Aptos Blockchain",
                "Cryptocurrency",
                "Blockchain Community",
                "Decentralized Social Network",
                "Crypto Social Platform",
                "Web3 Account Access",
                "Aptos Ecosystem",
                "Blockchain Social Media",
                "DeFi Community",
                "NFT Social Network",
                "Crypto Enthusiasts",
                "Web3 Networking",
                "Blockchain Education",
                "Aptos Development",
                "Decentralized Identity",
                "Crypto Content Creation",
                "Avocodos Login",
                "Avocodos Sign In",
                "Avocodos Web3",
                "Avocodos Aptos",
                "Avocodos Cryptocurrency",
                "Avocodos Blockchain",
                "Avocodos Community",
                "Avocodos Social",
                "Avocodos NFT",
                "Avocodos Defi",
                "Avocodos Web3 Social",
                "Avocodos Aptos Blockchain",
                "Avocodos Cryptocurrency",
                "Avocodos Blockchain Community",
                "Avocodos Decentralized Social Network",
                "Avocodos Crypto Social Platform",
                "Avocodos Web3 Account Access",
            ]
        default:
            throw new Error("Invalid page");
    }
}