import { useMemo, useState, type ReactNode } from 'react';

type PassKind = 'Season' | 'Multi-day';
type Region = 'Front Range' | 'I-70' | 'Central' | 'Southwest';
type Resort = { name: string; region: Region; ticket: number; vertical: string; vibe: string };
type SkiPass = { id: string; name: string; kind: PassKind; price: number; days: number | null; blackout: boolean; color: string; resorts: string[]; note: string };

const resorts: Resort[] = [
    ['Arapahoe Basin','I-70',169,'2,530′','High alpine'],['Aspen Snowmass','Central',259,'4,406′','Four mountains'],['Beaver Creek','I-70',289,'3,340′','Luxury groomers'],['Breckenridge','I-70',279,'3,398′','Big mountain'],['Copper Mountain','I-70',219,'2,738′','Naturally divided'],['Crested Butte','Central',229,'3,062′','Steep & soulful'],['Echo Mountain','Front Range',99,'600′','Night laps'],['Eldora','Front Range',189,'1,240′','Close to Boulder'],['Granby Ranch','Front Range',129,'1,000′','Family friendly'],['Hesperus','Southwest',69,'700′','Local hill'],['Howelsen Hill','Central',45,'440′','Historic local'],['Kendall Mountain','Southwest',55,'240′','Small & friendly'],['Keystone','I-70',249,'3,128′','Long cruisers'],['Loveland','I-70',149,'2,210′','No-frills alpine'],['Monarch Mountain','Central',139,'1,162′','Natural snow'],['Powderhorn','Central',109,'1,650′','Western slope'],['Purgatory','Southwest',149,'2,029′','Sunny & playful'],['Silverton Mountain','Southwest',249,'3,087′','Expert adventure'],['Ski Cooper','Central',105,'1,200′','Quiet classics'],['Steamboat','Central',269,'3,668′','Champagne powder'],['Sunlight Mountain','Central',119,'2,010′','Affordable charm'],['Telluride','Southwest',245,'4,425′','Destination terrain'],['Vail','I-70',299,'3,450′','Legendary bowls'],['Winter Park','Front Range',249,'3,060′','Seven territories'],['Wolf Creek','Southwest',105,'1,604′','Deep snow'],
].map(([name, region, ticket, vertical, vibe]) => ({ name, region, ticket, vertical, vibe } as Resort));

const passes: SkiPass[] = [
    { id:'ikon-base', name:'Ikon Base Pass', kind:'Season', price:1029, days:null, blackout:true, color:'#5a46d6', resorts:['Arapahoe Basin','Aspen Snowmass','Copper Mountain','Eldora','Steamboat','Winter Park'], note:'A flexible pick for Front Range and destination variety.' },
    { id:'epic-local', name:'Epic Local Pass', kind:'Season', price:799, days:null, blackout:true, color:'#ef5b3f', resorts:['Beaver Creek','Breckenridge','Crested Butte','Keystone','Vail'], note:'Strong value if your calendar centers on I-70.' },
    { id:'indy-plus', name:'Indy+ Pass', kind:'Season', price:579, days:2, blackout:false, color:'#2f9f83', resorts:['Granby Ranch','Howelsen Hill','Kendall Mountain','Powderhorn','Sunlight Mountain'], note:'Two days at each partner; built for independent-hill road trips.' },
    { id:'power', name:'Power Pass', kind:'Season', price:749, days:null, blackout:false, color:'#bd5eb4', resorts:['Hesperus','Purgatory'], note:'The Southwest Colorado specialist.' },
    { id:'loveland', name:'Loveland Season Pass', kind:'Season', price:699, days:null, blackout:false, color:'#188ac0', resorts:['Loveland'], note:'Simple, local, and blackout-free.' },
    { id:'monarch', name:'Monarch Season Pass', kind:'Season', price:659, days:null, blackout:false, color:'#da8a19', resorts:['Monarch Mountain'], note:'Best for frequent natural-snow laps in central Colorado.' },
    { id:'ikon-4', name:'Ikon Session 4-Day', kind:'Multi-day', price:549, days:4, blackout:true, color:'#7867e4', resorts:['Arapahoe Basin','Aspen Snowmass','Copper Mountain','Eldora','Steamboat','Winter Park'], note:'Four total days shared across a broad resort set.' },
    { id:'epic-4', name:'Epic Day Pass · 4 days', kind:'Multi-day', price:424, days:4, blackout:true, color:'#f2745e', resorts:['Beaver Creek','Breckenridge','Crested Butte','Keystone','Vail'], note:'Low commitment for one four-day Epic trip.' },
    { id:'gems', name:'Colorado Gems 4-Pack', kind:'Multi-day', price:249, days:4, blackout:true, color:'#1d9da2', resorts:['Echo Mountain','Granby Ranch','Loveland','Monarch Mountain','Powderhorn','Ski Cooper','Sunlight Mountain'], note:'Budget-minded sampler for smaller Colorado mountains.' },
    { id:'southwest-4', name:'Southwest 4-Pack', kind:'Multi-day', price:299, days:4, blackout:false, color:'#c56a32', resorts:['Hesperus','Purgatory','Telluride','Wolf Creek'], note:'An illustrative road-trip bundle for comparing day-ticket value.' },
];

type IconName = 'mountain'|'wallet'|'users'|'calendar'|'search'|'check'|'spark'|'arrow';
function Icon({ name }: { name: IconName }) {
    const paths: Record<IconName, ReactNode> = {
        mountain:<><path d="m3 19 6.4-11 3.1 5.1L15.3 9 21 19H3Z"/><path d="m7.4 11.5 2 1.4 1.6-2.1M13.6 11.4l1.8 1.4 1.4-1.4"/></>, wallet:<><path d="M4 7.5h14a2 2 0 0 1 2 2V18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h11v4.5"/><path d="M15 12h5"/></>, users:<><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.4-3.5 2.1-5 5.5-5s5.1 1.5 5.5 5M15 5.5a2.5 2.5 0 0 1 0 5M16.5 14c2.5.2 3.7 1.7 4 4"/></>, calendar:<><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></>, search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>, check:<path d="m5 12 4 4L19 6"/>, spark:<><path d="m12 3 1.2 4.2L17 9l-3.8 2L12 15l-1.2-4L7 9l3.8-1.8L12 3Z"/><path d="m5 15 .7 2.2L8 18l-2.3.8L5 21l-.7-2.2L2 18l2.3-.8L5 15Z"/></>, arrow:<><path d="M5 12h14M14 7l5 5-5 5"/></>,
    };
    return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

const money = new Intl.NumberFormat('en-US',{ style:'currency',currency:'USD',maximumFractionDigits:0 });

function App() {
    const [days,setDays] = useState(8);
    const [skiers,setSkiers] = useState(1);
    const [kind,setKind] = useState<'All'|PassKind>('All');
    const [region,setRegion] = useState<'All'|Region>('All');
    const [query,setQuery] = useState('');
    const [selected,setSelected] = useState(['Breckenridge','Copper Mountain','Winter Park']);
    const [expanded,setExpanded] = useState<string|null>('epic-local');

    const visibleResorts = useMemo(() => resorts.filter((r) => (region === 'All' || r.region === region) && r.name.toLowerCase().includes(query.toLowerCase())),[query,region]);
    const ranked = useMemo(() => passes.filter((p) => kind === 'All' || p.kind === kind).map((p) => {
        const matches = selected.filter((r) => p.resorts.includes(r));
        const covered = p.days === null ? days : Math.min(days,p.days);
        const chosen = resorts.filter((r) => selected.includes(r.name));
        const average = chosen.length ? chosen.reduce((sum,r) => sum + r.ticket,0) / chosen.length : 199;
        const total = (p.price + Math.max(0,days-covered) * average) * skiers;
        return { ...p,matches,total,coverage:selected.length ? matches.length/selected.length : 0,perDay:total/Math.max(days*skiers,1) };
    }).sort((a,b) => b.coverage-a.coverage || a.total-b.total),[days,kind,selected,skiers]);
    const toggleResort = (name:string) => setSelected((current) => current.includes(name) ? current.filter((r) => r !== name) : [...current,name]);
    const best = ranked[0];

    return <main>
        <nav className="topbar"><div className="brand"><span className="brand-mark"><Icon name="mountain"/></span><span><strong>Ski Budget</strong><small>COLORADO PASS PLANNER</small></span></div><div className="nav-actions"><span>Planning estimates · 26/27</span><button className="saved-button"><Icon name="wallet"/> My budget</button></div></nav>
        <header className="hero"><div className="hero-copy"><span className="eyebrow"><i/> COLORADO · 25 RESORTS</span><h1>More mountain.<br/><em>Less math.</em></h1><p>Compare season passes and multi-day packs around the places you actually want to ski.</p></div><div className="hero-art" aria-hidden="true"><div className="sun"/><div className="peak peak-back"/><div className="peak peak-front"/><div className="lift-line"><i/><i/><i/></div></div></header>
        <section className="planner" aria-label="Trip planner">
            <div className="planner-label"><span><Icon name="spark"/></span><div><small>START HERE</small><strong>Shape your ski season</strong></div></div>
            <label className="days-field"><span><Icon name="calendar"/> Ski days</span><div><button onClick={() => setDays(Math.max(1,days-1))}>−</button><strong>{days}</strong><button onClick={() => setDays(Math.min(30,days+1))}>+</button></div></label>
            <div className="skiers-field"><span><Icon name="users"/> Skiers</span><div>{[1,2,3,4].map((count) => <button className={skiers === count ? 'active':''} onClick={() => setSkiers(count)} key={count}>{count}</button>)}</div></div>
            <div className="budget-snapshot"><small>BEST MATCH ESTIMATE</small><strong>{best ? money.format(best.total):'—'}</strong><span>{best?.name ?? 'Choose resorts'}</span></div>
        </section>
        <div className="workspace">
            <aside className="resort-panel"><div className="panel-title"><div><small>STEP 1</small><h2>Pick your mountains</h2></div><span className="count-badge">{selected.length} selected</span></div><div className="search"><Icon name="search"/><input aria-label="Search resorts" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Colorado resorts"/></div><div className="region-tabs">{(['All','Front Range','I-70','Central','Southwest'] as const).map((item) => <button className={region === item ? 'active':''} onClick={() => setRegion(item)} key={item}>{item}</button>)}</div>
                <div className="resort-list">{visibleResorts.map((resort) => <button className={`resort-row ${selected.includes(resort.name) ? 'selected':''}`} onClick={() => toggleResort(resort.name)} key={resort.name}><span className="check"><Icon name="check"/></span><span className="resort-name"><strong>{resort.name}</strong><small>{resort.vibe} · {resort.vertical}</small></span><span className="ticket"><small>DAY TICKET</small><strong>~{money.format(resort.ticket)}</strong></span></button>)}</div>
                <p className="resort-note">Estimates are for comparison only. Always verify current prices, restrictions, and operating status with the resort.</p>
            </aside>
            <section className="results-panel"><div className="results-head"><div><small>STEP 2</small><h2>Compare your best fits</h2><p>Ranked by resort coverage, then estimated total.</p></div><div className="kind-toggle">{(['All','Season','Multi-day'] as const).map((item) => <button className={kind === item ? 'active':''} onClick={() => setKind(item)} key={item}>{item}</button>)}</div></div>
                {ranked.map((pass,index) => <article className={`pass-card ${index === 0 ? 'best':''} ${expanded === pass.id ? 'expanded':''}`} key={pass.id}>{index === 0 && <span className="best-ribbon"><Icon name="spark"/> BEST MATCH</span>}<button className="pass-summary" onClick={() => setExpanded(expanded === pass.id ? null:pass.id)} aria-expanded={expanded === pass.id}><span className="pass-logo" style={{ background:pass.color }}>{pass.name.split(' ').slice(0,2).map((word) => word[0]).join('')}</span><span className="pass-identity"><small>{pass.kind.toUpperCase()} PASS</small><strong>{pass.name}</strong><span>{pass.blackout ? 'Some blackout dates':'No blackout dates'}</span></span><span className="coverage"><small>YOUR MOUNTAINS</small><strong>{pass.matches.length}<b> / {selected.length || '—'}</b></strong><span className="coverage-track"><i style={{ width:`${pass.coverage*100}%`,background:pass.color }}/></span></span><span className="price"><small>EST. TOTAL · {skiers} {skiers === 1 ? 'SKIER':'SKIERS'}</small><strong>{money.format(pass.total)}</strong><span>{money.format(pass.perDay)} / ski day</span></span><span className="open"><Icon name="arrow"/></span></button>
                    {expanded === pass.id && <div className="pass-detail"><p>{pass.note}</p><div><small>COVERS YOUR PICKS</small><span>{pass.matches.length ? pass.matches.map((name) => <i key={name}><Icon name="check"/>{name}</i>):<em>No selected resorts are included.</em>}</span></div><button onClick={() => setSelected(pass.resorts)}>See this pass across Colorado <Icon name="arrow"/></button></div>}
                </article>)}
            </section>
        </div>
        <footer><div className="brand mini"><span className="brand-mark"><Icon name="mountain"/></span><strong>Ski Budget</strong></div><p>Planning estimates, not purchase prices. Pass access and blackout dates can change.</p><span>Made for Colorado powder days ❄</span></footer>
    </main>;
}

export default App;
