# NFL Mode v3.alpha

## TLDR: Too Long, Didn't Read
Just install the **Script**.\
It handles the math; the team with the most points after 20 songs wins!

## Script: Download and Install This
[Link to the Script](https://github.com/Frittutisna/NFL-Mode/blob/main/Script.js)

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
        <td style="text-align:center">20 Watched "Equal"</td>
        <td style="text-align:center">
            <details>
                <summary>Click to view code</summary>
                <code style="word-break: break-all">e0g0k21111110130k000031110000000k11111111111100k051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1k903-11111--</code>
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
                <code style="word-break: break-all;">e0g05211111101100000531110000000511111111111100k051o000000f11100k012r02i0a46533a11002s0111111111002s0111002s01a111111111102a11111111111hg1k903-11111--</code>
            </details>
        </td>
    </tr>
</table>

## Changelog: What Changed Here?
- Format changes:
    - Replaced 4 Random songs from Regulation with 4 more Watched "Equal" songs
    - Added Rebroadcast Songs to both Regulation and Overtime
    - Improved Mercy Rule calculation to ignore impossible consecutive `TD + 2PCs`
    - Removed the need to swap between consecutive rounds since the script handles this automatically
- Scoresheet/Script changes:
    - **Moved from Google Sheets to JavaScript for immense speed improvement**

## Lineup: Away and Home, Captains, OPs, DPs
**Captains** (highest-Elo player in each team) split their teams into 2 Offensive (OP) and 2 Defensive (DP) players.\
Captain’s correct guesses count **double** (2 points) for (T)DIFF calculations.\
The team listed first (above) on Challonge is the **Away** team.\
Line up as follows: **Away** (OP1, OP2, DP1, DP2), then **Home** (OP1, OP2, DP1, DP2).\

## Score: Check the (T)DIFF
<details>
    <summary><b>Click to know more about Scoring</b></summary>
    <p>The <b>Away</b> team attacks (has <b>possession</b>) first. 
    Generally, possession swaps after every song. 
    To calculate points, subtract the Defending team’s score from the Attacking team’s score.
    <b>TDIFF</b> counts <b>everyone</b> and is looked at first, 
    while <b>DIFF</b> <b>only</b> counts Attacking team’s OPs and Defending team’s DPs.</p>
</details>

### Rouge: That Weird Canadian Thing
<details>
    <summary><b>Click to know more about Rouges</b></summary>
    <p>A <code>Rouge</code> (DIFF 0 or -1, 1 point) is awarded if 
    a play that would have resulted in a <code>Punt</code> happened 
    such that <b>≥1</b> player(s) from one team got the song right,
    but the other team missed it completely.
    This applies to both <b>Offense</b> and <b>Defense</b> to reward <i>erigs</i> and covers,
    even if the DIFF calculations would have stalled out with a <code>Punt</code>.
    A <b>Defensive</b> <code>Rouge</code> on Song 1 ends Overtime,
    but an <b>Offensive</b> <code>Rouge</code> does not.</p>
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

## Ending: Mercy, Overtime, Tie
Mercy Rule triggers if the trailing team can't catch with the songs left.\
If both teams are still tied after Regulation, continue to **Overtime**.\
**Away** team has first possession again.\
An `Onside Kick` or any Defensive Point(s) ends Overtime here.\
Otherwise, after both teams have **≥1** possession(s), whoever has more points wins.\
If Overtime doesn’t resolve the tie, the game is called a **Tie**,\
unless it's the **Championship Games** or the **Super Bowl**,\
in which case Overtime **repeats** until a winner is found.\
**Clear** the Overtime tally and repeat as necessary.

## Format: Best-of-7, Round Robin, Swiss, Knockouts
For 2 teams, play a best-of-7, swapping Away and Home between games.\
For 4 teams, play a double round-robin, swapping Away and Home between repeat games.\
The top two teams advance to the **Super Bowl**.\
For 6 teams, play a single round-robin.\
For 8 teams, play a 5-game Swiss league.\
In both cases, the top four teams advance to the **Championship Games**,\
then the two winners advance to the **Super Bowl**.