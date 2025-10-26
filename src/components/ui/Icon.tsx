import React from 'react';
import IconNoble from './icons/IconNoble';
import IconScholar from './icons/IconScholar';
import IconCommoner from './icons/IconCommoner';
import IconSect from './icons/IconSect';
import IconInfernal from './icons/IconInfernal';
import IconOutcast from './icons/IconOutcast';
import IconWoodland from './icons/IconWoodland';
import IconWandering from './icons/IconWandering';
import IconDragonBlood from './icons/IconDragonBlood';
import IconDragonScholar from './icons/IconDragonScholar';
import IconPhoenixReborn from './icons/IconPhoenixReborn';
import IconPhoenixFlame from './icons/IconPhoenixFlame';
import IconCelestialBureau from './icons/IconCelestialBureau';
import IconCelestialFallen from './icons/IconCelestialFallen';
import IconAsuraWarborn from './icons/IconAsuraWarborn';
import IconAsuraRage from './icons/IconAsuraRage';
import IconAsuraTactician from './icons/IconAsuraTactician';
import IconMonkeyKing from './icons/IconMonkeyKing';
import IconMonkeyMountain from './icons/IconMonkeyMountain';
import IconMonkeyTrickster from './icons/IconMonkeyTrickster';
import IconMonkeyMystic from './icons/IconMonkeyMystic';
import IconMonkeyArtisan from './icons/IconMonkeyArtisan';
import IconFoxNine from './icons/IconFoxNine';
import IconFoxCity from './icons/IconFoxCity';
import IconQilinAuspice from './icons/IconQilinAuspice';
import IconQilinGuardian from './icons/IconQilinGuardian';
import IconQilinBlessed from './icons/IconQilinBlessed';

type IconId = string;

interface Props {
  id: IconId | string;
  size?: number;
  className?: string;
  alt?: string;
}

export const IMPLEMENTED_ICON_IDS = [
  'icon-noble', 'icon-scholar', 'icon-commoner', 'icon-sect', 'icon-infernal', 'icon-outcast', 'icon-woodland', 'icon-wandering', 'icon-dragonblood', 'icon-dragon-scholar', 'icon-phoenix-reborn', 'icon-phoenix-flame', 'icon-celestial-bureau', 'icon-celestial-fallen', 'icon-asura-warborn', 'icon-asura-rage', 'icon-asura-tactician', 'icon-monkey-king', 'icon-monkey-mountain', 'icon-monkey-trickster', 'icon-monkey-mystic', 'icon-monkey-artisan', 'icon-fox-nine', 'icon-fox-city', 'icon-qilin-auspice', 'icon-qilin-guardian', 'icon-qilin-blessed'
];

const Svg: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'icon-noble': IconNoble,
  'icon-scholar': IconScholar,
  'icon-commoner': IconCommoner,
  'icon-sect': IconSect,
  'icon-infernal': IconInfernal,
  'icon-outcast': IconOutcast,
  'icon-woodland': IconWoodland,
  'icon-wandering': IconWandering,
  'icon-dragonblood': IconDragonBlood,
  'icon-dragon-scholar': IconDragonScholar,
  'icon-phoenix-reborn': IconPhoenixReborn,
  'icon-phoenix-flame': IconPhoenixFlame,
  'icon-celestial-bureau': IconCelestialBureau,
  'icon-celestial-fallen': IconCelestialFallen,
  'icon-asura-warborn': IconAsuraWarborn,
  'icon-asura-rage': IconAsuraRage,
  'icon-asura-tactician': IconAsuraTactician,
  'icon-monkey-king': IconMonkeyKing,
  'icon-monkey-mountain': IconMonkeyMountain,
  'icon-monkey-trickster': IconMonkeyTrickster,
  'icon-monkey-mystic': IconMonkeyMystic,
  'icon-monkey-artisan': IconMonkeyArtisan,
  'icon-fox-nine': IconFoxNine,
  'icon-fox-city': IconFoxCity,
  'icon-qilin-auspice': IconQilinAuspice,
  'icon-qilin-guardian': IconQilinGuardian,
  'icon-qilin-blessed': IconQilinBlessed,
};

const Icon: React.FC<Props> = ({ id, size = 40, className, alt }) => {
  const SvgComp = (Svg as any)[id];
  const ariaHidden = !alt;
  const wrapperStyle: React.CSSProperties = { width: size, height: size, display: 'inline-block' };
  const srOnlyStyle: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0
  };

  if (SvgComp) {
    return (
      <div className={className} aria-hidden={ariaHidden} aria-label={alt} style={wrapperStyle}>
        <SvgComp width={size} height={size} />
        {alt && <span style={srOnlyStyle}>{alt}</span>}
      </div>
    );
  }

  // generic placeholder SVG
  return (
    <div className={className} aria-hidden={ariaHidden} aria-label={alt} style={wrapperStyle}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#E5E7EB" />
        <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#374151">?</text>
      </svg>
      {alt && <span style={srOnlyStyle}>{alt}</span>}
    </div>
  );
};

export default Icon;
