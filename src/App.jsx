import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">SLCCRAOP</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <p className="text-text">SLCCRAOP - Sri Lanka Cyber Crime Registry and Accountability Oversight Project</p>
        <section className="ticker" aria-label="Overall progress">
          <div><b>128</b><span>Cases sent to authorities</span></div>
          <div><b>71</b><span>Awaiting a reply</span></div>
          <div><b>39</b><span>Under investigation</span></div>
          <div><b>11</b><span>Closed, resolved</span></div>
          <div><b>7</b><span>Closed, unresolved</span></div>
          <div><b>9 days</b><span>Median time to first reply</span></div>
          <div className="asof">Last updated 10 Nov 2026, 14:30. Sample figures, not real data.</div>
        </section>
        <section id="ledger">
          <h2>Public case ledger</h2>
          <p className="fake">Sample rows for design only.</p>
          <form className="filters" role="search" onSubmit={(e) => { e.preventDefault(); return false; }}>
            <div><label htmlFor="q">Search case ID or summary</label><input id="q" type="search" /></div>
            <div><label htmlFor="c">Category</label><select id="c"><option>All</option></select></div>
            <div><label htmlFor="a">Authority</label><select id="a"><option>All</option></select></div>
            <div><label htmlFor="s">Status</label><select id="s"><option>All</option></select></div>
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
                <td data-label="Category and summary">Non-consensual sharing of images. Images shared in a closed group without consent.</td>
                <td data-label="Authority">CCID</td>
                <td data-label="Status"><span className="track wait" aria-hidden="true"><i className="on" /><i /><i /><i /></span>Submitted, awaiting reply</td>
                <td data-label="Latest reply">No reply yet<br/><small>Sent 2 Nov 2026</small></td>
              </tr>
              <tr>
                <td className="id" data-label="Case">SL-2026-0037</td>
                <td data-label="Category and summary">Sextortion. Threats to release images unless money is paid.</td>
                <td data-label="Authority">CCID</td>
                <td data-label="Status"><span className="track" aria-hidden="true"><i className="on" /><i className="on" /><i className="on" /><i /></span>Under investigation</td>
                <td data-label="Latest reply">Action in progress<br/><small>6 Nov 2026</small></td>
              </tr>
              <tr>
                <td className="id" data-label="Case">SL-2026-0029</td>
                <td data-label="Category and summary">Online sexual harassment. Repeated unwanted sexual messages and fake profiles.</td>
                <td data-label="Authority">SLCERT</td>
                <td data-label="Status"><span className="track done" aria-hidden="true"><i className="on" /><i className="on" /><i className="on" /><i className="on" /></span>Closed, resolved</td>
                <td data-label="Latest reply">Closed by authority<br/><small>28 Oct 2026</small></td>
              </tr>
              <tr>
                <td className="id" data-label="Case">SL-2026-0018</td>
                <td data-label="Category and summary">Non-consensual sharing of images. Content reposted across several pages.</td>
                <td data-label="Authority">CCID</td>
                <td data-label="Status"><span className="track shut" aria-hidden="true"><i className="on" /><i className="on" /><i className="on" /><i className="on" /></span>Closed, unresolved: suspect not identified</td>
                <td data-label="Latest reply">Closed by authority<br/><small>19 Oct 2026</small></td>
              </tr>
            </tbody>
          </table>
          <div className="pager"><span>Showing 1 to 4 of 128 cases</span><span><a href="#">Previous</a> &nbsp; <a href="#">Next</a></span></div>
        </section>
      </main>
    </div>
  );
}