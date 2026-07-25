import { useState } from 'react';
import { HelpCircle, ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const FAQS = [
  {
    q: 'Apakah hasil Oral Screen AI bisa dijadikan diagnosis?',
    a: 'Tidak. Oral Screen AI adalah alat bantu triase untuk deteksi dini. Hasil harus selalu dikonfirmasi oleh dokter gigi atau spesialis.',
  },
  {
    q: 'Apakah foto saya diunggah ke server?',
    a: 'Analisis AI berjalan langsung di perangkat Anda (on-device). Foto tidak dikirim ke mana pun untuk proses pemindaian.',
  },
  {
    q: 'Bagaimana cara mengambil foto yang baik?',
    a: 'Gunakan pencahayaan terang, pastikan fokus tajam dan tidak buram, serta buka mulut lebar agar area target terlihat jelas.',
  },
  {
    q: 'Seberapa sering saya harus melakukan pemeriksaan?',
    a: 'Untuk pemantauan rutin, disarankan setiap 1–3 bulan, atau lebih sering bila Anda memiliki faktor risiko tinggi.',
  },
];

export function Bantuan() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-md">
      <div>
        <h3 className="text-display-lg-mobile md:text-display-lg text-on-surface">Pusat Bantuan</h3>
        <p className="text-body-lg text-on-surface-variant">
          Temukan jawaban atas pertanyaan umum atau hubungi tim dukungan kami.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <ContactCard icon={MessageCircle} title="Live Chat" detail="Balasan dalam ~5 menit" />
        <ContactCard icon={Mail} title="Email" detail="support@oralscreen.ai" />
        <ContactCard icon={Phone} title="Telepon" detail="+62 21 5000 1234" />
      </div>

      <Card className="p-lg">
        <h4 className="text-headline-md font-bold text-on-surface flex items-center gap-sm mb-md">
          <HelpCircle size={20} className="text-primary" /> Pertanyaan Umum
        </h4>
        <div className="divide-y divide-outline-variant">
          {FAQS.map((f, i) => (
            <div key={f.q} className="py-sm">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-sm text-left"
              >
                <span className="text-body-lg font-semibold text-on-surface">{f.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-on-surface-variant transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && <p className="text-body-md text-on-surface-variant mt-sm">{f.a}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-surface-container-low border-none p-lg flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h4 className="text-headline-md font-bold text-on-surface mb-xs">Masih butuh bantuan?</h4>
          <p className="text-body-md text-on-surface-variant">
            Tim dukungan medis dan teknis kami siap membantu Anda.
          </p>
        </div>
        <Button>Hubungi Dukungan</Button>
      </Card>
    </div>
  );
}

function ContactCard({ icon: Icon, title, detail }: { icon: typeof Mail; title: string; detail: string }) {
  return (
    <Card className="p-lg flex flex-col items-start gap-sm hover:shadow-md transition-shadow cursor-pointer">
      <span className="w-11 h-11 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
        <Icon size={22} />
      </span>
      <h4 className="text-body-lg font-semibold text-on-surface">{title}</h4>
      <p className="text-body-md text-on-surface-variant">{detail}</p>
    </Card>
  );
}
