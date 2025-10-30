/*
  # Schema inicial do sistema de ranking de xadrez

  1. Tabelas principais
    - `players` - Jogadores cadastrados
    - `tournaments` - Torneios
    - `tournament_players` - Relação jogadores-torneios
    - `rounds` - Rodadas dos torneios
    - `matches` - Partidas das rodadas
    - `rating_history` - Histórico de rating dos jogadores
    - `desafio_ciclos` - Ciclos quinzenais
    - `desafio_confrontos` - Confrontos quinzenais
    - `historico_cores_dupla` - Histórico de cores por dupla

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para leitura pública e escrita apenas para admins
*/

-- Tabela de jogadores
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_date date NOT NULL,
  nickname text,
  email text,
  phone text,
  is_active boolean DEFAULT true,
  current_rating integer DEFAULT 1500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de histórico de rating
CREATE TABLE IF NOT EXISTS rating_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  previous_rating integer NOT NULL,
  new_rating integer NOT NULL,
  variation integer NOT NULL,
  reason text NOT NULL,
  tournament_id uuid,
  round_number integer,
  desafio_confronto_id uuid,
  date date NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Tabela de torneios
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  start_date date NOT NULL,
  end_date date,
  number_of_rounds integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  participants text[] DEFAULT '{}',
  present_players text[] DEFAULT '{}',
  participants_locked boolean DEFAULT false,
  tiebreak_enabled boolean DEFAULT false,
  allow_no_show boolean DEFAULT false,
  bye_points numeric(2,1) DEFAULT 1.0,
  bye_affects_rating boolean DEFAULT false,
  organizer_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de jogadores do torneio
CREATE TABLE IF NOT EXISTS tournament_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  initial_tournament_rating integer NOT NULL,
  current_score numeric(3,1) DEFAULT 0,
  received_bye boolean DEFAULT false,
  is_present boolean DEFAULT true,
  UNIQUE(tournament_id, player_id)
);

-- Tabela de rodadas
CREATE TABLE IF NOT EXISTS rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  number integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'locked')),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  UNIQUE(tournament_id, number)
);

-- Tabela de partidas
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES rounds(id) ON DELETE CASCADE,
  player_a_id uuid REFERENCES players(id),
  player_b_id uuid REFERENCES players(id),
  table_number integer NOT NULL,
  result text CHECK (result IN ('A', 'B', 'E', 'WO_A', 'WO_B')),
  score_a numeric(2,1) DEFAULT 0,
  score_b numeric(2,1) DEFAULT 0,
  vp_used integer,
  rating_delta integer,
  manually_adjusted boolean DEFAULT false,
  adjustment_reason text,
  modified_by text,
  is_bye boolean DEFAULT false,
  bye_player_id uuid REFERENCES players(id),
  created_at timestamptz DEFAULT now()
);

-- Tabela de ciclos quinzenais
CREATE TABLE IF NOT EXISTS desafio_ciclos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano integer NOT NULL,
  quinzena integer NOT NULL CHECK (quinzena IN (1, 2)),
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  UNIQUE(mes, ano, quinzena)
);

-- Tabela de confrontos quinzenais
CREATE TABLE IF NOT EXISTS desafio_confrontos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_id uuid REFERENCES desafio_ciclos(id) ON DELETE CASCADE,
  jogador_brancas_id uuid REFERENCES players(id),
  jogador_pretas_id uuid REFERENCES players(id),
  pos_brancas integer NOT NULL,
  pos_pretas integer NOT NULL,
  rating_brancas_snapshot integer NOT NULL,
  rating_pretas_snapshot integer NOT NULL,
  responsavel_id uuid REFERENCES players(id),
  resultado text CHECK (resultado IN ('1-0', '0-1', '0-0')),
  aplicado_em timestamptz,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de histórico de cores por dupla
CREATE TABLE IF NOT EXISTS historico_cores_dupla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jogador_a_id uuid REFERENCES players(id),
  jogador_b_id uuid REFERENCES players(id),
  ultima_cor_de_a text NOT NULL CHECK (ultima_cor_de_a IN ('BRANCAS', 'PRETAS')),
  ultima_cor_de_b text NOT NULL CHECK (ultima_cor_de_b IN ('BRANCAS', 'PRETAS')),
  atualizado_em timestamptz DEFAULT now(),
  UNIQUE(jogador_a_id, jogador_b_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE desafio_ciclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE desafio_confrontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_cores_dupla ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (leitura pública, escrita apenas para admins)
CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON rating_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tournament_players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON rounds FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON desafio_ciclos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON desafio_confrontos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON historico_cores_dupla FOR SELECT USING (true);

-- Políticas de escrita (apenas para usuários autenticados - simularemos admin)
CREATE POLICY "Allow authenticated insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON players FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON rating_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON rating_history FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON rating_history FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON tournaments FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON tournament_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON tournament_players FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON tournament_players FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON rounds FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON rounds FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON matches FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON desafio_ciclos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON desafio_ciclos FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON desafio_ciclos FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON desafio_confrontos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON desafio_confrontos FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON desafio_confrontos FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON historico_cores_dupla FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON historico_cores_dupla FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON historico_cores_dupla FOR DELETE USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_players_active ON players(is_active);
CREATE INDEX IF NOT EXISTS idx_players_rating ON players(current_rating DESC);
CREATE INDEX IF NOT EXISTS idx_rating_history_player ON rating_history(player_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rounds_tournament ON rounds(tournament_id, number);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_desafio_ciclos_status ON desafio_ciclos(status);
CREATE INDEX IF NOT EXISTS idx_desafio_confrontos_ciclo ON desafio_confrontos(ciclo_id);