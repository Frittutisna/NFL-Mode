import os
import math
import random
import re

SPREAD_THRESHOLD = 1.25
TEAM_SIZE        = 4
SIMULATIONS      = 1000
FILENAMES        = {
    'PLAYERS'   : 'players.txt',
    'REQS'      : 'requests.txt',
    'BL'        : 'blacklists.txt',
    'OUTPUT'    : 'teams.txt'
}

TEAM_NAMES = {
    1: "Steelers",
    2: "Chiefs",
    3: "Colts",
    4: "Patriots",
    5: "Packers",
    6: "Niners",
    7: "Saints",
    8: "Eagles"
}

class Player:
    def __init__(self, name, elo, original_idx=0):
        self.name           = name
        self.elo            = float(elo)
        self.original_idx   = original_idx

    def __repr__(self): return f"{self.name} ({self.elo})"

def parse_file(filename, file_type):
    if not os.path.exists(filename): return []
    data = []
    with open(filename, 'r', encoding='utf-8') as f: lines = f.readlines()

    for i, line in enumerate(lines):
        line = line.strip()
        if not line: continue
        parts = re.split(r'[,\t\s]+', line)
        parts = [p for p in parts if p]
        if len(parts) >= 2:
            if file_type == 'player':
                try                     : data.append(Player(parts[0], parts[1], i))
                except ValueError       : pass
            elif file_type == 'pair'    : data.append({'p1': parts[0], 'p2': parts[1]})
    
    return data

def get_stats_block(teams_data):
    if not teams_data: return 0.0, 0.0
    scores  = [t['total_elo'] for t in teams_data]
    avg_elo = sum(scores) / len(scores)
    spread  = max(scores) - min(scores)
    return avg_elo, spread

def write_output(num_selected, original_count, num_teams, active_players, final_assignments, reqs, bl):
    verified_reqs = 0
    for r in reqs:
        p1 = next((p for p in active_players if p.name == r['p1']), None)
        p2 = next((p for p in active_players if p.name == r['p2']), None)
        if p1 and p2:
            idx1 = active_players.index(p1)
            idx2 = active_players.index(p2)
            if final_assignments[idx1] == final_assignments[idx2]: verified_reqs += 1

    verified_bl = 0
    for b in bl:
        p1 = next((p for p in active_players if p.name == b['p1']), None)
        p2 = next((p for p in active_players if p.name == b['p2']), None)
        if p1 and p2:
            idx1 = active_players.index(p1)
            idx2 = active_players.index(p2)
            if final_assignments[idx1] != final_assignments[idx2]: verified_bl += 1

    captains_map = {active_players[i].name: True for i in range(num_teams)}

    teams_data = []
    for t_idx in range(1, num_teams + 1):
        members = []
        for i, p in enumerate(active_players):
            if final_assignments[i] == t_idx: members.append(p)
        
        total_elo = 0.0
        for m in members:
            if m.name in captains_map   : total_elo += (m.elo * 2)
            else                        : total_elo += m.elo

        members.sort(key = lambda x: (1 if x.name in captains_map else 0, x.elo), reverse = True)
        
        mem_strings = []
        for m in members:
            s = m.name
            if m.name in captains_map: s += " (C)"
            mem_strings.append(s)
        
        team_name = TEAM_NAMES.get(t_idx, f"Team {t_idx}")
        
        teams_data.append({
            'id'            : t_idx,
            'name'          : team_name,
            'total_elo'     : total_elo,
            'members_str'   : ", ".join(mem_strings)
        })

    avg_elo, spread = get_stats_block(teams_data)

    with open(FILENAMES['OUTPUT'], 'w', encoding='utf-8') as f:
        f.write(f"Balanced {num_selected} out of {original_count} players into {num_teams} teams\n")
        f.write(f"Fulfilled {verified_reqs} out of {len(reqs)} request(s)\n")
        f.write(f"Fulfilled {verified_bl} out of {len(bl)} blacklist(s)\n")
        f.write(f"Average Elo: {avg_elo:.2f}\n")
        f.write(f"Final Spread: {spread:.2f}\n\n")

        if num_teams == 8:
            afc_teams           = teams_data[0:4]
            nfc_teams           = teams_data[4:8]
            afc_avg, afc_spread = get_stats_block(afc_teams)
            f.write("AFC:\n")
            f.write(f"Average Elo: {afc_avg:.2f}\n")
            f.write(f"Final Spread: {afc_spread:.2f}\n\n")
            for t in afc_teams  : f.write(f"{t['name']} ({t['total_elo']:.2f}): {t['members_str']}\n")
            f.write("\n")

            nfc_avg, nfc_spread = get_stats_block(nfc_teams)
            f.write("NFC:\n")
            f.write(f"Average Elo: {nfc_avg:.2f}\n")
            f.write(f"Final Spread: {nfc_spread:.2f}\n\n")
            for t in nfc_teams  : f.write(f"{t['name']} ({t['total_elo']:.2f}): {t['members_str']}\n")
        else: 
            for t in teams_data : f.write(f"{t['name']} ({t['total_elo']:.2f}): {t['members_str']}\n")

    print(f"Success! Teams written to {FILENAMES['OUTPUT']}")


def main():
    all_players = parse_file(FILENAMES['PLAYERS'],  'player')
    raw_reqs    = parse_file(FILENAMES['REQS'],     'pair')
    raw_bl      = parse_file(FILENAMES['BL'],       'pair')
    
    if len(all_players) < 8:
        print("Error: Minimum of 8 players not met in players.txt")
        return
    
    original_count  = len(all_players)
    num_selected    = math.floor(original_count / 8) * 8
    all_players.sort(key = lambda x: x.elo, reverse = True)
    active_players  = all_players[:num_selected]
    
    reqs                = [r for r in raw_reqs  if r['p1'] and r['p2']]
    bl                  = [b for b in raw_bl    if b['p1'] and b['p2']]
    num_teams           = int(num_selected / TEAM_SIZE)
    
    best_overall_spread = float('inf')
    best_assignments    = None

    print(f"Running {SIMULATIONS} simulations to find the best balance")

    for sim in range(SIMULATIONS):
        possible        = True
        assignments     = [0]   * num_selected
        teams           = [0.0] * num_teams
        team_counts     = [0]   * num_teams
        team_indices    = list(range(num_teams))
        random.shuffle(team_indices)

        for i, p_idx in enumerate(team_indices):
            assignments[i]  = p_idx + 1
            teams[p_idx]    = active_players[i].elo * 2
            team_counts[p_idx] = 1

        for p in range(num_teams, num_selected):
            if assignments[p] == 0:
                target_team     = -1
                min_elo         = float('inf') 
                partners_needed = 0
                forced_team     = -1
                conflict        = False
                my_name         = active_players[p].name
                
                for r in reqs:
                    p_name = ""
                    if r['p1'] == my_name: p_name = r['p2']
                    if r['p2'] == my_name: p_name = r['p1']
                    if p_name:
                        p_idx_l = next((i for i, pl in enumerate(active_players) if pl.name == p_name), -1)
                        if p_idx_l > -1:
                            if assignments[p_idx_l] > 0:
                                if forced_team == -1                        : forced_team = assignments[p_idx_l]
                                elif forced_team != assignments[p_idx_l]    : conflict = True
                            else                                            : partners_needed += 1
                if conflict:
                    possible = False
                    break
                
                search_indices = list(range(num_teams))
                random.shuffle(search_indices)
                
                for t_idx in search_indices:
                    t = t_idx 
                    if forced_team != -1 and (t + 1) != forced_team: continue
                    
                    if team_counts[t] + partners_needed < TEAM_SIZE:
                        is_compatible = True
                        for mem in range(num_selected):
                            if assignments[mem] == (t + 1):
                                m_name = active_players[mem].name
                                for b in bl:
                                    if ((b['p1'] == m_name and b['p2'] == my_name) or 
                                        (b['p2'] == m_name and b['p1'] == my_name)):
                                        is_compatible = False
                                        break
                            if not is_compatible: break
                        
                        if is_compatible:
                            if forced_team > -1: 
                                target_team = t
                                break
                            elif teams[t] < min_elo:
                                min_elo     = teams[t]
                                target_team = t
                
                if target_team != -1:
                    assignments[p]              =   target_team + 1
                    teams[target_team]          +=  active_players[p].elo
                    team_counts[target_team]    +=  1
                    curr_name                   = active_players[p].name
                    for r in reqs:
                        p_part = ""
                        if r['p1'] == curr_name: p_part = r['p2']
                        if r['p2'] == curr_name: p_part = r['p1']
                        if p_part:
                            pp_idx = next((i for i, pl in enumerate(active_players) if pl.name == p_part), -1)
                            if pp_idx > -1 and assignments[pp_idx] == 0:
                                assignments[pp_idx] = target_team + 1
                                teams[target_team] += active_players[pp_idx].elo
                                team_counts[target_team] += 1
                else:
                    possible = False
                    break

        if possible:
            spread = max(teams) - min(teams)
            if spread < best_overall_spread:
                best_overall_spread = spread
                best_assignments = list(assignments)
            if spread <= SPREAD_THRESHOLD: break

    if not best_assignments:
        print("Could not generate valid teams, check constraints")
        return
    
    write_output(num_selected, original_count, num_teams, active_players, best_assignments, reqs, bl)

if __name__ == "__main__": main()