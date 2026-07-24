import { Request, Response } from 'express';
import { getUpcomingContests } from '../services/contest.service';

export async function getContests(req: Request, res: Response) {
  try {
    const contests = await getUpcomingContests(30);
    res.json({ success: true, data: contests, count: contests.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch contests' });
  }
}

export async function getContestsByPlatform(req: Request, res: Response) {
  try {
    const { platform } = req.params;
    const all = await getUpcomingContests(30);
    const filtered = all.filter(c => c.platform === platform);
    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch contests' });
  }
}
