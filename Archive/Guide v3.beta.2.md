# NFL Mode v3.beta.2

## Table of Contents
- [TLDR: What Do I Do?](#tldr-what-do-i-do)
- [Links: Balancer, Flowchart, Script](#links-balancer-flowchart-script)
- [Overview: Those Long Setting Codes](#overview-those-long-setting-codes)
- [Changelog: What Changed From v3.beta.1?](#changelog-what-changed-from-v3beta1)
- [Lineup: Away and Home, Captains, OPs, DPs](#lineup-away-and-home-captains-ops-dps)
- [Score: Check the (T)DIFF](#score-check-the-tdiff)
- [Ending: Mercy, Overtime, Tie](#ending-mercy-overtime-tie)
- [Format: Best-of-7, Round Robin, Knockouts](#format-best-of-7-round-robin-knockouts)
- [Manual: What Do I *Really* Do?](#manual-what-do-i-really-do)

## TLDR: What Do I Do?
- If you're **just playing**: Join the right lobby, line up correctly, and click Ready. If you're confused about anything, you can (in order of priority):
    - Just play along. People often say this is a game mode best understood through playing, not reading
    - Ask the lobby host to enter `/nfl whatIs [Term]` for you
    - **Download** the [Flowchart](#links-balancer-flowchart-script) (since it might not render correctly on GitHub), or
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
        <th style="text-align:center"><strong>Difficulty</strong></th>
        <th style="text-align:center"><strong>Song Mix</strong></th>
        <th style="text-align:center"><strong>Code</strong></th>
    </tr>
    <tr>
        <td style="text-align:center">Regulation</td>
        <td style="text-align:center">0 - 40</td>
        <td style="text-align:center">20 Watched Equal</td>
        <td style="text-align:center">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all">e0g0k21111100130k000031110000000k11111111111100k051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1k903-11111--</code>
            </details>
        </td>
    </tr>
    <tr>
        <td style="text-align:center">Overtime</td>
        <td style="text-align:center">0 - 100</td>
        <td style="text-align:center">5 Random</td>
        <td style="text-align:center">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all;">e0g05211111001100000531110000000511111111111100k051o000000f11100k012r02i0a46533a11002s0111111111002s0111002s01a111111111102a11111111111hg1k903-11111--</code>
            </details>
        </td>
    </tr>
</table>

## Changelog: What Changed From v3.beta.1?
### Balancer Changes
- Created platform-agnostic Python script for Balancer
- Changed balancing calculation to count Captain's Elos twice
- Increased spread threshold from `1.0` to `1.25` to account for doubling Captain's Elos in calculations
### Guide Change
- Fixed error in [Format](#format-best-of-7-round-robin-knockouts); 8 teams play a **double** round-robin
### Script Changes
- Centralized DOM selectors to top of script for easier maintenance
- Fixed aggresive resuming behavior on manual pauses
- Implemented courtesy pause on disconnects
- Reduced delay for priority messages
- Increased delay for normal messages
- Added `/nfl setTest` to enforce/ignore additional lobby validation checks
- Fixed Boolean commands (e.g., `/nfl setKnockout`, `/nfl setTest`) to ignore capitalizations, take T/Fs and 0/1s
### Scoresheet Change
- Fixed HTML output file to tally Captain's guesses as 2

## Lineup: Away and Home, Captains, OPs, DPs
**Captains** (highest-Elo player in each team) split their teams into 2 Offensive (OP) and 2 Defensive (DP) players. 
Captain’s correct guesses count **double** (2 points) for the (T)DIFF calculations. 
The team listed first (above) on Challonge is the **Away** team. 
Line up as follows: **Away** (1-4: OP1, OP2, DP1, DP2), then **Home** (5-8: OP1, OP2, DP1, DP2).

## Score: Check the (T)DIFF
<details>
    <summary><b>Click to know more about Scoring</b></summary>
    <p>The <b>Away</b> team attacks (has <b>possession</b>) first. 
    Generally, possession swaps after every song. 
    To calculate points, subtract the Defending team’s score from the Attacking team’s score.
    <b>TDIFF</b> counts <b>everyone</b> and is looked at first, 
    while <b>DIFF</b> <b>only</b> counts Attacking team’s OPs and Defending team’s DPs.</p>
</details>

<table style="text-align:center">
    <tr>
        <th style="text-align:center"><strong>Result</strong></th>
        <th style="text-align:center"><strong>TDIFF</strong></th>
        <th style="text-align:center"><strong>DIFF</strong></th>
        <th style="text-align:center"><strong>Offense</strong></th>
        <th style="text-align:center"><strong>Defense</strong></th>
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
        <td style="text-align:center">Offense Wins</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>TD + 2PC</code></td>
        <td rowspan="7" style="text-align:center">N/A</td>
        <td style="text-align:center">3</td>
        <td style="text-align:center">8</td>
        <td rowspan="8" style="text-align:center">Swap</td>
        <td rowspan="3" style="text-align:center">Continues</td>
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
        <td style="text-align:center">Offense Continues,<br>Defense Wins</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Punt</code></td>
        <td rowspan="4" style="text-align:center">N/A</td>
        <td style="text-align:center">N/A</td> 
        <td style="text-align:center">Continues</td>
    </tr>
    <tr>
        <td style="text-align:center"><code>Safety</code></td>
        <td style="text-align:center">-2</td>
        <td style="text-align:center">2</td>
        <td rowspan="3" style="text-align:center">Defense Wins</td>
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
    </tr>
</table>

### Rouge: The Canadian Single
<details>
    <summary><b>Click to know more about Rouge</b></summary>
    <p>A <code>Rouge</code> (DIFF 0 or -1, 1 point) is awarded if 
    a play that would have resulted in a <code>Punt</code> 
    happened such that <b>≥1</b> player(s) from one team got the song right,
    but the other team missed it completely.
    This applies to both <b>Offense</b> and <b>Defense</b> to reward <i>erigs</i> and covers,
    even if DIFF calculations would have stalled out with a <code>Punt</code>.
    A <b>Defensive</b> <code>Rouge</code> on Song 1 ends Overtime,
    but an <b>Offensive</b> <code>Rouge</code> does not.</p>
</details>

## Ending: Mercy, Overtime, Tie
Mercy Rule triggers if the trailing team can't catch with the songs left. 
If both teams are still tied after Regulation, continue to **Overtime**. 
The **Away** team again has first possession. 
An `Onside Kick` or any Defensive Point(s) ends Overtime here. 
Otherwise, after both teams have **≥1** possession(s), whoever has more points wins. 
If Overtime doesn’t resolve the tie, the game is called a **Tie**, 
unless it's the **Championship Games** or the **Super Bowl**, 
in which case Overtime **repeats** until a winner is found. 
**Clear** the Overtime tally and repeat as necessary.

## Format: Best-of-7, Round Robin, Knockouts
- **For 2 teams**: Play a best-of-7, automatically swapping Away and Home between games.
- **For 4 teams**: Play a double round-robin. The top two teams advance to the **Super Bowl**.
- **For 6 teams**: Play a single round-robin. The top four teams advance to the **Championship Games**, then the winners advance to the **Super Bowl**.
- **For 8 teams**: Play a double round-robin in 2 conferences. The winner of each conference advance to the **Super Bowl**.

## Manual: What Do I *Really* Do?
### If you're hosting the tour:
- Open the tour signup prompt and ask for team requests and/or blacklists.
- After the player list has been settled, find the [Balancer](#links-balancer-flowchart-script) and follow the instructions there.
- If the tour has 4+ teams, ask for 1 lobby host volunteer from each team.
- Read the [Format](#format-best-of-7-round-robin-knockouts) section and prepare the Challonge.
- After the team split has been settled, announce team compositions and the Challonge link.
- Note the results of each game in Challonge.
- If necessary, ping teams that advance to the **Championship Games** and/or **Super Bowl**.
- Announce the final results.

### If you're hosting a lobby for your team:
Install the [Script](#links-balancer-flowchart-script) (**only** the lobby host needs to install and operate the **Script**), then do the following:
- Apply the **Regulation** setting code (see [Overview](#overview-those-long-setting-codes)).
- Set the lobby name to "Tour: [Away Team Name]-[Home Team Name]" (e.g., "Tour: Steelers-Ravens").
- Invite the right players to the lobby, and make sure they're lined up correctly (**No need to swap between consecutive games**, also see [Lineup](#lineup-away-and-home-captains-ops-dps)).
- After everyone is ready, type `/nfl howTo` and follow the instructions there.
- Type `/nfl start` and start playing.
    - If you started the game by mistake, type `/nfl resetGame`, then return to lobby.
    - When the Winner has been decided either normally or through Mercy Rule, pause the game, then return to lobby.
- If it's tied after Regulation:
    - Apply the **Overtime** setting code (see [Overview](#overview-those-long-setting-codes)).
    - Start playing after everyone is ready (**No need to type `/nfl start` to start/repeat Overtime**).
    - If you started Overtime by mistake, type `/nfl resetOvertime`, then return to lobby.
    - When the winner has been decided either normally or through Sudden Death, pause the game, the return to lobby.
    - If you need to repeat overtime, start playing after everyone is ready.
- Type `/nfl export` to download the **Scoresheet**.
- Open the Scoresheet and copy the top row.
- Paste it in `#game-reporting` with the Scoresheet and JSON(s) (Regulation and **the last** Overtime, if necessary).
- Repeat from Step 1 for the next game.

### If you're the Captain of your team:
- **Split** your team into 2 Offensive (OPs) and 2 Defensive (DPs) Players.
    - **OPs'** main role is to **score** points when your team has possession.
    - **DPs'** main role is to **prevent** the opposing OPs from scoring points when your team doesn't have possession.
- Mention the **tour host** in `#tour-general` with the format `@[Tour Host] [Team Name]: OP1, OP2, DP1, DP2` (e.g., `@HakoHoka Steelers: florenz, chommy, miiarad (C), HakoHoka`).