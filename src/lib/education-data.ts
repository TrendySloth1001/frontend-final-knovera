/**
 * Comprehensive Education Data
 * Tags for specializations, qualifications, and interests across all fields
 */

export const SPECIALIZATIONS = [
  // STEM
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Information Technology',
  'Engineering',
  'Statistics',
  'Data Science',
  'Astronomy',
  'Environmental Science',
  'Geology',
  'Genetics',
  'Biotechnology',
  
  // Languages & Literature
  'English Literature',
  'Creative Writing',
  'Linguistics',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Japanese',
  'Arabic',
  'Hindi',
  'Portuguese',
  
  // Social Sciences
  'History',
  'Geography',
  'Political Science',
  'Sociology',
  'Anthropology',
  'Psychology',
  'Economics',
  'Philosophy',
  'International Relations',
  'Cultural Studies',
  
  // Arts & Design
  'Visual Arts',
  'Graphic Design',
  'Fine Arts',
  'Photography',
  'Film Studies',
  'Animation',
  'Interior Design',
  'Fashion Design',
  'Architecture',
  'Digital Arts',
  
  // Music & Performing Arts
  'Music Theory',
  'Vocal Music',
  'Instrumental Music',
  'Music Production',
  'Dance',
  'Theater',
  'Drama',
  'Acting',
  
  // Business & Finance
  'Business Administration',
  'Accounting',
  'Finance',
  'Marketing',
  'Management',
  'Entrepreneurship',
  'Human Resources',
  'Operations Management',
  'Supply Chain',
  'E-commerce',
  
  // Health & Medicine
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Nutrition',
  'Physical Therapy',
  'Public Health',
  'Mental Health',
  'Healthcare Administration',
  
  // Education
  'Early Childhood Education',
  'Elementary Education',
  'Secondary Education',
  'Special Education',
  'Educational Technology',
  'Curriculum Development',
  
  // Law & Government
  'Law',
  'Criminal Justice',
  'Public Policy',
  'Public Administration',
  
  // Other
  'Agriculture',
  'Sports Science',
  'Journalism',
  'Media Studies',
  'Communication',
  'Library Science',
  'Religious Studies',
  'Ethics',
];

export const QUALIFICATIONS = [
  // Degrees
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree (B.A.)',
  'Bachelor\'s Degree (B.Sc.)',
  'Bachelor\'s Degree (B.Com.)',
  'Bachelor of Education (B.Ed.)',
  'Bachelor of Engineering (B.E.)',
  'Bachelor of Technology (B.Tech.)',
  'Master\'s Degree (M.A.)',
  'Master\'s Degree (M.Sc.)',
  'Master\'s Degree (M.Com.)',
  'Master of Education (M.Ed.)',
  'Master of Business Administration (MBA)',
  'Master of Fine Arts (MFA)',
  'Master of Engineering (M.E.)',
  'Doctor of Philosophy (Ph.D.)',
  'Doctor of Education (Ed.D.)',
  'Juris Doctor (J.D.)',
  'Doctor of Medicine (M.D.)',
  
  // Certifications
  'Teaching Certificate',
  'Professional Certificate',
  'Diploma',
  'Advanced Diploma',
  'Postgraduate Diploma',
  'Industry Certification',
  'Online Certification',
  
  // Professional
  'Licensed Professional',
  'Board Certified',
  'Chartered Professional',
];

export const INTERESTS = [
  // STEM & Technology
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Cybersecurity',
  'Robotics',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Astronomy',
  'Engineering',
  'Electronics',
  'Programming',
  'Game Development',
  '3D Modeling',
  'Virtual Reality',
  
  // Arts & Creative
  'Drawing',
  'Painting',
  'Sculpture',
  'Photography',
  'Videography',
  'Graphic Design',
  'Digital Art',
  'Animation',
  'Fashion Design',
  'Interior Design',
  'Crafts',
  'Calligraphy',
  'Illustration',
  
  // Music & Performance
  'Music',
  'Singing',
  'Guitar',
  'Piano',
  'Drums',
  'Violin',
  'Music Production',
  'DJing',
  'Dancing',
  'Theater',
  'Acting',
  'Stand-up Comedy',
  'Magic',
  
  // Sports & Fitness
  'Football',
  'Basketball',
  'Cricket',
  'Tennis',
  'Swimming',
  'Running',
  'Cycling',
  'Yoga',
  'Martial Arts',
  'Gym & Fitness',
  'Hiking',
  'Rock Climbing',
  'Skateboarding',
  'Chess',
  'E-Sports',
  
  // Reading & Writing
  'Reading',
  'Creative Writing',
  'Poetry',
  'Blogging',
  'Journalism',
  'Content Writing',
  'Novel Writing',
  'Screenwriting',
  
  // Languages
  'Learning Languages',
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Mandarin',
  'Arabic',
  
  // Social & Humanities
  'History',
  'Geography',
  'Politics',
  'Philosophy',
  'Psychology',
  'Sociology',
  'Debate',
  'Public Speaking',
  'Volunteering',
  'Community Service',
  
  // Business & Finance
  'Entrepreneurship',
  'Stock Market',
  'Cryptocurrency',
  'Business Strategy',
  'Marketing',
  'Sales',
  'Real Estate',
  'Economics',
  
  // Lifestyle & Hobbies
  'Cooking',
  'Baking',
  'Gardening',
  'Travel',
  'Photography',
  'Bird Watching',
  'Collecting',
  'Puzzles',
  'Board Games',
  'Video Games',
  'Anime & Manga',
  'Movies',
  'TV Series',
  'Podcasts',
  
  // Science & Nature
  'Environmental Conservation',
  'Sustainability',
  'Wildlife',
  'Marine Biology',
  'Space Exploration',
  'Meteorology',
  
  // Other
  'Fashion',
  'Makeup & Beauty',
  'Home Improvement',
  'DIY Projects',
  'Meditation',
  'Mindfulness',
  'Astrology',
  'Car Mechanics',
  'Pet Care',
];

export type TagCategory = 'specializations' | 'qualifications' | 'interests';

export function getTagsByCategory(category: TagCategory): string[] {
  switch (category) {
    case 'specializations':
      return SPECIALIZATIONS;
    case 'qualifications':
      return QUALIFICATIONS;
    case 'interests':
      return INTERESTS;
    default:
      return [];
  }
}
