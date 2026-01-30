# NFL Mode v3-beta.6.3

## Table of Contents
- [TLDR: What Is This And What Do I Do?](#tldr-what-is-this-and-what-do-i-do)
- [Links: Balancer, Flowchart, PowerPoint, Script](#links-balancer-flowchart-powerpoint-script)
- [Overview: What Do I *Really* Need To Know?](#overview-what-do-i-really-need-to-know)
- [Comparison: What's The Difference?](#comparison-whats-the-difference)
- [Changelog: What Changed From v3.beta.5?](#changelog-what-changed-from-v3beta5)
- [Lineup: Away And Home, Captains, OPs, DPs](#lineup-away-and-home-captains-ops-dps)
- [Score: Check The (T)DIFF](#score-check-the-tdiff)
- [Ending: Mercy, Overtime, Tie(breakers)](#ending-mercy-overtime-tiebreakers)
- [Format: Best-Of-7, Round Robin, Knockouts](#format-best-of-7-round-robin-knockouts)
- [Manual: What Do I *Really* Do?](#manual-what-do-i-really-do)

## TLDR: What Is This And What Do I Do?
In very simple terms: *it's basically just T1-T4 vs T2-T3*
- If you're **just playing**: Join the right lobby, line up correctly, and click Ready. If you're confused about anything, you can (in order of priority):
    - Just play along. People often say this is a game mode best understood through playing, not reading
    - Try `/nfl help` or `/nfl whatIs` in the chat, or
    - Read the [PowerPoint](#links-balancer-flowchart-powerpoint-script)
- If you're **just watching**: Grab a bowl of popcorn before spectating the lobby of your choice.
- **Unless you have to, feel more than welcome to stop reading this guide here.** I promise you, unless you **really** have to, you **shouldn't** read the rest of this guide.
- If you're **hosting the tour** or **hosting a lobby** for your team, see [Manual: What Do I *Really* Do?](#manual-what-do-i-really-do).

## Links: Balancer, Flowchart, PowerPoint, Script
- [Link to the Balancer](https://github.com/Frittutisna/Balancer)
- [Link to the Flowchart](https://github.com/Frittutisna/NFL-Mode/blob/main/Flowchart/Flowchart.pdf)
- [Link to the PowerPoint](https://github.com/Frittutisna/NFL-Mode/blob/main/PowerPoint/PowerPoint.pdf)
- [Link to the Script](https://github.com/Frittutisna/NFL-Mode/blob/main/Script.js)

## Overview: What Do I *Really* Need To Know?
<table style="text-align:center">
    <tr>
        <th style="text-align:center"><strong>Phase</strong></th>
        <th style="text-align:center"><strong>Estimated Runtime</strong></th>
        <th style="text-align:center"><strong>Song Count</strong></th>
        <th style="text-align:center"><strong>Guess Time</strong></th>
        <th style="text-align:center"><strong>Difficulty</strong></th>
        <th style="text-align:center"><strong>Song Mix</strong></th>
        <th style="text-align:center"><strong>Code</strong></th>
    </tr>
    <tr>
        <td style="text-align:center">Regulation</td>
        <td style="text-align:center" rowspan="2">1 hour</td>
        <td style="text-align:center">11-20</td>
        <td style="text-align:center" rowspan="2">15</td>
        <td style="text-align:center" rowspan="2">0-40</td>
        <td style="text-align:center" rowspan="2">Watched with Random Rig Distribution</td>
        <td style="text-align:center" rowspan="2">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all">e0g0p21111100130p000011110000000p11111111111100f051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1ka03-11111--</code>
            </details>
        </td>
    </tr>
    <tr>
        <td style="text-align:center">Overtime</td>
        <td style="text-align:center">0-5</td>
    </tr>
</table>

## Comparison: What's The Difference?
<table>
    <thead>
        <tr>
            <th style="text-align:center" rowspan="2">Differences</th>
            <th style="text-align:center" rowspan="2">MLB</th>
            <th style="text-align:center" rowspan="2">NBA</th>
            <th style="text-align:center" colspan="2">NFL</th>
        </tr>
        <tr>
            <th style="text-align:center">Regulation</th>
            <th style="text-align:center">Overtime</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align:center">Estimated Runtime</td>
            <td style="text-align:center">2 hours</td>
            <td style="text-align:center">1.5 hours</td>
            <td style="text-align:center" colspan="2">1 hour</td>
        </tr>
        <tr>
            <td style="text-align:center">Song Count</td>
            <td style="text-align:center">16-30</td>
            <td style="text-align:center">12-40</td>
            <td style="text-align:center">11-20</td>
            <td style="text-align:center">0-5</td>
        </tr>
        <tr>
            <td style="text-align:center">Guess Time</td>
            <td style="text-align:center">20</td>
            <td style="text-align:center">10</td>
            <td style="text-align:center" colspan="2">15</td>
        </tr>
        <tr>
            <td style="text-align:center">Song Difficulty</td>
            <td style="text-align:center">0-100</td>
            <td style="text-align:center" colspan="3">0-40</td>
        </tr>
        <tr>
            <td style="text-align:center">Song Mix</td>
            <td style="text-align:center">Random</td>
            <td style="text-align:center" colspan="3" >Watched with Random Rig Distribution</td>
        </tr>
        <tr>
            <td style="text-align:center">DIFF</td>
            <td style="text-align:center" rowspan="4">Yes</td>
            <td style="text-align:center" rowspan="4">No</td>
            <td style="text-align:center" colspan="2">Yes</td>
        </tr>
        <tr>
            <td style="text-align:center">ODIFF</td>
            <td style="text-align:center" colspan="2" rowspan="7">No</td>
        </tr>
        <tr><td style="text-align:center">Base Running</td></tr>
        <tr><td style="text-align:center">Base Stealing</td></tr>
        <tr>
            <td style="text-align:center">Hot Streak</td>
            <td style="text-align:center" rowspan="6">No</td>
            <td style="text-align:center" rowspan="4">Yes</td>
        </tr>
        <tr><td style="text-align:center">Fast Break</td></tr>
        <tr><td style="text-align:center">Elam Ending</td></tr>
        <tr><td style="text-align:center">Buzzer Beater</td></tr>
        <tr>
            <td style="text-align:center">OP/DP Split</td>
            <td style="text-align:center" rowspan="5">No</td>
            <td style="text-align:center" colspan="2" rowspan="2">Yes</td>
        </tr>
        <tr><td style="text-align:center">Rouge</td></tr>
        <tr>
            <td style="text-align:center">Mercy Rule</td>
            <td style="text-align:center">Yes</td>
            <td style="text-align:center">Yes</td>
            <td style="text-align:center">No</td>
        </tr>
        <tr>
            <td style="text-align:center">Sudden Death</td>
            <td style="text-align:center" rowspan="2">No</td>
            <td style="text-align:center" rowspan="2">No</td>
            <td style="text-align:center" rowspan="2">Yes</td>
        </tr>
        <tr><td style="text-align:center">Tie</td></tr>
    </tbody>
</table>

## Changelog: What Changed From v3.beta.5
### Balancer Changes
- Clarified slot allocation for 8-player tours
- Implemented NFL-specific slot allocation
### Format Changes
- Reverted Song Count back to 20+5
- Removed pre-tour Captain team split
- Changed Last Tiebreaker to Possession Advantage
### Guide Changes
- Removed deprecated Captain section
- Reverted Code column from Overview
### Script Changes
- Removed deprecated `/nfl setCaptains`
- Removed redundant Captain bracket in HTML output
- Changed OP/DP-1/2 terminologies in HTML output to T1-4
- Added Win Probability message
- Added `/nfl setHost`
- Removed redundant responses from multiple script owners
- Fixed message trimming logic
- Added Win Probability graph to HTML output
- Split masking to include Y-masking from correct answers
- Added outcome subject to chat report
- Fixed directionality of probability fudging

## Lineup: Away And Home, Captains, OPs, DPs
The player with the highest (T1) and lowest (T4) **Watched** Elos of each team make up the **Offensive Players** (OPs). Their main role is to **score points** when their team has **possession**. To help with this, the T1 of each team is also designated as their **Captain**, which carries a **double multiplier** for their correct guesses. The other two players (T2 and T3) make up the **Defensive Players** (DPs). Their main role is to **prevent** the opposing OPs from scoring points when their team **doesn't have possession**. The team listed first (above) on Challonge is the **Away** team for each series. Line up as follows before each series: **Away** (Slots 1-4: T1, T4, T2, T3), then **Home** (Slots 5-8: T1, T4, T2, T3). There is **no need to swap** Slots between consecutive games; the Script does that **automatically**. 

## Score: Check The (T)DIFF
<details>
    <summary><b>Click to know more about Scoring</b></summary>
    <p>The <b>Away</b> team attacks (has <b>possession</b>) first. Possession <b>swaps</b> after every song <b>except</b> after an <code>Onside Kick</code>, and the Home team <b>must</b> have possession on Song 11. To calculate points, subtract the Defending team’s score from the Attacking team’s score. <b>TDIFF</b> counts <b>everyone</b> and is looked at first, while <b>DIFF</b> <b>only</b> counts Attacking team’s OPs and Defending team’s DPs.</p>
</details>

<table style="text-align:center">
    <tr>
        <th style="text-align:center"><strong>Result</strong></th>
        <th style="text-align:center"><strong>TDIFF</strong></th>
        <th style="text-align:center"><strong>DIFF</strong></th>
        <th style="text-align:center"><strong>Attacking</strong></th>
        <th style="text-align:center"><strong>Defending</strong></th>
        <th style="text-align:center"><strong>Possession</strong></th>
        <th style="text-align:center"><strong>Song OT1</strong></th>
    </tr>
    <tr>
        <td style="text-align:center"><code>Onside Kick</code></td>
        <td style="text-align:center">≥4</td>
        <td style="text-align:center">N/A</td>
        <td style="text-align:center">7</td>
        <td style="text-align:center" rowspan="4">N/A</td>
        <td style="text-align:center">Keep</td>
        <td style="text-align:center">Ends</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>TD + 2PC</code></td>
        <td style="text-align:center" rowspan="7">N/A</td>
        <td style="text-align:center">3</td>
        <td style="text-align:center">8</td>
        <td style="text-align:center" rowspan="8">Swap</td>
        <td style="text-align:center" rowspan="7">Continues</td>
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
        <td style="text-align:center" rowspan="2">0 or -1</td>
        <td style="text-align:center" colspan="2">1</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Punt</code></td>
        <td style="text-align:center" colspan="2">N/A</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Safety</code></td>
        <td style="text-align:center">-2</td>
        <td rowspan="3" style="text-align:center">N/A</td>
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
        <td style="text-align:center">Ends</td>
    </tr>
</table>

### Rouge: The Canadian Single
<details>
    <summary><b>Click to know more about Rouge</b></summary>
    <p>A <code>Rouge</code> (DIFF 0 or -1, 1 point) is awarded if a play that would have resulted in a <code>Punt</code> happened such that <b>≥1</b> player(s) from one team got the song right, but the other team missed it completely. This applies to both <b>Attacking</b> and <b>Defending</b> teams to reward solos (1/8s) and covers (2/8s), even if DIFF calculations would have stalled out with a <code>Punt</code>.</p>
</details>

## Ending: Mercy, Overtime, Tie(breakers)
Mercy Rule triggers if the trailing team can't catch with the songs left. If both teams are still tied after Regulation, the Script will automatically continue to 5-song **Overtime**. The **Away** team again has first possession. An `Onside Kick` from the Away team or a `House Call` from the Home team ends Overtime here. Otherwise, whoever scores next wins. If Overtime doesn’t resolve the tie, the game is called a **Tie**, unless breaking the tie is necessary (e.g., 3.0-3.0 series tie, Championship Games, Super Bowl). In which case, the following **Tiebreakers** will determine the winner (Tiebreakers 1-4 are determined solely from Overtime results):
1. Weighted Total (counting Captains twice)
2. Captains (Slots 1 vs 5)
3. T2s (Slots 3 vs 7)
4. T3s (Slots 4 vs 8)
5. Defending Team for Song 25

## Format: Best-Of-7, Round Robin, Knockouts
The script will automatically swap Away and Home teams between consecutive games.
- **For 2 teams**: Play a best-of-7. Whoever gets 4.0 points out of 7.0 wins.
- **For 4 teams**: Play a double round-robin. The top two teams advance to the **Super Bowl**.
- **For 6 teams**: Play a single round-robin. The top four teams advance to the **Championship Games**, then the winners advance to the **Super Bowl**.
- **For 8 teams**: Play a double round-robin in 2 conferences. The conference winners advance to the **Super Bowl**.

## Manual: What Do I *Really* Do?
### If you're hosting the tour:
- Open the tour signup prompt and ask for team requests and/or blacklists.
- After the player list has been settled, find the [Balancer](#links-balancer-flowchart-powerpoint-script) and follow the instructions there.
- If the tour has ≥4 teams, ask for 1 lobby host volunteer from each team.
- Read the [Format](#format-best-of-7-round-robin-knockouts) section and prepare the Challonge.
- Announce team compositions, as well as Challonge and lobby links.
- Note the results of each game in Challonge.
- If necessary, ping teams that advance to the **Championship Games** and/or **Super Bowl**.
- Announce the final results.

### If you're hosting a lobby for your team:
Install the [Script](#links-balancer-flowchart-powerpoint-script) (**only** the lobby host needs to install and operate the **Script**) on your browser through TamperMonkey, then do the following:
- Apply the **Regulation** setting code (see [Overview](#overview-those-long-setting-codes)).
- Invite the right players to the lobby, make sure they're lined up correctly (see [Lineup](#lineup-away-and-home-captains-ops-dps)), then type `/nfl howTo` and follow the instructions there.
- After everyone is ready, type `/nfl start` and start playing. If you started the game by mistake, type `/nfl resetGame`, return to lobby, then type `/nfl start` to restart.
- The Script will automatically download the **Scoresheet** after each Game. Open it on your browser, copy the top row, then paste it in `#game-reporting` with the Scoresheet and JSON.
- Repeat from Step 1 for a new lobby, from Step 2 for the same lobby and a new opponent, or from Step 3 for the same lobby and opponent.