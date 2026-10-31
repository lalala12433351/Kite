import { z } from 'zod';
import { saveFormLead } from '@/lib/formLeads';
import { sendFormMail } from '@/lib/mail';

const email = z.string().trim().email();

const schemas = {
  enquiry: z.object({
    formTitle: z.string().optional(),
    name: z.string().trim().min(1),
    email,
    mobile: z.string().trim().min(5),
    age: z.string().optional(),
    gender: z.string().optional(),
    cityState: z.string().optional(),
    qualification: z.string().optional(),
  }).passthrough(),
  contact: z.object({
    formTitle: z.string().optional(),
    name: z.string().trim().min(1),
    email,
    mobile: z.string().trim().min(5),
    age: z.string().optional(),
    gender: z.string().optional(),
    cityState: z.string().optional(),
    message: z.string().optional(),
    feedback: z.string().optional(),
  }).passthrough(),
  job: z.object({
    name: z.string().trim().min(1),
    email,
    mobile: z.string().trim().min(5),
    position: z.string().optional(),
    jobTitle: z.string().optional(),
    message: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.string().optional(),
    cityState: z.string().optional(),
  }).passthrough(),
  chat: z.object({
    name: z.string().trim().min(1),
    email: z.string().optional(),
    mobile: z.string().optional(),
    phone: z.string().optional(),
  }).passthrough(),
};

async function readFields(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    return request.json();
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export async function POST(request, { params }) {
  const { type } = await params;
  const schema = schemas[type];
  if (!schema) return new Response('error', { status: 404 });

  try {
    const fields = schema.parse(await readFields(request));
    saveFormLead(type, fields);

    const title = fields.formTitle || fields.jobTitle || fields.position || type;
    const lines = Object.entries(fields).filter(([, value]) => value != null && value !== '');
    try {
      await sendFormMail({
        subject: `${title} — ${fields.name || 'Website'}`,
        replyTo: fields.email,
        replyName: fields.name,
        lines,
      });
    } catch (error) {
      const status = error.status || 500;
      if (status !== 503) {
        console.error('[forms] saved lead but email failed', error);
      }
    }
    return new Response('success', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error) {
    const status = error.status || 400;
    return new Response('error', { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
