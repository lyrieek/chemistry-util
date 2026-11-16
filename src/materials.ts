export interface Element {
  sym: string
  n: number
  color?: string
}

export interface Material {
  name: string // i18n key (English)
  formula: string
  smiles?: string
  elements: Element[]
}

export const PALETTE = ['#008fff', '#dca0a0', '#f0c674', '#7fbbf3', '#a8d08d', '#e0a0e0', '#ffb347', '#88c2d0', '#d4a0a0', '#b39ddb']

export const MATERIALS: Material[] = [
  {
    name: 'Water',
    formula: 'H₂O',
    smiles: 'O',
    elements: [
      { sym: 'H', n: 2 },
      { sym: 'O', n: 1 },
    ],
  },
  {
    name: 'Table Salt',
    formula: 'NaCl',
    smiles: '[Na+].[Cl-]',
    elements: [
      { sym: 'Na', n: 1 },
      { sym: 'Cl', n: 1 },
    ],
  },
  {
    name: 'Iron Oxide',
    formula: 'Fe₂O₃',
    smiles: '[O-2].[O-2].[O-2].[Fe+3].[Fe+3]',
    elements: [
      { sym: 'Fe', n: 2 },
      { sym: 'O', n: 3 },
    ],
  },
  {
    name: 'Pitchblende',
    formula: 'UO₂',
    smiles: '[O-2].[O-2].[U+4]',
    elements: [
      { sym: 'U', n: 1 },
      { sym: 'O', n: 2 },
    ],
  },
  {
    name: 'Quartz',
    formula: 'SiO₂',
    elements: [
      { sym: 'Si', n: 1 },
      { sym: 'O', n: 2 },
    ],
  },
  {
    name: 'Limestone',
    formula: 'CaCO₃',
    smiles: '[Ca+2].[O-]C([O-])=O',
    elements: [
      { sym: 'Ca', n: 1 },
      { sym: 'C', n: 1 },
      { sym: 'O', n: 3 },
    ],
  },
  {
    name: 'Ammonia',
    formula: 'NH₃',
    smiles: 'N',
    elements: [
      { sym: 'N', n: 1 },
      { sym: 'H', n: 3 },
    ],
  },
  {
    name: 'Methane',
    formula: 'CH₄',
    smiles: 'C',
    elements: [
      { sym: 'C', n: 1 },
      { sym: 'H', n: 4 },
    ],
  },
  {
    name: 'Ethanol',
    formula: 'C₂H₆O',
    smiles: 'CCO',
    elements: [
      { sym: 'C', n: 2 },
      { sym: 'H', n: 6 },
      { sym: 'O', n: 1 },
    ],
  },
  {
    name: 'Glucose',
    formula: 'C₆H₁₂O₆',
    smiles: 'OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O',
    elements: [
      { sym: 'C', n: 6 },
      { sym: 'H', n: 12 },
      { sym: 'O', n: 6 },
    ],
  },
  {
    name: 'Caffeine',
    formula: 'C₈H₁₀N₄O₂',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    elements: [
      { sym: 'C', n: 8 },
      { sym: 'H', n: 10 },
      { sym: 'N', n: 4 },
      { sym: 'O', n: 2 },
    ],
  },
  {
    name: 'Steel',
    formula: 'Fe-C',
    elements: [
      { sym: 'Fe', n: 98 },
      { sym: 'C', n: 2 },
    ],
  },
  {
    name: 'Bronze',
    formula: 'Cu-Sn',
    elements: [
      { sym: 'Cu', n: 90 },
      { sym: 'Sn', n: 10 },
    ],
  },
  {
    name: 'Stainless Steel',
    formula: 'Fe-Cr-Ni',
    elements: [
      { sym: 'Fe', n: 70 },
      { sym: 'Cr', n: 18 },
      { sym: 'Ni', n: 8 },
      { sym: 'Mn', n: 2 },
      { sym: 'C', n: 1 },
    ],
  },
  {
    name: 'Lithium Phosphate',
    formula: 'Li₃PO₄',
    smiles: '[Li+].[Li+].[Li+].[O-]P([O-])([O-])=O',
    elements: [
      { sym: 'Li', n: 3 },
      { sym: 'P', n: 1 },
      { sym: 'O', n: 4 },
    ],
  },
  {
    name: 'Aluminum Oxide',
    formula: 'Al₂O₃',
    smiles: '[O-2].[O-2].[O-2].[Al+3].[Al+3]',
    elements: [
      { sym: 'Al', n: 2 },
      { sym: 'O', n: 3 },
    ],
  },
  {
    name: 'Silicon Carbide',
    formula: 'SiC',
    elements: [
      { sym: 'Si', n: 1 },
      { sym: 'C', n: 1 },
    ],
  },
  {
    name: 'Cantor Alloy',
    formula: 'FeNiCrMnCo',
    elements: [
      { sym: 'Fe', n: 1 },
      { sym: 'Ni', n: 1 },
      { sym: 'Cr', n: 1 },
      { sym: 'Mn', n: 1 },
      { sym: 'Co', n: 1 },
    ],
  },
  {
    name: 'Refractory HEA',
    formula: 'WMoTaNbV',
    elements: [
      { sym: 'W', n: 1 },
      { sym: 'Mo', n: 1 },
      { sym: 'Ta', n: 1 },
      { sym: 'Nb', n: 1 },
      { sym: 'V', n: 1 },
    ],
  },
]

MATERIALS.forEach((m) => {
  m.elements.forEach((e, i) => {
    e.color = PALETTE[i % PALETTE.length]
  })
})
