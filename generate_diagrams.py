"""
Generate high-resolution architecture and database schema diagrams for SafePlate documentation.
"""

import os
from PIL import Image, ImageDraw, ImageFont

def generate_architecture_diagram(output_path):
    width, height = 1600, 900
    img = Image.new('RGB', (width, height), color='#090d16')
    draw = ImageDraw.Draw(img)

    try:
        title_font = ImageFont.truetype("arial.ttf", 36)
        header_font = ImageFont.truetype("arialbd.ttf", 22)
        body_font = ImageFont.truetype("arial.ttf", 16)
        code_font = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        code_font = ImageFont.load_default()

    # Title header
    draw.rectangle([(0, 0), (width, 90)], fill='#0f172a')
    draw.line([(0, 90), (width, 90)], fill='#1e293b', width=2)
    draw.text((50, 25), "SafePlate Platform Architecture — Full-Stack & Intelligence Flow", fill='#38bdf8', font=title_font)

    # 4 Architecture Columns / Layers
    boxes = [
        {
            "title": "1. PRESENTATION LAYER (Vite + React)",
            "color": "#06b6d4",
            "bg": "#0c2333",
            "rect": (50, 140, 390, 800),
            "items": [
                ("User Role Switcher", "Inspector, Manager, Owner, Admin"),
                ("Operational Dashboard", "KPI Cards, Live Risk Meter, Analytics"),
                ("Establishments Directory", "Filterable List, 84/100 Case Study"),
                ("Inspection Operations", "Scheduling, Audit Workflow States"),
                ("Violations Registry", "Severity Weighting, Image Proof"),
                ("Corrective Actions Portal", "Proof Upload, Inspector Re-Inspection"),
                ("GenAI Intelligence View", "Interactive Chat, Grounded Citations"),
                ("Recharts Visual Analytics", "Risk Distribution & Category Bar Charts")
            ]
        },
        {
            "title": "2. REST API LAYER (Express.js)",
            "color": "#3b82f6",
            "bg": "#0f2042",
            "rect": (440, 140, 780, 800),
            "items": [
                ("/api/auth", "Role switcher & permission profiles"),
                ("/api/establishments", "CRUD, zone filtering, detail profiles"),
                ("/api/inspections", "Lifecycle: Scheduled -> Submitted -> Resolved"),
                ("/api/violations", "Logging, category classification, images"),
                ("/api/corrective-actions", "Proof submission & re-inspect verify"),
                ("/api/risk/recalculate/:id", "Dynamic risk recalculation (84 -> 20)"),
                ("/api/risk/metrics", "High-level municipal health analytics"),
                ("/api/genai/explain-risk", "Grounded risk explanation engine"),
                ("/api/genai/detect-violation", "Computer vision photo analysis")
            ]
        },
        {
            "title": "3. DATA PERSISTENCE LAYER",
            "color": "#10b981",
            "bg": "#0d2b22",
            "rect": (830, 140, 1170, 800),
            "items": [
                ("Hybrid Storage Architecture", "Supabase Client & In-Memory Fallback"),
                ("establishments Table", "10 seeded diverse facilities (Central Spice)"),
                ("inspections Table", "Audit dates, scores, inspector identities"),
                ("violations Table", "Category, severity, photo evidence URLs"),
                ("corrective_actions Table", "Remediation descriptions & sign-offs"),
                ("Dynamic State Mutations", "In-memory reactivity & live persistence"),
                ("Database Schema DDL", "PostgreSQL DDL script (schema.sql)")
            ]
        },
        {
            "title": "4. ML & GENAI ENGINES",
            "color": "#a855f7",
            "bg": "#25123d",
            "rect": (1220, 140, 1550, 800),
            "items": [
                ("Random Forest Classifier", "ml-model/risk_model.py (90.7% Acc)"),
                ("Trained Model Artifact", "risk_model.pkl (Scikit-Learn)"),
                ("Inference Features", "Critical, Major, Minor, Days Overdue"),
                ("Dynamic Scoring Heuristic", "Base + (Crit*35) + (Maj*15) + (Min*5)"),
                ("Gemini 1.5 Flash SDK", "@google/generative-ai integration"),
                ("Inspection Briefings", "Automated pre-audit targeted briefs"),
                ("Computer Vision Analysis", "Simulated kitchen hygiene CV models")
            ]
        }
    ]

    for b in boxes:
        rx1, ry1, rx2, ry2 = b["rect"]
        draw.rectangle([(rx1, ry1), (rx2, ry2)], fill=b["bg"], outline=b["color"], width=2)
        # Header box
        draw.rectangle([(rx1, ry1), (rx2, ry1 + 55)], fill='#1e293b')
        draw.text((rx1 + 15, ry1 + 18), b["title"], fill=b["color"], font=header_font)

        y = ry1 + 75
        for heading, desc in b["items"]:
            draw.rectangle([(rx1 + 12, y), (rx2 - 12, y + 58)], fill='#0b1329', outline='#1e293b', width=1)
            draw.text((rx1 + 22, y + 8), heading, fill='#ffffff', font=body_font)
            draw.text((rx1 + 22, y + 32), desc, fill='#94a3b8', font=code_font)
            y += 66

    # Horizontal Connector Arrows
    arrow_color = '#38bdf8'
    for y_pos in [280, 480, 680]:
        draw.line([(390, y_pos), (440, y_pos)], fill=arrow_color, width=3)
        draw.line([(780, y_pos), (830, y_pos)], fill=arrow_color, width=3)
        draw.line([(1170, y_pos), (1220, y_pos)], fill=arrow_color, width=3)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, quality=95)
    print(f"Saved architecture diagram to: {output_path}")

def generate_schema_diagram(output_path):
    width, height = 1500, 850
    img = Image.new('RGB', (width, height), color='#090d16')
    draw = ImageDraw.Draw(img)

    try:
        title_font = ImageFont.truetype("arial.ttf", 34)
        header_font = ImageFont.truetype("arialbd.ttf", 20)
        col_font = ImageFont.truetype("arialbd.ttf", 15)
        type_font = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        col_font = ImageFont.load_default()
        type_font = ImageFont.load_default()

    draw.rectangle([(0, 0), (width, 85)], fill='#0f172a')
    draw.line([(0, 85), (width, 85)], fill='#1e293b', width=2)
    draw.text((50, 25), "SafePlate Relational Database Schema (PostgreSQL)", fill='#10b981', font=title_font)

    tables = [
        {
            "name": "establishments",
            "color": "#06b6d4",
            "rect": (50, 130, 380, 780),
            "columns": [
                ("id (PK)", "SERIAL PRIMARY KEY"),
                ("name", "VARCHAR(255) NOT NULL"),
                ("type", "VARCHAR(100) NOT NULL"),
                ("address", "VARCHAR(255) NOT NULL"),
                ("zone", "VARCHAR(50) NOT NULL"),
                ("risk_score", "INTEGER NOT NULL"),
                ("risk_category", "VARCHAR(50) NOT NULL"),
                ("last_inspection_date", "DATE"),
                ("phone", "VARCHAR(50)"),
                ("email", "VARCHAR(100)"),
                ("owner_name", "VARCHAR(100)"),
                ("operating_license", "VARCHAR(100)"),
                ("created_at", "TIMESTAMPTZ")
            ]
        },
        {
            "name": "inspections",
            "color": "#3b82f6",
            "rect": (430, 130, 760, 600),
            "columns": [
                ("id (PK)", "SERIAL PRIMARY KEY"),
                ("establishment_id (FK)", "INTEGER -> establishments(id)"),
                ("inspector_name", "VARCHAR(100) NOT NULL"),
                ("inspection_date", "DATE NOT NULL"),
                ("status", "VARCHAR(50) NOT NULL"),
                ("score", "INTEGER"),
                ("notes", "TEXT"),
                ("created_at", "TIMESTAMPTZ")
            ]
        },
        {
            "name": "violations",
            "color": "#ef4444",
            "rect": (810, 130, 1140, 620),
            "columns": [
                ("id (PK)", "SERIAL PRIMARY KEY"),
                ("inspection_id (FK)", "INTEGER -> inspections(id)"),
                ("category", "VARCHAR(100) NOT NULL"),
                ("severity", "VARCHAR(50) NOT NULL"),
                ("description", "TEXT NOT NULL"),
                ("evidence_image_url", "TEXT"),
                ("corrective_action_status", "VARCHAR(50) DEFAULT 'Pending'"),
                ("created_at", "TIMESTAMPTZ")
            ]
        },
        {
            "name": "corrective_actions",
            "color": "#10b981",
            "rect": (1180, 130, 1460, 620),
            "columns": [
                ("id (PK)", "SERIAL PRIMARY KEY"),
                ("violation_id (FK)", "INTEGER -> violations(id)"),
                ("action_taken", "TEXT NOT NULL"),
                ("evidence_url", "TEXT"),
                ("submitted_at", "TIMESTAMPTZ"),
                ("status", "VARCHAR(50) DEFAULT 'Submitted'"),
                ("verified_by", "VARCHAR(100)"),
                ("verified_at", "TIMESTAMPTZ")
            ]
        }
    ]

    for t in tables:
        rx1, ry1, rx2, ry2 = t["rect"]
        draw.rectangle([(rx1, ry1), (rx2, ry2)], fill='#0b1329', outline=t["color"], width=2)
        draw.rectangle([(rx1, ry1), (rx2, ry1 + 50)], fill='#1e293b')
        draw.text((rx1 + 20, ry1 + 15), t["name"], fill=t["color"], font=header_font)

        y = ry1 + 65
        for col, col_type in t["columns"]:
            draw.text((rx1 + 20, y), col, fill='#ffffff', font=col_font)
            draw.text((rx1 + 20, y + 20), col_type, fill='#94a3b8', font=type_font)
            draw.line([(rx1 + 15, y + 42), (rx2 - 15, y + 42)], fill='#1e293b', width=1)
            y += 48

    # Foreign Key Connectors
    draw.line([(380, 240), (430, 240)], fill='#38bdf8', width=3) # establishments -> inspections
    draw.line([(760, 240), (810, 240)], fill='#ef4444', width=3) # inspections -> violations
    draw.line([(1140, 240), (1180, 240)], fill='#10b981', width=3) # violations -> corrective_actions

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, quality=95)
    print(f"Saved database schema diagram to: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(base_dir, "docs")
    generate_architecture_diagram(os.path.join(docs_dir, "architecture.png"))
    generate_schema_diagram(os.path.join(docs_dir, "database-schema.png"))
