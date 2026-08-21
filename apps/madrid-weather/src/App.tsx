import { useMemo, useState } from "react";

type HeatLevel = "hot" | "very-hot" | "extreme";
type ForecastSource = "Forecast" | "Outlook";

type ForecastDay = {
  date: string;
  day: string;
  highC: number;
  lowC: number;
  highF: number;
  lowF: number;
  summary: string;
  dress: string;
  heatLevel: HeatLevel;
  source: ForecastSource;
};

type PackingGroup = {
  name: string;
  cue: string;
  items: PackingItem[];
};

type PackingItem = {
  id: string;
  label: string;
};

const forecastDays: ForecastDay[] = [
  {
    date: "Jul 28",
    day: "Tue",
    highC: 37,
    lowC: 24,
    highF: 99,
    lowF: 75,
    summary: "Very hot and sunny with a yellow afternoon heat warning.",
    dress: "Linen or cotton, sandals, hat, sunglasses, and SPF.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Jul 29",
    day: "Wed",
    highC: 39,
    lowC: 23,
    highF: 102,
    lowF: 73,
    summary: "Peak heat day with an orange afternoon heat warning.",
    dress: "Loose light clothes only; carry water and avoid midday walking.",
    heatLevel: "extreme",
    source: "Forecast",
  },
  {
    date: "Jul 30",
    day: "Thu",
    highC: 38,
    lowC: 22,
    highF: 100,
    lowF: 72,
    summary: "Still very hot and sunny with a yellow heat warning.",
    dress: "Breathable layers, open shoes, and a strong sun setup.",
    heatLevel: "extreme",
    source: "Forecast",
  },
  {
    date: "Jul 31",
    day: "Fri",
    highC: 37,
    lowC: 24,
    highF: 99,
    lowF: 75,
    summary: "Sunny and dry with high afternoon heat.",
    dress: "Light trousers or shorts; skip jackets except for indoor AC.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 1",
    day: "Sat",
    highC: 37,
    lowC: 25,
    highF: 99,
    lowF: 77,
    summary: "Hot weekend weather with warm evenings.",
    dress: "Day-to-night outfit in linen; add an overshirt for restaurants.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 2",
    day: "Sun",
    highC: 36,
    lowC: 22,
    highF: 97,
    lowF: 72,
    summary: "Sunny, dry, and slightly lower heat.",
    dress: "Short sleeves, breathable bottoms, and comfortable walking shoes.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 3",
    day: "Mon",
    highC: 36,
    lowC: 22,
    highF: 97,
    lowF: 72,
    summary: "Trip starts with classic Barcelona summer heat.",
    dress: "Pack a light day outfit up top in your luggage.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 4",
    day: "Tue",
    highC: 38,
    lowC: 24,
    highF: 100,
    lowF: 75,
    summary: "Sunny, dry, and very hot again.",
    dress: "Choose your loosest outfit; keep errands early or late.",
    heatLevel: "extreme",
    source: "Forecast",
  },
  {
    date: "Aug 5",
    day: "Wed",
    highC: 39,
    lowC: 23,
    highF: 102,
    lowF: 73,
    summary: "Another extreme heat day near 39 C.",
    dress: "Light colors, breathable fabrics, and no heavy denim.",
    heatLevel: "extreme",
    source: "Forecast",
  },
  {
    date: "Aug 6",
    day: "Thu",
    highC: 36,
    lowC: 22,
    highF: 97,
    lowF: 72,
    summary: "Hot and sunny, though a little lower than midweek.",
    dress: "Lightweight outfit with a sun hat and broken-in shoes.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 7",
    day: "Fri",
    highC: 35,
    lowC: 22,
    highF: 95,
    lowF: 72,
    summary: "Sunny and hot with dry air.",
    dress: "Short sleeves and airy trousers work well.",
    heatLevel: "hot",
    source: "Forecast",
  },
  {
    date: "Aug 8",
    day: "Sat",
    highC: 36,
    lowC: 23,
    highF: 97,
    lowF: 73,
    summary: "Hot, bright, and dry.",
    dress: "Plan for sun exposure; add a dressier breathable outfit at night.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 9",
    day: "Sun",
    highC: 36,
    lowC: 24,
    highF: 97,
    lowF: 75,
    summary: "Warm morning, hot afternoon, warm night.",
    dress: "Sweat-friendly fabrics and sandals for lower walking days.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 10",
    day: "Mon",
    highC: 34,
    lowC: 24,
    highF: 93,
    lowF: 75,
    summary: "Still hot, with the lowest high in the forecast window.",
    dress: "A normal summer outfit; still use sunscreen.",
    heatLevel: "hot",
    source: "Forecast",
  },
  {
    date: "Aug 11",
    day: "Tue",
    highC: 36,
    lowC: 25,
    highF: 97,
    lowF: 77,
    summary: "Hot and sunny with a very warm low.",
    dress: "Keep the sleepwear light and the daytime outfit breathable.",
    heatLevel: "very-hot",
    source: "Forecast",
  },
  {
    date: "Aug 12",
    day: "Wed",
    highC: 35,
    lowC: 21,
    highF: 95,
    lowF: 70,
    summary: "Planning outlook: hot, dry Barcelona summer pattern.",
    dress: "Repeat lightweight clothes; no rain layer expected.",
    heatLevel: "hot",
    source: "Outlook",
  },
  {
    date: "Aug 13",
    day: "Thu",
    highC: 35,
    lowC: 21,
    highF: 95,
    lowF: 70,
    summary: "Planning outlook: sunny heat likely.",
    dress: "Breathable daytime outfit plus a light indoor layer.",
    heatLevel: "hot",
    source: "Outlook",
  },
  {
    date: "Aug 14",
    day: "Fri",
    highC: 36,
    lowC: 22,
    highF: 97,
    lowF: 72,
    summary: "Planning outlook: hot afternoon, warm evening.",
    dress: "Dress for heat, then swap to smart-casual linen at night.",
    heatLevel: "very-hot",
    source: "Outlook",
  },
  {
    date: "Aug 15",
    day: "Sat",
    highC: 35,
    lowC: 21,
    highF: 95,
    lowF: 70,
    summary: "Planning outlook: dry and hot for the holiday weekend.",
    dress: "Light colors and comfortable shoes for long outdoor plans.",
    heatLevel: "hot",
    source: "Outlook",
  },
  {
    date: "Aug 16",
    day: "Sun",
    highC: 34,
    lowC: 20,
    highF: 93,
    lowF: 68,
    summary: "Planning outlook: hot but a bit easier late in the trip.",
    dress: "Good day for rewearing a clean light outfit after laundry.",
    heatLevel: "hot",
    source: "Outlook",
  },
  {
    date: "Aug 17",
    day: "Mon",
    highC: 34,
    lowC: 20,
    highF: 93,
    lowF: 68,
    summary: "Planning outlook: sunny and dry after the two-week trip.",
    dress: "Keep a summer outfit handy if you stay an extra day.",
    heatLevel: "hot",
    source: "Outlook",
  },
];

const weeklyTakeaways = [
  {
    label: "Week 1",
    range: "Jul 28-Aug 3",
    headline: "Heat is the main constraint",
    detail: "Expect 36-39 C afternoons and warm nights. Outdoor plans are best before 11:00 or after 20:00.",
  },
  {
    label: "Trip week 1",
    range: "Aug 3-Aug 9",
    headline: "Pack for repeated very hot days",
    detail: "The first travel week has several 36-39 C days, so prioritize washable, breathable outfits.",
  },
  {
    label: "Trip week 2",
    range: "Aug 10-Aug 16",
    headline: "Still summer, slightly less severe",
    detail: "Forecast confidence drops after Aug 11, but Barcelona's August pattern remains hot and mostly dry.",
  },
];

const dressRules = [
  "Use linen, cotton, technical wicking fabrics, and light colors.",
  "Bring one thin overshirt or cardigan for museums, trains, and strong air conditioning.",
  "Avoid heavy denim, leather jackets, thick knits, and new shoes.",
  "Carry sunglasses, a brimmed hat, SPF 50, and a refillable bottle every day.",
];

const packingGroups: PackingGroup[] = [
  {
    name: "Clothing",
    cue: "Plan to do laundry once around Aug 9 or Aug 10.",
    items: [
      { id: "tops", label: "7 breathable tops or shirts" },
      { id: "bottoms", label: "4 lightweight bottoms: shorts, skirts, linen trousers" },
      { id: "dress-outfit", label: "2 dinner-ready warm-weather outfits" },
      { id: "layer", label: "1 thin overshirt or cardigan for AC" },
      { id: "sleep", label: "Light sleepwear for warm nights" },
      { id: "underwear", label: "14 underwear plus laundry bag" },
      { id: "socks", label: "8-10 thin socks" },
    ],
  },
  {
    name: "Shoes",
    cue: "Barcelona is walkable, hot, and hard on untested shoes.",
    items: [
      { id: "sneakers", label: "Broken-in breathable walking sneakers" },
      { id: "sandals", label: "Supportive walking sandals" },
      { id: "dress-shoes", label: "Optional lightweight dress shoes" },
      { id: "blister", label: "Blister patches or tape" },
    ],
  },
  {
    name: "Sun and heat",
    cue: "This is the highest-priority category.",
    items: [
      { id: "hat", label: "Packable brimmed hat" },
      { id: "sunglasses", label: "Sunglasses" },
      { id: "spf", label: "SPF 50 sunscreen and lip balm" },
      { id: "bottle", label: "Refillable water bottle" },
      { id: "electrolytes", label: "Electrolyte packets" },
      { id: "fan", label: "Small folding fan or cooling towel" },
    ],
  },
  {
    name: "Travel basics",
    cue: "Keep these in your carry-on.",
    items: [
      { id: "documents", label: "Passport, ID, cards, and travel insurance" },
      { id: "adapter", label: "Type C or F power adapter" },
      { id: "battery", label: "Portable battery and charging cable" },
      { id: "meds", label: "Medication and small first-aid kit" },
      { id: "toiletries", label: "Toiletries in a heat-safe pouch" },
      { id: "laundry", label: "Travel detergent sheets" },
    ],
  },
];

const tripDates = "Aug 3-Aug 16, 2026";

function App() {
  const [packedItemIds, setPackedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const packingTotal = useMemo(
    () =>
      packingGroups.reduce(
        (total, packingGroup) => total + packingGroup.items.length,
        0,
      ),
    [],
  );

  const tripForecastDays = useMemo(
    () =>
      forecastDays.filter(
        (forecastDay) =>
          forecastDay.date !== "Jul 28" &&
          forecastDay.date !== "Jul 29" &&
          forecastDay.date !== "Jul 30" &&
          forecastDay.date !== "Jul 31" &&
          forecastDay.date !== "Aug 1" &&
          forecastDay.date !== "Aug 2" &&
          forecastDay.date !== "Aug 17",
      ),
    [],
  );

  const averageTripHigh = useMemo(() => {
    const highTotal = tripForecastDays.reduce(
      (total, forecastDay) => total + forecastDay.highC,
      0,
    );

    return Math.round(highTotal / tripForecastDays.length);
  }, [tripForecastDays]);

  const togglePackedItem = (itemId: string) => {
    setPackedItemIds((currentPackedItems) => {
      const nextPackedItems = new Set(currentPackedItems);

      if (nextPackedItems.has(itemId)) {
        nextPackedItems.delete(itemId);
      } else {
        nextPackedItems.add(itemId);
      }

      return nextPackedItems;
    });
  };

  return (
    <main className="app-shell">
      <header className="trip-header" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Barcelona trip planner</p>
          <h1 id="page-title">Weather, outfits, and packing</h1>
          <p className="intro">
            A three-week Barcelona weather view for Jul 28-Aug 17, plus a
            two-week packing checklist for a trip starting next week.
          </p>
        </div>
        <div className="trip-badge" aria-label={`Trip dates ${tripDates}`}>
          <span>Trip dates</span>
          <strong>{tripDates}</strong>
        </div>
      </header>

      <section className="summary-grid" aria-label="Weather summary">
        <article className="metric-card metric-card--alert">
          <span className="metric-card__label">Heat alerts</span>
          <strong>Tue-Thu afternoons</strong>
          <p>
            Yellow warning Jul 28, orange warning Jul 29, yellow warning Jul 30.
          </p>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Trip average high</span>
          <strong>{averageTripHigh} C</strong>
          <p>Based on Aug 3-Aug 16 forecast and planning outlook entries.</p>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Rain gear</span>
          <strong>Low priority</strong>
          <p>Use luggage space for sun and heat gear instead of heavy layers.</p>
        </article>
      </section>

      <section className="content-section" aria-labelledby="weekly-title">
        <div className="section-heading">
          <p className="eyebrow">Next 3 weeks</p>
          <h2 id="weekly-title">What to expect</h2>
        </div>
        <div className="weekly-grid">
          {weeklyTakeaways.map((week) => (
            <article className="weekly-card" key={week.label}>
              <span>{week.label}</span>
              <strong>{week.range}</strong>
              <h3>{week.headline}</h3>
              <p>{week.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" aria-labelledby="forecast-title">
        <div className="section-heading section-heading--inline">
          <div>
            <p className="eyebrow">Daily view</p>
            <h2 id="forecast-title">Forecast and dressing plan</h2>
          </div>
          <p className="source-note">
            Forecast snapshot: Jul 28, 2026. Outlook entries begin Aug 12.
          </p>
        </div>

        <div className="forecast-grid">
          {forecastDays.map((forecastDay) => (
            <article
              className="forecast-card"
              data-heat={forecastDay.heatLevel}
              data-source={forecastDay.source}
              key={`${forecastDay.date}-${forecastDay.day}`}
            >
              <div className="forecast-card__topline">
                <span>{forecastDay.day}</span>
                <span>{forecastDay.date}</span>
              </div>
              <div className="forecast-card__temperature">
                <strong>{forecastDay.highC} C</strong>
                <span>
                  {forecastDay.highF} F / {forecastDay.lowC} C low
                </span>
              </div>
              <p>{forecastDay.summary}</p>
              <div className="dress-line">
                <span aria-hidden="true" />
                <strong>{forecastDay.dress}</strong>
              </div>
              <small>{forecastDay.source}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section" aria-labelledby="dress-title">
        <div className="dress-panel">
          <p className="eyebrow">How to dress</p>
          <h2 id="dress-title">Simple rules for Barcelona heat</h2>
          <ul>
            {dressRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="packing-progress" aria-label="Packing progress">
          <span>{packedItemIds.size} packed</span>
          <strong>{packingTotal} total items</strong>
          <progress max={packingTotal} value={packedItemIds.size}>
            {packedItemIds.size} of {packingTotal}
          </progress>
          <p>
            Checklist tuned for a two-week Barcelona trip from {tripDates}, with
            one laundry stop.
          </p>
        </div>
      </section>

      <section className="content-section" aria-labelledby="packing-title">
        <div className="section-heading">
          <p className="eyebrow">Packing list</p>
          <h2 id="packing-title">Two weeks starting next week</h2>
        </div>
        <div className="packing-grid">
          {packingGroups.map((packingGroup) => (
            <section className="packing-group" key={packingGroup.name}>
              <h3>{packingGroup.name}</h3>
              <p>{packingGroup.cue}</p>
              <ul>
                {packingGroup.items.map((item) => (
                  <li key={item.id}>
                    <label>
                      <input
                        checked={packedItemIds.has(item.id)}
                        onChange={() => togglePackedItem(item.id)}
                        type="checkbox"
                      />
                      <span>{item.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
