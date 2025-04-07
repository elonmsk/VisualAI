// Script de test pour vérifier les différentes dispositions de nœuds

// Générer un ensemble de nœuds pour le test
function generateTestNodes(count) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `node${i}`,
      name: `Nœud ${i}`,
      type: i % 3 === 0 ? 'protein' : (i % 3 === 1 ? 'gene' : 'chemical')
    });
  }
  return nodes;
}

// Fonction pour calculer les positions des nœuds avec différentes dispositions
function calculateNodePositions(nodes, width, height) {
  const nodeCount = nodes.length;
  
  if (nodeCount === 0) return nodes;
  
  if (nodeCount <= 10) {
    // Disposition en cercle simple pour peu de nœuds
    const radius = Math.min(width, height) * 0.35;
    const center = { x: 0, y: 0 };
    
    nodes.forEach((node, index) => {
      const angle = (index / nodeCount) * 2 * Math.PI;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      node.position = { x, y };
    });
  } 
  else if (nodeCount <= 50) {
    // Disposition en cercles concentriques pour nombre moyen de nœuds
    const innerRadius = Math.min(width, height) * 0.2;
    const outerRadius = Math.min(width, height) * 0.4;
    const center = { x: 0, y: 0 };
    
    // Répartir les nœuds entre cercle intérieur et extérieur
    const innerCircleCount = Math.min(8, Math.floor(nodeCount * 0.3));
    const outerCircleCount = nodeCount - innerCircleCount;
    
    // Cercle intérieur
    for (let i = 0; i < innerCircleCount; i++) {
      const angle = (i / innerCircleCount) * 2 * Math.PI;
      const x = center.x + innerRadius * Math.cos(angle);
      const y = center.y + innerRadius * Math.sin(angle);
      nodes[i].position = { x, y };
    }
    
    // Cercle extérieur
    for (let i = 0; i < outerCircleCount; i++) {
      const angle = (i / outerCircleCount) * 2 * Math.PI;
      const x = center.x + outerRadius * Math.cos(angle);
      const y = center.y + outerRadius * Math.sin(angle);
      nodes[innerCircleCount + i].position = { x, y };
    }
  }
  else {
    // Disposition en grille pour grand nombre de nœuds
    const cols = Math.ceil(Math.sqrt(nodeCount));
    const rows = Math.ceil(nodeCount / cols);
    const cellWidth = width * 0.7 / cols;
    const cellHeight = height * 0.7 / rows;
    const startX = -((cellWidth * (cols - 1)) / 2);
    const startY = -((cellHeight * (rows - 1)) / 2);
    
    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX + col * cellWidth;
      const y = startY + row * cellHeight;
      node.position = { x, y };
    });
  }
  
  return nodes;
}

// Tester les trois configurations
const defaultWidth = 800;
const defaultHeight = 600;

// 1. Petit nombre de nœuds (cercle)
const smallNodes = generateTestNodes(7);
calculateNodePositions(smallNodes, defaultWidth, defaultHeight);

// 2. Nombre moyen de nœuds (cercles concentriques)
const mediumNodes = generateTestNodes(30);
calculateNodePositions(mediumNodes, defaultWidth, defaultHeight);

// 3. Grand nombre de nœuds (grille)
const largeNodes = generateTestNodes(80);
calculateNodePositions(largeNodes, defaultWidth, defaultHeight);

// Afficher les résultats
console.log("== Test des dispositions de nœuds ==");

console.log("\n1. Disposition en cercle (7 nœuds):");
for (const node of smallNodes) {
  console.log(`${node.name}: (${node.position.x.toFixed(2)}, ${node.position.y.toFixed(2)})`);
}

console.log("\n2. Disposition en cercles concentriques (30 nœuds):");
console.log("\n   Cercle intérieur (premiers nœuds):");
for (let i = 0; i < 8; i++) {
  console.log(`${mediumNodes[i].name}: (${mediumNodes[i].position.x.toFixed(2)}, ${mediumNodes[i].position.y.toFixed(2)})`);
}
console.log("\n   Cercle extérieur (exemple de nœuds):");
for (let i = 8; i < 12; i++) {
  console.log(`${mediumNodes[i].name}: (${mediumNodes[i].position.x.toFixed(2)}, ${mediumNodes[i].position.y.toFixed(2)})`);
}

console.log("\n3. Disposition en grille (80 nœuds):");
console.log("\n   Premiers nœuds de la grille:");
for (let i = 0; i < 5; i++) {
  console.log(`${largeNodes[i].name}: (${largeNodes[i].position.x.toFixed(2)}, ${largeNodes[i].position.y.toFixed(2)})`);
}
console.log("\n   Derniers nœuds de la grille:");
for (let i = largeNodes.length - 5; i < largeNodes.length; i++) {
  console.log(`${largeNodes[i].name}: (${largeNodes[i].position.x.toFixed(2)}, ${largeNodes[i].position.y.toFixed(2)})`);
} 