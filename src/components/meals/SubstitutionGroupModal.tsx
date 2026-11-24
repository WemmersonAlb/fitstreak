import { getSubstitutionGroup } from '../../data/nutrition/substitutions';
import { formatPortion } from '../../utils/format';
import { Modal } from '../common/Modal';

export function SubstitutionGroupModal({ group, onClose }: { group: number | null; onClose: () => void }) {
  const g = group !== null ? getSubstitutionGroup(group) : undefined;
  return (
    <Modal
      open={!!g}
      onClose={onClose}
      title={g ? `Grupo ${g.number}: ${g.name}` : ''}
      subtitle="Quantidades equivalentes a 1 porção"
    >
      {g && <SubstitutionItems items={g.items} />}
    </Modal>
  );
}

export function SubstitutionItems({ items }: { items: { food: string; measure: string; amount: number; unit: string }[] }) {
  return (
    <ul className="divide-y divide-line/70">
      {items.map((it) => (
        <li key={it.food + it.measure} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
          <span className="font-medium">{it.food}</span>
          <span className="shrink-0 text-right text-xs text-muted">{formatPortion(it.measure, it.amount, it.unit)}</span>
        </li>
      ))}
    </ul>
  );
}
