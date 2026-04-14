package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.LedgerEntry;
import com.multivendor.ecommercebackend.repository.LedgerRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class TransactionExportService {

    @Autowired
    private LedgerRepository ledgerRepository;

    public byte[] exportTransactionsAsCSV(LocalDateTime startDate, LocalDateTime endDate) {
        List<LedgerEntry> entries = ledgerRepository.findByCreatedAtBetween(startDate, endDate);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Transaction ID,Order ID,Type,Amount,Reference ID,Timestamp\n");

        for (LedgerEntry entry : entries) {
            csv.append(entry.getId())
                    .append(",")
                    .append(entry.getOrderId())
                    .append(",")
                    .append(entry.getType())
                    .append(",")
                    .append(entry.getAmount())
                    .append(",")
                    .append(entry.getReferenceId())
                    .append(",")
                    .append(entry.getCreatedAt())
                    .append("\n");
        }

        log.info("Exported {} transactions to CSV", entries.size());
        return csv.toString().getBytes();
    }

    public byte[] exportTransactionsAsExcel(LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        List<LedgerEntry> entries = ledgerRepository.findByCreatedAtBetween(startDate, endDate);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Transactions");

        // Header row
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Transaction ID");
        headerRow.createCell(1).setCellValue("Order ID");
        headerRow.createCell(2).setCellValue("Type");
        headerRow.createCell(3).setCellValue("Amount");
        headerRow.createCell(4).setCellValue("Reference ID");
        headerRow.createCell(5).setCellValue("Timestamp");

        // Data rows
        int rowNum = 1;
        for (LedgerEntry entry : entries) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getId());
            row.createCell(1).setCellValue(entry.getOrderId());
            row.createCell(2).setCellValue(entry.getType().toString());
            row.createCell(3).setCellValue(entry.getAmount());
            row.createCell(4).setCellValue(entry.getReferenceId());
            row.createCell(5).setCellValue(entry.getCreatedAt().toString());
        }

        // Auto-size columns
        for (int i = 0; i < 6; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        log.info("Exported {} transactions to Excel", entries.size());
        return baos.toByteArray();
    }

    public byte[] exportTransactionsAsPDF(LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        List<LedgerEntry> entries = ledgerRepository.findByCreatedAtBetween(startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Paragraph title = new Paragraph("Transaction Report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // Date range
            Paragraph dateRange = new Paragraph("Period: " + startDate + " to " + endDate);
            dateRange.setAlignment(Element.ALIGN_CENTER);
            document.add(dateRange);
            document.add(new Paragraph("\n"));

            // Table
            com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(6);
            table.setWidthPercentage(100);

            // Header
            table.addCell("Transaction ID");
            table.addCell("Order ID");
            table.addCell("Type");
            table.addCell("Amount");
            table.addCell("Reference ID");
            table.addCell("Timestamp");

            // Data
            for (LedgerEntry entry : entries) {
                table.addCell(entry.getId());
                table.addCell(entry.getOrderId());
                table.addCell(entry.getType().toString());
                table.addCell(String.valueOf(entry.getAmount()));
                table.addCell(entry.getReferenceId());
                table.addCell(entry.getCreatedAt().toString());
            }

            document.add(table);
            document.close();

            log.info("Exported {} transactions to PDF", entries.size());
            return baos.toByteArray();

        } catch (DocumentException e) {
            log.error("Error generating PDF", e);
            throw new IOException(e);
        }
    }
}
