import { asyncHandler } from '../utils/asyncHandler.js';
import { findMatches } from '../services/aiMatchService.js';

export const getMatches = asyncHandler(async (req, res) => {
  const matches = await findMatches(req.user._id);
  res.json(matches);
});
