# NFL Mode v3.beta.5.0

## Table of Contents
- [TLDR: What Is This And What Do I Do?](#tldr-what-is-this-and-what-do-i-do)
- [Links: Balancer, Flowchart, Script](#links-balancer-flowchart-script)
- [Overview: Those Long Setting Codes](#overview-those-long-setting-codes)
- [Comparison: What's The Difference?](#comparison-whats-the-difference)
- [Changelog: What Changed From v3.beta.4?](#changelog-what-changed-from-v3beta4)
- [Lineup: Away And Home, Captains, OPs, DPs](#lineup-away-and-home-captains-ops-dps)
- [Score: Check The (T)DIFF](#score-check-the-tdiff)
- [Ending: Mercy, Overtime, Tie(breakers)](#ending-mercy-overtime-tiebreakers)
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
- [Link to the Balancer](https://github.com/Frittutisna/Balancer)
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
        <td style="text-align:center">9-16</td>
        <td rowspan="2" style="text-align:center">15</td>
        <td style="text-align:center">0-40</td>
        <td style="text-align:center">Watched <strong>Random</strong></td>
        <td style="text-align:center">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all">e0g0g21111100130g000011110000000g11111111111100f051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1ka03-11111--</code>
            </details>
        </td>
    </tr>
    <tr>
        <td style="text-align:center">Overtime</td>
        <td style="text-align:center">1-4*</td>
        <td style="text-align:center">0-100</td>
        <td style="text-align:center">Random</td>
        <td style="text-align:center">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all;">e0g05211111001100000531110000000511111111111100f051o000000f11100k012r02i0a46533a11002s0111111111002s0111002s01a111111111102a11111111111hg1k903-11111--</code>
            </details>
        </td>
    </tr>
</table>

* Due to AMQ's minimum of 5 songs in each round, the script will automatically return to lobby after Song 4, ignoring Song 5

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
            <td style="text-align:center">12-24</td>
            <td style="text-align:center">9-16</td>
        </tr>
        <tr>
            <td style="text-align:center">Song Mix</td>
            <td style="text-align:center">Random</td>
            <td colspan="2" style="text-align:center">Watched <strong>Random</strong></td>
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
            <td rowspan="6" style="text-align:center"><b>OT</b></td>
            <td style="text-align:center">Song Count</td>
            <td style="text-align:center">8</td>
            <td style="text-align:center">3-6</td>
            <td style="text-align:center">1-4</td>
        </tr>
        <tr>
            <td style="text-align:center">Song Mix</td>
            <td style="text-align:center">Random</td>
            <td style="text-align:center">Watched <strong>Random</strong></td>
            <td style="text-align:center">Random</td>
        </tr>
        <tr>
            <td style="text-align:center">Sudden Death</td>
            <td rowspan="2" style="text-align:center">No</td>
            <td rowspan="2" style="text-align:center">No</td>
            <td rowspan="2" style="text-align:center">Yes</td>
        </tr>
        <tr><td style="text-align:center">Tie</td></tr>
        <tr>
            <td style="text-align:center">Last Tiebreaker</td>
            <td colspan="2" style="text-align:center">Home</td>
            <td style="text-align:center">Away</td>
        </tr>
        <tr>
            <td style="text-align:center">Runner on 2nd, 1 Out</td>
            <td style="text-align:center">Yes</td>
            <td colspan="2" style="text-align:center">No</td>
        </tr>
    </tbody>
</table>

## Changelog: What Changed From v3.beta.4
### Balancer Change
- Moved Balancer to separate [repository](https://github.com/Frittutisna/Balancer)
### Format Change
- Changed Regulation Song Mix from Watched Equal to Watched **Random**
### Guide Changes
- Clarified Overtime triggers
- Clarified team split delegation
### Script Change
- Fixed `/nfl help` response not visible in public chat

## Lineup: Away And Home, Captains, OPs, DPs
**Captains** (player with the highest Watched Elo) split their teams into 2 Offensive (OP) and 2 Defensive (DP) players. 
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

## Ending: Mercy, Overtime, Tie(breakers)
Mercy Rule triggers if the trailing team can't catch with the songs left. 
If both teams are still tied after Regulation, continue to 4-song **Overtime**. 
The **Away** team again has first possession. 
An `Onside Kick` from the Away team or a `House Call` from the Home team ends Overtime here. 
Otherwise, after both teams have **≥1** possession(s) each, whoever has more points wins. 
If Overtime doesn’t resolve the tie, 
the game is called a **Tie unless** breaking the tie is necessary 
(e.g., 3.0-3.0 series tie, Championship Game, Super Bowl). 
In which case, the following **Tiebreakers** will determine the winner 
(Tiebreakers 1-4 are determined solely from Overtime results):
1. Weighted Total Correct (counting Captains twice)
2. Captains
3. Non-Captain OP/DP-1s (if the Captains were 17, look for 35)
4. Cross OP/DP-2s (if 17 then 46)
5. Away Team (to account for the Home team's knowledge advantage in Songs 2 and 4)

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
- Type `/nfl start` and start playing. If you started the game by mistake, type `/nfl resetGame`, return to lobby, then type `/nfl start` to restart.
- If it's tied after Regulation, apply the **Overtime** setting code (see [Overview](#overview-those-long-setting-codes)), then start playing after everyone is ready. If you started Overtime by mistake, type `/nfl resetOvertime`, return to lobby, then type `/nfl start` to restart Overtime.
- Type `/nfl export` to download the **Scoresheet**, open it on your browser, and copy the top row.
- Paste it in `#game-reporting` with the Scoresheet and JSON(s) (Regulation and Overtime if necessary).
- Repeat from Step 1 for the next game.

### If you're the Captain of your team:
- **Split** your team into 2 Offensive (OPs) and 2 Defensive (DPs) Players.
    - **OPs'** main role is to **score** points when your team has possession.
    - **DPs'** main role is to **prevent** the opposing OPs from scoring points when your team doesn't have possession.
    - You **may delegate** the team split to **your teammate** or the **tour host**.
        - Delegating team split does not also delegate the Captain role/multiplier
        - You **relinquish** your right to reject the team split offered by the tour host. If your team failed to submit the team split in time, the tour host will split your team as they see fit.
- Mention the **tour host** in `#tour-general` with the format `@[Tour Host] [Team Name]: OP1, OP2, DP1, DP2` (e.g., `@HakoHoka Steelers: florenz, chommy, miiarad (C), HakoHoka`).