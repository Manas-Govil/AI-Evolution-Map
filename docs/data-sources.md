# AI Evolution Map: Selected Real Data Sources

This document details the real-world data sources selected, evaluated, and accessed for the AI Evolution Map data pipeline.

---

## 1. Stanford AI Index & Partner Datasets

- **Primary Provider**: Stanford Institute for Human-Centered Artificial Intelligence (HAI)
- **Primary Report URL**: https://aiindex.stanford.edu/report/
- **Data Release Repositories**:
  - Stanford HAI Repo: https://github.com/AI-Index/AI-Index-Report
  - Our World in Data AI Data Portal: https://ourworldindata.org/artificial-intelligence
- **Access Modality**: Preserved raw CSV downloads with JSON metadata sidecars (immutable under `data/raw/stanford_ai_index/`).

### 1.1 Dataset: Global Private AI Investment
- **Raw File**: `data/raw/stanford_ai_index/private-investment-in-artificial-intelligence.csv`
- **Metadata Sidecar**: `data/raw/stanford_ai_index/private-investment-in-artificial-intelligence.metadata.json`
- **Exact Dataset Title**: *"External funding for privately held AI companies raising above $1.5 million"*
- **Original Source URL**: `https://ourworldindata.org/grapher/private-investment-in-artificial-intelligence?v=1&csvType=full&useColumnShortNames=false`
- **Primary Source Partner**: NetBase Quid via Stanford AI Index 2024 Chapter 4 (Economy) and U.S. Bureau of Labor Statistics (CPI).
- **Original Column Names**: `Entity`, `Year`, `Private investment in AI by region` (OWID Variable ID: 1227957, short name: `private_investment`).
- **Unit and Currency Basis**: `constant 2021 US$` (denominated in Billions in our processed pipeline via $\text{value} / 10^9$).
- **Inflation Adjustment**: **Yes, inflation-adjusted**. Adjusted using the US Consumer Price Index (CPI) published by the U.S. Bureau of Labor Statistics. Reflects opportunity cost against a broad consumer bundle, preventing nominal inflation distortion across time.
- **Definition of Private AI Investment**: Money invested into privately held AI startups and enterprises that raised more than $1.5 million from external private investors (venture-capital and private-equity deals).
  - **Explicit Exclusions**:
    - Publicly traded corporations (e.g. Alphabet/Google, Microsoft, Meta, Amazon, Apple).
    - Internal corporate R&D expenditures.
    - Capital expenditures (CapEx, e.g. GPU cluster buildouts, datacenter construction).
    - Government and public-sector research grants.
  - **Underestimation Note**: Because internal spending and Big Tech R&D are excluded, this metric tracks venture/private market velocity and significantly underestimates total global economic spending on AI.
  - **Spikes & Macro Sensitivity**: Large funding rounds (e.g., multi-billion-dollar deals in foundational model developers) create pronounced annual spikes.
- **Temporal Coverage**: 2013–2023 (11 consecutive annual observations for `Entity == "World"`).
- **Missing Values & Revisions**: No missing years in 2013–2023. Annual figures are subject to retrospective updates by Quid as company tag classifications evolve.
- **Licensing & Attribution**:
  - Open access via Our World in Data under Creative Commons Attribution (CC BY 4.0).
  - Mandatory citation: *"Quid via AI Index Report (2024); U.S. Bureau of Labor Statistics (2024) – with major processing by Our World in Data."*

### 1.2 Dataset: Notable AI Systems by Affiliation
- **Raw File**: `data/raw/stanford_ai_index/affiliation-researchers-building-artificial-intelligence-systems-all.csv`
- **Metadata Sidecar**: `data/raw/stanford_ai_index/affiliation-researchers-building-artificial-intelligence-systems-all.metadata.json`
- **Exact Dataset Title**: *"Affiliation of research teams building notable AI systems, by year of publication"*
- **Original Source URL**: `https://ourworldindata.org/grapher/affiliation-researchers-building-artificial-intelligence-systems-all?v=1&csvType=full&useColumnShortNames=false`
- **Primary Source Partner**: Epoch AI via Stanford AI Index 2024 Chapter 1 (Research and Development).
- **Original Column Names**: `Entity`, `Year`, `Annual number of AI systems by researcher affiliation` (OWID Variable ID: 1015505, short name: `yearly_count`).
- **Unit**: Count of notable AI systems (`AI systems`).
- **Inclusion Criteria for "Notable AI Systems"**: Epoch AI designates an AI model as "notable" if it meets established significance benchmarks:
  1. *Historical significance*: Landmark architectural or algorithmic breakthrough cited across literature.
  2. *State-of-the-art performance*: Achieved SOTA results on recognized benchmarks at time of publication.
  3. *High academic attention*: Reached $\ge 1,000$ citations for older models, or rapid proportional citation velocity for recent models.
  4. *Broad community/deployed impact*: Widespread open-source adoption or prominent commercial API deployment.
  - **Explicit Exclusions**: Minor fine-tunes, derivative fine-tuning repositories, and hobbyist reimplementations without independent novelty.
- **Meaning of Institutional Affiliation Categories**:
  - `Industry`: Primary authors are employed by commercial private or publicly traded enterprises (e.g. OpenAI, Google DeepMind, Meta AI, Anthropic, Microsoft).
  - `Academia`: Primary authors are affiliated with accredited degree-granting universities or higher education institutions.
  - `Academia and industry collaboration`: Co-authored publications bridging academic departments and corporate research labs.
  - `Other`: Independent research collectives, open-source cooperatives, or non-profit institutes not organized under standard university or corporate structures (e.g., EleutherAI, LAION).
  - `Not specified`: Publications where author institutional affiliation could not be verified from primary documentation.
- **Treatment of Missing Values & Zeros**: Years with 0 notable systems for a sector are explicitly recorded as integer `0` in raw data, not omitted.
- **Licensing & Attribution**:
  - Open access via Our World in Data under Creative Commons Attribution (CC BY 4.0).
  - Mandatory citation: *"Epoch AI (2024) – with major processing by Our World in Data. Parameter, Compute and Data Trends in Machine Learning."*

### 1.3 Annual Metric Coverage Matrix (2013–2023)

| Period | Private Investment ($B 2021 USD) | Notable Systems (Total) | Notable Systems (Industry) | Notable Systems (Academia) |
|:---:|:---:|:---:|:---:|:---:|
| **2013** | 6.012 | 19 | 7 | 10 |
| **2014** | 12.441 | 33 | 5 | 21 |
| **2015** | 18.168 | 29 | 13 | 9 |
| **2016** | 24.784 | 49 | 21 | 18 |
| **2017** | 41.013 | 55 | 26 | 18 |
| **2018** | 55.449 | 37 | 23 | 4 |
| **2019** | 64.214 | 68 | 30 | 12 |
| **2020** | 79.907 | 50 | 25 | 9 |
| **2021** | 145.403 | 79 | 46 | 9 |
| **2022** | 103.789 | 91 | 50 | 17 |
| **2023** | 92.793 | 119 | 69 | 18 |

- **Completeness Rate**: **100.0%** across all 11 years (44 observations total).
- **Missing Values**: 0 missing periods. All values are finite and non-negative.

---

## 2. OpenAlex API

- **Provider**: OurResearch (501(c)(3) nonprofit)
- **Base Endpoint**: `https://api.openalex.org/works`
- **Official Documentation**: https://docs.openalex.org/
- **Access Modality**: Public REST API + AWS S3 open bulk data dumps.
- **Core Information**:
  - ~300M scholarly works, authors, institutions, venues, and concepts.
  - Granular citation graph (`cited_by_count`, `referenced_works`).
  - Open Access availability statuses and direct PDF locations.
- **Rate Limits & Pagination**:
  - Unauthenticated rate limit: ~100,000 requests per day.
  - Polite Pool: Adding `mailto=your-email@domain.com` prioritizes requests.
  - Pagination: Cursor-based pagination (`cursor=*`) for large result queries.
- **Licensing**:
  - **CC0 1.0 Universal (Public Domain)** — fully permissive for academic and commercial reuse without restriction.
- **Biases & Methodological Constraints**:
  - Abstracts are served in an inverted index format (`{"word": [pos1, pos2]}`) requiring reconstruction.
  - Machine learning-based automated author disambiguation can occasionally merge distinct researchers with common names.
- **Cross-Dataset Join Keys**:
  - `doi` $\leftrightarrow$ arXiv published journal DOIs.
  - `ids.arxiv` $\leftrightarrow$ Canonical arXiv IDs.
  - `publication_year` $\leftrightarrow$ Chronological timeline alignment.

---

## 3. arXiv API

- **Provider**: Cornell University
- **Base Endpoint**: `http://export.arxiv.org/api/query`
- **Official Documentation**: https://info.arxiv.org/help/api/index.html
- **Access Modality**: REST API returning Atom 1.0 XML responses.
- **Core Information**:
  - Comprehensive preprints in Artificial Intelligence (`cs.AI`) and Machine Learning (`cs.LG`).
  - Plain-text abstracts, original submission dates (`<published>`), revision timestamps (`<updated>`), and primary subject categories.
- **Rate Limits & Etiquette**:
  - Hard requirement: **Minimum 3 seconds between successive HTTP calls**.
  - Max results per call: 2,000 (recommended $\le 500$).
  - Offset ceiling: 30,000 records.
- **Licensing**:
  - Metadata (titles, authors, abstracts): **CC0 Public Domain**.
  - Preprint full-text PDFs: Retained by authors under various licenses. The pipeline restricts ingestion strictly to open metadata.
- **Biases & Methodological Constraints**:
  - Preprints are un-refereed at time of submission.
  - Heavy self-selection skew toward computer science, mathematics, and physics.
- **Cross-Dataset Join Keys**:
  - `<arxiv:doi>` $\leftrightarrow$ OpenAlex `doi`.
  - arXiv ID $\leftrightarrow$ Hugging Face model card README references.

---

## 4. Hugging Face Hub API

- **Provider**: Hugging Face Inc.
- **Base Endpoint**: `https://huggingface.co/api/models`
- **Official Documentation**: https://huggingface.co/docs/hub/api
- **Access Modality**: Public REST API (JSON).
- **Core Information**:
  - Public repository metadata for over 1 million machine learning models.
  - Primary task tagging (`pipeline_tag`), framework (`transformers`, `diffusers`), licenses, 30-day download metrics, and community likes.
- **Rate Limits**:
  - Shared public IP quota for unauthenticated reads; exponential backoff on HTTP 429.
  - Pagination managed via HTTP `Link` headers.
- **Licensing**:
  - Platform metadata access is permitted under Hugging Face Terms of Service.
  - Individual model weights are governed by distinct creator licenses (Apache-2.0, MIT, Llama Community License).
- **Biases & Methodological Constraints**:
  - Download metrics capture automated CI/CD bot requests in addition to human practitioners.
  - Hub records skew toward open-weight architectures (e.g. LLaMA, Mistral) and omit closed proprietary APIs (e.g. GPT-4, Claude).
- **Cross-Dataset Join Keys**:
  - `createdAt` $\leftrightarrow$ Release milestone dates.
  - Model card citations $\leftrightarrow$ arXiv paper IDs.

---

## 5. Verified Historical Milestones & Governance Sources (1950–2026)

The Orbit Timeline tracks 20 peer-verified landmark milestones spanning October 1950 through February 2026, grounded in 22 canonical research sources.

### 5.1 Temporal Distinction: Milestones vs. Empirical Metrics
- **Historical Milestones (1950–2026)**: Track qualitative scientific breakthroughs, foundational architectures, commercial releases, and regulatory enforcement milestones. Primary sources include original peer-reviewed papers (Mind, Nature, Science, CVPR), open preprints (arXiv), official technical reports, and statutory legislative gazettes (EUR-Lex).
- **Multi-Year Empirical Metrics (2013–2023)**: Sourced strictly from the Stanford AI Index 2024 Report / Our World in Data / Epoch AI. Because institutional data collection, retrospective investment audits, and citation-velocity indexing by Stanford HAI and NetBase Quid are compiled on annual retrospective cycles, the empirical time-series metrics cover 2013–2023. They are kept methodologically separate from qualitative milestone dates to avoid synthetic data fabrication.

### 5.2 Chronological Registry of 20 Historical Milestones
1. **1950-10**: Computing Machinery and Intelligence (Turing Test) — Alan Turing (*Mind*)
2. **1956-08**: Dartmouth Summer Research Project on Artificial Intelligence — McCarthy et al. (*Dartmouth Archives*)
3. **1957-01**: The Perceptron — Frank Rosenblatt (*Cornell Aeronautical Lab / Psych. Rev.*)
4. **1986-10-09**: Backpropagation Learning Representations by Error Propagation — Rumelhart, Hinton, Williams (*Nature*)
5. **1997-05-11**: Deep Blue Defeats Garry Kasparov — Campbell, Hoane, Hsu (*Artificial Intelligence*)
6. **2012-09-30**: AlexNet Deep Convolutional Networks on ImageNet — Krizhevsky, Sutskever, Hinton (*NeurIPS*)
7. **2017-06-12**: Attention Is All You Need (Transformer Architecture) — Vaswani et al. (*NeurIPS / arXiv:1706.03762*)
8. **2020-05-28**: Language Models are Few-Shot Learners (GPT-3) — Brown et al. (*NeurIPS / arXiv:2005.14165*)
9. **2021-12-20**: High-Resolution Image Synthesis with Latent Diffusion Models — Rombach et al. (*CVPR 2022 / arXiv:2112.10752*)
10. **2022-11-30**: ChatGPT Launch & Conversational Alignment — OpenAI (*Official Announcement*)
11. **2023-03-14**: GPT-4 Multimodal Foundation Model & Technical Report — OpenAI (*arXiv:2303.08774*)
12. **2023-07-18**: Llama 2 Open Foundation and Fine-Tuned Chat Models — Touvron et al., Meta AI (*arXiv:2307.09288*)
13. **2023-12-18**: ISO/IEC 42001:2023 Artificial Intelligence Management System Standard — ISO/IEC JTC 1/SC 42 (*ISO Standard*)
14. **2024-05-08**: AlphaFold 3 Biomolecular Structure Prediction — Abramson et al., Google DeepMind (*Nature*)
15. **2024-05-13**: GPT-4o Omni Real-Time Multimodal Model — OpenAI (*Official Announcement*)
16. **2024-08-01**: European Union Artificial Intelligence Act Enters into Force — European Parliament & Council (*Regulation EU 2024/1689*)
17. **2024-09-12**: OpenAI o1 Reasoning Series & Test-Time Compute Scaling — OpenAI (*Official Documentation*)
18. **2025-01-22**: DeepSeek-R1 Open-Weight Reasoning Model via Reinforcement Learning — DeepSeek-AI (*arXiv:2501.12948*)
19. **2025-02-11**: Paris AI Action Summit Global Accord & International Scientific Report on the Safety of Advanced AI — Élysée & UK DSIT (*Intergovernmental Declaration*)
20. **2026-02-02**: EU AI Act Article 5 Prohibitions and GPAI Governance Standards Enforceable — European Commission AI Office (*Statutory Enforcement*)

