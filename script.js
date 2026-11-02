const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else { revealItems.forEach(item => item.classList.add('visible')); }
const heroVisual = document.querySelector('.hero-visual');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroVisual && window.matchMedia('(pointer:fine)').matches && !reducedMotion) {
  // Move only the visual layers with CSS variables; never rotate the hero container,
  // so the four approved holographic panels retain their exact positions.
  heroVisual.addEventListener('pointermove', event => {
    const rect = heroVisual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    heroVisual.style.setProperty('--pointer-x', `${x}%`);
    heroVisual.style.setProperty('--pointer-y', `${y}%`);
  });
  heroVisual.addEventListener('pointerleave', () => {
    heroVisual.style.setProperty('--pointer-x', '50%');
    heroVisual.style.setProperty('--pointer-y', '45%');
  });
}

// Fine particle field: restrained ambient depth around the existing hero artwork.
if (heroVisual && !reducedMotion) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles'; canvas.setAttribute('aria-hidden', 'true');
  heroVisual.append(canvas);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    let particles = [], frame = 0, width = 0, height = 0;
    const resize = () => {
      const rect = heroVisual.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(46, Math.max(18, Math.round(width / 13)));
      particles = Array.from({length: count}, () => ({x:Math.random()*width,y:Math.random()*height,r:.5+Math.random()*1.35,a:.12+Math.random()*.35,s:.08+Math.random()*.22,p:Math.random()*6.28}));
    };
    const draw = () => {
      ctx.clearRect(0,0,width,height);
      particles.forEach(p => {
        p.y -= p.s; p.x += Math.sin(frame*.008+p.p)*.12;
        if(p.y < -4){p.y=height+4;p.x=Math.random()*width;}
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(157,190,255,${p.a})`;ctx.shadowBlur=9;ctx.shadowColor='rgba(105,145,255,.55)';ctx.fill();
      });
      frame++; requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener('resize', resize, {passive:true});
  }
}

// Thin reading-progress indicator; no content or layout changes.
const progress = document.createElement('div'); progress.className = 'experience-progress'; progress.setAttribute('aria-hidden','true'); document.body.append(progress);
let progressTick = false;
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty('--scroll-progress', `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
  progressTick = false;
};
window.addEventListener('scroll', () => { if(!progressTick){requestAnimationFrame(updateProgress);progressTick=true;} }, {passive:true});
updateProgress();

// Cursor-following light on project cards, with no movement of card content.
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    const rect=card.getBoundingClientRect();
    card.style.setProperty('--card-x',`${event.clientX-rect.left}px`);
    card.style.setProperty('--card-y',`${event.clientY-rect.top}px`);
  });
});

// Detailed project stories. Figures are reported project metrics; workflow descriptions are generalized for confidentiality.
const projectDetails = [
  {
    kicker: 'HURON · GENAI · RAG · AWS BEDROCK', title: 'Clinical Supplies Categorization',
    sections: [
      ['The business problem', 'Clinical supply descriptions arrive in inconsistent language and must be assigned to a standardized, multi-level taxonomy. Exact descriptions may be sparse or unfamiliar, while similar items can belong to different categories depending on their clinical use and anatomical context.'],
      ['Solution overview', 'Built a retrieval-assisted classification workflow on AWS Bedrock. The process starts with exact-item lookup. For unseen or insufficiently described items, Claude enriches the clinical description; the enriched text is then used to retrieve similar records from the Knowledge Base.'],
      ['Retrieval and decision logic', 'The retrieval stage returns the top 8 similar items and combines 70% semantic vector similarity with 30% text similarity. Strong matches can guide direct assignment; otherwise, retrieved taxonomy context is supplied to Claude for taxonomy-constrained classification across the required levels.'],
      ['Quality controls', 'Added anatomical-site detection and post-classification consistency checks to reduce cross-joint mismatches. The wider workflow also uses structured outputs, explicit out-of-scope handling, validation, resumable processing and run-level cost tracking.'],
      ['Evaluation and delivery', 'The work included comparison against an LLM-only baseline to understand the contribution of retrieval. Six production models were delivered across three taxonomy levels and three orthopedic attribute domains.'],
      ['Reported outcomes', 'Achieved 90%+ accuracy across six completed engagements for seven clients. A separate pipeline-optimization result improved reported accuracy from 55% to 95%, reduced manual review from 67.5 to 7.5 hours per engagement and shortened turnaround from 10 business days to 1–2 days. The optimization projection was $101,467.50 in annual savings across 15 engagements; completed-engagement savings were separately reported as $17,100 across six engagements.']
    ], flow: ['Input clinical item','Exact-item lookup','Claude description enrichment (if needed)','Top-8 Knowledge Base retrieval','70% semantic + 30% text similarity','Taxonomy-constrained classification','Anatomical-site / consistency checks','Prediction or review'], tags: ['AWS Bedrock','Claude','Knowledge Bases','Embeddings','Hybrid retrieval','Taxonomy classification','Evaluation']
  },
  {
    kicker: 'HURON · AP · GENAI · KNOWLEDGE BASE', title: 'AP Vendor Categorization — From Purchased Services ML to GenAI',
    sections: [
      ['The starting point: Purchased Services', 'The earlier Purchased Services categorization work used a traditional supervised machine-learning approach. An SGD-based classifier learned category patterns from labelled examples and achieved approximately 85% accuracy on a test set. This established a practical baseline for automating spend categorization, but depended on the training examples and the consistency of the available text.'],
      ['Why the approach evolved', 'The later AP Vendor Categorization work addressed a broader vendor-level problem: vendor names and descriptions can be inconsistent, category definitions can overlap, and the same vendor may appear in multiple forms. Rather than treating the earlier SGD model as the final answer, the solution evolved toward a more context-aware workflow using curated vendor knowledge, deterministic rules, retrieval and LLM reasoning. This is an evolution in the problem-solving approach—not a claim that the SGD model was simply converted into an LLM.'],
      ['What I built', 'A multi-stage GenAI and Knowledge Base workflow on AWS Bedrock. It uses a curated vendor lookup, deterministic handling for patient-refund cases, vendor-name and entity checks, Claude-generated vendor descriptions, and vendor-identity-based Knowledge Base retrieval.'],
      ['Retrieval and classification', 'A Knowledge Base similarity score of 80% or above can be used for direct assignment. When the match is weaker, Claude classifies the vendor using the retrieved vendor context and category definitions. If Stage 1 Claude confidence is below 70%, Stage 2 adds GL-account and department signals to provide more context.'],
      ['Controls and consolidation', 'Added explicit low-confidence review paths rather than forcing uncertain predictions. Predictions are consolidated to one category per vendor using majority voting. The workflow also includes curated lookup handling and deterministic exceptions to keep known cases out of unnecessary LLM inference.'],
      ['Reported outcomes', 'The AP Vendor Categorization workflow achieved 70–80% reported accuracy across four client engagements, saved approximately 50 hours of manual review per engagement and delivered $22,800 in reported savings across those four engagements.']
    ], flow: ['Vendor records','Curated lookup + deterministic exceptions','Vendor identity / entity checks','Vendor description enrichment','Vendor Knowledge Base retrieval','≥80% match: direct assignment','Below threshold: Claude Stage 1','Confidence <70%: add GL + department signals','Stage 2 / review + vendor-level majority vote'], tags: ['SGD baseline','AWS Bedrock','Claude','Knowledge Bases','Vendor enrichment','GL / department context','Confidence routing','Human review']
  },
  {
    kicker: 'HURON · NLP · SENTIMENT ANALYSIS', title: 'Rounding Vnext Sentiment Analysis',
    sections: [
      ['The problem', 'Large volumes of free-text feedback are difficult to inspect manually. Teams need a scalable way to understand sentiment and identify recurring issues, especially within negative feedback.'],
      ['What I built', 'A deployed sentiment-analysis workflow using AWS Comprehend to classify hundreds of thousands of feedback comments. The output made unstructured comments easier to summarize and review at scale.'],
      ['Theme extraction', 'Applied YAKE keyword extraction specifically to negative comments. Restricting keyword analysis to negative feedback helped surface recurring terms and potential issue themes for further investigation.'],
      ['Evaluation', 'The sentiment workflow achieved approximately 80% accuracy on a labelled test dataset. This is the reported test-set result, not a claim of perfect sentiment interpretation for every comment.'],
      ['Practical value', 'Combined sentiment labels and negative-feedback themes into a more structured view of customer feedback, supporting faster exploration and prioritization of recurring concerns.']
    ], flow: ['Feedback comments','Text preparation','AWS Comprehend sentiment classification','Separate negative feedback','YAKE keyword extraction','Aggregate sentiment + recurring themes','Explore and prioritize issues'], tags: ['AWS Comprehend','YAKE','NLP','Sentiment analysis','Text preprocessing','Theme discovery']
  },
  {
    kicker: 'HURON · PREDICTIVE ML · HEALTHCARE', title: 'Revenue Cycle Authorization Prediction',
    sections: [
      ['The problem', 'Revenue-cycle teams need to identify cases that require authorization so that the appropriate follow-up can happen earlier in the workflow.'],
      ['What I built', 'Developed an XGBoost classification proof of concept using approximately 100,000 records to predict authorization requirements. The work framed authorization need as a supervised prediction problem over structured revenue-cycle data.'],
      ['Modelling approach', 'Prepared the dataset, performed exploratory analysis and feature engineering, trained the XGBoost classifier and evaluated its predictions against the labelled outcome. The model output was intended to help identify cases for operational attention.'],
      ['Reported outcome and scope', 'Approximately 97% reported model accuracy on the proof of concept. This was a POC rather than a claim of a fully deployed production system.']
    ], flow: ['Historical revenue-cycle records','Data preparation + feature engineering','XGBoost classifier','Authorization required?','Prediction for operational prioritization','POC evaluation'], tags: ['Python','XGBoost','~100K records','Feature engineering','Classification','Healthcare analytics']
  },
  {
    kicker: 'HURON · EDUCATION ANALYTICS · PREDICTIVE MODELLING', title: 'IPEDS Graduation Rate Analysis',
    sections: [
      ['The problem', 'Institutional graduation outcomes vary across institutions and academic years. The analysis examined multi-year IPEDS data to model graduation-rate outcomes and study patterns that may help explain differences.'],
      ['Dataset and preparation', 'Worked with data covering 150 institutions across four academic years. The analysis involved preparing and exploring institutional data for modelling and comparison.'],
      ['Model development', 'Developed a Random Forest model and benchmarked it against LightGBM and XGBoost. The comparison provided a way to assess alternative tree-based approaches for the graduation-rate prediction task.'],
      ['Reported outcome', 'Reported predictive performance was approximately 85%, with RMSE of ±7.5 percentage points. The RMSE is the more interpretable error measure for the graduation-rate estimate.']
    ], flow: ['IPEDS institutional data','4 academic years · 150 institutions','Data preparation + EDA','Random Forest model','Benchmark LightGBM + XGBoost','Compare model performance','Graduation-rate estimates / analysis'], tags: ['IPEDS','Random Forest','LightGBM','XGBoost','EDA','Regression / prediction']
  },
  {
    kicker: 'GANIT · RETAIL ANALYTICS · DEEP LEARNING', title: 'MRL Retail Pricing Prediction',
    sections: [
      ['The problem', 'The business team needed quantitative pricing estimates from historical retail data to support pricing decisions.'],
      ['Dataset and modelling', 'Developed a deep-learning pricing prediction model using approximately 50,000 retail records. The project involved data preprocessing, exploratory analysis, feature engineering, model development and evaluation.'],
      ['Collaboration', 'Worked with a five-member team and translated model outputs into inputs that could support business pricing decisions.'],
      ['Reported outcome', 'The model achieved an R² score of 0.90. This indicates strong fit on the evaluated data; it should not be interpreted as a 90% classification accuracy.']
    ], flow: ['Historical retail records (~50K)','Preprocessing + EDA','Feature engineering','Deep-learning regression model','Model evaluation (R²)','Pricing estimates for business decisions'], tags: ['Deep learning','Python','Retail analytics','Feature engineering','Regression','R² = 0.90']
  },
  {
    kicker: 'QUADGEN · TELECOM ANALYTICS · MACHINE LEARNING', title: 'Cellular Network Anomaly Detection',
    sections: [
      ['The problem', 'Network operations teams monitor base-station behaviour for abnormal conditions. Traffic spikes, resource exhaustion and performance degradation can require investigation, and manual monitoring can be time-consuming.'],
      ['What I built', 'Developed a binary machine-learning classifier across 10 base stations to distinguish normal operating behaviour (Label 0) from anomalous behaviour (Label 1).'],
      ['Model development and evaluation', 'Defined the normal-versus-anomalous target, tuned model parameters and evaluated performance using precision and recall. These measures helped assess both the quality of anomaly flags and the model’s ability to identify abnormal behaviour.'],
      ['Reported outcome', 'Approximately 90% reported accuracy. The solution was intended to support earlier fault identification, reduce manual monitoring effort and help network operations investigate unusual behaviour.']
    ], flow: ['Base-station telemetry / metrics','Define normal vs anomalous labels','Prepare model features','Binary anomaly classifier','Precision + recall evaluation','Flag abnormal behaviour for investigation'], tags: ['Telecom analytics','Binary classification','Model tuning','Precision / recall','10 base stations','Anomaly detection']
  }
];
const projectCards = document.querySelectorAll('.project-card');
const projectDialog = document.querySelector('.project-dialog');
if (projectDialog) {
  const title = projectDialog.querySelector('#project-dialog-title');
  const kicker = projectDialog.querySelector('.dialog-kicker');
  const content = projectDialog.querySelector('.dialog-content');
  const closeButton = projectDialog.querySelector('.dialog-close');
  projectCards.forEach((card, index) => {
    const openButton = card.querySelector('.project-open');
    openButton?.addEventListener('click', () => {
      const project = projectDetails[index]; if (!project) return;
      title.textContent = project.title; kicker.textContent = project.kicker; content.replaceChildren();
      project.sections.forEach(([heading, body], sectionIndex) => {
        const section = document.createElement('section'); section.style.setProperty('--section-index', sectionIndex); const h = document.createElement('h3'); const p = document.createElement('p');
        h.textContent = heading; p.textContent = body; section.append(h, p); content.append(section);
      });
      if (project.flow) {
        const flowSection = document.createElement('section'); flowSection.className = 'project-process';
        const heading = document.createElement('h3'); heading.textContent = 'Workflow at a glance'; flowSection.append(heading);
        const flow = document.createElement('ol'); flow.className = 'process-flow';
        project.flow.forEach((step, stepIndex) => { const li = document.createElement('li'); li.style.setProperty('--step-index', stepIndex); li.textContent = step; flow.append(li); });
        flowSection.append(flow); content.append(flowSection);
      }
      const tags = document.createElement('div'); tags.className = 'dialog-tags';
      project.tags.forEach(label => { const tag = document.createElement('span'); tag.textContent = label; tags.append(tag); });
      content.append(tags); projectDialog.showModal(); closeButton.focus();
    });
  });
  // One shared close handler works for every dynamically populated project.
  projectDialog.addEventListener('click', event => {
    if (event.target.closest('.dialog-close')) {
      event.preventDefault();
      event.stopPropagation();
      if (projectDialog.open) projectDialog.close();
      return;
    }
    if (event.target === projectDialog) projectDialog.close();
  });
  projectDialog.addEventListener('close', () => { document.activeElement?.blur?.(); });
}
