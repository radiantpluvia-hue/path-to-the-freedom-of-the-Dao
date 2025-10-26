import React from 'react';

export default function DomainCaptureModal({ open, territoryId, territory, capturePreview, onConfirm, onCancel }:{
  open: boolean;
  territoryId?: string | null;
  territory?: any;
  capturePreview?: any;
  onConfirm?: (opts?: { funding?: 'normal'|'drain_player'|'force_capture', forceConfirm?: boolean }) => void;
  onCancel?: () => void;
}) {
  if (!open) return null;
  const [funding, setFunding] = React.useState<'normal'|'drain_player'|'force_capture'>('normal');
  const [forceConfirm, setForceConfirm] = React.useState(false);
  const [ackHighUpkeep, setAckHighUpkeep] = React.useState(false);
  return (
    <div style={{ position: 'fixed', left: '50%', top: '30%', transform: 'translateX(-50%)', zIndex: 10000, background: 'var(--dark)', padding: 12, borderRadius: 8, width: 520, boxShadow: '0 6px 20px rgba(0,0,0,0.6)' }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Confirm Domain Capture</div>
      <div style={{ color: 'var(--muted)' }}>
        You are about to claim control of <strong>{territoryId}</strong>.
      </div>
      {capturePreview && (
        <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
          <div><strong>Preview</strong></div>
          <div style={{ marginTop: 6 }}><strong>Defense (garrison):</strong> {String(capturePreview.defense ?? 'Unknown')}</div>
          <div style={{ marginTop: 6 }}><strong>Required Upkeep (gold):</strong> {String(capturePreview.requiredUpkeep ?? 'Unknown')}</div>
          <div style={{ marginTop: 6 }}><strong>Upkeep Paid:</strong> {capturePreview.upkeepPaid ? 'Yes' : (capturePreview.upkeepPaid === false ? 'No' : 'Unknown')}</div>
          <div style={{ marginTop: 6 }}><strong>Garrison After:</strong> {capturePreview.garrisonAfter ? JSON.stringify(capturePreview.garrisonAfter) : 'None'}</div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Funding Options</div>
            <label style={{ display: 'block' }}><input type="radio" name="funding" checked={funding==='normal'} onChange={()=>setFunding('normal')} /> Normal (use faction treasury)</label>
            <label style={{ display: 'block' }}><input type="radio" name="funding" checked={funding==='drain_player'} onChange={()=>setFunding('drain_player')} /> Drain Player (use player funds if faction treasury insufficient)</label>
            <label style={{ display: 'block' }}><input type="radio" name="funding" checked={funding==='force_capture'} onChange={()=>setFunding('force_capture')} /> Force Capture (always succeed, increased attrition & penalties)</label>
          </div>
          {/* Ledger preview */}
          <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
            <div style={{ fontWeight: 700 }}>Ledger Preview</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Faction ({capturePreview?.previousOwner ?? 'None'} → {capturePreview?.newOwner ?? 'None'})</div>
                <div style={{ fontFamily: 'monospace', marginTop: 6 }}>
                  {capturePreview?.ledger ? (
                    <span>{Number(capturePreview.ledger.factionBefore ?? 0).toLocaleString()} <span style={{ color: (capturePreview.ledger.factionAfter ?? 0) < (capturePreview.ledger.factionBefore ?? 0) ? 'var(--danger)' : (capturePreview.ledger.factionAfter ?? 0) > (capturePreview.ledger.factionBefore ?? 0) ? 'var(--accent)' : 'var(--muted)'}}>{'→ ' + Number(capturePreview.ledger.factionAfter ?? 0).toLocaleString()}</span></span>
                  ) : 'N/A'}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Player</div>
                <div style={{ fontFamily: 'monospace', marginTop: 6 }}>{capturePreview?.ledger ? (<span>{Number(capturePreview.ledger.playerBefore ?? 0).toLocaleString()} <span style={{ color: (capturePreview.ledger.playerAfter ?? 0) < (capturePreview.ledger.playerBefore ?? 0) ? 'var(--danger)' : 'var(--muted)'}}>{'→ ' + Number(capturePreview.ledger.playerAfter ?? 0).toLocaleString()}</span></span>) : 'N/A'}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Garrison</div>
                <div style={{ fontFamily: 'monospace', marginTop: 6 }}>{capturePreview?.ledger ? (<span>{capturePreview.ledger.garrisonBefore ?? 'N/A'} <span style={{ color: (capturePreview.ledger.garrisonAfter ?? 0) < (capturePreview.ledger.garrisonBefore ?? 0) ? 'var(--danger)' : 'var(--muted)'}}>{'→ ' + (capturePreview.ledger.garrisonAfter ?? 'N/A')}</span></span>) : 'N/A'}</div>
              </div>
            </div>
            {funding === 'force_capture' && (
              <div style={{ marginTop: 6, color: 'var(--danger)' }}><strong>Force Capture Consequences:</strong> +50% attrition, -10 influence, -5 reputation. This is irreversible.</div>
            )}
            {/* High-upkeep warning */}
            {capturePreview?.ledger && (capturePreview.ledger.factionBefore !== undefined) && (capturePreview.requiredUpkeep && (capturePreview.requiredUpkeep > (capturePreview.ledger.factionBefore ?? 0) * 0.5)) && (
              <div style={{ marginTop: 8, background: 'rgba(255,0,0,0.06)', padding: 8, borderRadius: 6 }}>
                <div style={{ fontWeight: 800, color: 'var(--danger)' }}>Warning: High Upkeep</div>
                <div style={{ marginTop: 6 }}>This capture requires more than 50% of the faction's current treasury. You must acknowledge to proceed.</div>
                <label style={{ display: 'block', marginTop: 6 }}><input type="checkbox" checked={ackHighUpkeep} onChange={(e)=>setAckHighUpkeep(e.target.checked)} /> I understand the risk and wish to proceed</label>
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <div><strong>Current Owner:</strong> {String(territory?.ownerFactionId || 'None')}</div>
        <div style={{ marginTop: 6 }}><strong>Influence:</strong></div>
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', marginTop: 6 }}>{JSON.stringify(territory?.influence || {}, null, 2)}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button onClick={onCancel} style={{ padding: '6px 10px' }}>Cancel</button>
        <button onClick={()=>{
          // if high-upkeep and not force-capture require explicit ack
          const highUpkeep = capturePreview?.ledger && (capturePreview.requiredUpkeep && (capturePreview.requiredUpkeep > (capturePreview.ledger.factionBefore ?? 0) * 0.5));
          if (highUpkeep && funding !== 'force_capture' && !ackHighUpkeep) return;
          if (funding==='force_capture' && !forceConfirm) return setForceConfirm(true);
          onConfirm && onConfirm({ funding, forceConfirm });
        }} style={{ padding: '6px 10px' }}>{funding==='force_capture' && !forceConfirm ? 'Confirm Force Capture' : 'Confirm Capture'}</button>
      </div>
      {forceConfirm && funding==='force_capture' && (
        <div style={{ marginTop: 8, background: 'rgba(255,0,0,0.06)', padding: 8, borderRadius: 6 }}>
          <div style={{ fontWeight: 800 }}>Force Capture Confirmation</div>
          <div style={{ marginTop: 6 }}>This action has severe consequences and is irreversible. Click Confirm Capture again to proceed.</div>
        </div>
      )}
    </div>
  );
}
