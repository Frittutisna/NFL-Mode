# NFL Mode v3.beta.3.3

## Table of Contents
- [TLDR: What Is This And What Do I Do?](#tldr-what-is-this-and-what-do-i-do)
- [Links: Balancer, Flowchart, Script](#links-balancer-flowchart-script)
- [Overview: Those Long Setting Codes](#overview-those-long-setting-codes)
- [Comparison: What's The Difference?](#comparison-whats-the-difference)
- [Changelog: What Changed From v3.beta.2?](#changelog-what-changed-from-v3beta2)
- [Lineup: Away And Home, Captains, OPs, DPs](#lineup-away-and-home-captains-ops-dps)
- [Score: Check The (T)DIFF](#score-check-the-tdiff)
- [Ending: Mercy, Overtime, Tie](#ending-mercy-overtime-tie)
- [Format: Best-Of-7, Round Robin, Knockouts](#format-best-of-7-round-robin-knockouts)
- [Manual: What Do I *Really* Do?](#manual-what-do-i-really-do)

## TLDR: What Is This And What Do I Do?
This is an oversimplifcation of things, but *it's basically just swapping 2v2 Eru Modes in a 4v4 setting*.
- If you're **just playing**: Join the right lobby, line up correctly, and click Ready. If you're confused about anything, you can (in order of priority):
    - Just play along. People often say this is a game mode best understood through playing, not reading
    - Try `/nfl help` or `/nfl whatIs` in the chat, or
    - Read further
- If you're **just watching**: Grab a bowl of popcorn before spectating the lobby of your choice.
- **Unless you have to, feel more than welcome to stop reading this guide here.** I promise you, unless you **really** have to, you **shouldn't** read the rest of this guide.
- If you're **hosting the tour**, **hosting a lobby** for your team, or the **Captain** (you have the highest **Watched Elo**) of your team, see [Manual: What Do I *Really* Do?](#manual-what-do-i-really-do).

## Links: Balancer, Flowchart, Script
- [Link to the Balancer](https://github.com/Frittutisna/NFL-Mode/blob/main/Balancer/Balancer.py)
- [Link to the Flowchart](https://github.com/Frittutisna/NFL-Mode/blob/main/Flowchart/Flowchart.pdf)
- [Link to the Script](https://github.com/Frittutisna/NFL-Mode/blob/main/Script.js)

## Overview: Those Long Setting Codes
<table style="text-align:center">
    <tr>
        <th style="text-align:center"><strong>Phase</strong></th>
        <th style="text-align:center"><strong>Song Count</strong></th>
        <th style="text-align:center"><strong>Guess Time</strong></th>
        <th style="text-align:center"><strong>Difficulty</strong></th>
        <th style="text-align:center"><strong>Song Mix</strong></th>
        <th style="text-align:center"><strong>Code</strong></th>
    </tr>
    <tr>
        <td style="text-align:center">Regulation</td>
        <td style="text-align:center">16</td>
        <td rowspan="2" style="text-align:center">15</td>
        <td style="text-align:center">0 - 40</td>
        <td style="text-align:center">Watched Equal</td>
        <td style="text-align:center">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all">e0g0g21111100130g000031110000000g11111111111100f051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1k903-11111--</code>
            </details>
        </td>
    </tr>
    <tr>
        <td style="text-align:center">Overtime</td>
        <td style="text-align:center">4*</td>
        <td style="text-align:center">0 - 100</td>
        <td style="text-align:center">Random</td>
        <td style="text-align:center">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all;">e0g05211111001100000531110000000511111111111100f051o000000f11100k012r02i0a46533a11002s0111111111002s0111002s01a111111111102a11111111111hg1k903-11111--</code>
            </details>
        </td>
    </tr>
</table>

* Due to AMQ's minimum of 5 songs in each round, the script will automatically return to lobby in a Knockout Overtime tie to restart Overtime, ignoring Song 5

## Comparison: What's The Difference?
<table>
    <thead>
        <tr>
            <th style="text-align:center">Phase</th>
            <th style="text-align:center">Differences</th>
            <th style="text-align:center">MLB</th>
            <th style="text-align:center">NBA</th>
            <th style="text-align:center">NFL</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="11" style="text-align:center"><b>BOTH</b></td>
            <td style="text-align:center">Guess Time</td>
            <td style="text-align:center">20</td>
            <td style="text-align:center">10</td>
            <td style="text-align:center">15</td>
        </tr>
        <tr>
            <td style="text-align:center">OP/DP Split</td>
            <td style="text-align:center">No</td>
            <td rowspan="3" style="text-align:center">No</td>
            <td rowspan="5" style="text-align:center">Yes</td>
        </tr>
        <tr>
            <td style="text-align:center">DIFF</td>
            <td rowspan="3" style="text-align:center">Yes</td>
        </tr>
        <tr><td style="text-align:center">ODIFF</td></tr>
        <tr>
            <td style="text-align:center">TDIFF</td>
            <td style="text-align:center">Yes</td>
        </tr>
        <tr>
            <td style="text-align:center">Rouge</td>
            <td rowspan="5" style="text-align:center">No</td>
            <td style="text-align:center">No</td>
        </tr>
        <tr>
            <td style="text-align:center">Hot Streak</td>
            <td rowspan="4" style="text-align:center">Yes</td>
            <td rowspan="5" style="text-align:center">No</td>
        </tr>
        <tr><td style="text-align:center">Fast Break</td></tr>
        <tr><td style="text-align:center">Buzzer Beater</td></tr>
        <tr><td style="text-align:center">Elam Ending</td></tr>
        <tr>
            <td style="text-align:center">Base Running</td>
            <td style="text-align:center">Yes</td>
            <td style="text-align:center">No</td>
        </tr>
        <tr>
            <td rowspan="4" style="text-align:center"><b>REG</b></td>
            <td style="text-align:center">Song Count</td>
            <td style="text-align:center">32</td>
            <td style="text-align:center">24</td>
            <td style="text-align:center">16</td>
        </tr>
        <tr>
            <td style="text-align:center">Song Mix</td>
            <td style="text-align:center">Random</td>
            <td colspan="2" style="text-align:center">Watched Equal</td>
        </tr>
        <tr>
            <td style="text-align:center">Song Difficulty</td>
            <td style="text-align:center">0-100</td>
            <td colspan="2" style="text-align:center">0-40</td>
        </tr>
        <tr>
            <td style="text-align:center">Mercy Rule</td>
            <td colspan="2" style="text-align:center">No</td>
            <td style="text-align:center">Yes</td>
        </tr>
        <tr>
            <td rowspan="5" style="text-align:center"><b>OT</b></td>
            <td style="text-align:center">Song Count</td>
            <td style="text-align:center">8</td>
            <td style="text-align:center">6</td>
            <td style="text-align:center">4</td>
        </tr>
        <tr>
            <td style="text-align:center">Sudden Death</td>
            <td rowspan="2" style="text-align:center">No</td>
            <td rowspan="3" style="text-align:center">No</td>
            <td rowspan="2" style="text-align:center">Yes</td>
        </tr>
        <tr><td style="text-align:center">Tie</td></tr>
        <tr>
            <td style="text-align:center">Runner on 2nd, 1 Out</td>
            <td style="text-align:center">Yes</td>
            <td style="text-align:center">No</td>
        </tr>
    </tbody>
</table>

## Changelog: What Changed From v3.beta.2?
### Balancer Changes
- Fully deprecated Balancer on Sheets
- Moved and adapted instructions to Balancer on Python
- Reduced first team bias
- Implemented best-of-1,000 random simulations
- Adapted for MLB/NBA/NFL Modes and normal tours
### Flowchart Changes
- Added Song R9 rule
- Color-coded for better visibility
- Unified Attacking and Defending `Rouges`
- Changed Song OT1 Sudden Death win conditions
- Clarified and unified song identifiers
- Added `Next song` box for clarity
### Format Changes
- Reduced song count from 20/5 to 16/4
- Reduced guess time from 20 to 15 seconds
- Home team has possession in Song 9 regardless of game conditions
- Limited Captains to OP1/DP1
- Changed Overtime Song 1 win conditions to `Onside Kick` for the Attacking team or `House Call` for the Defending team
### Guide Changes
- Updated TLDR to account for public informational commands
- Split `Song Mix` in [Overview](#overview-those-long-setting-codes) into `Song Count` and `Song Mix`
- Added `Guess Time` to [Overview](#overview-those-long-setting-codes)
- Added [Comparison](#comparison-whats-the-difference) section
- Added detail about AMQ minimum song count
- Updated setting codes
- Clarified OP1/DP1 Captain requirement
- Clarified team split delegation
### Script Changes
- Simplified Mercy Rule lookup to only the song ahead
- Rejected `/nfl start` to start Overtime except after resets
- Added possession arrows to chat messages for better visibility (e.g., `Tour: ← Steelers - Ravens →`)
- Removed redundant `Possession: [Team]` messages
- Opened `nfl [export/flowchart/guide/help/whatIs]` to everyone
- Automatically set lobby name to match `/nfl setTeams`
- Simplified `[Team] only needs [Outcome] to tie ...` messages in Overtime
- Implemented automatic setting code changes to switch between Regulation and Overtime
- Fixed HTML output logic on series-ending Game
### Other Changes
- Fixed broken [v3.beta.2](https://github.com/Frittutisna/NFL-Mode/blob/main/Archive/Guide%20v3.beta.2.md) and re-implemented all changes

## Lineup: Away And Home, Captains, OPs, DPs
**Captains** (player with the highest Watched Elo in each team) split their teams into 2 Offensive (OP) and 2 Defensive (DP) players. 
Captains must be OP1 or DP1, and their correct guesses count **double** (2 points) for the (T)DIFF calculations. 
The team listed first (above) on Challonge is the **Away** team. 
Line up as follows: **Away** (1-4: OP1, OP2, DP1, DP2), then **Home** (5-8: OP1, OP2, DP1, DP2).

## Score: Check The (T)DIFF
<details>
    <summary><b>Click to know more about Scoring</b></summary>
    <p>The <b>Away</b> team attacks (has <b>possession</b>) first. 
    Possession swaps after every song except after an <code>Onside Kick</code>, 
    and the Home team <b>must</b> have possession on Song 9. 
    To calculate points, subtract the Defending team’s score from the Attacking team’s score.
    <b>TDIFF</b> counts <b>everyone</b> and is looked at first, 
    while <b>DIFF</b> <b>only</b> counts Attacking team’s OPs and Defending team’s DPs.</p>
</details>

<table style="text-align:center">
    <tr>
        <th style="text-align:center"><strong>Result</strong></th>
        <th style="text-align:center"><strong>TDIFF</strong></th>
        <th style="text-align:center"><strong>DIFF</strong></th>
        <th style="text-align:center"><strong>Attacking</strong></th>
        <th style="text-align:center"><strong>Defending</strong></th>
        <th style="text-align:center"><strong>Possession</strong></th>
        <th style="text-align:center"><strong>Overtime Song 1</strong></th>
    </tr>
    <tr>
        <td style="text-align:center"><code>Onside Kick</code></td>
        <td style="text-align:center">≥4</td>
        <td style="text-align:center">N/A</td>
        <td style="text-align:center">7</td>
        <td rowspan="4" style="text-align:center">N/A</td>
        <td style="text-align:center">Keep</td>
        <td style="text-align:center">Attacking Wins</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>TD + 2PC</code></td>
        <td rowspan="7" style="text-align:center">N/A</td>
        <td style="text-align:center">3</td>
        <td style="text-align:center">8</td>
        <td rowspan="8" style="text-align:center">Swap</td>
        <td rowspan="7" style="text-align:center">Continues</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Touchdown</code></td>
        <td style="text-align:center">2</td>
        <td style="text-align:center">7</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Field Goal</code></td>
        <td style="text-align:center">1</td>
        <td style="text-align:center">3</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Rouge</code></td>
        <td rowspan="2" style="text-align:center">0 or -1</td>
        <td colspan="2" style="text-align:center">1</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Punt</code></td>
        <td rowspan="4" style="text-align:center">N/A</td>
        <td style="text-align:center">N/A</td> 
    </tr>
    <tr>
        <td style="text-align:center"><code>Safety</code></td>
        <td style="text-align:center">-2</td>
        <td style="text-align:center">2</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Pick Six</code></td>
        <td style="text-align:center">-3</td>
        <td style="text-align:center">6</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>House Call</code></td>
        <td style="text-align:center">≤-4</td>
        <td style="text-align:center">N/A</td>
        <td style="text-align:center">7</td>
        <td style="text-align:center">Defending Wins</td>
    </tr>
</table>

### Rouge: The Canadian Single
<details>
    <summary><b>Click to know more about Rouge</b></summary>
    <p>A <code>Rouge</code> (DIFF 0 or -1, 1 point) is awarded if 
    a play that would have resulted in a <code>Punt</code> 
    happened such that <b>≥1</b> player(s) from one team got the song right,
    but the other team missed it completely.
    This applies to both <b>Attacking</b> and <b>Defending</b> teams to reward <i>erigs</i> and covers,
    even if DIFF calculations would have stalled out with a <code>Punt</code>.</p>
</details>

## Ending: Mercy, Overtime, Tie
Mercy Rule triggers if the trailing team can't catch with the songs left. 
If both teams are still tied after Regulation, continue to **Overtime**. 
The **Away** team again has first possession. 
An `Onside Kick` from the Away team or a `House Call` from the Home team ends Overtime here. 
Otherwise, after both teams have **≥1** possession(s) each, whoever has more points wins. 
If Overtime doesn’t resolve the tie, the game is called a **Tie**, 
unless it's the **Championship Games** or the **Super Bowl**, 
in which case Overtime **repeats** until a winner is found. 
Overtime will be **reset and restarted** as necessary.

## Format: Best-Of-7, Round Robin, Knockouts
The script will automatically swap Away and Home teams between consecutive games.
- **For 2 teams**: Play a best-of-7. Whoever gets 4.0 points out of 7.0 wins.
- **For 4 teams**: Play a double round-robin. The top two teams advance to the **Super Bowl**.
- **For 6 teams**: Play a single round-robin. The top four teams advance to the **Championship Games**, then the winners advance to the **Super Bowl**.
- **For 8 teams**: Play a double round-robin in 2 conferences. The conference winners advance to the **Super Bowl**.

## Manual: What Do I *Really* Do?
### If you're hosting the tour:
- Open the tour signup prompt and ask for team requests and/or blacklists.
- After the player list has been settled, find the [Balancer](#links-balancer-flowchart-script) and follow the instructions there.
- If the tour has ≥4 teams, ask for 1 lobby host volunteer from each team.
- Read the [Format](#format-best-of-7-round-robin-knockouts) section and prepare the Challonge.
- After the team split has been settled, announce team compositions and the Challonge link.
- Note the results of each game in Challonge.
- If necessary, ping teams that advance to the **Championship Games** and/or **Super Bowl**.
- Announce the final results.

### If you're hosting a lobby for your team:
Install the [Script](#links-balancer-flowchart-script) (**only** the lobby host needs to install and operate the **Script**) on your browser through TamperMonkey, then do the following:
- Apply the **Regulation** setting code (see [Overview](#overview-those-long-setting-codes)).
- Invite the right players to the lobby, and make sure they're lined up correctly (see [Lineup](#lineup-away-and-home-captains-ops-dps)).
- After everyone is ready, type `/nfl howTo` and follow the instructions there.
- Type `/nfl start` and start playing.
    - If you started the game by mistake, type `/nfl resetGame`, return to lobby, then type `/nfl start` to restart.
    - Pause the game at the start of the next Song when the `Mercy rule trigger warning next Song!` message comes up. If it didn't trigger, the script will resume the game for you. If it triggered, the game will automatically start the vote to return to lobby.
- If it's tied after Regulation:
    - Apply the **Overtime** setting code (see [Overview](#overview-those-long-setting-codes)).
    - Start playing after everyone is ready (**No need to type `/nfl start` to start Overtime unless you reset/repeat**).
    - If you started Overtime by mistake, type `/nfl resetOvertime`, return to lobby, then type `/nfl start` to restart Overtime.
    - When the Winner has been decided through Sudden Death, the game will automatically start the vote to return to lobby.
    - If you need to repeat Overtime, type `/nfl start` after everyone is ready.
- Type `/nfl export` to download the **Scoresheet**.
- Open the Scoresheet and copy the top row.
- Paste it in `#game-reporting` with the Scoresheet and JSON(s) (Regulation and **the last** Overtime, if necessary).
- Repeat from Step 1 for the next game.

### If you're the Captain of your team:
- **Split** your team into 2 Offensive (OPs) and 2 Defensive (DPs) Players.
    - **OPs'** main role is to **score** points when your team has possession.
    - **DPs'** main role is to **prevent** the opposing OPs from scoring points when your team doesn't have possession.
    - You **may delegate** the team split to the **tour host**, but you **relinquish** your right to reject the team split offered.
- Mention the **tour host** in `#tour-general` with the format `@[Tour Host] [Team Name]: OP1, OP2, DP1, DP2` (e.g., `@HakoHoka Steelers: florenz, chommy, miiarad (C), HakoHoka`).