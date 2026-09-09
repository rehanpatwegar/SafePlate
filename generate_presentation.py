import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

print("Initializing Presentation...")
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

DARK_BG = RGBColor(15, 23, 42)
CYAN = RGBColor(6, 182, 212)
WHITE = RGBColor(248, 250, 252)
SLATE = RGBColor(148, 163, 184)
CARD_BG = RGBColor(30, 41, 59)

# Slide 1: Title
s1 = prs.slides.add_slide(prs.slide_layouts[6])
s1.background.fill.solid()
s1.background.fill.fore_color.rgb = DARK_BG

tb = s1.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.3), Inches(3.0))
tf = tb.text_frame
p1 = tf.paragraphs[0]
p1.text = "SafePlate"
p1.font.size = Pt(54)
p1.font.bold = True
p1.font.color.rgb = CYAN

p2 = tf.add_paragraph()
p2.text = "Intelligent Food Safety Inspection & Risk Management Platform"
p2.font.size = Pt(22)
p2.font.bold = True
p2.font.color.rgb = WHITE
p2.space_before = Pt(12)

p3 = tf.add_paragraph()
p3.text = "Automated Risk Scoring • AI Computer Vision Pre-Fill • Grounded GenAI Assistant"
p3.font.size = Pt(14)
p3.font.color.rgb = SLATE
p3.space_before = Pt(10)

# Slide 2: Challenges
s2 = prs.slides.add_slide(prs.slide_layouts[6])
s2.background.fill.solid()
s2.background.fill.fore_color.rgb = DARK_BG
tb2 = s2.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.3), Inches(5.5))
tf2 = tb2.text_frame
p = tf2.paragraphs[0]
p.text = "Food Safety Inspection Challenges & Solution"
p.font.size = Pt(28)
p.font.bold = True
p.font.color.rgb = CYAN

points = [
    ("Legacy Challenge: Reactive Inspection Cycles", "Health departments inspect restaurants on fixed calendars regardless of changing risk signals."),
    ("Legacy Challenge: Manual Reporting Bottlenecks", "Paper-based or disjointed violation tracking delays remediation for weeks."),
    ("SafePlate Solution: Dynamic Risk Recalculation", "Algorithmic & Random Forest risk scoring (90.7% accuracy) automatically updates facility priority."),
    ("SafePlate Solution: Computer Vision Hazard Pre-Fill", "Inspectors upload kitchen photos; AI detects temperature abuse, pests, and cross-contamination."),
    ("SafePlate Solution: Remediation Loop (Central Spice)", "Resolving violations plummets risk score from 84 (Critical) to 20 (Low Risk).")
]

for title, desc in points:
    p_t = tf2.add_paragraph()
    p_t.text = f"• {title}: {desc}"
    p_t.font.size = Pt(14)
    p_t.font.color.rgb = WHITE
    p_t.space_before = Pt(16)

# Slide 3: Architecture & Workflow
s3 = prs.slides.add_slide(prs.slide_layouts[6])
s3.background.fill.solid()
s3.background.fill.fore_color.rgb = DARK_BG
tb3 = s3.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.3), Inches(5.5))
tf3 = tb3.text_frame
p = tf3.paragraphs[0]
p.text = "System Architecture & 12-Step Operational Workflow"
p.font.size = Pt(28)
p.font.bold = True
p.font.color.rgb = CYAN

steps = [
    "1. Role Switcher: Inspector, Manager, Owner (Central Spice), Administrator",
    "2. Dashboard: Real-time municipal KPIs & Recharts risk distributions",
    "3. Establishments Directory: Filterable directory with live risk badges",
    "4. Restaurant Profile: Central Spice 84/100 visual score meter & history",
    "5. Inspection Lifecycle: Scheduled -> In Progress -> Submitted -> Resolved",
    "6. AI-Assisted Violations: Image upload with CV pre-fill (Cooler, Pantry, Prep)",
    "7. Corrective Actions Portal: Owner submits proof of fix & contractor logs",
    "8. Inspector Verification: Re-inspection approval triggers risk drop (84 -> 20)",
    "9. Grounded GenAI Assistant: Real-time interactive Q&A grounded in database"
]

for step in steps:
    p_s = tf3.add_paragraph()
    p_s.text = f"✓ {step}"
    p_s.font.size = Pt(13)
    p_s.font.color.rgb = WHITE
    p_s.space_before = Pt(10)

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "presentation")
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, "slides.pptx")
prs.save(out_file)
print(f"Presentation saved successfully to: {out_file}")
