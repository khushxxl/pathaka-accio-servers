export const GENRE_TAGS = [
    'History',
    'People',
    'Society & Culture',
    'Science',
    'Sport',
    'Philosophy',
    'Politics',
    'News & Current Affairs',
    'Business & Finance',
    'Tech',
    'Film & TV (spoilers!)',
    'Books',
    'Personal Development',
    'Arts & Entertainment',
    'Local History & News',
    'Food',
    'Nature',
    'Spirituality',
    'Health & Wellness',
    'Fitness & Training',
    'Parenting',
    'Relationships',
    'Environment',
    'Kids & Family',
    'Travel',
    'Gaming',
    'Education',
    'True Crime',
    'Comedy'
] as const;

export type GenreTag = typeof GENRE_TAGS[number];

export interface PodcastTags {
    genre: GenreTag;
    subgenre: string;
    keywords: string[];
}

export const getTaggingInstructions = () => `
## PODCAST TAGGING INSTRUCTIONS

1. Genre Selection
- Select exactly ONE genre from this list: ${GENRE_TAGS.join(', ')}
- Choose the most specific applicable genre
- If multiple genres fit, prioritize the one that best matches the main focus

2. Subgenre Creation
- Create a succinct descriptive subgenre label that still remains high level and easily searchable  
- Format: [Region/Era/Field/Topic]
- Examples: "Ancient Greece", "Quantum Physics", "AI Ethics"
- Aim for 2-3 words maximum
- Use title case (e.g., "Modern Architecture" not "modern architecture")

3. Keywords Generation
- Generate exactly 10 keywords
- Include key people, places, concepts, and themes drawn from the provided context
- Order from most to least relevant
- Avoid generic terms
- Include specific technical terms when relevant
- Keep each keyword to 1-3 words maximum
- No duplicate concepts between keywords

Return in this JSON format:
{
    "genre": "selected_genre",
    "subgenre": "specific_subgenre",
    "keywords": ["keyword1", "keyword2", ... "keyword10"]
}
`; 
