export interface DetectedOpening {
  eco: string;
  name: string;
  variation?: string;
  matchedPlies: number;
}

interface OpeningEntry {
  eco: string;
  name: string;
  variation?: string;
  moves: string[];
}

const OPENING_BOOK: OpeningEntry[] = [
  // First moves & irregular
  { eco: 'A00', name: 'Uncommon Opening', moves: ['a3'] },
  { eco: 'A00', name: 'Ware Opening', moves: ['a4'] },
  { eco: 'A00', name: 'Sodium Attack', moves: ['Na3'] },
  { eco: 'A00', name: 'Barnes Opening', moves: ['f3'] },
  { eco: 'A00', name: 'Grob Attack', moves: ['g4'] },
  { eco: 'A00', name: 'Polish Opening (Orangutan)', moves: ['b4'] },
  { eco: 'A00', name: 'Polish Opening', variation: 'Outflank', moves: ['b4', 'c6'] },
  { eco: 'A00', name: 'Polish Opening', variation: 'Symmetrical', moves: ['b4', 'e5', 'Bb2', 'Bxb4'] },
  { eco: 'A00', name: 'Dunst Opening', moves: ['Nc3'] },
  { eco: 'A00', name: "King's Fianchetto Opening", moves: ['g3'] },
  { eco: 'A01', name: 'Nimzo-Larsen Attack', moves: ['b3'] },
  { eco: 'A01', name: 'Nimzo-Larsen Attack', variation: 'Classical', moves: ['b3', 'e5', 'Bb2', 'Nc6'] },
  { eco: 'A02', name: "Bird's Opening", moves: ['f4'] },
  { eco: 'A03', name: "Bird's Opening", variation: 'Dutch Variation', moves: ['f4', 'd5'] },
  { eco: 'A03', name: "Bird's Opening", variation: 'From Gambit', moves: ['f4', 'e5'] },
  { eco: 'A04', name: 'Réti Opening', moves: ['Nf3'] },
  { eco: 'A06', name: 'Réti Opening', variation: 'Nimzo-Larsen / Réti', moves: ['Nf3', 'd5'] },
  { eco: 'A07', name: "King's Indian Attack", moves: ['Nf3', 'd5', 'g3'] },
  { eco: 'A09', name: 'Réti Opening', variation: 'Advance Variation', moves: ['Nf3', 'd5', 'c4'] },

  // English Opening (A10–A39)
  { eco: 'A10', name: 'English Opening', moves: ['c4'] },
  { eco: 'A13', name: 'English Opening', variation: 'Agincourt Defense', moves: ['c4', 'e6'] },
  { eco: 'A15', name: 'English Opening', variation: 'Anglo-Indian Defense', moves: ['c4', 'Nf6'] },
  { eco: 'A16', name: 'English Opening', variation: 'Anglo-Grünfeld', moves: ['c4', 'Nf6', 'Nc3', 'd5'] },
  { eco: 'A20', name: 'English Opening', variation: 'Reversed Sicilian', moves: ['c4', 'e5'] },
  { eco: 'A22', name: 'English Opening', variation: 'Bremen System', moves: ['c4', 'e5', 'Nc3', 'Nf6'] },
  { eco: 'A25', name: 'English Opening', variation: 'Sicilian Reversed', moves: ['c4', 'e5', 'Nc3', 'Nc6'] },
  { eco: 'A30', name: 'English Opening', variation: 'Symmetrical', moves: ['c4', 'c5'] },
  { eco: 'A34', name: 'English Opening', variation: 'Symmetrical Four Knights', moves: ['c4', 'c5', 'Nc3', 'Nf6', 'Nf3', 'Nc6'] },

  // 1. d4 sidelines, Englund, Benoni, Dutch, Indian (A40–A99)
  { eco: 'A40', name: "Queen's Pawn Game", moves: ['d4'] },
  { eco: 'A40', name: 'Englund Gambit', moves: ['d4', 'e5'] },
  { eco: 'A40', name: 'Englund Gambit', variation: 'Accepted', moves: ['d4', 'e5', 'dxe5', 'Nc6', 'Nf3', 'Qe7'] },
  { eco: 'A41', name: "Queen's Pawn Game", variation: 'Modern / Rat', moves: ['d4', 'd6'] },
  { eco: 'A43', name: 'Old Benoni', moves: ['d4', 'c5'] },
  { eco: 'A45', name: 'Trompowsky Attack', moves: ['d4', 'Nf6', 'Bg5'] },
  { eco: 'A46', name: 'Torre Attack', moves: ['d4', 'Nf6', 'Nf3', 'e6', 'Bg5'] },
  { eco: 'A48', name: 'London System', variation: 'East Indian Setup', moves: ['d4', 'Nf6', 'Nf3', 'g6', 'Bf4'] },
  { eco: 'A50', name: 'Indian Defense', moves: ['d4', 'Nf6'] },
  { eco: 'A52', name: 'Budapest Gambit', moves: ['d4', 'Nf6', 'c4', 'e5'] },
  { eco: 'A53', name: 'Old Indian Defense', moves: ['d4', 'Nf6', 'c4', 'd6'] },
  { eco: 'A56', name: 'Benoni Defense', moves: ['d4', 'Nf6', 'c4', 'c5'] },
  { eco: 'A57', name: 'Benko Gambit', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5'] },
  { eco: 'A60', name: 'Modern Benoni', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6'] },
  { eco: 'A80', name: 'Dutch Defense', moves: ['d4', 'f5'] },
  { eco: 'A85', name: 'Dutch Defense', variation: 'Classical', moves: ['d4', 'f5', 'c4', 'Nf6', 'Nc3', 'e6'] },
  { eco: 'A87', name: 'Dutch Defense', variation: 'Leningrad Variation', moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'g6'] },
  { eco: 'A90', name: 'Dutch Defense', variation: 'Stonewall Variation', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'd5'] },

  // 1. e4 Irregular, Owen, Nimzowitsch, Scandinavian, Alekhine, Pirc, Caro-Kann (B00–B19)
  { eco: 'B00', name: "King's Pawn Game", moves: ['e4'] },
  { eco: 'B00', name: 'Nimzowitsch Defense', moves: ['e4', 'Nc6'] },
  { eco: 'B00', name: "Owen's Defense", moves: ['e4', 'b6'] },
  { eco: 'B01', name: 'Scandinavian Defense', moves: ['e4', 'd5'] },
  { eco: 'B01', name: 'Scandinavian Defense', variation: 'Mieses-Kotrc', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5'] },
  { eco: 'B01', name: 'Scandinavian Defense', variation: 'Modern (Nf6)', moves: ['e4', 'd5', 'exd5', 'Nf6'] },
  { eco: 'B02', name: "Alekhine's Defense", moves: ['e4', 'Nf6'] },
  { eco: 'B03', name: "Alekhine's Defense", variation: 'Four Pawns Attack', moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'c4', 'Nb6', 'f4'] },
  { eco: 'B06', name: 'Modern Defense', moves: ['e4', 'g6'] },
  { eco: 'B07', name: 'Pirc Defense', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3'] },
  { eco: 'B09', name: 'Pirc Defense', variation: 'Austrian Attack', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'f4'] },
  { eco: 'B10', name: 'Caro-Kann Defense', moves: ['e4', 'c6'] },
  { eco: 'B12', name: 'Caro-Kann Defense', variation: 'Advance Variation', moves: ['e4', 'c6', 'd4', 'd5', 'e5'] },
  { eco: 'B12', name: 'Caro-Kann Defense', variation: 'Fantasy Variation', moves: ['e4', 'c6', 'd4', 'd5', 'f3'] },
  { eco: 'B13', name: 'Caro-Kann Defense', variation: 'Exchange Variation', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5'] },
  { eco: 'B14', name: 'Caro-Kann Defense', variation: 'Panov-Botvinnik Attack', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4'] },
  { eco: 'B15', name: 'Caro-Kann Defense', variation: 'Two Knights', moves: ['e4', 'c6', 'Nc3', 'd5', 'Nf3'] },
  { eco: 'B18', name: 'Caro-Kann Defense', variation: 'Classical Variation', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'] },
  { eco: 'B19', name: 'Caro-Kann Defense', variation: 'Karpov Variation', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7'] },

  // Sicilian Defense (B20–B99)
  { eco: 'B20', name: 'Sicilian Defense', moves: ['e4', 'c5'] },
  { eco: 'B21', name: 'Sicilian Defense', variation: 'Smith-Morra Gambit', moves: ['e4', 'c5', 'd4', 'cxd4', 'c3'] },
  { eco: 'B22', name: 'Sicilian Defense', variation: 'Alapin Variation', moves: ['e4', 'c5', 'c3'] },
  { eco: 'B23', name: 'Sicilian Defense', variation: 'Closed Sicilian', moves: ['e4', 'c5', 'Nc3'] },
  { eco: 'B23', name: 'Sicilian Defense', variation: 'Grand Prix Attack', moves: ['e4', 'c5', 'Nc3', 'Nc6', 'f4'] },
  { eco: 'B27', name: 'Sicilian Defense', variation: 'Hyperaccelerated Dragon', moves: ['e4', 'c5', 'Nf3', 'g6'] },
  { eco: 'B30', name: 'Sicilian Defense', variation: 'Rossolimo Variation', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5'] },
  { eco: 'B32', name: 'Sicilian Defense', variation: 'Open', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4'] },
  { eco: 'B33', name: 'Sicilian Defense', variation: 'Sveshnikov Variation', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'] },
  { eco: 'B35', name: 'Sicilian Defense', variation: 'Accelerated Dragon', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'] },
  { eco: 'B40', name: 'Sicilian Defense', variation: 'Pin / e6', moves: ['e4', 'c5', 'Nf3', 'e6'] },
  { eco: 'B41', name: 'Sicilian Defense', variation: 'Kan Variation', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'] },
  { eco: 'B45', name: 'Sicilian Defense', variation: 'Taimanov Variation', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6'] },
  { eco: 'B50', name: 'Sicilian Defense', variation: 'd6 System', moves: ['e4', 'c5', 'Nf3', 'd6'] },
  { eco: 'B52', name: 'Sicilian Defense', variation: 'Moscow Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'Bb5'] },
  { eco: 'B54', name: 'Sicilian Defense', variation: 'Open (d6)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4'] },
  { eco: 'B70', name: 'Sicilian Defense', variation: 'Dragon Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'] },
  { eco: 'B76', name: 'Sicilian Defense', variation: 'Dragon Yugoslav Attack', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3'] },
  { eco: 'B80', name: 'Sicilian Defense', variation: 'Scheveningen Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6'] },
  { eco: 'B90', name: 'Sicilian Defense', variation: 'Najdorf Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'] },

  // French Defense (C00–C19)
  { eco: 'C00', name: 'French Defense', moves: ['e4', 'e6'] },
  { eco: 'C01', name: 'French Defense', variation: 'Exchange Variation', moves: ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5'] },
  { eco: 'C02', name: 'French Defense', variation: 'Advance Variation', moves: ['e4', 'e6', 'd4', 'd5', 'e5'] },
  { eco: 'C03', name: 'French Defense', variation: 'Tarrasch Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2'] },
  { eco: 'C11', name: 'French Defense', variation: 'Classical Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6'] },
  { eco: 'C15', name: 'French Defense', variation: 'Winawer Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'] },

  // Open Games 1. e4 e5 (C20–C99)
  { eco: 'C20', name: "King's Pawn Opening", variation: 'Double King Pawn', moves: ['e4', 'e5'] },
  { eco: 'C20', name: 'Bongcloud Attack', moves: ['e4', 'e5', 'Ke2'] },
  { eco: 'C20', name: "Scholar's Mate Setup", moves: ['e4', 'e5', 'Qh5'] },
  { eco: 'C20', name: "Wayward Queen Attack", moves: ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4'] },
  { eco: 'C21', name: 'Center Game', moves: ['e4', 'e5', 'd4', 'exd4'] },
  { eco: 'C21', name: 'Danish Gambit', moves: ['e4', 'e5', 'd4', 'exd4', 'c3'] },
  { eco: 'C23', name: "Bishop's Opening", moves: ['e4', 'e5', 'Bc4'] },
  { eco: 'C25', name: 'Vienna Game', moves: ['e4', 'e5', 'Nc3'] },
  { eco: 'C27', name: 'Vienna Gambit', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4'] },
  { eco: 'C28', name: 'Vienna Game', variation: 'Max Lange Defense', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4'] },
  { eco: 'C30', name: "King's Gambit", moves: ['e4', 'e5', 'f4'] },
  { eco: 'C33', name: "King's Gambit Accepted", moves: ['e4', 'e5', 'f4', 'exf4'] },
  { eco: 'C30', name: "King's Gambit Declined", variation: 'Falkbeer Countergambit', moves: ['e4', 'e5', 'f4', 'd5'] },
  { eco: 'C40', name: "King's Knight Opening", moves: ['e4', 'e5', 'Nf3'] },
  { eco: 'C40', name: 'Latvian Gambit', moves: ['e4', 'e5', 'Nf3', 'f5'] },
  { eco: 'C41', name: 'Philidor Defense', moves: ['e4', 'e5', 'Nf3', 'd6'] },
  { eco: 'C42', name: 'Petrov Defense', moves: ['e4', 'e5', 'Nf3', 'Nf6'] },
  { eco: 'C42', name: 'Stafford Gambit', moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6'] },
  { eco: 'C44', name: 'Scotch Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'] },
  { eco: 'C45', name: 'Scotch Game', variation: 'Classical', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5'] },
  { eco: 'C46', name: 'Three Knights Opening', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3'] },
  { eco: 'C47', name: 'Four Knights Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6'] },
  { eco: 'C47', name: 'Halloween Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Nxe5'] },
  { eco: 'C48', name: 'Four Knights Game', variation: 'Spanish Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Bb5'] },

  // Italian Game (C50–C59)
  { eco: 'C50', name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] },
  { eco: 'C50', name: 'Italian Game', variation: 'Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'] },
  { eco: 'C51', name: 'Italian Game', variation: 'Evans Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'] },
  { eco: 'C53', name: 'Italian Game', variation: 'Giuoco Pianissimo', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'] },
  { eco: 'C55', name: 'Italian Game', variation: 'Two Knights Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'] },
  { eco: 'C57', name: 'Italian Game', variation: 'Fried Liver / Knight Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5'] },
  { eco: 'C57', name: 'Italian Game', variation: 'Traxler Counterattack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'Bc5'] },

  // Ruy Lopez (C60–C99)
  { eco: 'C60', name: 'Ruy Lopez (Spanish Game)', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { eco: 'C63', name: 'Ruy Lopez', variation: 'Schliemann Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'f5'] },
  { eco: 'C65', name: 'Ruy Lopez', variation: 'Berlin Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'] },
  { eco: 'C68', name: 'Ruy Lopez', variation: 'Exchange Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6'] },
  { eco: 'C70', name: 'Ruy Lopez', variation: 'Morphy Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'] },
  { eco: 'C78', name: 'Ruy Lopez', variation: 'Morphy Defense (Nf6)', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6'] },
  { eco: 'C84', name: 'Ruy Lopez', variation: 'Closed Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'] },
  { eco: 'C89', name: 'Ruy Lopez', variation: 'Marshall Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5'] },

  // Closed Games 1. d4 d5 (D00–D69)
  { eco: 'D00', name: "Queen's Pawn Game", variation: 'Symmetrical', moves: ['d4', 'd5'] },
  { eco: 'D00', name: 'Blackmar-Diemer Gambit', moves: ['d4', 'd5', 'e4', 'dxe4', 'Nc3'] },
  { eco: 'D02', name: 'London System', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'] },
  { eco: 'D02', name: 'London System', variation: 'Immediate Bf4', moves: ['d4', 'd5', 'Bf4'] },
  { eco: 'D02', name: 'Jobava London System', moves: ['d4', 'd5', 'Nc3', 'Nf6', 'Bf4'] },
  { eco: 'D04', name: 'Colle System', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'e3'] },
  { eco: 'D06', name: "Queen's Gambit", moves: ['d4', 'd5', 'c4'] },
  { eco: 'D07', name: "Queen's Gambit", variation: 'Chigorin Defense', moves: ['d4', 'd5', 'c4', 'Nc6'] },
  { eco: 'D08', name: "Queen's Gambit", variation: 'Albin Countergambit', moves: ['d4', 'd5', 'c4', 'e5'] },
  { eco: 'D10', name: 'Slav Defense', moves: ['d4', 'd5', 'c4', 'c6'] },
  { eco: 'D15', name: 'Slav Defense', variation: 'Main Line', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3'] },
  { eco: 'D20', name: "Queen's Gambit Accepted", moves: ['d4', 'd5', 'c4', 'dxc4'] },
  { eco: 'D30', name: "Queen's Gambit Declined", moves: ['d4', 'd5', 'c4', 'e6'] },
  { eco: 'D35', name: "Queen's Gambit Declined", variation: 'Exchange Variation', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5'] },
  { eco: 'D37', name: "Queen's Gambit Declined", variation: 'Classical (Bf4/Nf3)', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3'] },
  { eco: 'D43', name: 'Semi-Slav Defense', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'c6'] },
  { eco: 'D52', name: "Queen's Gambit Declined", variation: 'Cambridge Springs', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'e3', 'c6', 'Nf3', 'Qa5'] },

  // Grünfeld & Indian Defenses (D70–E99)
  { eco: 'D80', name: 'Grünfeld Defense', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'] },
  { eco: 'D85', name: 'Grünfeld Defense', variation: 'Exchange Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4'] },
  { eco: 'E00', name: 'Catalan Opening', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3'] },
  { eco: 'E04', name: 'Catalan Opening', variation: 'Open Catalan', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'dxc4'] },
  { eco: 'E11', name: 'Bogo-Indian Defense', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'Bb4'] },
  { eco: 'E12', name: "Queen's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'] },
  { eco: 'E20', name: 'Nimzo-Indian Defense', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'] },
  { eco: 'E32', name: 'Nimzo-Indian Defense', variation: 'Classical (Qc2)', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2'] },
  { eco: 'E46', name: 'Nimzo-Indian Defense', variation: 'Rubinstein Variation', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O'] },
  { eco: 'E60', name: "King's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'g6'] },
  { eco: 'E70', name: "King's Indian Defense", variation: 'Classical Setup', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'] },
  { eco: 'E76', name: "King's Indian Defense", variation: 'Four Pawns Attack', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4'] },
  { eco: 'E80', name: "King's Indian Defense", variation: 'Sämisch Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3'] },
  { eco: 'E97', name: "King's Indian Defense", variation: 'Mar del Plata', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5'] }
];

function normalizeSan(san: string): string {
  return san.replace(/[+#!?]+$/g, '');
}

export function detectOpening(sanMoves: string[]): DetectedOpening {
  if (!sanMoves || sanMoves.length === 0) {
    return {
      eco: 'A00',
      name: 'Starting Position',
      matchedPlies: 0
    };
  }

  const normalized = sanMoves.map(normalizeSan);
  let bestMatch: OpeningEntry | null = null;

  for (const entry of OPENING_BOOK) {
    if (entry.moves.length > normalized.length) continue;
    let matches = true;
    for (let i = 0; i < entry.moves.length; i++) {
      if (normalized[i] !== normalizeSan(entry.moves[i])) {
        matches = false;
        break;
      }
    }
    if (matches) {
      if (!bestMatch || entry.moves.length >= bestMatch.moves.length) {
        bestMatch = entry;
      }
    }
  }

  if (bestMatch) {
    return {
      eco: bestMatch.eco,
      name: bestMatch.name,
      variation: bestMatch.variation,
      matchedPlies: bestMatch.moves.length
    };
  }

  return {
    eco: 'A00',
    name: 'Custom Opening',
    matchedPlies: Math.min(1, normalized.length)
  };
}
