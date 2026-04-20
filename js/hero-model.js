(function () {
  const model = document.getElementById('hero-model');
  if (!model) return;

  const BASE_COLOR = [0.85, 0.88, 0.92, 1.0];
  const METALNESS = 0.75;
  const ROUGHNESS = 0.45;

  model.addEventListener('load', function () {
    try {
      const materials = model.model && model.model.materials;
      if (!materials) return;
      materials.forEach(function (m) {
        if (m.pbrMetallicRoughness) {
          m.pbrMetallicRoughness.setBaseColorFactor(BASE_COLOR);
          m.pbrMetallicRoughness.setMetallicFactor(METALNESS);
          m.pbrMetallicRoughness.setRoughnessFactor(ROUGHNESS);
        }
      });
    } catch (e) {
      console.warn('hero-model: material update failed', e);
    }
  });
})();
