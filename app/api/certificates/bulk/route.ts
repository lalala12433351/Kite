import * as XLSX from 'xlsx';
import { bulkUpsertCertificates, rowsFromSheetMatrix } from '@/lib/certificates';
import { buildCertificateTemplateBuffer } from '@/lib/certificateExcelTemplate';
import { requireAdmin } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const form = await request.formData();
    const file = form.get('file');
    const overwrite = String(form.get('overwrite') || 'true') !== 'false';

    if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
      return Response.json({ success: false, error: 'Excel file is required' }, { status: 400 });
    }

    const name = String((file as File).name || '').toLowerCase();
    if (!/\.(xlsx|xls|csv)$/.test(name)) {
      return Response.json({ success: false, error: 'Upload an .xlsx, .xls, or .csv file' }, { status: 400 });
    }

    const buffer = Buffer.from(await (file as File).arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return Response.json({ success: false, error: 'Workbook has no sheets' }, { status: 400 });
    }
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true }) as unknown[][];
    const rows = rowsFromSheetMatrix(matrix);
    if (!rows.length) {
      return Response.json(
        {
          success: false,
          error:
            'No data rows found. Use headers: Certificate Number, Student Name, Batch, Issue Date, Status.',
        },
        { status: 400 },
      );
    }

    const result = bulkUpsertCertificates(rows, { overwrite });
    return Response.json({
      success: true,
      message: `Imported ${result.added} new, updated ${result.updated}, skipped ${result.skipped}`,
      ...result,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Bulk import failed' },
      { status: 400 },
    );
  }
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const buffer = buildCertificateTemplateBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="kite-certificates-template.xlsx"',
    },
  });
}
