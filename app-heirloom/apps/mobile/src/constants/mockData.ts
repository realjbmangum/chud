// Mock data for UI development
export const MOCK_PROMPTS = [
  { id: '1', text: 'What is your favorite childhood memory?', category: 'childhood' },
  { id: '2', text: 'What was the best advice you ever received?', category: 'legacy' },
  { id: '3', text: 'How did you meet your spouse?', category: 'family' },
  { id: '4', text: 'What traditions did your family have?', category: 'family' },
  { id: '5', text: 'What are you most proud of in your career?', category: 'career' },
];

export const MOCK_STORIES = [
  {
    id: '1',
    title: 'Summer at Grandma\'s House',
    category: 'childhood',
    mediaType: 'video',
    duration: 245,
    thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400',
    createdAt: '2025-11-28',
    createdBy: { name: 'Mom', avatar: null },
  },
  {
    id: '2',
    title: 'Dad\'s First Car',
    category: 'legacy',
    mediaType: 'audio',
    duration: 180,
    thumbnail: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
    createdAt: '2025-11-25',
    createdBy: { name: 'Dad', avatar: null },
  },
  {
    id: '3',
    title: 'Our Wedding Day',
    category: 'family',
    mediaType: 'video',
    duration: 420,
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    createdAt: '2025-11-20',
    createdBy: { name: 'Mom', avatar: null },
  },
  {
    id: '4',
    title: 'Starting My Business',
    category: 'career',
    mediaType: 'audio',
    duration: 312,
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
    createdAt: '2025-11-15',
    createdBy: { name: 'Dad', avatar: null },
  },
  {
    id: '5',
    title: 'Christmas 1985',
    category: 'childhood',
    mediaType: 'video',
    duration: 156,
    thumbnail: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400',
    createdAt: '2025-11-10',
    createdBy: { name: 'Grandma', avatar: null },
  },
];

export const MOCK_FAMILY_STORIES = [
  {
    id: '6',
    title: 'How We Met',
    category: 'family',
    mediaType: 'video',
    duration: 380,
    thumbnail: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=400',
    createdAt: '2025-11-29',
    createdBy: { name: 'Grandpa Joe', avatar: null },
  },
  {
    id: '7',
    title: 'Life Lessons',
    category: 'legacy',
    mediaType: 'audio',
    duration: 560,
    thumbnail: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400',
    createdAt: '2025-11-27',
    createdBy: { name: 'Grandma Rose', avatar: null },
  },
  {
    id: '8',
    title: 'The Farm Years',
    category: 'childhood',
    mediaType: 'video',
    duration: 290,
    thumbnail: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400',
    createdAt: '2025-11-22',
    createdBy: { name: 'Uncle Mike', avatar: null },
  },
];

export const MOCK_TIME_CAPSULES = [
  {
    id: '1',
    title: 'For Sarah\'s 18th Birthday',
    releaseAt: '2028-06-15',
    recipientCount: 1,
    storyCount: 5,
  },
  {
    id: '2',
    title: 'Anniversary Memories',
    releaseAt: '2026-09-20',
    recipientCount: 2,
    storyCount: 3,
  },
];

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    childhood: '#91A8C0',
    career: '#C4A464',
    family: '#0C3B2E',
    faith: '#7B6BA8',
    legacy: '#A67B5B',
    general: '#6B7280',
  };
  return colors[category] || colors.general;
};
