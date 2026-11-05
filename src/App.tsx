import { useMemo, useState } from 'react';
import { CalendarDays, LayoutDashboard, DoorOpen, ClipboardList, Users, Settings, Bell, Search, Plus, Clock3, CheckCircle2, XCircle, AlertTriangle, Menu, ChevronLeft, ChevronRight, LogOut, SlidersHorizontal } from 'lucide-react';

type ReservationStatus = 'Confirmada' | 'Em análise' | 'Rejeitada';
type Reservation = { id: number; person: string; room: string; date: string; start: string; end: string; purpose: string; status: ReservationStatus };
type Room = { id: number; name: string; capacity: number; type: string; status: 'Disponível' | 'Manutenção' };
const initialRooms: Room[] = [
  { id: 1, name: 'Laboratório 01', capacity: 30, type: 'Laboratório', status: 'Disponível' },
  { id: 2, name: 'Sala 204', capacity: 25, type: 'Sala de aula', status: 'Disponível' },
  { id: 3, name: 'Auditório Central', capacity: 120, type: 'Auditório', status: 'Disponível' },
  { id: 4, name: 'Laboratório 02', capacity: 20, type: 'Laboratório', status: 'Manutenção' },
  { id: 5, name: 'Sala 108', capacity: 35, type: 'Sala de aula', status: 'Disponível' },
  { id: 6, name: 'Sala de reuniões', capacity: 12, type: 'Reunião', status: 'Disponível' },
];
const today = new Date().toISOString().slice(0, 10);
const initialReservations: Reservation[] = [
  { id: 1042, person: 'Mariana Costa', room: 'Laboratório 01', date: today, start: '08:00', end: '10:00', purpose: 'Aula prática de programação', status: 'Confirmada' },
  { id: 1043, person: 'Rafael Mendes', room: 'Sala 204', date: today, start: '10:00', end: '12:00', purpose: 'Reunião de projeto', status: 'Em análise' },
  { id: 1044, person: 'Camila Oliveira', room: 'Auditório Central', date: today, start: '14:00', end: '16:00', purpose: 'Palestra acadêmica', status: 'Confirmada' },
  { id: 1045, person: 'Lucas Ferreira', room: 'Sala 108', date: today, start: '19:00', end: '21:00', purpose: 'Grupo de estudos', status: 'Em análise' },
];
const navItems = [
  { id: 'Visão geral', icon: LayoutDashboard }, { id: 'Reservas', icon: ClipboardList },
  { id: 'Salas', icon: DoorOpen }, { id: 'Calendário', icon: CalendarDays }, { id: 'Usuários', icon: Users },
];
const formatDate = (value: string) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '';

export default function App() {
  const [page, setPage] = useState('Visão geral');
  const [reservations, setReservations] = useState(initialReservations);
  const [rooms] = useState(initialRooms);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(today);
  const [modal, setModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ room: '', date: today, start: '19:00', end: '21:00', purpose: '' });

  const filtered = useMemo(() => reservations.filter(r => `${r.person} ${r.room} ${r.purpose} ${r.id}`.toLowerCase().includes(query.toLowerCase())), [reservations, query]);
  const confirmed = reservations.filter(r => r.status === 'Confirmada').length;
  const pending = reservations.filter(r => r.status === 'Em análise').length;
  const activeRooms = rooms.filter(r => r.status === 'Disponível').length;

  function submitReservation(e: React.FormEvent) {
    e.preventDefault();
    if (!form.room || !form.purpose || form.start >= form.end) { setToast('Confira a sala, a finalidade e o intervalo de horário.'); return; }
    const conflict = reservations.some(r => r.room === form.room && r.date === form.date && r.status !== 'Rejeitada' && form.start < r.end && form.end > r.start);
    const next: Reservation = { id: Math.max(1045, ...reservations.map(r => r.id)) + 1, person: 'Você (usuário)', room: form.room, date: form.date, start: form.start, end: form.end, purpose: form.purpose, status: conflict ? 'Em análise' : 'Confirmada' };
    setReservations(prev => [next, ...prev]); setModal(false);
    setToast(conflict ? 'Solicitação enviada para análise: possível conflito de horário.' : 'Reserva registrada e confirmada!');
    setPage('Reservas');
  }
  function updateStatus(id: number, status: ReservationStatus) { setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r)); setToast(`Reserva #${id} ${status.toLowerCase()}.`); }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-icon"><CalendarDays size={21}/></div><span>Reserva<span className="brand-accent">Fácil</span></span></div>
      <div className="workspace-label">MENU PRINCIPAL</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => {setPage(item.id); setMobileMenu(false)}}><item.icon size={18}/><span>{item.id}</span>{item.id === 'Reservas' && <span className="nav-count">{reservations.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="workspace-label">SISTEMA</div><button className="nav-item" onClick={() => setToast('Configurações demonstrativas')}><Settings size={18}/> <span>Configurações</span></button><div className="profile"><div className="avatar">AD</div><div><strong>Administrador</strong><small>Gestor do sistema</small></div><button aria-label="Sair" onClick={() => setToast('Sessão demonstrativa')}><LogOut size={17}/></button></div></div>
    </aside>
    {mobileMenu && <div className="scrim" onClick={() => setMobileMenu(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div><div className="top-actions"><button className="icon-button notification" onClick={() => setToast(`${pending} solicitação(ões) aguardando análise`)}><Bell size={19}/><i/></button><div className="top-avatar">AD</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">QUINTA-FEIRA · PAINEL DE CONTROLE</div><h1>{page === 'Visão geral' ? 'Visão geral' : page}</h1><p>{page === 'Visão geral' ? 'Acompanhe as reservas e a ocupação dos espaços.' : page === 'Reservas' ? 'Gerencie solicitações e acompanhe os agendamentos.' : page === 'Salas' ? 'Consulte os espaços disponíveis para reserva.' : page === 'Calendário' ? 'Visualize a programação por dia.' : 'Área de usuários do sistema.'}</p></div><button className="primary-button" onClick={() => {setForm({...form, date, room: rooms.find(r => r.status === 'Disponível')?.name || ''});setModal(true)}}><Plus size={17}/> Nova reserva</button></div>
        {page === 'Visão geral' && <>
          <div className="stats-grid"><Stat icon={<ClipboardList size={19}/>} label="Total de reservas" value={reservations.length.toString()} change="Neste período" tone="blue"/><Stat icon={<CheckCircle2 size={19}/>} label="Confirmadas" value={confirmed.toString()} change="Reservas aprovadas" tone="green"/><Stat icon={<Clock3 size={19}/>} label="Em análise" value={pending.toString()} change="Aguardando validação" tone="orange"/><Stat icon={<DoorOpen size={19}/>} label="Salas disponíveis" value={`${activeRooms}/${rooms.length}`} change="Espaços ativos" tone="purple"/></div>
          <div className="dashboard-grid"><section className="panel schedule-panel"><div className="panel-header"><div><h2>Agenda de hoje</h2><p>Reservas programadas para hoje</p></div><button className="text-button" onClick={() => setPage('Calendário')}>Ver calendário <ChevronRight size={15}/></button></div><div className="date-strip"><span>{formatDate(today)}</span><span className="today-tag">Hoje</span></div><div className="schedule-list">{reservations.filter(r => r.date === today).sort((a,b)=>a.start.localeCompare(b.start)).map(r=><div className="schedule-row" key={r.id}><div className="time-block"><strong>{r.start}</strong><span>{r.end}</span></div><div className="timeline-dot"/><div className="schedule-info"><strong>{r.room}</strong><span>{r.purpose}</span><small>{r.person}</small></div><Status status={r.status}/></div>)}{reservations.filter(r=>r.date===today).length===0&&<div className="empty">Nenhuma reserva para esta data.</div>}</div></section>
          <section className="panel quick-panel"><div className="panel-header"><div><h2>Acesso rápido</h2><p>Atalhos para gerenciar</p></div></div><div className="quick-links"><button onClick={()=>setModal(true)}><span className="quick-icon blue"><Plus size={18}/></span><span><strong>Solicitar reserva</strong><small>Agende uma sala ou espaço</small></span><ChevronRight size={16}/></button><button onClick={()=>setPage('Salas')}><span className="quick-icon purple"><DoorOpen size={18}/></span><span><strong>Consultar salas</strong><small>Veja disponibilidade e capacidade</small></span><ChevronRight size={16}/></button><button onClick={()=>setPage('Calendário')}><span className="quick-icon green"><CalendarDays size={18}/></span><span><strong>Ver calendário</strong><small>Confira a agenda completa</small></span><ChevronRight size={16}/></button></div><div className="hours-note"><Clock3 size={16}/><span><strong>Horário noturno</strong><br/>19:00 às 21:00</span></div></section></div>
          <section className="panel table-panel"><div className="panel-header"><div><h2>Reservas recentes</h2><p>Últimas solicitações registradas</p></div><button className="text-button" onClick={()=>setPage('Reservas')}>Ver todas <ChevronRight size={15}/></button></div><ReservationTable rows={filtered.slice(0,5)} onApprove={updateStatus}/></section>
        </>}
        {page === 'Reservas' && <section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search size={16}/><input placeholder="Buscar por pessoa, sala ou finalidade..." value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="filter-button" onClick={()=>setToast('Exibindo todos os status')}><SlidersHorizontal size={16}/> Filtros</button></div><ReservationTable rows={filtered} onApprove={updateStatus}/></section>}
        {page === 'Salas' && <div className="rooms-grid">{rooms.map(room=><div className="panel room-card" key={room.id}><div className="room-illustration"><DoorOpen size={32}/><span className={`room-status ${room.status==='Disponível'?'available':'maintenance'}`}>{room.status}</span></div><h3>{room.name}</h3><p>{room.type}</p><div className="room-meta"><span><Users size={15}/> Até {room.capacity} pessoas</span><button disabled={room.status!=='Disponível'} onClick={()=>{setForm({...form,room:room.name,date});setModal(true)}}>Reservar <ChevronRight size={14}/></button></div></div>)}</div>}
        {page === 'Calendário' && <section className="panel calendar-panel"><div className="panel-header"><div><h2>Programação diária</h2><p>Selecione uma data para consultar as reservas</p></div><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="date-input"/></div><div className="date-summary">Reservas em <strong>{formatDate(date)}</strong></div><ReservationTable rows={reservations.filter(r=>r.date===date)} onApprove={updateStatus}/>{reservations.filter(r=>r.date===date).length===0&&<div className="empty">Nenhuma reserva para esta data.</div>}<div className="calendar-foot"><button className="filter-button" onClick={()=>setDate(today)}><ChevronLeft size={15}/> Hoje</button><button className="filter-button" onClick={()=>{const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+1);setDate(d.toISOString().slice(0,10))}}>Próximo dia <ChevronRight size={15}/></button></div></section>}
        {page === 'Usuários' && <section className="panel users-panel"><div className="panel-header"><div><h2>Usuários cadastrados</h2><p>Usuários com acesso ao sistema</p></div></div><div className="user-row"><div className="avatar">AD</div><div><strong>Administrador</strong><small>admin@reservafacil.edu.br</small></div><span className="role-pill">Administrador</span><Status status="Confirmada"/></div><div className="user-row"><div className="avatar teal">UC</div><div><strong>Usuário acadêmico</strong><small>usuario@instituicao.edu.br</small></div><span className="role-pill">Solicitante</span><Status status="Confirmada"/></div><p className="muted-note">Demonstração visual — autenticação e cadastro dependem da integração com o back-end.</p></section>}
        <footer>© 2026 ReservaFácil <span>•</span> Sistema de gerenciamento de reservas</footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">NOVA SOLICITAÇÃO</span><h2>Solicitar reserva</h2></div><button className="icon-button" onClick={()=>setModal(false)}><XCircle size={20}/></button></div><form onSubmit={submitReservation}><label>Espaço / sala<select required value={form.room} onChange={e=>setForm({...form,room:e.target.value})}><option value="">Selecione uma sala</option>{rooms.filter(r=>r.status==='Disponível').map(r=><option key={r.id}>{r.name}</option>)}</select></label><label>Data<input type="date" required min={today} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><div className="form-two"><label>Horário de início<select value={form.start} onChange={e=>setForm({...form,start:e.target.value})}>{['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(t=><option key={t}>{t}</option>)}</select></label><label>Horário de término<select value={form.end} onChange={e=>setForm({...form,end:e.target.value})}>{['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map(t=><option key={t}>{t}</option>)}</select></label></div><div className="night-hint"><Clock3 size={15}/> Período noturno definido: <strong>19h às 21h</strong></div><label>Finalidade da reserva<textarea required rows={3} placeholder="Descreva o motivo da utilização da sala..." value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})}/></label><div className="modal-actions"><button type="button" className="filter-button" onClick={()=>setModal(false)}>Cancelar</button><button type="submit" className="primary-button">Enviar solicitação <ChevronRight size={16}/></button></div></form></div></div>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}<button onClick={()=>setToast('')}>×</button></div>}
  </div>;
}
function Stat({icon,label,value,change,tone}:{icon:React.ReactNode;label:string;value:string;change:string;tone:string}){return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-change">{change}</div></div>}
function Status({status}:{status:ReservationStatus}){return <span className={`status ${status==='Confirmada'?'confirmed':status==='Em análise'?'pending':'rejected'}`}><i/>{status}</span>}
function ReservationTable({rows,onApprove}:{rows:Reservation[];onApprove:(id:number,status:ReservationStatus)=>void}){return <div className="table-wrap"><table><thead><tr><th>CÓDIGO</th><th>ESPAÇO</th><th>USUÁRIO</th><th>DATA</th><th>HORÁRIO</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong className="code">#{r.id}</strong></td><td><strong>{r.room}</strong><small className="cell-sub">{r.purpose}</small></td><td>{r.person}</td><td>{formatDate(r.date)}</td><td><span className="time-chip">{r.start} – {r.end}</span></td><td><Status status={r.status}/></td><td><div className="row-actions">{r.status==='Em análise'&&<><button title="Confirmar" className="approve" onClick={()=>onApprove(r.id,'Confirmada')}><CheckCircle2 size={16}/></button><button title="Rejeitar" className="reject" onClick={()=>onApprove(r.id,'Rejeitada')}><XCircle size={16}/></button></>}{r.status!=='Em análise'&&<span className="action-muted">—</span>}</div></td></tr>)}</tbody></table>{rows.length===0&&<div className="empty">Nenhuma reserva encontrada.</div>}</div>}
