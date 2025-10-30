import { User } from '../models/User.js';

const toVector = (list = []) => new Set(list.map((item) => item.toLowerCase()));

const similarity = (source, target) => {
  if (!source.size && !target.size) return 0;
  let intersection = 0;
  target.forEach((value) => {
    if (source.has(value)) intersection += 1;
  });
  const union = source.size + target.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

export async function findMatches(userId, limit = 10) {
  const user = await User.findById(userId);
  if (!user) return [];
  const userSkills = toVector(user.skills);
  const userInterests = toVector(user.interests);

  const candidates = await User.find({ _id: { $ne: userId } }).select('-password');

  const scored = candidates
    .map((candidate) => {
      const candidateSkills = toVector(candidate.skills);
      const candidateInterests = toVector(candidate.interests);
      
      let teachScore = 0;
      userInterests.forEach((interest) => {
        if (candidateSkills.has(interest)) teachScore += 1;
      });
      
      let learnScore = 0;
      candidate.interests.forEach((candidateInterest) => {
        if (userSkills.has(candidateInterest.toLowerCase())) learnScore += 1;
      });
      
      const skillScore = similarity(userSkills, candidateSkills);
      const interestScore = similarity(userInterests, candidateInterests);
      const languageBoost = user.language && candidate.language && user.language === candidate.language ? 0.1 : 0;
      
      const matchScore = (teachScore * 0.4) + (learnScore * 0.4) + (skillScore * 0.1) + (interestScore * 0.1);
      const score = Math.min(matchScore + languageBoost, 1);
      
      return { candidate, score, teachScore, learnScore };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate, score, teachScore, learnScore }) => ({ 
      ...candidate.toObject(), 
      score,
      canTeachYou: teachScore > 0,
      youCanTeach: learnScore > 0
    }));

  return scored;
}
