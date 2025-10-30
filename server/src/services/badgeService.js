const BADGE_LEVELS = [
  { threshold: 5, name: 'Bronze Mentor' },
  { threshold: 10, name: 'Silver Mentor' },
  { threshold: 20, name: 'Gold Mentor' },
  { threshold: 40, name: 'Platinum Connector' },
];

export function calculateBadges(sessionCount) {
  return BADGE_LEVELS.filter((badge) => sessionCount >= badge.threshold).map((badge) => badge.name);
}
