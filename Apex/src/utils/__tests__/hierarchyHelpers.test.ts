/**
 * TESTES MANUAIS PARA HIERARCHY HELPERS
 *
 * Execute este arquivo com: npx ts-node src/utils/__tests__/hierarchyHelpers.test.ts
 * Ou copie e cole no console do navegador/node
 */

import { Note } from '@/src/types/note.types';
import {
  isRoot,
  isLeaf,
  calculateDepth,
  calculatePath,
  countChildren,
  countDescendants,
  getParent,
  getChildren,
  getSiblings,
  getAncestors,
  getDescendants,
  validateHierarchy,
  validateAllHierarchies,
} from '../hierarchyHelpers';

// ==========================================
// DADOS DE TESTE
// ==========================================

const testNotes: Note[] = [
  // Raiz
  {
    id: 'root-1',
    title: 'Matemática',
    blocks: [],
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childrenIds: ['child-1', 'child-2'],
    isRoot: true,
    depth: 0,
    hierarchyOrder: 0,
  },
  // Filhos
  {
    id: 'child-1',
    title: 'Cálculo 1',
    parentId: 'root-1',
    blocks: [],
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childrenIds: ['grandchild-1', 'grandchild-2'],
    depth: 1,
    path: ['root-1'],
    hierarchyOrder: 0,
  },
  {
    id: 'child-2',
    title: 'Cálculo 2',
    parentId: 'root-1',
    blocks: [],
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childrenIds: ['grandchild-3'],
    depth: 1,
    path: ['root-1'],
    hierarchyOrder: 1,
  },
  // Netos
  {
    id: 'grandchild-1',
    title: 'Limites',
    parentId: 'child-1',
    blocks: [],
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childrenIds: [],
    depth: 2,
    path: ['root-1', 'child-1'],
    hierarchyOrder: 0,
  },
  {
    id: 'grandchild-2',
    title: 'Derivadas',
    parentId: 'child-1',
    blocks: [],
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childrenIds: [],
    depth: 2,
    path: ['root-1', 'child-1'],
    hierarchyOrder: 1,
  },
  {
    id: 'grandchild-3',
    title: 'Séries',
    parentId: 'child-2',
    blocks: [],
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childrenIds: [],
    depth: 2,
    path: ['root-1', 'child-2'],
    hierarchyOrder: 0,
  },
];

// ==========================================
// TESTES
// ==========================================

console.log('🧪 INICIANDO TESTES - HIERARCHY HELPERS\n');

// Teste 1: isRoot
console.log('1️⃣  Teste: isRoot()');
const root = testNotes.find(n => n.id === 'root-1')!;
const child = testNotes.find(n => n.id === 'child-1')!;
console.log('  ✓ Raiz é root?', isRoot(root)); // true
console.log('  ✓ Filho é root?', isRoot(child)); // false

// Teste 2: isLeaf
console.log('\n2️⃣  Teste: isLeaf()');
const leaf = testNotes.find(n => n.id === 'grandchild-1')!;
console.log('  ✓ Folha é leaf?', isLeaf(leaf)); // true
console.log('  ✓ Raiz é leaf?', isLeaf(root)); // false

// Teste 3: calculateDepth
console.log('\n3️⃣  Teste: calculateDepth()');
console.log('  ✓ Profundidade da raiz:', calculateDepth(root, testNotes)); // 0
console.log('  ✓ Profundidade do filho:', calculateDepth(child, testNotes)); // 1
console.log('  ✓ Profundidade do neto:', calculateDepth(leaf, testNotes)); // 2

// Teste 4: calculatePath
console.log('\n4️⃣  Teste: calculatePath()');
console.log('  ✓ Caminho da raiz:', calculatePath(root, testNotes)); // []
console.log('  ✓ Caminho do filho:', calculatePath(child, testNotes)); // ['root-1']
console.log('  ✓ Caminho do neto:', calculatePath(leaf, testNotes)); // ['root-1', 'child-1']

// Teste 5: countChildren
console.log('\n5️⃣  Teste: countChildren()');
console.log('  ✓ Filhos da raiz:', countChildren(root)); // 2
console.log('  ✓ Filhos do filho:', countChildren(child)); // 2
console.log('  ✓ Filhos da folha:', countChildren(leaf)); // 0

// Teste 6: countDescendants
console.log('\n6️⃣  Teste: countDescendants()');
console.log('  ✓ Descendentes da raiz:', countDescendants(root, testNotes)); // 5
console.log('  ✓ Descendentes do filho:', countDescendants(child, testNotes)); // 2
console.log('  ✓ Descendentes da folha:', countDescendants(leaf, testNotes)); // 0

// Teste 7: getParent
console.log('\n7️⃣  Teste: getParent()');
const parent = getParent(child, testNotes);
console.log('  ✓ Pai do filho:', parent?.title); // 'Matemática'
console.log('  ✓ Pai da raiz:', getParent(root, testNotes)); // undefined

// Teste 8: getChildren
console.log('\n8️⃣  Teste: getChildren()');
const children = getChildren(root, testNotes);
console.log('  ✓ Filhos da raiz:', children.map(c => c.title)); // ['Cálculo 1', 'Cálculo 2']

// Teste 9: getSiblings
console.log('\n9️⃣  Teste: getSiblings()');
const siblings = getSiblings(child, testNotes);
console.log('  ✓ Irmãos de Cálculo 1:', siblings.map(s => s.title)); // ['Cálculo 2']

// Teste 10: getAncestors
console.log('\n🔟 Teste: getAncestors()');
const ancestors = getAncestors(leaf, testNotes);
console.log('  ✓ Ancestrais de Limites:', ancestors.map(a => a.title)); // ['Matemática', 'Cálculo 1']

// Teste 11: getDescendants
console.log('\n1️⃣1️⃣  Teste: getDescendants()');
const descendants = getDescendants(root, testNotes);
console.log('  ✓ Descendentes da raiz:', descendants.map(d => d.title).length); // 5

// Teste 12: validateHierarchy
console.log('\n1️⃣2️⃣  Teste: validateHierarchy()');
const validation = validateHierarchy(child, testNotes);
console.log('  ✓ Filho é válido?', validation.valid); // true
console.log('  ✓ Erros:', validation.errors); // []

// Teste 13: validateAllHierarchies
console.log('\n1️⃣3️⃣  Teste: validateAllHierarchies()');
const allValidation = validateAllHierarchies(testNotes);
console.log('  ✓ Todas válidas?', allValidation.valid); // true
console.log('  ✓ Erros:', Object.keys(allValidation.noteErrors).length); // 0

console.log('\n✅ TODOS OS TESTES CONCLUÍDOS!\n');

// ==========================================
// TESTE DE ERRO (nota inválida)
// ==========================================

console.log('🧪 TESTE DE VALIDAÇÃO DE ERRO\n');

const invalidNote: Note = {
  id: 'invalid',
  title: 'Inválida',
  parentId: 'nao-existe',
  blocks: [],
  tags: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const errorValidation = validateHierarchy(invalidNote, testNotes);
console.log('  ✓ Nota inválida detectada?', !errorValidation.valid); // true
console.log('  ✓ Erros encontrados:', errorValidation.errors); // ['Parent nao-existe não encontrado']

console.log('\n✅ TESTE DE ERRO CONCLUÍDO!\n');
