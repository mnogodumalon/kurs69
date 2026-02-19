import { useEffect, useState } from 'react';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import type { Dozenten, Raeume, Teilnehmer, Kurse, Anmeldungen } from '@/types/app';
import { BookOpen, ClipboardList, DoorOpen, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

const CHART_COLORS = [
  'oklch(0.55 0.2 270)',
  'oklch(0.65 0.18 300)',
  'oklch(0.6 0.15 200)',
  'oklch(0.7 0.15 150)',
  'oklch(0.75 0.12 50)',
];

export default function DashboardOverview() {
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [d, r, t, k, a] = await Promise.all([
          LivingAppsService.getDozenten(),
          LivingAppsService.getRaeume(),
          LivingAppsService.getTeilnehmer(),
          LivingAppsService.getKurse(),
          LivingAppsService.getAnmeldungen(),
        ]);
        setDozenten(d);
        setRaeume(r);
        setTeilnehmer(t);
        setKurse(k);
        setAnmeldungen(a);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate stats
  const totalRevenue = anmeldungen.reduce((sum, a) => {
    const kursId = extractRecordId(a.fields.kurs);
    const kurs = kurse.find(k => k.record_id === kursId);
    return sum + (kurs?.fields.preis || 0);
  }, 0);

  const paidCount = anmeldungen.filter(a => a.fields.bezahlt).length;
  const unpaidCount = anmeldungen.length - paidCount;

  const activeKurse = kurse.filter(k => {
    if (!k.fields.enddatum) return false;
    return isAfter(parseISO(k.fields.enddatum), new Date());
  });

  // Kurse per Dozent chart data
  const kursPerDozent = dozenten.map(d => {
    const count = kurse.filter(k => extractRecordId(k.fields.dozent) === d.record_id).length;
    return {
      name: d.fields.name?.split(' ')[0] || 'N/A',
      kurse: count,
    };
  }).filter(d => d.kurse > 0);

  // Payment status pie data
  const paymentData = [
    { name: 'Bezahlt', value: paidCount },
    { name: 'Offen', value: unpaidCount },
  ];

  // Recent Anmeldungen
  const recentAnmeldungen = [...anmeldungen]
    .sort((a, b) => {
      const dateA = a.fields.anmeldedatum || '';
      const dateB = b.fields.anmeldedatum || '';
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  const getTeilnehmerName = (url: string | undefined) => {
    const id = extractRecordId(url);
    return teilnehmer.find(t => t.record_id === id)?.fields.name || '-';
  };

  const getKursTitel = (url: string | undefined) => {
    const id = extractRecordId(url);
    return kurse.find(k => k.record_id === id)?.fields.titel || '-';
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="hero-gradient rounded-2xl p-8 text-white relative overflow-hidden" style={{ boxShadow: 'var(--shadow-hero)' }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">Kursverwaltung</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Willkommen zurück
          </h1>
          <p className="text-white/80 text-lg max-w-xl">
            Verwalten Sie Ihre Kurse, Dozenten und Teilnehmer an einem Ort.
          </p>
        </div>
        <div className="relative z-10 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Aktive Kurse</p>
            <p className="text-3xl font-bold">{loading ? '-' : activeKurse.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Anmeldungen</p>
            <p className="text-3xl font-bold">{loading ? '-' : anmeldungen.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Teilnehmer</p>
            <p className="text-3xl font-bold">{loading ? '-' : teilnehmer.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Gesamtumsatz</p>
            <p className="text-3xl font-bold">{loading ? '-' : totalRevenue.toLocaleString('de-DE')}€</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={GraduationCap}
          label="Dozenten"
          value={loading ? '-' : dozenten.length}
          sublabel="im System"
        />
        <KpiCard
          icon={DoorOpen}
          label="Räume"
          value={loading ? '-' : raeume.length}
          sublabel="verfügbar"
        />
        <KpiCard
          icon={Users}
          label="Teilnehmer"
          value={loading ? '-' : teilnehmer.length}
          sublabel="registriert"
        />
        <KpiCard
          icon={BookOpen}
          label="Kurse"
          value={loading ? '-' : kurse.length}
          sublabel="insgesamt"
        />
        <KpiCard
          icon={ClipboardList}
          label="Anmeldungen"
          value={loading ? '-' : anmeldungen.length}
          sublabel={`${paidCount} bezahlt`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kurse per Dozent */}
        <div className="chart-container rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-1">Kurse pro Dozent</h3>
          <p className="text-sm text-muted-foreground mb-6">Verteilung der Kurse auf Dozenten</p>
          {kursPerDozent.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={kursPerDozent} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="kurse" fill="oklch(0.55 0.2 270)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Keine Daten vorhanden
            </div>
          )}
        </div>

        {/* Payment Status */}
        <div className="chart-container rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-1">Zahlungsstatus</h3>
          <p className="text-sm text-muted-foreground mb-6">Übersicht der Anmeldungen</p>
          {anmeldungen.length > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {paymentData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ background: CHART_COLORS[0] }} />
                  <div>
                    <p className="text-2xl font-bold">{paidCount}</p>
                    <p className="text-sm text-muted-foreground">Bezahlt</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ background: CHART_COLORS[1] }} />
                  <div>
                    <p className="text-2xl font-bold">{unpaidCount}</p>
                    <p className="text-sm text-muted-foreground">Offen</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Keine Daten vorhanden
            </div>
          )}
        </div>
      </div>

      {/* Recent Anmeldungen */}
      <div className="chart-container rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-1">Letzte Anmeldungen</h3>
        <p className="text-sm text-muted-foreground mb-6">Die neuesten Kursanmeldungen</p>
        {recentAnmeldungen.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Teilnehmer</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Kurs</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Datum</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAnmeldungen.map((a) => (
                  <tr key={a.record_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{getTeilnehmerName(a.fields.teilnehmer)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{getKursTitel(a.fields.kurs)}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {a.fields.anmeldedatum ? format(parseISO(a.fields.anmeldedatum), 'dd.MM.yyyy', { locale: de }) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        a.fields.bezahlt
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Noch keine Anmeldungen vorhanden
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sublabel }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  sublabel: string;
}) {
  return (
    <div className="kpi-card rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="kpi-icon w-10 h-10 rounded-lg flex items-center justify-center">
          <Icon size={18} />
        </div>
        <TrendingUp size={14} className="text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold tracking-tight stat-value">{value}</p>
      <p className="text-sm font-medium text-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}
