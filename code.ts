/// <reference types="@figma/plugin-typings" />

// entry point for Figma plugin
figma.showUI(__html__, { height: 250 });

// Listen for messages from the UI
figma.ui.onmessage = async msg => {
  if (msg.type === 'nudge-values') {
    // Nudge y duración por defecto si no se proporcionan del UI
    const nudge = typeof msg.nudge === 'number' ? msg.nudge : 60;
    const duration = typeof msg.duration === 'number' ? msg.duration : 2;
    // Obtiene todos los nodos posicionables en la página (excluyendo slices)
    const nodes = figma.currentPage.children.filter(n => n.type !== 'SLICE' && 'x' in n && 'y' in n);
    // Guarda la selección actual para restaurarla después
    const originalSelection = figma.currentPage.selection;
    // Almacena las posiciones originales de todos los nodos
    const originalPositions = nodes.map(n => ({ node: n, x: n.x, y: n.y }));
    
    // Definir una velocidad constante para cada ciclo de zumbido (en ms)
    const cycleTime = 300; // Tiempo para un ciclo completo (izquierda-derecha-centro)
    const stepTime = 50; // Tiempo para cada paso individual del zumbido
    
    // Calcular cuántos ciclos completos caben en la duración total
    const totalCycles = Math.max(1, Math.floor(duration * 1000 / cycleTime));
    
    // Crea un array con todos los desplazamientos horizontales
    let allOffsets = [];
    for (let i = 0; i < totalCycles; i++) {
      // Cada ciclo consiste en tres movimientos: izquierda (-nudge), derecha (+nudge) y centro (0)
      allOffsets.push(-nudge, nudge, 0); // Desplazamiento a la izquierda, derecha y al centro valor de nudge del UI en px
    }
    
    // Ejecutar la animación
    for (const offset of allOffsets) {
      for (const { node, x } of originalPositions) {
        node.x = x + offset;
      }
      // Espera el tiempo definido (stepTime) antes de pasar al siguiente movimiento
      await new Promise<void>(resolve => setTimeout(resolve, stepTime));
    }
    
    // Asegurarse de que todos los nodos regresen a su posición original
    for (const { node, x } of originalPositions) {
      node.x = x;
    }
    
    // Restaurar la selección original
    figma.currentPage.selection = originalSelection;
    // Cerrar el plugin y mostrar un mensaje de éxito
    figma.closePlugin(`¡Zumbido de ${nudge}px durante ${duration}s realizado!`);
  }
};
