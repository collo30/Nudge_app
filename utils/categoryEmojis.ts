// Default emoji mappings based on category name keywords
const emojiMappings: { keywords: string[], emoji: string }[] = [
    // Housing & Utilities
    { keywords: ['rent', 'mortgage', 'housing', 'home'], emoji: '🏠' },
    { keywords: ['utilities', 'utility', 'electric', 'electricity', 'power'], emoji: '⚡' },
    { keywords: ['water'], emoji: '💧' },
    { keywords: ['gas', 'heating'], emoji: '🔥' },
    { keywords: ['internet', 'wifi', 'broadband'], emoji: '🌐' },
    { keywords: ['phone', 'mobile', 'cell'], emoji: '📱' },

    // Transportation
    { keywords: ['car', 'auto', 'vehicle'], emoji: '🚗' },
    { keywords: ['gas', 'fuel', 'petrol'], emoji: '⛽' },
    { keywords: ['bus', 'transit', 'transport', 'commute'], emoji: '🚌' },
    { keywords: ['uber', 'lyft', 'taxi', 'ride'], emoji: '🚕' },

    // Food & Groceries
    { keywords: ['groceries', 'grocery', 'food', 'supermarket'], emoji: '🛒' },
    { keywords: ['restaurant', 'dining', 'eat out', 'takeout'], emoji: '🍽️' },
    { keywords: ['coffee', 'cafe', 'starbucks'], emoji: '☕' },
    { keywords: ['fast food', 'pizza', 'burger'], emoji: '🍕' },

    // Health & Wellness
    { keywords: ['health', 'medical', 'doctor', 'hospital'], emoji: '🏥' },
    { keywords: ['medicine', 'pharmacy', 'prescription', 'drug'], emoji: '💊' },
    { keywords: ['dental', 'dentist', 'teeth'], emoji: '🦷' },
    { keywords: ['gym', 'fitness', 'workout', 'exercise'], emoji: '🏋️' },
    { keywords: ['eye', 'vision', 'glasses', 'optician'], emoji: '👓' },

    // Insurance
    { keywords: ['insurance', 'life insurance'], emoji: '🛡️' },
    { keywords: ['car insurance', 'auto insurance'], emoji: '🚗' },
    { keywords: ['health insurance'], emoji: '🏥' },

    // Entertainment & Lifestyle
    { keywords: ['entertainment', 'fun', 'leisure'], emoji: '🎉' },
    { keywords: ['netflix', 'streaming', 'subscription', 'hulu', 'disney'], emoji: '📺' },
    { keywords: ['spotify', 'music', 'apple music'], emoji: '🎵' },
    { keywords: ['gaming', 'games', 'xbox', 'playstation', 'nintendo'], emoji: '🎮' },
    { keywords: ['movies', 'cinema', 'theater'], emoji: '🎬' },
    { keywords: ['books', 'reading', 'kindle'], emoji: '📚' },

    // Shopping & Personal
    { keywords: ['clothing', 'clothes', 'fashion', 'apparel'], emoji: '👗' },
    { keywords: ['shoes', 'footwear'], emoji: '👟' },
    { keywords: ['beauty', 'cosmetics', 'makeup'], emoji: '💄' },
    { keywords: ['hair', 'salon', 'barber', 'haircut'], emoji: '💇' },
    { keywords: ['shopping', 'misc', 'stuff'], emoji: '🛍️' },

    // Travel & Vacation
    { keywords: ['travel', 'vacation', 'holiday', 'trip'], emoji: '✈️' },
    { keywords: ['hotel', 'accommodation', 'airbnb'], emoji: '🏨' },
    { keywords: ['beach', 'resort'], emoji: '🏖️' },

    // Savings & Finance
    { keywords: ['savings', 'save', 'saving'], emoji: '💰' },
    { keywords: ['emergency', 'emergency fund', 'rainy day'], emoji: '☂️' },
    { keywords: ['retirement', '401k', 'ira', 'pension'], emoji: '📈' },
    { keywords: ['investment', 'invest', 'stocks'], emoji: '📊' },
    { keywords: ['debt', 'loan', 'credit card', 'payment'], emoji: '💳' },

    // Family & Kids
    { keywords: ['kids', 'children', 'child', 'baby'], emoji: '👶' },
    { keywords: ['education', 'school', 'tuition', 'college'], emoji: '🎓' },
    { keywords: ['daycare', 'childcare', 'babysitter'], emoji: '🧒' },

    // Pets
    { keywords: ['pet', 'dog', 'puppy'], emoji: '🐕' },
    { keywords: ['cat', 'kitten'], emoji: '🐱' },
    { keywords: ['vet', 'veterinary', 'animal'], emoji: '🏥' },

    // Gifts & Donations
    { keywords: ['gift', 'gifts', 'present', 'birthday'], emoji: '🎁' },
    { keywords: ['charity', 'donation', 'donate', 'giving', 'tithe'], emoji: '❤️' },

    // Personal Care
    { keywords: ['personal', 'self care', 'spa'], emoji: '🧘' },
    { keywords: ['alcohol', 'beer', 'wine', 'bar', 'drinks'], emoji: '🍺' },
];

// Get default emoji based on category name
export function getDefaultEmoji(categoryName: string): string {
    const nameLower = categoryName.toLowerCase();

    // Split category name into words for better matching
    const nameWords = nameLower.split(/[\s-_]+/);

    for (const mapping of emojiMappings) {
        for (const keyword of mapping.keywords) {
            // Check if the category name contains the keyword as a whole word or significant part
            // 1. Exact phrase match (for multi-word keywords like "credit card")
            if (nameLower.includes(keyword) && keyword.includes(' ')) {
                return mapping.emoji;
            }
            // 2. Exact word match
            if (nameWords.includes(keyword)) {
                return mapping.emoji;
            }
            // 3. Partial match only if keyword is long enough (avoid "fun" in "fund")
            if (keyword.length > 3 && nameLower.includes(keyword)) {
                return mapping.emoji;
            }
        }
    }

    // Default fallback emoji
    return '📋';
}

// Get emoji for a category (custom or default)
export function getCategoryDisplayEmoji(categoryName: string, customEmoji?: string): string {
    if (customEmoji) return customEmoji;
    return getDefaultEmoji(categoryName);
}

// Curated emoji list for manual selection
export const categoryEmojis = [
    // Needs - Essentials
    '🏠', '🏡', '🔌', '⚡', '💧', '🔥', '📱', '📞', '🌐', '🚗', '⛽', '🚌', '🚕', '🏥', '💊', '🦷', '👓', '🛒', '🥬', '🍎',
    // Wants - Lifestyle  
    '🎬', '🎮', '🎧', '🎵', '📺', '🍿', '🍕', '🍔', '🍜', '☕', '🍺', '🍷', '👗', '👟', '💄', '💇', '🏋️', '⚽', '🏖️', '✈️',
    // Savings & Finance
    '💰', '💵', '💳', '🏦', '📈', '📊', '🎯', '🎓', '👶', '🏨', '🚑', '🛡️', '☂️', '💎', '🎁', '🎉', '❤️', '🐕', '🐱', '🌱', '📚', '✨', '🛍️', '🍽️', '📋'
];
