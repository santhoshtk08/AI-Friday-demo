"""
receipt.py — FD receipt PDF generator using ReportLab
"""

import os
import tempfile
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


RECEIPTS_DIR = os.environ.get("FD_RECEIPTS_DIR", "/tmp/fd_receipts")
os.makedirs(RECEIPTS_DIR, exist_ok=True)


def generate_fd_receipt_pdf(fd: dict) -> str:
    """
    Generate a professional A4 PDF receipt for an FD account.
    Returns the file path.
    """
    pdf_path = os.path.join(RECEIPTS_DIR, f"FD_Receipt_{fd['fd_no']}.pdf")

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "BankTitle",
        parent=styles["Title"],
        fontSize=18,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1a3c6e"),
        alignment=TA_CENTER,
        spaceAfter=2,
    )
    subtitle_style = ParagraphStyle(
        "SubTitle",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica",
        textColor=colors.HexColor("#555555"),
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    receipt_label_style = ParagraphStyle(
        "ReceiptLabel",
        parent=styles["Normal"],
        fontSize=13,
        fontName="Helvetica-Bold",
        textColor=colors.white,
        alignment=TA_CENTER,
        spaceAfter=0,
    )
    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1a3c6e"),
        spaceAfter=4,
        spaceBefore=8,
    )
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER,
    )
    note_style = ParagraphStyle(
        "Note",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#555555"),
        alignment=TA_CENTER,
    )

    story = []

    # ── Bank Header ────────────────────────────────────────────────────
    story.append(Paragraph("National Community Bank", title_style))
    story.append(Paragraph("Fixed Deposit Receipt", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1a3c6e")))
    story.append(Spacer(1, 6))

    # ── Receipt Banner ─────────────────────────────────────────────────
    banner_data = [[
        Paragraph("FIXED DEPOSIT CONFIRMATION", receipt_label_style)
    ]]
    banner_table = Table(banner_data, colWidths=["100%"])
    banner_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1a3c6e")),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROUNDEDCORNERS", [4]),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # ── FD Number + Issue Date (top right) ────────────────────────────
    meta_data = [
        ["FD Account No:", fd["fd_no"], "Issue Date:", datetime.now().strftime("%d-%b-%Y")],
        ["Status:", fd.get("status", "Active"), "Issued By:", fd.get("created_by", "—")],
    ]
    meta_table = Table(meta_data, colWidths=[45 * mm, 65 * mm, 35 * mm, 50 * mm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",  (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (1, 0), (1, 0), colors.HexColor("#1a3c6e")),  # FD no in blue
        ("FONTNAME",  (1, 0), (1, 0), "Helvetica-Bold"),
        ("FONTSIZE",  (1, 0), (1, 0), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))

    # ── Customer Details ───────────────────────────────────────────────
    story.append(Paragraph("Customer Details", section_header_style))
    kyc_data = [
        ["Customer Name", ":", fd["customer_name"]],
        ["ID Type",       ":", fd["id_type"]],
        ["ID Number",     ":", fd["id_number"]],
    ]
    kyc_table = Table(kyc_data, colWidths=[45 * mm, 5 * mm, 145 * mm])
    kyc_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f4f8ff")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#dce7f5")),
    ]))
    story.append(kyc_table)
    story.append(Spacer(1, 8))

    # ── FD Details ─────────────────────────────────────────────────────
    story.append(Paragraph("Fixed Deposit Details", section_header_style))

    interest_type_label = "Annual Compound" if fd["interest_type_used"] == "compound" else "Simple Interest"
    tenure_str = f"{fd['tenure_value']} {fd['tenure_unit']}"

    fd_data = [
        ["Principal Amount",    ":",
         f"Rs. {fd['deposit_amount']:,.2f}",
         "Interest Type",       ":",
         interest_type_label],
        ["Interest Rate (p.a.)", ":",
         f"{fd['interest_rate']}%",
         "Tenure",              ":",
         tenure_str],
        ["Start Date",          ":",
         _fmt_date(fd["start_date"]),
         "Maturity Date",       ":",
         _fmt_date(fd["maturity_date"])],
        ["Maturity Amount",     ":",
         f"Rs. {fd['maturity_amount']:,.2f}",
         "",                    "",
         ""],
    ]

    fd_table = Table(fd_data, colWidths=[45 * mm, 5 * mm, 50 * mm, 42 * mm, 5 * mm, 48 * mm])
    fd_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",  (3, 0), (3, -1), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        # Highlight maturity amount
        ("FONTNAME",  (2, 3), (2, 3), "Helvetica-Bold"),
        ("FONTSIZE",  (2, 3), (2, 3), 11),
        ("TEXTCOLOR", (2, 3), (2, 3), colors.HexColor("#1a3c6e")),
        # Row shading
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef4ff")),
        ("BACKGROUND", (0, 1), (-1, 1), colors.white),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#eef4ff")),
        ("BACKGROUND", (0, 3), (-1, 3), colors.HexColor("#d0e7ff")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#c5d8f0")),
    ]))
    story.append(fd_table)
    story.append(Spacer(1, 14))

    # ── Interest Summary Box ───────────────────────────────────────────
    interest_earned = fd["maturity_amount"] - fd["deposit_amount"]
    summary_data = [
        ["SUMMARY", "", ""],
        ["Principal Deposited",
         f"Rs. {fd['deposit_amount']:,.2f}", ""],
        ["Total Interest Earned",
         f"Rs. {interest_earned:,.2f}", ""],
        ["Maturity Amount Payable",
         f"Rs. {fd['maturity_amount']:,.2f}", ""],
    ]
    summary_table = Table(summary_data, colWidths=[100 * mm, 65 * mm, 30 * mm])
    summary_table.setStyle(TableStyle([
        # Header row
        ("SPAN",       (0, 0), (-1, 0)),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a3c6e")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN",      (0, 0), (-1, 0), "CENTER"),
        ("FONTSIZE",   (0, 0), (-1, 0), 10),
        # Data rows
        ("FONTNAME",   (0, 1), (0, -1), "Helvetica"),
        ("FONTNAME",   (1, 1), (1, -1), "Helvetica-Bold"),
        ("ALIGN",      (1, 0), (1, -1), "RIGHT"),
        ("FONTSIZE",   (0, 1), (-1, -1), 9),
        # Highlight last row
        ("BACKGROUND", (0, 3), (-1, 3), colors.HexColor("#cce5ff")),
        ("FONTNAME",   (0, 3), (-1, 3), "Helvetica-Bold"),
        ("FONTSIZE",   (1, 3), (1, 3), 11),
        ("TEXTCOLOR",  (1, 3), (1, 3), colors.HexColor("#1a3c6e")),
        # Padding and borders
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("BOX",  (0, 0), (-1, -1), 1, colors.HexColor("#1a3c6e")),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#1a3c6e")),
        ("GRID", (0, 1), (-1, -1), 0.3, colors.HexColor("#aaccee")),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 20))

    # ── Signature Line ─────────────────────────────────────────────────
    sig_data = [["Authorised Signatory", "", "Branch Stamp"]]
    sig_table = Table(sig_data, colWidths=[80 * mm, 40 * mm, 75 * mm])
    sig_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",  (0, 0), (-1, -1), 9),
        ("ALIGN",     (0, 0), (0, 0), "LEFT"),
        ("ALIGN",     (2, 0), (2, 0), "RIGHT"),
        ("LINEABOVE", (0, 0), (0, 0), 0.5, colors.black),
        ("LINEABOVE", (2, 0), (2, 0), 0.5, colors.black),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(sig_table)
    story.append(Spacer(1, 12))

    # ── Footer ─────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "This is a system-generated document and does not require a physical signature.",
        note_style
    ))
    story.append(Paragraph(
        f"Generated on: {datetime.now().strftime('%d-%b-%Y %H:%M:%S')}  |  "
        "National Community Bank, Fixed Deposit Department",
        footer_style
    ))
    story.append(Paragraph(
        "Terms: FD is subject to applicable TDS deductions. Premature withdrawal may attract penalty.",
        footer_style
    ))

    doc.build(story)
    return pdf_path


def _fmt_date(date_str: str) -> str:
    """Format ISO date string to readable format."""
    try:
        return datetime.fromisoformat(date_str).strftime("%d-%b-%Y")
    except Exception:
        return date_str