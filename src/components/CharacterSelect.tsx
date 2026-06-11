import type { CSSProperties } from 'react';
import { CHARACTERS } from '../game/characters';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function CharacterSelect({ selected, onSelect }: Props) {
  return (
    <div style={wrap}>
      <div style={grid}>
        {CHARACTERS.map(char => {
          const isSelected = char.id === selected;
          return (
            <button
              key={char.id}
              style={itemBtn}
              onClick={() => onSelect(char.id)}
            >
              <div style={{
                ...imgWrap,
                outline: isSelected ? '3px solid #3DAE79' : '3px solid transparent',
                boxShadow: isSelected ? '0 0 0 2px #fff, 0 0 0 4px #3DAE79' : 'none',
              }}>
                <img src={char.src} style={imgStyle} alt={char.label} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const wrap: CSSProperties = {
  margin: '6px 0',
};

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 72px)',
  gap: 14,
  justifyContent: 'center',
};

const itemBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  borderRadius: '50%',
  WebkitTapHighlightColor: 'transparent',
};

const imgWrap: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  overflow: 'hidden',
  transition: 'outline 0.15s, box-shadow 0.15s',
};

const imgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  borderRadius: '50%',
  objectFit: 'cover',
};
