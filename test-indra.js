// Script de test simple

// Créons quelques nœuds avec des positions calculées
const nodes = [
  { id: 'node1', name: 'IL4', type: 'protein' },
  { id: 'node2', name: 'CASP3', type: 'protein' },
  { id: 'node3', name: 'ATP', type: 'chemical' },
];

const defaultWidth = 800;
const defaultHeight = 600;
const radius = Math.min(defaultWidth, defaultHeight) * 0.4;
const center = { x: 0, y: 0 };

// Calculer les positions en cercle
for (let i = 0; i < nodes.length; i++) {
  const angle = (i / nodes.length) * 2 * Math.PI;
  const x = center.x + radius * Math.cos(angle);
  const y = center.y + radius * Math.sin(angle);
  nodes[i].position = { x, y };
}

// Afficher le résultat
console.log("Test de calcul des positions des nœuds");
console.log("--------------------------------------");
console.log("Nombre de nœuds:", nodes.length);
console.log("Largeur du graphe:", defaultWidth);
console.log("Hauteur du graphe:", defaultHeight);
console.log("Rayon utilisé:", radius);

// Afficher les positions calculées
console.log("\nPositions calculées:");
for (const node of nodes) {
  console.log(`${node.name}: (${node.position.x.toFixed(2)}, ${node.position.y.toFixed(2)})`);
}

// Afficher le premier nœud complet pour vérification
console.log("\nDétail du premier nœud:");
console.log(nodes[0]); 