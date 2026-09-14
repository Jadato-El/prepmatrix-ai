import { DocumentSource, Exam, ExamAttempt, Flashcard, QuizQuestion, UserSettings } from '../types/index.js';

const STORAGE_KEYS = {
  DOCUMENTS: 'prepmatrix_documents_v1',
  FLASHCARDS: 'prepmatrix_flashcards_v1',
  QUIZ: 'prepmatrix_quizzes_v1',
  EXAMS: 'prepmatrix_exams_v1',
  ATTEMPTS: 'prepmatrix_attempts_v1',
  SETTINGS: 'prepmatrix_settings_v1',
};

// High-standard seeded academic documents
const SEED_DOCUMENTS: DocumentSource[] = [
  {
    id: 'seed-doc-1',
    title: 'Distributed Systems & Fault-Tolerant Consensus',
    type: 'text',
    content: `In distributed systems, the consensus problem requires a group of independent processes to agree on a single data value or state transition, even in the presence of node crashes or network partitions. 

The FLP Impossibility Theorem (Fischer, Lynch, Paterson, 1985) establishes that in an asynchronous network model, no deterministic consensus protocol can guarantee both safety and liveness in the presence of even a single unannounced process crash. Consequently, practical consensus algorithms like Raft and Paxos weaken assumptions by relying on partial synchrony and randomized leader election timeouts to achieve liveness while strictly preserving safety.

In the Raft protocol, the leader coordinates state machine replication. Log entries flow strictly from the leader to followers. A log entry is considered committed once it has been successfully replicated on a strict majority of nodes (quorum: N/2 + 1). If a follower fails to respond, the leader retries indefinitely. Raft guarantees the State Machine Safety Property: if a server has applied a log entry at a given index to its state machine, no other server will ever apply a different log entry for the same index.

Split-brain syndrome occurs when network partitions sever connectivity between clusters, potentially causing disjoint sub-clusters to elect separate leaders. Quorum-based consensus prevents split-brain by requiring that any legitimate leader must secure a majority vote from all cluster members. Because two majorities in any cluster of size N must share at least one overlapping member, a minority partition can never achieve a quorum to elect a rogue leader.`,
    excerpt: 'Comprehensive study on the FLP theorem, Raft consensus mechanism, quorum majorities, and split-brain prevention.',
    wordCount: 242,
    createdAt: new Date().toISOString(),
    tags: ['Computer Science', 'Distributed Systems', 'Raft'],
  },
  {
    id: 'seed-doc-2',
    title: 'Cellular Immunology & Adaptive Immune Memory',
    type: 'text',
    content: `Adaptive immunity is characterized by antigen specificity and immunological memory, mediated principally by B lymphocytes and T lymphocytes.

Antigen presentation relies on Major Histocompatibility Complex (MHC) molecules. MHC Class I molecules are expressed on virtually all nucleated cells and present endogenous intracellular peptides (such as viral fragments or mutated oncogenic proteins) to CD8+ Cytotoxic T Lymphocytes (CTLs). Upon recognition, CTLs trigger apoptosis in target cells via the perforin/granzyme pathway and Fas/FasL signaling. Conversely, MHC Class II molecules are expressed exclusively on professional antigen-presenting cells (APCs)—namely dendritic cells, macrophages, and B cells—presenting exogenous extracellular antigens to CD4+ Helper T Lymphocytes.

T cell activation requires two distinct signals to prevent inappropriate autoimmune destruction. Signal 1 is the specific interaction between the T-cell receptor (TCR) and the peptide-MHC complex. Signal 2 is a co-stimulatory interaction, predominantly between CD28 on the T cell and B7 (CD80/CD86) on the APC. If Signal 1 occurs in the absence of Signal 2, the T cell enters a state of functional unresponsiveness known as clonal anergy, an essential peripheral tolerance mechanism.

Memory B cells and plasma cells generate secondary antibody responses characterized by higher affinity (via somatic hypermutation in germinal centers) and class switching from low-affinity IgM to high-affinity IgG, IgA, or IgE.`,
    excerpt: 'Deep dive into MHC Class I vs II, CD4/CD8 T cell pathways, two-signal hypothesis, clonal anergy, and affinity maturation.',
    wordCount: 228,
    createdAt: new Date().toISOString(),
    tags: ['Biology', 'Medicine', 'Immunology'],
  },
];

// High-standard seeded flashcards with Bloom's Taxonomy calibration
const SEED_FLASHCARDS: Flashcard[] = [
  {
    id: 'seed-fc-1',
    front: 'What fundamental constraint does the FLP Impossibility Theorem prove regarding asynchronous distributed systems?',
    back: 'The FLP Theorem proves that no deterministic consensus algorithm can guarantee both safety (agreement/validity) and liveness (termination) in an asynchronous network in the presence of even a single unannounced fail-stop process crash.',
    hint: 'Think about the trade-off between deterministic termination and asynchronous network delays.',
    difficulty: 'hard',
    tags: ['Distributed Systems', 'Consensus'],
    leitnerBox: 1,
    sourceCitation: 'FLP Impossibility Theorem (Fischer, Lynch, Paterson, 1985)',
  },
  {
    id: 'seed-fc-2',
    front: 'Why does Raft require a strict majority quorum (N/2 + 1) to commit a log entry?',
    back: 'Any two majorities in a cluster of size N must share at least one overlapping node. This intersection guarantee ensures that any newly elected leader will observe all previously committed entries, preventing state divergence and split-brain.',
    hint: 'Pigeonhole principle applied to cluster partition subsets.',
    difficulty: 'medium',
    tags: ['Distributed Systems', 'Raft'],
    leitnerBox: 2,
    sourceCitation: 'Raft protocol: Log entries committed on majority quorum',
  },
  {
    id: 'seed-fc-3',
    front: 'What occurs when a naïve T cell receives Signal 1 (TCR-MHC binding) without Signal 2 (CD28-B7 co-stimulation)?',
    back: 'The T cell enters a state of "clonal anergy" (permanent functional unresponsiveness) or undergoes apoptosis. This serves as a vital peripheral tolerance safeguard against autoimmune reactions.',
    hint: 'It does not activate; rather, it enters an unreactive protective state.',
    difficulty: 'medium',
    tags: ['Immunology', 'T Cells'],
    leitnerBox: 1,
    sourceCitation: 'Two-signal hypothesis: CD28 on T cell and B7 (CD80/CD86) on APC',
  },
  {
    id: 'seed-fc-4',
    front: 'Which cells express MHC Class II molecules and what type of antigen do they present?',
    back: 'MHC Class II is expressed strictly by Professional Antigen-Presenting Cells (APCs: Dendritic cells, Macrophages, and B cells). They present exogenous (extracellular) peptides to CD4+ Helper T cells.',
    hint: 'Rule of 8: MHC II x CD4 = 8, and APCs specialize in scavenging external pathogens.',
    difficulty: 'easy',
    tags: ['Immunology', 'MHC'],
    leitnerBox: 3,
    sourceCitation: 'MHC Class II expressed exclusively on professional APCs',
  },
  {
    id: 'seed-fc-5',
    front: 'Explain the mechanism by which CD8+ Cytotoxic T Lymphocytes induce targeted target-cell apoptosis.',
    back: 'CTLs release perforin (forming transmembrane pores in the target cell membrane) and granzyme proteases (which enter via pores to activate executioner caspases). They can also trigger apoptosis via Fas ligand (FasL) binding to target Fas receptors.',
    hint: 'Pore formation followed by enzymatic activation of caspases.',
    difficulty: 'hard',
    tags: ['Immunology', 'Apoptosis'],
    leitnerBox: 2,
    sourceCitation: 'Perforin/granzyme pathway and Fas/FasL signaling in CD8+ CTLs',
  },
];

// High-standard seeded Quiz Questions with 4-way detailed explanations
const SEED_QUIZ: QuizQuestion[] = [
  {
    id: 'seed-q-1',
    question: 'A 5-node distributed cluster implementing the Raft protocol experiences a catastrophic network partition, isolating 2 nodes on side Alpha and 3 nodes on side Beta. If a client attempts write operations on both partitions simultaneously, what behavior will occur?',
    options: [
      'Side Alpha will accept writes with eventual reconciliation, while side Beta drops writes.',
      'Side Beta can elect a leader and commit writes, while side Alpha will reject or stall client writes.',
      'Both partitions will reject all writes until full 5-node network connectivity is restored.',
      'Both partitions will independently elect leaders, resulting in split-brain data corruption.'
    ],
    correctIndex: 1,
    explanations: [
      'INCORRECT: Side Alpha has only 2 nodes out of 5, which fails to satisfy the majority quorum threshold (3 of 5). It cannot commit writes.',
      'CORRECT: Side Beta maintains 3 of 5 nodes, which forms a strict majority quorum. It can safely elect a leader and commit writes. Side Alpha cannot reach quorum and will reject writes, successfully preventing split-brain.',
      'INCORRECT: Raft does not require unanimous 5-node availability. As long as a strict majority (3/5) is reachable, operations continue.',
      'INCORRECT: Split-brain is mathematically precluded because two majorities cannot exist simultaneously in a 5-node cluster (3 + 3 = 6 > 5).'
    ],
    difficulty: 'hard',
    conceptTested: 'Quorum intersection and partition tolerance in Raft',
    sourceCitation: 'Quorum-based consensus: Any legitimate leader must secure a majority vote (N/2 + 1).',
  },
  {
    id: 'seed-q-2',
    question: 'In cellular immunology, why does tumor microenvironment expression of PD-L1 inhibit CD8+ cytotoxic T lymphocyte function?',
    options: [
      'It physically blocks MHC Class I from binding intracellular antigens.',
      'It degrades perforin molecules before they can insert into the cell membrane.',
      'It triggers inhibitory checkpoint signaling through PD-1, halting T-cell effector activation.',
      'It induces non-specific class switching from IgG to IgM antibodies.'
    ],
    correctIndex: 2,
    explanations: [
      'INCORRECT: PD-L1 does not bind or cleave the MHC Class I complex; MHC presentation remains intact.',
      'INCORRECT: Perforin synthesis and vesicle release are prevented upstream via intracellular inhibitory signaling, not direct molecular degradation.',
      'CORRECT: PD-1 is an inhibitory checkpoint receptor on T cells. When engaged by PD-L1 expressed on tumor or stromal cells, it down-regulates T-cell receptor signaling and cytokine secretion, inducing immune exhaustion.',
      'INCORRECT: Class switching occurs in B lymphocytes within germinal centers, not in CD8+ T cells.'
    ],
    difficulty: 'medium',
    conceptTested: 'T-cell exhaustion & Immune checkpoint pathways',
    sourceCitation: 'T cell activation requires co-stimulatory regulation and checkpoint signaling.',
  },
  {
    id: 'seed-q-3',
    question: 'Which of the following cellular components is responsible for presenting endogenous intracellular viral peptides to CD8+ T cells?',
    options: [
      'MHC Class II molecules',
      'MHC Class I molecules',
      'Toll-like Receptor 4 (TLR4)',
      'Complement Component C3b'
    ],
    correctIndex: 1,
    explanations: [
      'INCORRECT: MHC Class II presents exogenous antigens to CD4+ T helper cells.',
      'CORRECT: MHC Class I molecules are expressed on nucleated cells to present endogenous intracellular fragments to CD8+ cytotoxic T cells.',
      'INCORRECT: TLR4 is an innate pattern recognition receptor that recognizes lipopolysaccharides (LPS), not an antigen presentation molecule.',
      'INCORRECT: C3b is an opsonin in the complement cascade that tags pathogens for phagocytosis.'
    ],
    difficulty: 'easy',
    conceptTested: 'MHC Class I vs Class II differentiation',
    sourceCitation: 'MHC Class I molecules present endogenous intracellular peptides to CD8+ CTLs.',
  },
];

// Seeded full practice exam
const SEED_EXAM: Exam = {
  id: 'seed-exam-1',
  title: 'Full Diagnostic Examination: Systems Architecture & Molecular Immunology',
  description: 'Rigorous timed practice exam calibrated to high academic standards. Evaluates foundational comprehension, applied case analysis, and synthesis under test conditions.',
  timeLimitMinutes: 15,
  passingPercentage: 70,
  questions: [
    ...SEED_QUIZ,
    {
      id: 'seed-q-4',
      question: 'Consider an asynchronous network where message delivery latency is unbounded. According to the FLP Impossibility Theorem, why cannot an algorithm guarantee both safety and termination with a single crash?',
      options: [
        'Because an infinitely slow process cannot be reliably distinguished from a crashed process.',
        'Because Byzantine faults inherently alter message digests without detection.',
        'Because network buffers will inevitably overflow under asynchronous queuing.',
        'Because physical clock drift prevents establishing a global monotonic timestamp.'
      ],
      correctIndex: 0,
      explanations: [
        'CORRECT: In an asynchronous system with unbounded delays, it is mathematically impossible to distinguish between a process that is running extremely slowly and one that has silently crashed.',
        'INCORRECT: FLP theorem models fail-stop crashes, not Byzantine (arbitrary malicious) faults.',
        'INCORRECT: The FLP model assumes abstract message delivery without hardware buffer constraints.',
        'INCORRECT: Asynchronous consensus models do not assume or require synchronized physical clocks.'
      ],
      difficulty: 'hard',
      conceptTested: 'FLP Impossibility theorem core premise',
      sourceCitation: 'FLP Theorem (1985): Unannounced process crash indistinguishable from delay in asynchronous networks.',
    },
    {
      id: 'seed-q-5',
      question: 'What is the primary immunological function of Somatic Hypermutation occurring within germinal centers?',
      options: [
        'To eliminate self-reactive T cells via negative thymic selection.',
        'To generate point mutations in immunoglobulin variable regions to increase antigen affinity.',
        'To degrade foreign antigens into 8-10 amino acid peptide fragments.',
        'To stimulate rapid non-specific degranulation of tissue mast cells.'
      ],
      correctIndex: 1,
      explanations: [
        'INCORRECT: Negative selection of T cells occurs in the thymus, not in lymph node germinal centers.',
        'CORRECT: Somatic hypermutation introduces targeted mutations into B-cell immunoglobulin V regions, followed by follicular dendritic cell selection for affinity maturation.',
        'INCORRECT: Antigen cleavage is performed by proteasomes and lysosomal enzymes, not hypermutation.',
        'INCORRECT: Mast cell degranulation is an immediate type I hypersensitivity reaction mediated by IgE crosslinking.'
      ],
      difficulty: 'medium',
      conceptTested: 'Affinity maturation in B cell germinal centers',
      sourceCitation: 'Secondary antibody responses characterized by higher affinity via somatic hypermutation in germinal centers.',
    }
  ],
  sourceDocIds: ['seed-doc-1', 'seed-doc-2'],
  createdAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  studyMode: 'all',
  soundEnabled: true,
  autoReadTTS: false,
};

export const StorageService = {
  getDocuments(): DocumentSource[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) {
      this.saveDocuments(SEED_DOCUMENTS);
      return SEED_DOCUMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_DOCUMENTS;
    }
  },

  saveDocuments(docs: DocumentSource[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  addDocument(doc: DocumentSource): void {
    const existing = this.getDocuments();
    const updated = [doc, ...existing.filter(d => d.id !== doc.id)];
    this.saveDocuments(updated);
  },

  deleteDocument(id: string): void {
    const existing = this.getDocuments();
    this.saveDocuments(existing.filter(d => d.id !== id));
  },

  getFlashcards(): Flashcard[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    if (!raw) {
      this.saveFlashcards(SEED_FLASHCARDS);
      return SEED_FLASHCARDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_FLASHCARDS;
    }
  },

  saveFlashcards(cards: Flashcard[]): void {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
  },

  addFlashcards(newCards: Flashcard[]): void {
    const existing = this.getFlashcards();
    this.saveFlashcards([...newCards, ...existing]);
  },

  updateFlashcard(card: Flashcard): void {
    const existing = this.getFlashcards();
    const updated = existing.map(c => (c.id === card.id ? card : c));
    this.saveFlashcards(updated);
  },

  getQuizzes(): QuizQuestion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ);
    if (!raw) {
      this.saveQuizzes(SEED_QUIZ);
      return SEED_QUIZ;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_QUIZ;
    }
  },

  saveQuizzes(questions: QuizQuestion[]): void {
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(questions));
  },

  addQuizzes(newQuestions: QuizQuestion[]): void {
    const existing = this.getQuizzes();
    this.saveQuizzes([...newQuestions, ...existing]);
  },

  getExams(): Exam[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      this.saveExams([SEED_EXAM]);
      return [SEED_EXAM];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [SEED_EXAM];
    }
  },

  saveExams(exams: Exam[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  addExam(exam: Exam): void {
    const existing = this.getExams();
    this.saveExams([exam, ...existing.filter(e => e.id !== exam.id)]);
  },

  getAttempts(): ExamAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveAttempt(attempt: ExamAttempt): void {
    const existing = this.getAttempts();
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([attempt, ...existing]));
  },

  getSettings(): UserSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportBackup(): string {
    return JSON.stringify(
      {
        documents: this.getDocuments(),
        flashcards: this.getFlashcards(),
        quizzes: this.getQuizzes(),
        exams: this.getExams(),
        attempts: this.getAttempts(),
        settings: this.getSettings(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.documents) this.saveDocuments(data.documents);
      if (data.flashcards) this.saveFlashcards(data.flashcards);
      if (data.quizzes) this.saveQuizzes(data.quizzes);
      if (data.exams) this.saveExams(data.exams);
      if (data.attempts) localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(data.attempts));
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (err) {
      console.error('Failed to import backup:', err);
      return false;
    }
  },
};
