import React from 'react'
import './index.css'

export default function App() {
  return (
    <main className="wrap">
      <header>
        <div className="wrap">
          <a href="#" className="brand">
            SLCCRAOP <small>Public case ledger</small>
          </a>
          <nav>
            <a href="#">Home</a>
            <a href="#">Cases</a>
            <a href="#">Ledger</a>
            <div className="lang">
              <button aria-pressed={false}>EN</button>
              <button aria-pressed={false}>SI</button>
              <button aria-pressed={false}>TA</button>
            </div>
          </nav>
        </div>
      </header>

      <section className="notice">
        <div className="wrap">
          <p>This is a demo notice. Real content comes from the database.</p>
        </div>
      </section>

      <h1>SLCCRAOP Public Ledger</h1>

      <p className="lede">
        Sample figures, not real data. All case data is FAKE.
      </p>

      <div className="cta">
        <button className="btn primary">Search Cases</button>
        <button className="btn secondary">Advanced Search</button>
      </div>

      <section>
        <h2>Ticker</h2>
        <div className="ticker">
          <div>
            <b>4</b><span>New cases added today</span>
          </div>
          <div>
            <b>12</b><span>Active investigations</span>
          </div>
          <div className="asof">Last updated 10 Nov 2026, 14:30</div>
        </div>
      </section>

      <section>
        <h2>Filters</h2>
        <div className="filters">
          <div>
            <label htmlFor="q">Search case ID or summary</label>
            <input id="q" type="search" placeholder="Enter case ID or summary" />
          </div>
          <div>
            <label htmlFor="c">Category</label>
            <select id="c">
              <option>All</option>
              <option>Non-consensual sharing</option>
              <option>Sextortion</option>
              <option>Online harassment</option>
            </select>
          </div>
          <div>
            <label htmlFor="a">Authority</label>
            <select id="a">
              <option>All</option>
              <option>CCID</option>
              <option>SLCERT</option>
            </select>
          </div>
          <div>
            <label htmlFor="s">Status</label>
            <select id="s">
              <option>All</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2>Public case ledger</h2>
        <p className="fake">Sample rows for design only.</p>
        <form className="filters" role="search" onsubmit="return false">
          <div>
            <label htmlFor="q">Search case ID or summary</label>
            <input id="q" type="search" placeholder="Search..." />
          </div>
          <div>
            <label htmlFor="c">Category</label>
            <select id="c"><option>All</option></select>
          </div>
          <div>
            <label htmlFor="a">Authority</label>
            <select id="a"><option>All</option></select>
          </div>
          <div>
            <label htmlFor="s">Status</label>
            <select id="s"><option>All</option></select>
          </div>
        </form>
        <table>
          <thead>
            <tr>
              <th>Case</th>
              <th>Category and summary</th>
              <th>Authority</th>
              <th>Status</th>
              <th>Latest reply</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="id" data-label="Case">SL-2026-0042</td>
              <td data-label="Category and summary">
                Non-consensual sharing of images<br>
                Images shared in a closed group without consent.
              </td>
              <td data-label="Authority">CCID</td>
              <td data-label="Status">
                <span className="track" aria-hidden="true">
                  <i className="on" />
                  <i />
                  <i />
                  <i />
                </span>
                Submitted, awaiting reply
              </td>
              <td data-label="Latest reply">
                No reply yet<br>
                <small>Sent 2 Nov 2026</small>
              </td>
            </tr>
            <tr>
              <td className="id" data-label="Case">SL-2026-0037</td>
              <td data-label="Category and summary">
                Sextortion<br>
                Threats to release images unless money is paid.
              </td>
              <td data-label="Authority">CCID</td>
              <td data-label="Status">
                <span className="track" aria-hidden="true">
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i />
                </span>
                Under investigation
              </td>
              <td data-label="Latest reply">
                Action in progress<br>
                <small>6 Nov 2026</small>
              </td>
            </tr>
            <tr>
              <td className="id" data-label="Case">SL-2026-0029</td>
              <td data-label="Category and summary">
                Online sexual harassment<br>
                Repeated unwanted sexual messages and fake profiles.
              </td>
              <td data-label="Authority">SLCERT</td>
              <td data-label="Status">
                <span className="track done" aria-hidden="true">
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                </span>
                Closed, resolved
              </td>
              <td data-label="Latest reply">
                Closed by authority<br>
                <small>28 Oct 2026</small>
              </td>
            </tr>
            <tr>
              <td className="id" data-label="Case">SL-2026-0018</td>
              <td data-label="Category and summary">
                Non-consensual sharing of images<br>
                Content reposted across several pages.
              </td>
              <td data-label="Authority">CCID</td>
              <td data-label="Status">
                <span className="track shut" aria-hidden="true">
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                </span>
                Closed, unresolved: suspect not identified
              </td>
              <td data-label="Latest reply">
                Closed by authority<br>
                <small>19 Oct 2026</small>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="pager">
          <span>Showing 1 to 4 of 128 cases</span>
          <span>
            <a href="#">Previous</a> &nbsp; <a href="#">Next</a>
          </span>
        </div>
      </section>
    </main>
  )
}