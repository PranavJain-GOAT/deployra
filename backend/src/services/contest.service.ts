import axios from 'axios';
import logger from '../utils/logger';
import { Contest, ContestPlatform } from '../types';

// ─── Rich mock contests (always available as fallback) ───────────────────────
function makeMock(): Contest[] {
  const now = Date.now();
  const h = (n: number) => new Date(now + n * 3_600_000);
  return [
    { id: 'cf-960', name: 'Codeforces Round 960 (Div. 2)', platform: 'codeforces', url: 'https://codeforces.com/contest/1987', startTime: h(2), endTime: h(4), durationSeconds: 7200, isRegistered: false, reminderSet: false },
    { id: 'cf-961', name: 'Codeforces Round 961 (Div. 1+2)', platform: 'codeforces', url: 'https://codeforces.com/contest/1988', startTime: h(26), endTime: h(29), durationSeconds: 10800, isRegistered: false, reminderSet: false },
    { id: 'lc-401', name: 'LeetCode Weekly Contest 401', platform: 'leetcode', url: 'https://leetcode.com/contest/weekly-contest-401', startTime: h(18), endTime: h(19.5), durationSeconds: 5400, isRegistered: true, reminderSet: true },
    { id: 'lc-bi-130', name: 'LeetCode Biweekly Contest 130', platform: 'leetcode', url: 'https://leetcode.com/contest/biweekly-contest-130', startTime: h(42), endTime: h(43.5), durationSeconds: 5400, isRegistered: false, reminderSet: false },
    { id: 'cc-start142', name: 'CodeChef Starters 142 (Rated)', platform: 'codechef', url: 'https://www.codechef.com/START142', startTime: h(50), endTime: h(52), durationSeconds: 7200, isRegistered: false, reminderSet: false },
    { id: 'at-abc360', name: 'AtCoder Beginner Contest 360', platform: 'atcoder', url: 'https://atcoder.jp/contests/abc360', startTime: h(72), endTime: h(73.67), durationSeconds: 6000, isRegistered: false, reminderSet: false },
    { id: 'at-arc180', name: 'AtCoder Regular Contest 180', platform: 'atcoder', url: 'https://atcoder.jp/contests/arc180', startTime: h(96), endTime: h(98), durationSeconds: 7200, isRegistered: false, reminderSet: false },
    { id: 'cf-edu', name: 'Educational Codeforces Round 170', platform: 'codeforces', url: 'https://codeforces.com/contest/1989', startTime: h(120), endTime: h(122), durationSeconds: 7200, isRegistered: false, reminderSet: false },
  ];
}

// ─── Cache ───────────────────────────────────────────────────────────────────
let cache: Contest[] = [];
let lastFetch = 0;
const TTL = 5 * 60_000; // 5 min

// ─── Fetch from Codeforces public API ────────────────────────────────────────
async function fetchCodeforces(): Promise<Contest[]> {
  const { data } = await axios.get('https://codeforces.com/api/contest.list', {
    timeout: 6000,
    headers: { 'User-Agent': 'OmniPulse/1.0' },
  });
  if (data.status !== 'OK') return [];
  return (data.result as Array<{
    id: number; name: string; phase: string;
    startTimeSeconds: number; durationSeconds: number;
  }>)
    .filter(c => c.phase === 'BEFORE')
    .slice(0, 12)
    .map(c => ({
      id: `cf-${c.id}`,
      name: c.name,
      platform: 'codeforces' as ContestPlatform,
      url: `https://codeforces.com/contest/${c.id}`,
      startTime: new Date(c.startTimeSeconds * 1000),
      endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
      durationSeconds: c.durationSeconds,
      isRegistered: false,
      reminderSet: false,
    }));
}

// ─── Fetch from Kontests aggregator (LeetCode, CodeChef, AtCoder) ────────────
async function fetchKontests(slug: string, platform: ContestPlatform): Promise<Contest[]> {
  const { data } = await axios.get(`https://kontests.net/api/v1/${slug}`, {
    timeout: 6000,
    headers: { 'User-Agent': 'OmniPulse/1.0' },
  });
  return (data as Array<{
    name: string; url: string;
    start_time: string; end_time: string; duration: string;
  }>)
    .filter(c => new Date(c.start_time) > new Date())
    .slice(0, 6)
    .map((c, i) => ({
      id: `${platform}-k-${i}-${Date.now()}`,
      name: c.name,
      platform,
      url: c.url,
      startTime: new Date(c.start_time),
      endTime: new Date(c.end_time),
      durationSeconds: parseInt(c.duration) || 7200,
      isRegistered: false,
      reminderSet: false,
    }));
}

// ─── Main fetch with graceful fallback ───────────────────────────────────────
export async function fetchAllContests(): Promise<Contest[]> {
  if (cache.length > 0 && Date.now() - lastFetch < TTL) return cache;

  const results: Contest[] = [];
  const mock = makeMock();

  // Codeforces
  try {
    const cf = await fetchCodeforces();
    if (cf.length > 0) {
      results.push(...cf);
      logger.info(`Contests: fetched ${cf.length} from Codeforces`);
    } else {
      results.push(...mock.filter(m => m.platform === 'codeforces'));
    }
  } catch (e) {
    logger.warn(`Codeforces API failed: ${(e as Error).message} — using mock`);
    results.push(...mock.filter(m => m.platform === 'codeforces'));
  }

  // LeetCode via Kontests
  try {
    const lc = await fetchKontests('leet_code', 'leetcode');
    results.push(...(lc.length ? lc : mock.filter(m => m.platform === 'leetcode')));
    if (lc.length) logger.info(`Contests: fetched ${lc.length} from LeetCode`);
  } catch {
    results.push(...mock.filter(m => m.platform === 'leetcode'));
  }

  // CodeChef
  try {
    const cc = await fetchKontests('code_chef', 'codechef');
    results.push(...(cc.length ? cc : mock.filter(m => m.platform === 'codechef')));
  } catch {
    results.push(...mock.filter(m => m.platform === 'codechef'));
  }

  // AtCoder
  try {
    const at = await fetchKontests('at_coder', 'atcoder');
    results.push(...(at.length ? at : mock.filter(m => m.platform === 'atcoder')));
  } catch {
    results.push(...mock.filter(m => m.platform === 'atcoder'));
  }

  // Deduplicate by name
  const seen = new Set<string>();
  const unique = results.filter(c => {
    const key = `${c.platform}:${c.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort soonest first
  unique.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (unique.length > 0) {
    cache = unique;
    lastFetch = Date.now();
  }

  logger.info(`Contests total: ${unique.length}`);
  return unique.length > 0 ? unique : mock;
}

export async function getUpcomingContests(limit = 30): Promise<Contest[]> {
  const all = await fetchAllContests();
  const now = new Date();
  return all
    .filter(c => new Date(c.endTime) > now) // include live ones too
    .slice(0, limit);
}
