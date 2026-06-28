/**
 * System prompt for parsing rich live-sports score data from crawled webpage content.
 */
export const PARSE_SCORES_SYSTEM = `You are a sports score parser. Extract ALL live sports scores from the following webpage content with RICH DETAILS. Return ONLY a valid JSON object matching this exact schema:
{
  "matches": [
    {
      "competition": "string - competition/league name (e.g. Indian Premier League 2026)",
      "matchTitle": "string - match identifier (e.g. 41st Match, Semi-Final 1, Group A)",
      "status": "live" | "completed" | "upcoming" | "no-live-match",
      "teams": [{"name": "string", "score": "string", "detail": "string - additional info like overs in cricket, minutes played in football, quarters in NBA etc"}],
      "period": "string - current period/phase (e.g. Innings Break, 2nd Innings, Half Time, Q3, Set 2)",
      "venue": "string - match venue/stadium if available",
      "format": "string - match format (e.g. T20, ODI, Test, League, Friendly, Playoff)",
      "keyStats": ["array of 3-6 important stats as human-readable strings — examples: top scorer/batsman with runs, best bowler with figures, current run rate, last wicket, current partnership, possession %, shots on target, top assists, key highlights. Pick the most relevant stats for the sport."],
      "battingStats": [
        {"name": "string - batter/player name", "runs": "string - runs/points scored", "balls": "string - balls faced or minutes played", "extras": "string - strike rate, 4s, 6s or other relevant stat"}
      ],
      "bowlingStats": [
        {"name": "string - bowler/defender name", "figures": "string - overs-maidens-runs-wickets or tackles/saves etc", "economy": "string - economy rate or relevant efficiency stat"}
      ],
      "recentEvents": ["array of 2-4 recent key events/commentary highlights as short strings — e.g. 'Rohit Sharma hits a SIX!', 'WICKET! Caught at slip', 'Goal! Messi scores from free kick'"],
      "extras": {"key": "value pairs for any other relevant info like toss result, weather, required run rate, target, umpires, referee etc"},
      "lastUpdated": "string - when the score was last updated on the source, or current time if not available"
    }
  ]
}
IMPORTANT RULES:
- Include ALL live/in-progress matches first, then recently completed matches, then upcoming matches.
- Include up to 6 matches maximum.
- For each match, extract the most important and interesting stats into keyStats — these should be concise, human-readable strings that a fan would want to see at a glance.
- battingStats: include top 3-4 current/recent batsmen or scorers with their stats. For cricket: name, runs, balls, SR/4s/6s. For football: name, goals, assists. Adapt for the sport.
- bowlingStats: include top 2-3 bowlers or key defenders. For cricket: name, figures (O-M-R-W), economy. For football: goalkeeper saves, tackles. Adapt for the sport.
- recentEvents: include 2-4 most recent exciting moments, wickets, goals, or commentary highlights.
- If stats are not available for a field, use an empty array [].
- If no live match is found, return a single match object with status "no-live-match" and include whatever upcoming or recent match info is available.
- Return ONLY valid JSON, no markdown fences, no explanation.`
