import json
from pathlib import Path

kb_path = Path("data/reference/seed_knowledge_base.json")
with open(kb_path, "r", encoding="utf-8") as f:
    kb = json.load(f)

new_sources = [
    {
        "id": "source-rombach-2022-latent-diffusion",
        "title": "High-Resolution Image Synthesis with Latent Diffusion Models",
        "authors": [
            "Robin Rombach",
            "Andreas Blattmann",
            "Dominik Lorenz",
            "Patrick Esser",
            "Bjorn Ommer"
        ],
        "publication_date": "2021-12-20",
        "date_precision": "day",
        "publisher": "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2022)",
        "source_type": "peer_reviewed_paper",
        "url": "https://arxiv.org/abs/2112.10752",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-openai-2022-chatgpt",
        "title": "Introducing ChatGPT: Optimizing Language Models for Dialogue",
        "authors": ["OpenAI"],
        "publication_date": "2022-11-30",
        "date_precision": "day",
        "publisher": "OpenAI Technical Blog",
        "source_type": "model_release",
        "url": "https://openai.com/index/chatgpt/",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-openai-2023-gpt4",
        "title": "GPT-4 Technical Report",
        "authors": ["OpenAI"],
        "publication_date": "2023-03-15",
        "date_precision": "day",
        "publisher": "arXiv / OpenAI",
        "source_type": "peer_reviewed_paper",
        "url": "https://arxiv.org/abs/2303.08774",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-meta-2023-llama2",
        "title": "Llama 2: Open Foundation and Fine-Tuned Chat Models",
        "authors": [
            "Hugo Touvron",
            "Louis Martin",
            "Kevin Stone",
            "Peter Albert",
            "Meta AI"
        ],
        "publication_date": "2023-07-18",
        "date_precision": "day",
        "publisher": "arXiv / Meta AI",
        "source_type": "peer_reviewed_paper",
        "url": "https://arxiv.org/abs/2307.09288",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-iso-2023-42001",
        "title": "ISO/IEC 42001:2023 - Artificial Intelligence Management System",
        "authors": [
            "International Organization for Standardization",
            "International Electrotechnical Commission"
        ],
        "publication_date": "2023-12-18",
        "date_precision": "day",
        "publisher": "ISO/IEC",
        "source_type": "institutional_report",
        "url": "https://www.iso.org/standard/81230.html",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-google-2024-alphafold3",
        "title": "Accurate structure prediction of biomolecular interactions with AlphaFold 3",
        "authors": [
            "Josh Abramson",
            "Jonas Adler",
            "Jack Dunger",
            "John Jumper",
            "Demis Hassabis"
        ],
        "publication_date": "2024-05-08",
        "date_precision": "day",
        "publisher": "Nature 630, 493-500",
        "source_type": "peer_reviewed_paper",
        "url": "https://doi.org/10.1038/s41586-024-07487-w",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-openai-2024-gpt4o",
        "title": "Hello GPT-4o: Omni Multimodal Model Across Audio, Vision, and Text",
        "authors": ["OpenAI"],
        "publication_date": "2024-05-13",
        "date_precision": "day",
        "publisher": "OpenAI Announcements",
        "source_type": "model_release",
        "url": "https://openai.com/index/hello-gpt-4o/",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-eu-2024-ai-act",
        "title": "Regulation (EU) 2024/1689 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act)",
        "authors": ["European Parliament", "Council of the European Union"],
        "publication_date": "2024-07-12",
        "date_precision": "day",
        "publisher": "Official Journal of the European Union",
        "source_type": "institutional_report",
        "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-openai-2024-o1",
        "title": "Learning to Reason with LLMs: Introducing OpenAI o1 Preview",
        "authors": ["OpenAI"],
        "publication_date": "2024-09-12",
        "date_precision": "day",
        "publisher": "OpenAI Research",
        "source_type": "model_release",
        "url": "https://openai.com/index/learning-to-reason-with-llms/",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-deepseek-2025-r1",
        "title": "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
        "authors": [
            "DeepSeek-AI",
            "Daya Guo",
            "Dejian Yang",
            "Haowei Zhang",
            "Chaoqing Jia"
        ],
        "publication_date": "2025-01-22",
        "date_precision": "day",
        "publisher": "arXiv:2501.12948",
        "source_type": "peer_reviewed_paper",
        "url": "https://arxiv.org/abs/2501.12948",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-paris-2025-ai-summit",
        "title": "Statement on Inclusive and Sustainable Artificial Intelligence for People and the Planet",
        "authors": [
            "Paris AI Action Summit Co-Chairs",
            "Government of France",
            "Government of India"
        ],
        "publication_date": "2025-02-11",
        "date_precision": "day",
        "publisher": "AI Action Summit Paris",
        "source_type": "institutional_report",
        "url": "https://www.elysee.fr/en/",
        "accessed_at": "2026-10-26T12:00:00Z"
    },
    {
        "id": "source-international-ai-safety-report-2025",
        "title": "International Scientific Report on the Safety of Advanced AI",
        "authors": [
            "Yoshua Bengio",
            "International AI Safety Expert Panel"
        ],
        "publication_date": "2025-01-29",
        "date_precision": "day",
        "publisher": "UK Department for Science, Innovation and Technology",
        "source_type": "institutional_report",
        "url": "https://www.gov.uk/government/publications/international-scientific-report-on-the-safety-of-advanced-ai",
        "accessed_at": "2026-10-26T12:00:00Z"
    }
]

new_milestones = [
    {
        "id": "milestone-latent-diffusion-2021",
        "title": "Publication of Latent Diffusion Models (Foundation for Stable Diffusion)",
        "date_start": "2021-12-20",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Robin Rombach and collaborators introduced latent diffusion models, moving diffusion training to compressed latent spaces and unlocking scalable high-resolution generative image synthesis.",
        "source_ids": ["source-rombach-2022-latent-diffusion"],
        "concept_ids": ["concept-deep-learning"],
        "confidence": "verified"
    },
    {
        "id": "milestone-chatgpt-release-2022",
        "title": "OpenAI Releases ChatGPT (Democratization of Conversational AI)",
        "date_start": "2022-11-30",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "OpenAI launched ChatGPT based on GPT-3.5 with reinforcement learning from human feedback (RLHF), reaching 100M monthly active users within two months and initiating widespread public adoption.",
        "source_ids": ["source-openai-2022-chatgpt"],
        "concept_ids": ["concept-autoregressive-llm", "concept-transformer"],
        "confidence": "verified"
    },
    {
        "id": "milestone-gpt4-multimodal-2023",
        "title": "OpenAI Launches GPT-4 (Multimodal Foundation Model Benchmark)",
        "date_start": "2023-03-14",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Demonstrated human-level performance on standardized benchmarks including top-10th percentile bar exam scoring, introducing visual understanding and enhanced reliability.",
        "source_ids": ["source-openai-2023-gpt4"],
        "concept_ids": ["concept-autoregressive-llm", "concept-transformer"],
        "confidence": "verified"
    },
    {
        "id": "milestone-llama2-open-weights-2023",
        "title": "Meta Releases Llama 2 (Open-Weight Foundation Model Ecosystem)",
        "date_start": "2023-07-18",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Meta released Llama 2 with permissive commercial licensing for research and commercial deployment, catalyzing global open-source model adaptation and on-device optimization.",
        "source_ids": ["source-meta-2023-llama2"],
        "concept_ids": ["concept-autoregressive-llm", "concept-transformer"],
        "confidence": "verified"
    },
    {
        "id": "milestone-iso-42001-standard-2023",
        "title": "Publication of ISO/IEC 42001 (First Global Standard for AI Management Systems)",
        "date_start": "2023-12-18",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "The International Organization for Standardization published ISO/IEC 42001, defining international certifiable governance standards for responsible and accountable enterprise AI systems.",
        "source_ids": ["source-iso-2023-42001"],
        "concept_ids": ["concept-artificial-intelligence"],
        "confidence": "verified"
    },
    {
        "id": "milestone-alphafold-3-2024",
        "title": "Google DeepMind & Isomorphic Labs Unveil AlphaFold 3 in Nature",
        "date_start": "2024-05-08",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Introduced diffusion-based joint modeling of proteins, nucleic acids, ligands, and ions, transforming computational biology by predicting all molecule-of-life interactions.",
        "source_ids": ["source-google-2024-alphafold3"],
        "concept_ids": ["concept-deep-learning"],
        "confidence": "verified"
    },
    {
        "id": "milestone-gpt4o-realtime-multimodal-2024",
        "title": "OpenAI Announces GPT-4o (Omni Real-Time Multimodal Interaction)",
        "date_start": "2024-05-13",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "End-to-end trained omni model processing native audio, vision, and text simultaneously with human-like 232ms voice latency, establishing real-time multimodal assistants.",
        "source_ids": ["source-openai-2024-gpt4o"],
        "concept_ids": ["concept-autoregressive-llm", "concept-transformer"],
        "confidence": "verified"
    },
    {
        "id": "milestone-eu-ai-act-entry-into-force-2024",
        "title": "European Union AI Act Enters Into Force (Comprehensive Global AI Regulation)",
        "date_start": "2024-08-01",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Regulation (EU) 2024/1689 officially entered into force, establishing the world's first comprehensive risk-categorized legal framework for AI governance and general-purpose models.",
        "source_ids": ["source-eu-2024-ai-act"],
        "concept_ids": ["concept-artificial-intelligence"],
        "confidence": "verified"
    },
    {
        "id": "milestone-openai-o1-reasoning-2024",
        "title": "OpenAI Releases o1 Reasoning Series (Test-Time Compute Scaling)",
        "date_start": "2024-09-12",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Pioneered deliberate test-time compute scaling using reinforcement learning chain-of-thought, demonstrating competitive programming performance and PhD-level physics benchmark accuracy.",
        "source_ids": ["source-openai-2024-o1"],
        "concept_ids": ["concept-autoregressive-llm", "concept-transformer"],
        "confidence": "verified"
    },
    {
        "id": "milestone-deepseek-r1-release-2025",
        "title": "DeepSeek Releases DeepSeek-R1 (Open-Weight Reasoning via Reinforcement Learning)",
        "date_start": "2025-01-22",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Demonstrated frontier-tier reasoning capabilities using pure reinforcement learning without supervised warm-up (R1-Zero) and multi-head latent attention, releasing weights under open license.",
        "source_ids": ["source-deepseek-2025-r1"],
        "concept_ids": ["concept-autoregressive-llm", "concept-transformer"],
        "confidence": "verified"
    },
    {
        "id": "milestone-paris-ai-action-summit-2025",
        "title": "Paris AI Action Summit Concludes with 60+ Nation Global Accord",
        "date_start": "2025-02-11",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "Global leaders and researchers adopted the Statement on Inclusive and Sustainable AI, establishing international cooperation benchmarks for computing access, safety standards, and public AI infrastructure.",
        "source_ids": ["source-paris-2025-ai-summit", "source-international-ai-safety-report-2025"],
        "concept_ids": ["concept-artificial-intelligence"],
        "confidence": "verified"
    },
    {
        "id": "milestone-eu-ai-act-first-bans-active-2026",
        "title": "EU AI Act General Prohibitions and GPAI Governance Standards Become Legally Enforceable",
        "date_start": "2026-02-02",
        "date_precision": "day",
        "era": "generative_ai",
        "description": "The European AI Office initiated legal enforcement of Article 5 prohibited practices and baseline governance codes of practice for systemic general-purpose AI providers across EU member states.",
        "source_ids": ["source-eu-2024-ai-act"],
        "concept_ids": ["concept-artificial-intelligence"],
        "confidence": "verified"
    }
]

existing_source_ids = {s["id"] for s in kb["sources"]}
for s in new_sources:
    if s["id"] not in existing_source_ids:
        kb["sources"].append(s)

existing_milestone_ids = {m["id"] for m in kb["milestones"]}
for m in new_milestones:
    if m["id"] not in existing_milestone_ids:
        kb["milestones"].append(m)

# Sort milestones chronologically
kb["milestones"].sort(key=lambda m: m["date_start"])

with open(kb_path, "w", encoding="utf-8") as f:
    json.dump(kb, f, indent=2, ensure_ascii=False)

print(f"Total sources after extension: {len(kb['sources'])}")
print(f"Total milestones after extension: {len(kb['milestones'])}")
