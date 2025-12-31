# NFL Mode v2

## TLDR: Too Long, Didn't Read
Just track who gets each song right in your copy of the **Scoresheet**.\
It handles the math; the team with the most points after 20 songs wins!

## Scoresheet: Make a Copy of This and Rename That Copy
[Link to the Scoresheet](https://docs.google.com/spreadsheets/d/1m5uJ6SeWtyJtTeS_KEWjuXcvc_0XMAHHPrKvFjU-9sE/copy)

## Overview: Those Long Setting Codes
<table style="text-align:center">
    <tr>
        <th style="text-align:center"><strong>Phase</strong></th>
        <th style="text-align:center"><strong>Difficulty</strong></th>
        <th style="text-align:center"><strong>Song Mix</strong></th>
        <th style="text-align:center"><strong>Code</strong></th>
    </tr>
    <tr>
        <td>Regulation</td>
        <td>0 - 40</td>
        <td>16 Watched Equal, 4 Random</td>
        <td><details>
            <summary>Click to view code</summary>
            <code style="word-break: break-all">e0g0k21111100120g000431110000000k11111111111100k051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1k903-11111--</code>
        </details></td>
    </tr>
    <tr>
        <td>Overtime</td>
        <td>0 - 100</td>
        <td>5 Random</td>
        <td><details>
            <summary>Click to view code</summary>
            <code style="word-break: break-all;">e0g05211111001100000531110000000511111111111100k051o000000f11100k012r02i0a46533a11002s0111111111002s0111002s01a111111111102a11111111111hg1k903-11111--</code>
        </details></td>
    </tr>
</table>

## Changelog: What Changed Here?
- Format changes:
    - Changed `Touchdown and Keep` to `Onside Kick`
    - Clarified that an `Onside Kick` (as well as a `Safety`, a `Pick Six`, or a `House Call`) on Song 1 ends Overtime
    - Split `Touchdown` (DIFF +3 or +2, 7 points) to `TD + 2PC` (DIFF +3, 8 points) and `Touchdown` (DIFF +2, 7 points)
    - Split `Safety` (DIFF -2 or -3, 2 points) to `Safety` (DIFF -2, 2 points) and `Pick Six` (DIFF -3, 6 points)
    - Changed `Interception` to `House Call`
    - Changed Mercy Rule multiplier from 7 to 8 to account for `TD + 2PC`
    - Replaced Sweep references to TDIFF for unity with DIFF
    - Changed Overtime difficulty from 0 - 40 to 0 - 100
    - Clarified bracket format
- Scoresheet changes:
    - Updated format and link from Excel on MediaFire to a copyable Google Sheets link
    - Changed the sheet and workbook passwords from animemusicquiz.com to AMQ (might not be relevant in Google Sheets)
    - Moved team and player setup from the Game 1 sheet to a separate Setup sheet
    - Clarified the steps and explanations in the Setup and Game sheets
    - Added an extra Game sheet to accommodate up to Game 7 from the previous 6
    - Color-coded the Away team with blue and the Home team with orange
    - Moved the Possession column left of the tally
    - Deleted the distracting 0s from the tally
    - Fixed unseen error in TDIFF calculation that failed to account for non-OP1 Captains in double calculations
    - Hid the DIFF column
    - Bolded final game states in the Winner column

## Lineup: Away and Home, Captains, OPs, DPs
**Captains** (highest-Elo player in each team) split their teams into 2 Offensive (OP) and 2 Defensive (DP) players.\
Captain’s correct guesses count **double** (2 points) for (T)DIFF calculations.\
The team listed first (above) on Challonge is the **Away** team.\
Line up as follows: **Away** (OP1, OP2, DP1, DP2), then **Home** (OP1, OP2, DP1, DP2).\
Swap **Away** and **Home** if you play the same team again.

## Score: Check the (T)DIFF
The **Away** team attacks (has **possession**) first.\
Generally, possession swaps after every song.\
To calculate points, subtract the Defending team’s score from the Attacking team’s score.\
**TDIFF** counts **everyone** and is looked at first, 
while **DIFF** **only** counts Attacking team’s OPs and Defending team’s DPs.

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
        <td>Onside Kick</td>
        <td>≥4</td>
        <td>N/A</td>
        <td>7</td>
        <td rowspan="5">N/A</td>
        <td>Keep</td>
        <td>Offense Wins</td>
    </tr>
    <tr>
        <td>TD + 2PC</td>
        <td rowspan="6">N/A</td>
        <td>3</td>
        <td>8</td>
        <td rowspan="7">Swap</td>
        <td rowspan="4">Continues</td>
    </tr>
    <tr>
        <td>Touchdown</td>
        <td>2</td>
        <td>7</td>
    </tr>
    <tr>
        <td>Field Goal</td>
        <td>1</td>
        <td>3</td>
    </tr>
    <tr>
        <td>Punt</td>
        <td>0 or -1</td>
        <td rowspan="4">N/A</td>
    </tr>
    <tr>
        <td>Safety</td>
        <td>-2</td>
        <td>2</td>
        <td rowspan="3">Defense Wins</td>
    </tr>
    <tr>
        <td>Pick Six</td>
        <td>-3</td>
        <td>6</td>
    </tr>
    <tr>
        <td>House Call</td>
        <td>≤-4</td>
        <td>N/A</td>
        <td>7</td>
    </tr>
</table>

## Ending: Mercy, Overtime, Tie
If a team trails by more than (Remaining Songs × 8), the game ends early.\
If both teams are still tied after Regulation, continue to **Overtime**.\
**Away** team has first possession again.\
Onside Kick/Safety/Pick Six/House Call ends Overtime here.\
Otherwise, after both teams have at least one possession, whoever has more points wins.\
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
In both cases, the top four teams advance to the **Championship Games**, 

then the two winners advance to the **Super Bowl**.
